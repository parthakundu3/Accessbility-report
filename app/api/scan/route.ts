import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';
import AxePuppeteer from '@axe-core/puppeteer';
import { ScanResult, Violation } from '@/types/wcag';

// IMPORTANT: Import these at the top-level to ensure they're loaded
import 'puppeteer-core';
import '@sparticuz/chromium-min';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const results: ScanResult[] = [];

    for (const file of files) {
      if (file.name.endsWith('.zip')) {
        const zipResults = await processZipFile(file);
        results.push(...zipResults);
      } else if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
        const htmlContent = await file.text();
        const scanResult = await scanHtml(htmlContent, file.name);
        results.push(scanResult);
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json({ error: 'Failed to process files' }, { status: 500 });
  }
}

async function processZipFile(zipFile: File): Promise<ScanResult[]> {
  const zip = new JSZip();
  const content = await zipFile.arrayBuffer();
  const zipContent = await zip.loadAsync(content);
  const results: ScanResult[] = [];

  for (const [filename, file] of Object.entries(zipContent.files)) {
    if (!file.dir && (filename.endsWith('.html') || filename.endsWith('.htm'))) {
      const htmlContent = await file.async('string');
      const scanResult = await scanHtml(htmlContent, filename);
      results.push(scanResult);
    }
  }

  return results;
}

async function scanHtml(htmlContent: string, filename: string): Promise<ScanResult> {
  let browser = null;
  try {
    // For local development, use a local Chrome path if available
    const isDev = process.env.NODE_ENV === 'development';
    const executablePath = isDev && process.env.CHROME_PATH 
      ? process.env.CHROME_PATH 
      : await chromium.executablePath();

    console.log('Launching browser with executablePath:', executablePath);

    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const results = await new AxePuppeteer(page)
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const violations: Violation[] = results.violations.map(violation => ({
      rule: violation.id,
      impact: violation.impact || 'unknown',
      description: violation.description,
      help: violation.help,
      helpUrl: violation.helpUrl,
      nodes: violation.nodes.map(node => ({
        html: node.html,
        target: node.target as string[],
        failureSummary: node.failureSummary || ''
      }))
    }));

    return {
      filename,
      timestamp: new Date().toISOString(),
      violations,
      passes: results.passes.length,
      violationsCount: results.violations.length,
      incomplete: results.incomplete.length,
      inapplicable: results.inapplicable.length
    };
  } catch (error) {
    console.error(`Error scanning ${filename}:`, error);
    return {
      filename,
      timestamp: new Date().toISOString(),
      violations: [],
      passes: 0,
      violationsCount: 0,
      incomplete: 0,
      inapplicable: 0
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}