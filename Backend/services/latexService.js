const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const axios = require('axios');

const readFileAsync = promisify(fs.readFile);

const PREAMBLE_PATH = path.join(__dirname, '..', 'resume-template-preamble.tex');
const CL_PREAMBLE_PATH = path.join(__dirname, '..', 'cover-letter-preamble.tex');
const LATEX_API_URL = 'https://latex.ytotech.com/builds/sync';

// Cache preambles in memory after first read
const _preambleCache = {};
async function getPreamble(filePath) {
  if (!_preambleCache[filePath]) {
    _preambleCache[filePath] = await readFileAsync(filePath, 'utf8');
  }
  return _preambleCache[filePath];
}

/**
 * Escape special LaTeX characters in a plain-text string.
 * Called by resumeBuilder.js — never by Claude.
 */
function escapeLatex(str) {
  if (!str) return '';
  return String(str)
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

/**
 * Compile a LaTeX body (sections only) into a PDF buffer via the YtoTech API.
 * Assembles: preamble + \begin{document} + body + \end{document}
 * @param {string} body - LaTeX content between \begin{document} and \end{document}
 * @returns {{ pdf: Buffer, latex: string }}
 */
async function compile(body, preamblePath = PREAMBLE_PATH) {
  const preamble = await getPreamble(preamblePath);
  const fullLatex = `${preamble}\n\n\\begin{document}\n\n${body}\n\n\\end{document}\n`;

  try {
    const response = await axios.post(
      LATEX_API_URL,
      {
        compiler: 'pdflatex',
        resources: [
          {
            main: true,
            content: fullLatex,
          },
        ],
      },
      {
        responseType: 'arraybuffer',
        timeout: 60000, // 60s — remote compilation can be slow on cold start
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const pdf = Buffer.from(response.data);
    return { pdf, latex: fullLatex };
  } catch (err) {
    // API returns error details in response body on 4xx/5xx
    if (err.response) {
      const body = Buffer.from(err.response.data).toString('utf8');
      throw new Error(`LaTeX compilation failed (${err.response.status}): ${body.slice(0, 500)}`);
    }
    throw new Error(`LaTeX API request failed: ${err.message}`);
  }
}

/**
 * Warm up: sends a minimal compile to the API on server startup
 * so the first real request hits a warm connection.
 */
async function warmUp() {
  try {
    console.log('Warming up LaTeX API connection...');
    await compile('\\begin{center}warm up\\end{center}');
    console.log('LaTeX API ready');
  } catch (err) {
    console.warn('LaTeX API warm-up failed:', err.message);
  }
}

async function compileCoverLetter(body) {
  return compile(body, CL_PREAMBLE_PATH);
}

module.exports = { compile, compileCoverLetter, escapeLatex, warmUp };
