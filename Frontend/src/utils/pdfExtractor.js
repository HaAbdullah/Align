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
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pageTexts = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Group text items by their Y position so line structure is preserved.
      // Without this, all items are joined with spaces into one blob and Haiku
      // cannot distinguish section headers, job titles, dates, or bullet points.
      const lineMap = new Map();
      for (const item of textContent.items) {
        // item.str is undefined on MarkedContent items — skip those
        if (!item.str || !item.str.trim() || !item.transform) continue;
        // Round Y to the nearest integer to group items on the same visual line
        const y = Math.round(item.transform[5]);
        if (!lineMap.has(y)) lineMap.set(y, []);
        lineMap.get(y).push({ x: item.transform[4], text: item.str });
      }

      // Sort lines top-to-bottom (PDF Y coords are bottom-up, so descending = top first)
      const lines = [...lineMap.entries()]
        .sort((a, b) => b[0] - a[0])
        .map(([, items]) =>
          items
            .sort((a, b) => a.x - b.x)
            .map((i) => i.text)
            .join(" ")
            .trim()
        )
        .filter((line) => line.length > 0);

      pageTexts.push(lines.join("\n"));
    }

    return pageTexts.join("\n\n");
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
