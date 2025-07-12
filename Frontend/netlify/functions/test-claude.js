// netlify/functions/test-claude.js
const axios = require("axios");

exports.handler = async function (event, context) {
  // Set CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, x-claude-api-key",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Handle preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    // Get API key from environment variable or request header
    const apiKey =
      process.env.CLAUDE_API_KEY || event.headers["x-claude-api-key"];

    if (!apiKey) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: "API key is required",
        }),
      };
    }

    // Test the API key with a simple request
    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-3-7-sonnet-20250219",
        messages: [
          {
            role: "user",
            content: "Say hello and tell me that my API key is working!",
          },
        ],
        max_tokens: 100,
      },
      {
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
        },
      }
    );

    // Return success
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: response.data.content[0].text,
      }),
    };
  } catch (error) {
    console.log(
      "Error testing Claude API:",
      error.response?.data || error.message
    );

    return {
      statusCode: error.response?.status || 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: error.response?.data?.error?.message || error.message,
      }),
    };
  }
};
