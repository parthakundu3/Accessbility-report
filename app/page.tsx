'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import ResultsDisplay from '@/components/ResultsDisplay';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ScanResult } from '@/types/wcag';

const FileUploader = dynamic(() => import('@/components/FileUploader'), {
  ssr: false,
  loading: () => <div className="border-2 border-dashed rounded-lg p-8 text-center">Loading uploader...</div>
});

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[] | null>(null);

  const handleUpload = async (files: File[]) => {
    setIsLoading(true);
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.results) {
        setScanResults(data.results);
      } else if (data.error) {
        console.error(data.error);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = (results: ScanResult[]): string => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>WCAG 2.0 AA Compliance Report</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; padding: 2rem; background: #f5f5f5; }
          .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 2rem; }
          h1 { color: #0070AD; border-bottom: 2px solid #12ABDB; padding-bottom: 0.5rem; margin-bottom: 1rem; }
          h2 { color: #333; margin: 1.5rem 0 0.5rem; }
          .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 1.5rem 0; }
          .card { padding: 1rem; border-radius: 8px; background: #f9f9f9; border-left: 4px solid; }
          .card.violations { border-left-color: #dc2626; }
          .card.passes { border-left-color: #10b981; }
          .card.incomplete { border-left-color: #f59e0b; }
          .card h3 { font-size: 2rem; margin-bottom: 0.25rem; }
          .violation-item { background: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 1rem; margin: 1rem 0; }
          .violation-item h4 { color: #dc2626; margin-bottom: 0.5rem; }
          .impact { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; margin-bottom: 0.5rem; }
          .impact-critical { background: #7f1a1a; color: white; }
          .impact-serious { background: #dc2626; color: white; }
          .impact-moderate { background: #f59e0b; color: white; }
          .impact-minor { background: #eab308; color: black; }
          a { color: #0070AD; text-decoration: none; }
          a:hover { text-decoration: underline; }
          footer { margin-top: 2rem; text-align: center; font-size: 0.875rem; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>WCAG 2.0 Level AA Compliance Report</h1>
          <p>Generated: ${new Date().toLocaleString()}</p>
          ${results.map(file => `
            <h2>File: ${escapeHtml(file.filename)}</h2>
            <div class="summary">
              <div class="card violations">
                <h3>${file.violationsCount}</h3>
                <p>Violations</p>
              </div>
              <div class="card passes">
                <h3>${file.passes}</h3>
                <p>Passes</p>
              </div>
              <div class="card incomplete">
                <h3>${file.incomplete}</h3>
                <p>Needs Review</p>
              </div>
            </div>
            ${file.violations.length > 0 ? `
              <h3>Accessibility Violations</h3>
              ${file.violations.map(v => `
                <div class="violation-item">
                  <span class="impact impact-${v.impact}">${v.impact}</span>
                  <h4>${escapeHtml(v.rule)}</h4>
                  <p>${escapeHtml(v.description)}</p>
                  <p><strong>Fix:</strong> ${escapeHtml(v.help)}</p>
                  <a href="${v.helpUrl}" target="_blank" rel="noopener noreferrer">Learn how to fix this →</a>
                  ${v.nodes.length > 0 ? `
                    <details style="margin-top: 0.75rem;">
                      <summary>Affected elements (${v.nodes.length})</summary>
                      ${v.nodes.map(node => `
                        <pre style="background:#f1f1f1; padding:0.5rem; margin:0.5rem 0; overflow-x:auto;">${escapeHtml(node.html)}</pre>
                      `).join('')}
                    </details>
                  ` : ''}
                </div>
              `).join('')}
            ` : `
              <div style="background:#e6f7e6; padding:1rem; border-radius:8px; margin-top:1rem;">
                ✓ No WCAG 2.0 Level AA violations found.
              </div>
            `}
          `).join('')}
          <footer>
            <p>Automated scan using axe-core. Manual review recommended for complete accessibility assurance.</p>
          </footer>
        </div>
        <script>
          function escapeHtml(str) {
            return str.replace(/[&<>]/g, function(m) {
              if (m === '&') return '&amp;';
              if (m === '<') return '&lt;';
              if (m === '>') return '&gt;';
              return m;
            });
          }
        </script>
      </body>
      </html>
    `;
  };

  const downloadReport = () => {
    if (!scanResults) return;
    const report = generateReport(scanResults);
    const blob = new Blob([report], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wcag-report-${new Date().toISOString()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4" style={{ color: '#0070AD' }}>
              WCAG 2.0 Level AA Compliance Checker
            </h1>
            <p className="text-xl text-gray-600">
              Upload your HTML files to check against accessibility standards
            </p>
          </div>
          
          <FileUploader onUpload={handleUpload} isLoading={isLoading} />
          
          {isLoading && <LoadingSpinner />}
          
          {scanResults && (
            <div className="mt-8">
              <button
                onClick={downloadReport}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 transition-colors"
              >
                Download Report
              </button>
              <ResultsDisplay results={scanResults} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// Helper function to escape HTML special characters
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}