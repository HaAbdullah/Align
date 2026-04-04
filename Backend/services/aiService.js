/**
 * AI Service
 * Handles all AI-related API calls (Claude & Perplexity)
 * Clean, consistent service layer following FAANG standards
 */

const fs = require("fs");
const axios = require("axios");
const { APIError } = require("../middleware/errorMiddleware");
const { compile } = require("./latexService");
const resumeBuilder = require("./resumeBuilder");

class AIService {
  constructor() {
    // Load system prompts on initialization
    this.systemPrompts = {
      resume: this.loadPrompt("./Resume-Instructions.txt"),
      coverLetter: this.loadPrompt("./Cover-Letter-Instructions.txt"),
      resumeFeedback: `
You are a professional resume writer. You're receiving user feedback to improve their resume document. 
The user will provide:
1. Their resume
2. A job description
3. The current version of their resume
4. Their feedback on how to improve it

Your task is to carefully analyze the feedback and regenerate the RESUME incorporating the user's suggestions.
Only output the complete HTML resume document with CSS styling - no explanations or surrounding text.

Remember to:
- Preserve the professional formatting and style
- Implement ALL the user's requested changes
- Maintain the overall structure while improving the content
- Make sure the resume remains tailored to the specific job description
- ALWAYS return a RESUME, never a cover letter

The output should be a complete, standalone HTML resume document ready for display.
`,
      coverLetterFeedback: `
You are a professional cover letter writer. You're receiving user feedback to improve their cover letter document. 
The user will provide:
1. Their resume
2. A job description
3. The current version of their cover letter
4. Their feedback on how to improve it

Your task is to carefully analyze the feedback and regenerate the COVER LETTER incorporating the user's suggestions.
Only output the complete HTML cover letter document with CSS styling - no explanations or surrounding text.

Remember to:
- Preserve the professional formatting and style
- Implement ALL the user's requested changes
- Maintain the overall structure while improving the content
- Make sure the cover letter remains tailored to the specific job description
- ALWAYS return a COVER LETTER, never a resume

The output should be a complete, standalone HTML cover letter document ready for display.
`,
      questionGeneration: `
You are an expert interview coach and hiring manager. Based on the provided job description, generate a comprehensive list of interview questions that a company would typically ask for this role.

Please organize the questions into the following categories:
1. General/Behavioral Questions (5-7 questions)
2. Technical/Role-Specific Questions (7-10 questions) 
3. Company Culture/Situational Questions (4-6 questions)
4. Advanced/Problem-Solving Questions (3-5 questions)

For each question, also provide:
- The question text
- A brief hint about what the interviewer is looking for
- The difficulty level (Easy, Medium, Hard)

Return the response as a JSON object with this structure:
{
  "categories": [
    {
      "name": "General/Behavioral Questions",
      "questions": [
        {
          "question": "Tell me about yourself.",
          "hint": "Looking for concise professional summary and career highlights",
          "difficulty": "Easy"
        }
      ]
    }
  ]
}

Only return the JSON object, no additional text or explanation.
`,
      compensationAnalysis: `
You are an expert HR compensation analyst. Based on the provided job description, analyze and provide comprehensive compensation benchmarking data.

Please structure your response as a JSON object with the following format:
{
  "overview": {
    "position": "Job title extracted from description",
    "industry": "Industry sector",
    "averageSalary": 85000,
    "minSalary": 65000,
    "maxSalary": 110000,
    "trend": "Growing" | "Stable" | "Declining",
    "insights": [
      "Market insight 1",
      "Market insight 2",
      "Market insight 3"
    ]
  },
  "levels": [
    {
      "level": "Entry",
      "experience": "0-2 years",
      "minSalary": 55000,
      "maxSalary": 75000,
      "averageSalary": 65000
    },
    {
      "level": "Mid",
      "experience": "3-5 years", 
      "minSalary": 75000,
      "maxSalary": 95000,
      "averageSalary": 85000
    },
    {
      "level": "Senior",
      "experience": "6+ years",
      "minSalary": 95000,
      "maxSalary": 160000,
      "averageSalary": 110000
    }
  ],
  "locations": [
    {
      "city": "San Francisco",
      "state": "CA",
      "minSalary": 90000,
      "maxSalary": 140000,
      "averageSalary": 115000,
      "costOfLiving": 180,
      "jobCount": 245
    },
    {
      "city": "Austin",
      "state": "TX", 
      "minSalary": 70000,
      "maxSalary": 100000,
      "averageSalary": 85000,
      "costOfLiving": 110,
      "jobCount": 156
    }
  ],
  "benefits": [
    {
      "name": "Health Insurance",
      "value": "$8,000-$15,000/year",
      "icon": "🏥"
    },
    {
      "name": "401(k) Match",
      "value": "4-6% company match",
      "icon": "💰"
    },
    {
      "name": "PTO",
      "value": "15-25 days",
      "icon": "🏖️"
    },
    {
      "name": "Remote Work",
      "value": "Hybrid/Full Remote",
      "icon": "🏠"
    }
  ]
}

Provide realistic salary ranges based on current market data. Include 3-5 major locations with varying cost of living. Add 4-6 common benefits for this type of role.

Only return the JSON object, no additional text or explanation.
`,
      keywordsAnalysis: `You are an expert resume and job matching analyst. Your task is to analyze job descriptions and resume analysis results to identify matching keywords and their strategic importance.

Focus ONLY on keywords that appear in BOTH the job description AND the resume analysis results. Do not mention missing keywords.

IMPORTANT: Format your response as a simple list where each line follows this exact pattern:
Keyword: Brief explanation of why this match is strategically important

Examples:
React: Demonstrates proficiency in the primary frontend framework required for this role
Project Management: Shows leadership experience that aligns with the role's management responsibilities
Agile: Indicates familiarity with the development methodology used by the team

Do not use headers, sections, or bullet points. Just provide a clean list of keywords with their analysis, one per line.

Focus on:
- Technical skills that match
- Soft skills that align
- Qualifications that correspond
- Industry terms that overlap

Keep explanations concise but valuable for ATS optimization and strategic positioning.`,
      companyInsights: `You are a professional company research analyst. Based on the search results, create a comprehensive company insights report in JSON format. 

IMPORTANT: Return ONLY valid JSON without any markdown formatting, code blocks, or additional text.

The JSON should have this exact structure:
{
  "overview": {
    "companyName": "Company Name",
    "industry": "Industry Type",
    "companySize": "Employee count or size category",
    "founded": "Year founded (if available)",
    "description": "Brief company description"
  },
  "ratings": [
    {
      "platform": "Platform name (e.g., Glassdoor, Indeed, LinkedIn)",
      "rating": 4.2,
      "reviewCount": "Number of reviews",
      "recommendationRate": "Percentage who recommend (if available)"
    }
  ],
  "reviews": [
    {
      "title": "Review title or summary",
      "role": "Employee role/position",
      "rating": 4.0,
      "pros": "Positive aspects mentioned",
      "cons": "Negative aspects mentioned"
    }
  ],
  "culture": {
    "values": ["Value 1", "Value 2", "Value 3"],
    "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
    "workEnvironment": "Description of work environment and culture"
  },
  "insights": [
    {
      "icon": "📈",
      "title": "Growth & Opportunities",
      "description": "Career development and growth opportunities"
    },
    {
      "icon": "💰",
      "title": "Compensation & Benefits",
      "description": "Salary competitiveness and benefits package"
    },
    {
      "icon": "🏢",
      "title": "Work-Life Balance",
      "description": "Work-life balance and flexibility"
    },
    {
      "icon": "👥",
      "title": "Team & Management",
      "description": "Management quality and team dynamics"
    }
  ]
}

Focus on providing accurate, recent information. If specific data is not available, use reasonable defaults or indicate "N/A". Ensure all ratings are numerical values between 1.0 and 5.0.`,
    };
  }

