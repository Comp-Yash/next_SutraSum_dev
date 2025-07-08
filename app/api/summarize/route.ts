import { type NextRequest, NextResponse } from "next/server"
import * as mammoth from 'mammoth'

// Simple PDF text extraction function using pdf-parse
async function extractPDFText(buffer: ArrayBuffer): Promise<string> {
  try {
    // Import pdf-parse dynamically
    const pdf = await import('pdf-parse/lib/pdf-parse')
    
    // Convert ArrayBuffer to Buffer
    const pdfBuffer = Buffer.from(buffer)
    
    // Parse the PDF
    const data = await pdf.default(pdfBuffer)
    
    return data.text || ""
  } catch (error) {
    console.error("PDF extraction error:", error)
    throw new Error("Failed to extract text from PDF")
  }
}

// DOCX text extraction function using mammoth
async function extractDOCXText(buffer: ArrayBuffer): Promise<string> {
  try {
    // Convert ArrayBuffer to Buffer
    const docxBuffer = Buffer.from(buffer)
    
    // Extract text using mammoth
    const result = await mammoth.extractRawText({ buffer: docxBuffer })
    
    return result.value || ""
  } catch (error) {
    console.error("DOCX extraction error:", error)
    throw new Error("Failed to extract text from DOCX")
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("Processing file:", file.name, "Type:", file.type, "Size:", file.size)

    // Extract text from file based on type
    let text = ""

    if (file.type === "text/plain") {
      text = await file.text()
    } else if (file.type === "application/pdf") {
      console.log("Processing PDF file...")
      const buffer = await file.arrayBuffer()
      text = await extractPDFText(buffer)

      if (!text || text.trim().length < 10) {
        return NextResponse.json(
          {
            error:
              "Could not extract readable text from PDF. The PDF might be image-based or encrypted. Please ensure the PDF contains selectable text or try converting to TXT format.",
          },
          { status: 400 },
        )
      }
    } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      console.log("Processing DOCX file...")
      const buffer = await file.arrayBuffer()
      text = await extractDOCXText(buffer)

      if (!text || text.trim().length < 10) {
        return NextResponse.json(
          {
            error: "Could not extract readable text from DOCX. The document might be corrupted or heavily formatted. Please try converting to TXT format.",
          },
          { status: 400 },
        )
      }
    } else {
      return NextResponse.json(
        {
          error: `Unsupported file type: ${file.type}. Please upload a PDF, DOCX, or TXT file.`,
        },
        { status: 400 },
      )
    }

    console.log("Extracted text length:", text.length)
    console.log("Text preview:", text.substring(0, 200) + "...")

    if (!text.trim()) {
      return NextResponse.json({ error: "No text content found in file" }, { status: 400 })
    }

    // Truncate text if too long (Gemini has token limits)
    const maxLength = 8000
    if (text.length > maxLength) {
      text = text.substring(0, maxLength) + "..."
      console.log("Text truncated to", maxLength, "characters")
    }

    // Use direct API call to Google Gemini
    const GEMINI_API_KEY = "AIzaSyDtuDrum9_r2aEsZdDWKh3TAvsKALMGWMM"

    console.log("Calling Gemini API...")

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Please provide a concise and comprehensive summary of the following text. Focus on the main points, key insights, and important details. Keep the summary between 300 words . Proper well structured summary (dont use *):\n\n${text}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 500,
          },
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Gemini API error:", response.status, errorData)
      return NextResponse.json(
        {
          error: `Failed to generate summary: ${response.status}`,
        },
        { status: 500 },
      )
    }

    const result = await response.json()
    console.log("Gemini API response received")

    if (!result.candidates || !result.candidates[0] || !result.candidates[0].content) {
      console.error("Unexpected Gemini response structure:", result)
      return NextResponse.json(
        {
          error: "Invalid response from AI service",
        },
        { status: 500 },
      )
    }

    const summary = result.candidates[0].content.parts[0].text
    console.log("Summary generated successfully, length:", summary.length)

    return NextResponse.json({ summary })
  } catch (error) {
    console.error("Summarization error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate summary. Please try again.",
      },
      { status: 500 },
    )
  }
}
