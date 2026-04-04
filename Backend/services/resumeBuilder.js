const { escapeLatex } = require('./latexService');

/**
 * Build the heading section.
 * @param {{ name, phone, email, linkedin, github }} data
 */
function buildHeader(data) {
  const { name, phone, email, linkedin, github } = data;
  const e = escapeLatex;

  // Extract just the path portion for display (linkedin.com/in/foo → linkedin.com/in/foo)
  const linkedinDisplay = linkedin ? linkedin.replace(/^https?:\/\//i, '') : '';
  const githubDisplay = github ? github.replace(/^https?:\/\//i, '') : '';
  const linkedinHref = linkedin && !/^https?:\/\//i.test(linkedin) ? `https://${linkedin}` : (linkedin || '');
  const githubHref = github && !/^https?:\/\//i.test(github) ? `https://${github}` : (github || '');

  return `\\begin{center}
    \\textbf{\\Huge \\scshape ${e(name)}} \\\\ \\vspace{1pt}
    \\small ${e(phone)} $|$ \\href{mailto:${email}}{\\underline{${e(email)}}} $|$${linkedinDisplay ? `
    \\href{${linkedinHref}}{\\underline{${e(linkedinDisplay)}}} $|$` : ''}${githubDisplay ? `
    \\href{${githubHref}}{\\underline{${e(githubDisplay)}}}` : ''}
\\end{center}`;
}

/**
 * Build the Technical Skills section.
 * @param {{ categories: Array<{ label: string, items: string[] }> }} data
 */
function buildSkills(data) {
  const { categories } = data;
  const e = escapeLatex;

  const lines = categories.map(cat =>
    `     \\textbf{${e(cat.label)}}{: ${cat.items.map(e).join(', ')}} \\\\`
  ).join('\n');

  return `\\section{Technical Skills}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
${lines}
    }}
 \\end{itemize}`;
}

/**
 * Build the Experience section.
 * @param {Array<{ company, title, startDate, endDate, location, bullets: string[] }>} entries
 */
function buildExperience(entries) {
  const e = escapeLatex;

  const items = entries.map(entry => {
    const dateRange = entry.endDate
      ? `${e(entry.startDate)} -- ${e(entry.endDate)}`
      : e(entry.startDate);

    const bullets = entry.bullets.map(b => `        \\resumeItem{${e(b)}}`).join('\n');

    return `    \\resumeSubheading
      {${e(entry.company)}}{${dateRange}}
      {${e(entry.title)}}{${e(entry.location)}}
      \\resumeItemListStart
${bullets}
      \\resumeItemListEnd`;
  }).join('\n\n');

  return `\\section{Experience}
  \\resumeSubHeadingListStart

${items}

  \\resumeSubHeadingListEnd`;
}

/**
 * Build the Education section.
 * @param {Array<{ school, location, degree, dates, bullets?: string[] }>} entries
 */
function buildEducation(entries) {
  const e = escapeLatex;

  const items = entries.map(entry => {
    let block = `    \\resumeSubheading
      {${e(entry.school)}}{${e(entry.location)}}
      {${e(entry.degree)}}{${e(entry.dates || '')}}`;

    if (entry.bullets && entry.bullets.length > 0) {
      const bullets = entry.bullets.map(b => `        \\resumeItem{${e(b)}}`).join('\n');
      block += `
      \\resumeItemListStart
${bullets}
      \\resumeItemListEnd`;
    }

    return block;
  }).join('\n\n');

  return `\\section{Education}
  \\resumeSubHeadingListStart
${items}
  \\resumeSubHeadingListEnd`;
}

/**
 * Build the Projects section.
 * @param {Array<{ name, technologies: string[], bullets: string[] }>} entries
 */
function buildProjects(entries) {
  const e = escapeLatex;

  const items = entries.map(entry => {
    const techStr = entry.technologies.map(e).join(', ');
    const bullets = entry.bullets.map(b => `            \\resumeItem{${e(b)}}`).join('\n');

    return `      \\resumeProjectHeading
          {\\textbf{${e(entry.name)}} $|$ \\emph{${techStr}}}{}
          \\resumeItemListStart
${bullets}
          \\resumeItemListEnd`;
  }).join('\n');

  return `\\section{Projects}
    \\resumeSubHeadingListStart
${items}
    \\resumeSubHeadingListEnd`;
}

/**
 * Assemble all sections into the full document body.
 * Sections are only included when they have content.
 * Order: Technical Skills → Experience → Education → Projects
 */
function buildAll({ header, skills, experience, education, projects }) {
  const sections = [buildHeader(header)];

  if (skills && skills.categories && skills.categories.length > 0) {
    sections.push(buildSkills(skills));
  }
  if (experience && experience.length > 0) {
    sections.push(buildExperience(experience));
  }
  if (education && education.length > 0) {
    sections.push(buildEducation(education));
  }
  if (projects && projects.length > 0) {
    sections.push(buildProjects(projects));
  }

  return sections.join('\n\n\n');
}

module.exports = { buildHeader, buildSkills, buildExperience, buildEducation, buildProjects, buildAll };
