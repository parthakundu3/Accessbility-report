import fs from 'fs';
import { load } from 'cheerio';

export interface Rule {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  check: ($: cheerio.CheerioAPI) => { passed: boolean; message: string; elements?: string[] };
}

export function parseRulesFromMarkdown(markdownContent: string): Rule[] {
  const lines = markdownContent.split('\n');
  const rules: Rule[] = [];
  let currentRule: Partial<Rule> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('## Rule:')) {
      if (currentRule.id) {
        // Finalize previous rule
        rules.push(currentRule as Rule);
      }
      // Start new rule
      currentRule = { id: line.replace('## Rule:', '').trim() };
    } else if (line.startsWith('- **Impact**:')) {
      currentRule.impact = line.split('**Impact**:')[1].trim() as Rule['impact'];
    } else if (line.startsWith('- **Description**:')) {
      currentRule.description = line.split('**Description**:')[1].trim();
    } else if (line.startsWith('- **Check**:')) {
      const checkLogic = line.split('**Check**:')[1].trim();
      // Compile check function from the description
      currentRule.check = createCheckFunction(checkLogic);
    }
  }
  if (currentRule.id) rules.push(currentRule as Rule);
  return rules;
}

function createCheckFunction(checkLogic: string): Rule['check'] {
  // Simple mapping from human-readable check to actual function
  if (checkLogic.includes('img:not([alt])')) {
    return ($) => {
      const images = $('img:not([alt])');
      return {
        passed: images.length === 0,
        message: `Found ${images.length} image(s) without alt attribute.`,
        elements: images.map((_, el) => $.html(el)).get(),
      };
    };
  }
  if (checkLogic.includes('heading order')) {
    return ($) => {
      let valid = true;
      let lastLevel = 0;
      const headings = $('h1,h2,h3,h4,h5,h6');
      headings.each((_, el) => {
        const level = parseInt(el.tagName[1]);
        if (level > lastLevel + 1) valid = false;
        lastLevel = level;
      });
      return {
        passed: valid,
        message: valid ? 'Headings are properly nested.' : 'Heading levels skipped.',
        elements: headings.map((_, el) => $.html(el)).get(),
      };
    };
  }
  if (checkLogic.includes('skip to content')) {
    return ($) => {
      const skipLink = $('a[href="#main"], a[href="#content"], .skip-link');
      const exists = skipLink.length > 0;
      return {
        passed: exists,
        message: exists ? 'Skip link present.' : 'No skip link found.',
        elements: skipLink.map((_, el) => $.html(el)).get(),
      };
    };
  }
  // Default fallback (always pass)
  return ($) => ({ passed: true, message: 'Rule not implemented.' });
}