  /**
   * Loads system prompt from file
   * @param {string} filePath - Path to prompt file
   * @returns {string} Prompt content or default message
   * @private
   */
  loadPrompt(filePath) {
    try {
      return fs.readFileSync(filePath, "utf8");
    } catch (error) {
      console.warn(`⚠️  Could not load prompt file: ${filePath}`);
      return "Default prompt - please configure system prompts.";
    }
  }

  /**
   * Generic Claude API call with consistent error handling
   * @param {string} systemPrompt - System prompt for Claude
   * @param {string} userContent - User content to process
   * @param {number} maxTokens - Maximum tokens for response
   * @returns {Object} Claude API response
   */
  async callClaudeAPI(systemPrompt, userContent, maxTokens = 4000) {
    if (!process.env.CLAUDE_API_KEY) {
      throw new APIError("Claude API key not configured", 500);
    }

    try {
      console.log(`Calling Claude API - Content length: ${userContent.length}`);

      const response = await axios.post(
        "https://api.anthropic.com/v1/messages",
        {
          model: "claude-sonnet-4-20250514",
          max_tokens: maxTokens,
          system: systemPrompt,
          messages: [
            {
              role: "user",
              content: userContent,
            },
          ],
        },
        {
          headers: {
            "x-api-key": process.env.CLAUDE_API_KEY,
            "Content-Type": "application/json",
            "anthropic-version": "2023-06-01",
          },
          timeout: 60000,
        }
      );

      console.log(
        `✅ Claude API success - Response length: ${
          response.data.content?.[0]?.text?.length || 0
        }`
      );
      const fullText = response.data.content
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join("");

      console.log("✅ Full content length:", fullText.length);
      console.log("📄 Full Claude text:\n", fullText);

      return response.data;
    } catch (error) {
      console.error("❌ Claude API error:", error.message);
      this._handleAPIError(error, "Claude");
    }
  }

