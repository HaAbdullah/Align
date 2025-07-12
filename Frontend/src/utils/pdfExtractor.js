import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist";

// Set the worker source for PDF.js
GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`;

/**
 * Extracts text from a PDF file
 * @param {File} file - The PDF file object
 * @returns {Promise<string>} - Promise that resolves with the extracted text
 */
export const extractTextFromPDF = async (file) => {
  try {
    // Read the file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Load the PDF document
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    // Get the total number of pages
    const totalPages = pdf.numPages;
    const textPromises = [];

    // Extract text from each page
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Concatenate the text items from the page
      const pageText = textContent.items.map((item) => item.str).join(" ");

      textPromises.push(pageText);
    }

    // Combine text from all pages
    const fullText = textPromises.join("\n");
    return fullText;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw error;
  }
};

/**
 * Processes a PDF file and returns the extracted text
 * @param {File} file - The PDF file object
 * @returns {Promise<string>} - Promise that resolves with the extracted text
 */
export const processPDFResume = async (file) => {
  try {
    if (!file || file.type !== "application/pdf") {
      throw new Error("Please upload a valid PDF file");
    }

    const extractedText = await extractTextFromPDF(file);
    return extractedText;
  } catch (error) {
    console.error("Error processing PDF resume:", error);
    throw error;
  }
};
