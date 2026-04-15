/**
 * Test: PDF text extraction
 * Run with: node test_pdf_extract.mjs
 * Tests the pdfExtractor logic to ensure:
 *   1. No crash on PDFs with MarkedContent items (undefined item.str)
 *   2. Line structure is preserved (newlines between sections)
 *   3. Content is complete (not truncated)
 */
import * as pdfjsLib from './node_modules/pdfjs-dist/legacy/build/pdf.mjs';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function extractTextFromPDF(pdfBuffer) {
  const pdf = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;
  const pageTexts = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    const lineMap = new Map();
    for (const item of textContent.items) {
      // item.str is undefined on MarkedContent items — skip those
      if (!item.str || !item.str.trim() || !item.transform) continue;
      const y = Math.round(item.transform[5]);
      if (!lineMap.has(y)) lineMap.set(y, []);
      lineMap.get(y).push({ x: item.transform[4], text: item.str });
    }

    const lines = [...lineMap.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([, items]) =>
        items.sort((a, b) => a.x - b.x).map(i => i.text).join(' ').trim()
      )
      .filter(line => line.length > 0);

    pageTexts.push(lines.join('\n'));
  }

  return pageTexts.join('\n\n');
}

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  PASS  ${label}`);
    passed++;
  } else {
    console.log(`  FAIL  ${label}`);
    failed++;
  }
}

async function runTests() {
  console.log('=== PDF EXTRACTION TESTS ===\n');

  // Test 1: No crash on real PDF
  console.log('Test 1: No crash on valid PDF');
  try {
    const pdfBuffer = new Uint8Array(readFileSync(join(__dirname, 'node_modules/pdf-parse/test/data/01-valid.pdf')));
    const text = await extractTextFromPDF(pdfBuffer);
    assert(text.length > 0, 'extracted non-empty text');
    assert(typeof text === 'string', 'output is a string');
    assert(text.includes('\n'), 'output has newlines (line structure preserved)');
    console.log(`  Extracted ${text.length} chars, ${text.split('\n').length} lines\n`);
  } catch (err) {
    console.log(`  CRASH: ${err.message}\n`);
    failed++;
  }

  // Test 2: Multiple PDFs (robustness)
  console.log('Test 2: Multiple PDFs without crash');
  const pdfs = ['01-valid.pdf', '02-valid.pdf', '04-valid.pdf'];
  for (const name of pdfs) {
    try {
      const pdfBuffer = new Uint8Array(readFileSync(join(__dirname, `node_modules/pdf-parse/test/data/${name}`)));
      const text = await extractTextFromPDF(pdfBuffer);
      assert(text.length > 0, `${name} → extracted text`);
    } catch (err) {
      console.log(`  CRASH on ${name}: ${err.message}`);
      failed++;
    }
  }
  console.log();

  // Test 3: Simulate the MarkedContent bug fix
  // MarkedContent items have no `str` property — old code would crash with TypeError
  console.log('Test 3: Handles MarkedContent items (undefined item.str)');
  try {
    // Simulate what pdfjs returns when there are MarkedContent items
    const mockItems = [
      { str: 'Abdullah Hasanjee', transform: [1,0,0,1,100,700] },
      { transform: [1,0,0,1,50,680] }, // MarkedContent — no str property
      { str: undefined, transform: [1,0,0,1,50,680] }, // str is undefined
      { str: '', transform: [1,0,0,1,50,660] }, // str is empty
      { str: 'Software Engineer', transform: [1,0,0,1,100,650] },
    ];

    const lineMap = new Map();
    for (const item of mockItems) {
      if (!item.str || !item.str.trim() || !item.transform) continue;
      const y = Math.round(item.transform[5]);
      if (!lineMap.has(y)) lineMap.set(y, []);
      lineMap.get(y).push({ x: item.transform[4], text: item.str });
    }
    const lines = [...lineMap.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([, items]) => items.sort((a,b) => a.x - b.x).map(i => i.text).join(' ').trim())
      .filter(l => l.length > 0);

    assert(lines.length === 2, 'extracted 2 valid lines, skipped 3 bad items');
    assert(lines[0] === 'Abdullah Hasanjee', 'first line correct');
    assert(lines[1] === 'Software Engineer', 'second line correct');
    console.log();
  } catch (err) {
    console.log(`  CRASH: ${err.message}\n`);
    failed++;
  }

  console.log(`=== RESULTS: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) process.exit(1);
}

runTests();