  /**
   * Generic Perplexity API call with consistent error handling
   * @param {string} systemPrompt - System prompt for Perplexity
   * @param {string} userContent - User content to process
   * @param {number} maxTokens - Maximum tokens for response
   * @returns {Object} Formatted response matching Claude structure
   */
  async callPerplexityAPI(systemPrompt, userContent, maxTokens = 2000) {
    if (!process.env.PERPLEXITY_API_KEY) {
      throw new APIError("Perplexity API key not configured", 500);
    }

    try {
      console.log(
        `🔍 Calling Perplexity API - Content length: ${userContent.length}`
      );

      const response = await axios.post(
        "https://api.perplexity.ai/chat/completions",
        {
          model: "sonar",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: userContent,
            },
          ],
          max_tokens: maxTokens,
          temperature: 0.2,
          top_p: 0.9,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 60000,
        }
      );

      console.log(`✅ Perplexity API success`);

      // Format to match Claude response structure
      return {
        content: [
          {
            text: response.data.choices[0].message.content,
          },
        ],
      };
    } catch (error) {
      console.error("❌ Perplexity API error:", error.message);
      this._handleAPIError(error, "Perplexity");
    }
  }

  /**
   * Centralized API error handling
   * @param {Error} error - Error object from API call
   * @param {string} apiName - Name of the API (Claude/Perplexity)
   * @throws {APIError} Formatted API error
   * @private
   */
  _handleAPIError(error, apiName) {
    if (error.response) {
      console.error(`${apiName} API response status:`, error.response.status);
      console.error(`${apiName} API response data:`, error.response.data);
      throw new APIError(
        `${apiName} API error: ${
          error.response.data?.error?.message || error.message
        }`,
        error.response.status
      );
    }
    throw new APIError(`${apiName} API error: ${error.message}`, 500);
  }

  // =============================================================================
  // Document Generation Methods
  // =============================================================================

  /**
   * Generates resume based on job description
   * @param {string} jobDescription - Job description text
   * @returns {Object} Generated resume content
   */
  async generateResume(jobDescription) {
    const isFeedbackRequest =
      jobDescription.includes("USER FEEDBACK") &&
      jobDescription.includes("CURRENT RESUME");

    const systemPrompt = isFeedbackRequest
      ? this.systemPrompts.resumeFeedback
      : this.systemPrompts.resume;

    return this.callClaudeAPI(systemPrompt, jobDescription);
  }

  /**
   * Calls Claude with a given model (Haiku or Sonnet) and returns the text response.
   * @private
   */
  async _callClaude(model, systemPrompt, userContent, maxTokens = 800) {
    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: "user", content: userContent }],
      },
      {
        headers: {
          "x-api-key": process.env.CLAUDE_API_KEY,
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
        },
        timeout: 60000,
      }
    );
    return response.data.content.filter(p => p.type === "text").map(p => p.text).join("");
  }

  /**
   * Parse JSON from a Claude response, stripping any markdown fences.
   * @private
   */
  _parseJSON(text) {
    // Strip markdown fences
    let cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

    // Try direct parse first (fastest path)
    try { return JSON.parse(cleaned); } catch (_) {}

    // Find the first { or [ to determine JSON type
    const startObj = cleaned.indexOf('{');
    const startArr = cleaned.indexOf('[');
    if (startObj === -1 && startArr === -1) throw new Error('Malformed JSON in response');

    const isArr = startArr !== -1 && (startObj === -1 || startArr < startObj);
    const start = isArr ? startArr : startObj;
    const openChar = isArr ? '[' : '{';
    const closeChar = isArr ? ']' : '}';

    // Use brace-counting to find the true matching closing bracket,
    // correctly skipping { } [ ] inside JSON string values.
    let depth = 0;
    let inString = false;
    let escaped = false;
    let end = -1;

    for (let i = start; i < cleaned.length; i++) {
      const ch = cleaned[i];
      if (escaped)          { escaped = false; continue; }
      if (ch === '\\' && inString) { escaped = true;  continue; }
      if (ch === '"')       { inString = !inString; continue; }
      if (inString)         continue;
      if (ch === openChar)  { depth++; }
      else if (ch === closeChar) {
        depth--;
        if (depth === 0) { end = i; break; }
      }
    }

    if (end !== -1) {
      try { return JSON.parse(cleaned.slice(start, end + 1)); } catch (_) {}
    }

    // Fallback: the JSON may be truncated (hit token limit). Try the last
    // occurrence of the closing char and work backwards from there.
    let fallbackEnd = cleaned.lastIndexOf(closeChar);
    while (fallbackEnd > start) {
      try { return JSON.parse(cleaned.slice(start, fallbackEnd + 1)); } catch (_) {}
      fallbackEnd = cleaned.lastIndexOf(closeChar, fallbackEnd - 1);
    }

    throw new Error('Malformed JSON in response');
  }

  /**
   * V2: Generates resume using parallel Haiku section calls + Sonnet review.
   * Returns { latex, pdf } where pdf is a base64-encoded string.
   * @param {string} resumeText - Plain text of user's uploaded resume
   * @param {string} jobDescription - Job description text
   */
  async generateResumeV2(resumeText, jobDescription) {
    const HAIKU = "claude-haiku-4-5-20251001";
    const SONNET = "claude-sonnet-4-6";

    const context = `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`;
    // Experience and projects use resume-only context so Haiku cannot filter
    // entries based on JD relevance (e.g. accounting JD vs CS resume).
    const resumeOnlyContext = `RESUME:\n${resumeText}`;

    // ── Section prompts ──────────────────────────────────────────────────────
    // CRITICAL: Each prompt's ONLY job is data extraction → raw JSON output.
    // No notes, no commentary, no qualifications inside JSON string values.

    const headerPrompt = `You are a data extraction tool. Output ONLY raw JSON. No explanation, no markdown, no code fences, no commentary.

Extract the candidate's contact information from the RESUME section.

Output exactly this JSON shape:
{"name":"Full Name","phone":"phone number","email":"email@example.com","linkedin":"linkedin URL or empty string","github":"github URL or empty string"}

If a field is not found, use an empty string. Do not add any notes or comments inside the values.`;

    const skillsPrompt = `You are a data extraction tool. Output ONLY raw JSON. No explanation, no markdown, no code fences, no commentary.

Extract ALL technical skills from the RESUME section. Prioritise skills that also appear in the JOB DESCRIPTION.

Output exactly this JSON shape (2-4 categories, each with concise single-item names):
{"categories":[{"label":"Languages","items":["Python","JavaScript"]},{"label":"Frameworks & Libraries","items":["React","Node.js"]},{"label":"Tools & Platforms","items":["AWS","Docker","Git"]}]}

Only include TECHNICAL skills (programming languages, frameworks, tools, databases, software). Do NOT include spoken/human languages (English, Spanish, etc.) — those are not technical skills. Do not fabricate. Do not add notes inside values.`;

    const experiencePrompt = `You are a data extraction tool. Output ONLY raw JSON. No explanation, no markdown, no code fences, no commentary.

Extract ALL work experience entries from the RESUME section. You MUST include every job listed regardless of whether it matches the job description.

For each entry, copy the bullet points from the resume. Keep the strongest 3-4 bullets per job (prioritise those with metrics/numbers). You may tighten wording but never fabricate.

Output exactly this JSON shape (most recent first):
[{"company":"Company Name","title":"Job Title","startDate":"Mon YYYY","endDate":"Mon YYYY or Present","location":"City, State/Province","bullets":["Bullet text","Bullet text"]}]

RULES:
- ALWAYS output every job entry present in the RESUME — never return [] if jobs exist
- Maximum 4 bullets per job entry
- Never fabricate information
- Do not add notes or comments inside JSON string values
- Do not evaluate relevance to the job description — extract everything`;

    const educationPrompt = `You are a data extraction tool. Output ONLY raw JSON. No explanation, no markdown, no code fences, no commentary.

Extract ALL education entries from the RESUME section.

Output exactly this JSON shape (most recent first):
[{"school":"University Name","location":"City, Province/State","degree":"Degree — Major","dates":"Mon YYYY -- Mon YYYY","bullets":["Achievement or relevant coursework"]}]

Rules:
- For "dates": use format "Sep YYYY -- May YYYY", or "Expected Mon YYYY" if graduation is in the future, or just "YYYY -- YYYY" if only years are given
- Use "bullets" only if the resume explicitly lists achievements, awards, GPA, or coursework for that entry
- If no bullets, use an empty array for that entry
- Do not add notes, qualifications, or commentary inside any JSON string value
- Copy degree and school names exactly as they appear in the resume`;

    const projectsPrompt = `You are a data extraction tool. Output ONLY raw JSON. No explanation, no markdown, no code fences, no commentary.

Extract ALL projects from the "Projects" section of the RESUME. Include every project listed.

A PROJECT is something listed under the "Projects" section heading.
A PROJECT is NOT a job, internship, or co-op — those belong in Experience.

Output exactly this JSON shape:
[{"name":"Project Name","technologies":["React","Node.js"],"bullets":["What it does and its impact","Technical detail"]}]

Rules:
- Include ALL projects from the Projects section regardless of relevance to the job description
- ONLY include entries under the "Projects" section — do NOT pull from Experience
- Maximum 2 bullets per project
- Never fabricate projects or technologies
- If no Projects section exists in the resume, output an empty array: []
- Do not add notes or comments inside JSON string values`;

    // ── Run all 5 section calls in parallel ──────────────────────────────────
    console.log("Starting parallel Haiku section calls...");
    const [headerText, skillsText, experienceText, educationText, projectsText] =
      await Promise.all([
        this._callClaude(HAIKU, headerPrompt, context, 400),
        this._callClaude(HAIKU, skillsPrompt, context, 800),
        this._callClaude(HAIKU, experiencePrompt, resumeOnlyContext, 4000),
        this._callClaude(HAIKU, educationPrompt, context, 800),
        this._callClaude(HAIKU, projectsPrompt, resumeOnlyContext, 2000),
      ]);
    console.log("All section calls complete");
    console.log("--- RAW HAIKU OUTPUTS ---");
    console.log("HEADER:", headerText);
    console.log("SKILLS:", skillsText);
    console.log("EXPERIENCE:", experienceText);
    console.log("EDUCATION:", educationText);
    console.log("PROJECTS:", projectsText);
    console.log("--- END RAW OUTPUTS ---");

    // ── Parse JSON from each section ─────────────────────────────────────────
    // Critical sections (header, skills, experience, education) throw on failure
    // so the error is visible in logs. Projects is optional — silently falls back.
    const parseSection = (name, text, fallback, optional = false) => {
      try {
        const parsed = this._parseJSON(text);
        if (parsed === null || parsed === undefined) {
          if (optional) { console.warn(`Section "${name}" returned null, using empty fallback`); return fallback; }
          throw new Error(`Section "${name}" returned null/undefined`);
        }
        return parsed;
      } catch (err) {
        console.error(`JSON parse failed for section "${name}":`, err.message);
        console.error(`  Raw output (first 600 chars): ${text.slice(0, 600)}`);
        if (optional) { console.warn(`  Using empty fallback for optional section "${name}"`); return fallback; }
        throw new Error(`Malformed JSON in ${name} section: ${err.message}`);
      }
    };
    const header     = parseSection('header',     headerText,     { name: '', phone: '', email: '', linkedin: '', github: '' });
    const skills     = parseSection('skills',     skillsText,     { categories: [] });
    const experience = parseSection('experience', experienceText, []);
    const education  = parseSection('education',  educationText,  []);
    const projects   = parseSection('projects',   projectsText,   [], true);

    // ── Build LaTeX body and compile ─────────────────────────────────────────
    const body = resumeBuilder.buildAll({ header, skills, experience, education, projects });
    console.log("📄 Compiling LaTeX...");
    const { pdf: pdfBuffer, latex } = await compile(body);
    console.log("✅ LaTeX compiled successfully");

    return {
      latex,
      pdf: pdfBuffer.toString("base64"),
    };
  }

  /**
   * Generates cover letter based on job description
   * @param {string} jobDescription - Job description text
   * @returns {Object} Generated cover letter content
   */
  async generateCoverLetter(jobDescription) {
    const isFeedbackRequest =
      jobDescription.includes("USER FEEDBACK") &&
      jobDescription.includes("CURRENT COVER LETTER");

    const systemPrompt = isFeedbackRequest
      ? this.systemPrompts.coverLetterFeedback
      : this.systemPrompts.coverLetter;

    return this.callClaudeAPI(systemPrompt, jobDescription);
  }

  /**
   * Generates interview questions based on job description
   * @param {string} jobDescription - Job description text
   * @returns {Object} Generated questions content
   */
  async generateQuestions(jobDescription) {
    const content = `Please generate interview questions for this job posting:\n\n${jobDescription}`;
    const response = await this.callClaudeAPI(
      this.systemPrompts.questionGeneration,
      content
    );

    // Clean Claude response to remove markdown formatting
    return this._cleanClaudeJSONResponse(response);
  }

  // =============================================================================
  // Analysis Methods (Using Perplexity for real-time data)
  // =============================================================================

  /**
   * Generates compensation analysis using real-time market data
   * @param {string} jobDescription - Job description text
   * @returns {Object} Compensation analysis data
   */
  async generateCompensation(jobDescription) {
    const jobTitle = this._extractJobTitle(jobDescription);
    const searchQuery = `Current salary ranges and compensation data for ${jobTitle} position in 2024-2025. Include salary by experience level (entry, mid, senior), major US cities, industry trends, and common benefits packages.`;
    const content = `Search for current compensation data: ${searchQuery}\n\nJob Description: ${jobDescription}`;

    return this.callPerplexityAPI(
      this.systemPrompts.compensationAnalysis,
      content,
      3000
    );
  }

  /**
   * Generates company insights using real-time data
   * @param {string} jobDescription - Job description text
   * @returns {Object} Company insights data with fallback handling
   */
  async generateCompanyInsights(jobDescription) {
    const companyName = this._extractCompanyName(jobDescription);
    const searchQuery = `${companyName} company reviews employee ratings Glassdoor Indeed LinkedIn company culture benefits workplace insights testimonials 2024 2025`;
    const content = `Search for comprehensive company insights: ${searchQuery}\n\nJob Description Context: ${jobDescription}`;

    const response = await this.callPerplexityAPI(
      this.systemPrompts.companyInsights,
      content,
      3000
    );

    return this._processCompanyInsightsResponse(response, companyName);
  }

  /**
   * Generates keywords analysis comparing job description with resume
   * @param {string} jobDescription - Job description text
   * @param {Object} analysisResults - Resume analysis results
   * @returns {Object} Keywords analysis data
   */
  async generateKeywords(jobDescription, analysisResults) {
    if (!analysisResults) {
      throw new APIError(
        "Analysis results are required for keyword comparison",
        400
      );
    }

    const jobTitle = this._extractJobTitle(jobDescription);
    const content = `
Job Title: ${jobTitle}

Job Description:
${jobDescription}

Resume Analysis Results:
${JSON.stringify(analysisResults, null, 2)}

Please analyze and identify ONLY the keywords that appear in BOTH the job description and the resume analysis results. Return each keyword with its analysis on a separate line using the format: "Keyword: Analysis"`;

    return this.callPerplexityAPI(this.systemPrompts.keywordsAnalysis, content);
  }

  // =============================================================================
  // Utility Methods
  // =============================================================================

  /**
   * Extracts job title from job description
   * @param {string} jobDescription - Job description text
   * @returns {string} Extracted job title or default
   * @private
   */
  _extractJobTitle(jobDescription) {
    const jobTitleMatch =
      jobDescription.match(/(?:job title|position|role):\s*([^\n]+)/i) ||
      jobDescription.match(/^([^\n]+)/);
    return jobTitleMatch ? jobTitleMatch[1].trim() : "Software Developer";
  }

  /**
   * Extracts company name from job description
   * @param {string} jobDescription - Job description text
   * @returns {string} Extracted company name or default
   * @private
   */
  _extractCompanyName(jobDescription) {
    const companyNameMatch =
      jobDescription.match(/(?:company|organization|employer):\s*([^\n]+)/i) ||
      jobDescription.match(
        /at\s+([A-Z][a-zA-Z\s&.,]+?)(?:\s+is|\s+seeks|\s+looking)/i
      ) ||
      jobDescription.match(
        /([A-Z][a-zA-Z\s&.,]+?)\s+is\s+(?:seeking|looking|hiring)/i
      );

    return companyNameMatch
      ? companyNameMatch[1].trim().replace(/[.,]$/, "")
      : "the company";
  }

  /**
   * Processes company insights response with fallback handling
   * @param {Object} response - API response
   * @param {string} companyName - Company name for fallback
   * @returns {Object} Processed response with fallback if needed
   * @private
   */
  _processCompanyInsightsResponse(response, companyName) {
    try {
      const cleanedContent = response.content[0].text
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();

      const parsedData = JSON.parse(cleanedContent);

      return {
        content: [
          {
            text: JSON.stringify(parsedData),
          },
        ],
      };
    } catch (parseError) {
      console.error("❌ Error parsing company insights JSON:", parseError);
      return this._getCompanyInsightsFallback(companyName);
    }
  }

  /**
   * Cleans Claude API response to remove markdown formatting and ensure valid JSON
   * @param {Object} response - Claude API response
   * @returns {Object} Cleaned response with valid JSON
   * @private
   */
  _cleanClaudeJSONResponse(response) {
    try {
      if (
        !response.content ||
        !response.content[0] ||
        !response.content[0].text
      ) {
        throw new Error("Invalid Claude response structure");
      }

      let content = response.content[0].text;

      // Remove markdown code blocks
      content = content
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();

      // Validate that it's valid JSON
      const parsedJSON = JSON.parse(content);

      // Return in the same format but with cleaned content
      return {
        content: [
          {
            text: JSON.stringify(parsedJSON),
          },
        ],
      };
    } catch (parseError) {
      console.error("❌ Error cleaning Claude JSON response:", parseError);
      console.error("Raw content:", response.content[0].text);

      // Return original response if cleaning fails
      return response;
    }
  }
  _getCompanyInsightsFallback(companyName) {
    const fallbackData = {
      overview: {
        companyName: companyName,
        industry: "Technology",
        companySize: "Not specified",
        founded: "N/A",
        description: "Company information could not be retrieved at this time.",
      },
      ratings: [
        {
          platform: "Glassdoor",
          rating: 3.5,
          reviewCount: "N/A",
          recommendationRate: "N/A",
        },
      ],
      reviews: [
        {
          title: "General Employee Feedback",
          role: "Various Positions",
          rating: 3.5,
          pros: "Information not available",
          cons: "Information not available",
        },
      ],
      culture: {
        values: ["Innovation", "Collaboration", "Excellence"],
        benefits: ["Health Insurance", "Retirement Plan", "Paid Time Off"],
        workEnvironment: "Company culture information not available",
      },
      insights: [
        {
          icon: "📈",
          title: "Growth & Opportunities",
          description: "Career development information not available",
        },
        {
          icon: "💰",
          title: "Compensation & Benefits",
          description: "Compensation information not available",
        },
        {
          icon: "🏢",
          title: "Work-Life Balance",
          description: "Work-life balance information not available",
        },
        {
          icon: "👥",
          title: "Team & Management",
          description: "Management information not available",
        },
      ],
    };

    return {
      content: [
        {
          text: JSON.stringify(fallbackData),
        },
      ],
    };
  }
}

module.exports = new AIService();
