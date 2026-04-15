const { escapeLatex } = require('./latexService');

/**
 * Build the cover letter body as a LaTeX string.
 * @param {{ name, email, phone, linkedin, date, company, jobTitle, paragraph1, paragraph2 }} data
 */
function buildCoverLetter({ name, email, phone, linkedin, date, paragraph1, paragraph2 }) {
  const e = escapeLatex;

  const linkedinDisplay = linkedin ? linkedin.replace(/^https?:\/\//i, '') : '';
  const linkedinHref = linkedin && !/^https?:\/\//i.test(linkedin)
    ? `https://${linkedin}`
    : (linkedin || '');

  const contactParts = [];
  if (phone) contactParts.push(e(phone));
  if (email) contactParts.push(`\\href{mailto:${email}}{\\underline{${e(email)}}}`);
  if (linkedinDisplay) contactParts.push(`\\href{${linkedinHref}}{\\underline{${e(linkedinDisplay)}}}`);

  return `\\begin{center}
  \\textbf{\\Huge \\scshape ${e(name)}} \\\\ \\vspace{3pt}
  \\small ${contactParts.join(' $|$ ')}
\\end{center}

\\vspace{10pt}

${e(date)}

\\vspace{10pt}

Dear Hiring Manager,

${e(paragraph1)}

${e(paragraph2)}

\\vspace{14pt}

Sincerely,

\\vspace{26pt}

${e(name)}`;
}

module.exports = { buildCoverLetter };
