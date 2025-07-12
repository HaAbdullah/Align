// TODO: Now deprecated since we are using Render

// const axios = require("axios");

// exports.handler = async function (event, context) {
//   // Set CORS headers
//   const headers = {
//     "Access-Control-Allow-Origin": "*",
//     "Access-Control-Allow-Headers": "Content-Type",
//     "Access-Control-Allow-Methods": "POST, OPTIONS",
//   };

//   // Handle preflight requests
//   if (event.httpMethod === "OPTIONS") {
//     return {
//       statusCode: 200,
//       headers,
//       body: "",
//     };
//   }

//   // Only allow POST requests
//   if (event.httpMethod !== "POST") {
//     return {
//       statusCode: 405,
//       headers,
//       body: JSON.stringify({ error: "Method Not Allowed" }),
//     };
//   }

//   try {
//     const body = JSON.parse(event.body);
//     const jobDescription = body.jobDescription;
//     console.log(
//       "Job Description received length:",
//       jobDescription ? jobDescription.length : 0
//     );

//     // Check if job description is empty or undefined
//     if (!jobDescription || jobDescription.trim() === "") {
//       return {
//         statusCode: 400,
//         headers,
//         body: JSON.stringify({ error: "Job description cannot be empty" }),
//       };
//     }

//     // Get API key from environment variable
//     const apiKey = process.env.CLAUDE_API_KEY;

//     if (!apiKey) {
//       return {
//         statusCode: 500,
//         headers,
//         body: JSON.stringify({ error: "API key not configured" }),
//       };
//     }

//     // Prepare the system prompt to ensure a 3-line summary
//     const systemPrompt = `You are a resume bullet point creator.\
//       Create EXACTLY 3 concise bullet points \
//       ENSURE the bullet points match the user's experiences to the key aspects of the job description provided.\
//       Things that mentioned in the Job description must be mentioned in the points. If there is a mismatch between resume and job description, focus on job description points.\
//       Focus on role responsibilities, required qualifications, and company information. \
//       Keep each bullet point to a single sentence. Do not include any additional text, explanations, or formatting.\
//       First, you will be given the user's resumes with the header (RESUME) and then the job description with the header (JOB DESCRIPTION).`;

//     // Call Claude API with the combined job description and resume
//     const response = await axios.post(
//       "https://api.anthropic.com/v1/messages",
//       {
//         model: "claude-3-5-sonnet-20241022",
//         max_tokens: 150,
//         system: systemPrompt,
//         messages: [
//           {
//             role: "user",
//             content: jobDescription,
//           },
//         ],
//       },
//       {
//         headers: {
//           "x-api-key": apiKey,
//           "Content-Type": "application/json",
//           "anthropic-version": "2023-06-01",
//         },
//         timeout: 9999, // 9 second timeout (within Netlify's 10s limit)
//       }
//     );

//     return {
//       statusCode: 200,
//       headers,
//       body: JSON.stringify(response.data),
//     };
//   } catch (error) {
//     console.error("Error:", error.message);

//     // Add more detailed error logging
//     if (error.response) {
//       console.error("API response status:", error.response.status);
//       console.error("API response data:", error.response.data);
//     }

//     return {
//       statusCode: 500,
//       headers,
//       body: JSON.stringify({
//         error: error.message || "Unknown error occurred",
//       }),
//     };
//   }
// };
