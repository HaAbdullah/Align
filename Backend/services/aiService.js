/**
 * AI Service
 * Handles all AI-related API calls (Claude & Perplexity)
 * Clean, consistent service layer following FAANG standards
 */

const fs = require("fs");
const axios = require("axios");
const { APIError } = require("../middleware/errorMiddleware");

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
