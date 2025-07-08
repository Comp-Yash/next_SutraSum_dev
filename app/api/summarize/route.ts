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

// Function to chunk text for large inputs
function chunkText(text: string, maxChunkSize: number = 30000): string[] {
  if (text.length <= maxChunkSize) {
    return [text]
  }
  
  const chunks: string[] = []
  let start = 0
  
  while (start < text.length) {
    let end = start + maxChunkSize
    
    // Try to break at a sentence or paragraph boundary
    if (end < text.length) {
      const lastPeriod = text.lastIndexOf('.', end)
      const lastNewline = text.lastIndexOf('\n', end)
      const breakPoint = Math.max(lastPeriod, lastNewline)
      
      if (breakPoint > start + maxChunkSize * 0.5) {
        end = breakPoint + 1
      }
    }
    
    chunks.push(text.slice(start, end))
    start = end
  }
  
  return chunks
}

// Function to summarize large text by processing chunks
async function summarizeLargeText(text: string, apiKey: string): Promise<string> {
  // For very large texts, process in chunks
  if (text.length > 50000) {
    const chunks = chunkText(text, 30000)
    const chunkSummaries: string[] = []
    
    console.log(`Processing ${chunks.length} chunks for large text`)
    
    for (let i = 0; i < chunks.length; i++) {
      console.log(`Processing chunk ${i + 1}/${chunks.length}`)
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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
                    text: `Please provide a concise summary of this text section (part ${i + 1} of ${chunks.length}). Focus on the main points and key insights:\n\n${chunks[i]}`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1000,
            },
          }),
        },
      )
      
      if (!response.ok) {
        throw new Error(`Failed to summarize chunk ${i + 1}: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
        chunkSummaries.push(result.candidates[0].content.parts[0].text)
      }
      
      // Add a small delay to avoid rate limiting
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    // Now combine all chunk summaries into a final summary
    const combinedSummary = chunkSummaries.join('\n\n')
    
    const finalResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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
                  text: `Please create a comprehensive final summary by combining these section summaries. Create a cohesive, well-structured summary that captures all the main points (aim for 400-600 words):\n\n${combinedSummary}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1500,
          },
        }),
      },
    )
    
    if (!finalResponse.ok) {
      throw new Error(`Failed to create final summary: ${finalResponse.status}`)
    }
    
    const finalResult = await finalResponse.json()
    
    if (!finalResult.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Invalid response structure from final summary")
    }
    
    return finalResult.candidates[0].content.parts[0].text
  } else {
    // For smaller texts, process directly
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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
                  text: `Please provide a concise and comprehensive summary of the following text. Focus on the main points, key insights, and important details. Keep the summary between 300-500 words. Proper well structured summary:\n\n${text}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1200,
          },
        }),
      },
    )
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }
    
    const result = await response.json()
    
    if (!result.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Invalid response structure from Gemini")
    }
    
    return result.candidates[0].content.parts[0].text
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Starting file processing...")
    
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("Processing file:", file.name, "Type:", file.type, "Size:", file.size)

    // Check file size (Vercel free tier limit is 4MB for request body)
    const maxFileSize = 4 * 1024 * 1024 // 4MB
    if (file.size > maxFileSize) {
      return NextResponse.json(
        { error: `File size exceeds limit. Maximum allowed size is 4MB, but file is ${(file.size / 1024 / 1024).toFixed(2)}MB.` },
        { status: 400 }
      )
    }

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
            error: "Could not extract readable text from PDF. The PDF might be image-based or encrypted. Please ensure the PDF contains selectable text or try converting to TXT format.",
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

    // Clean the text (remove excessive whitespace, normalize line breaks)
    text = text.replace(/\s+/g, ' ').trim()

    // Use environment variable for API key (more secure)
    const GEMINI_API_KEY = "AIzaSyDtuDrum9_r2aEsZdDWKh3TAvsKALMGWMM"

    console.log("Calling Gemini API for summarization...")

    const summary = await summarizeLargeText(text, GEMINI_API_KEY)

    console.log("Summary generated successfully, length:", summary.length)

    return NextResponse.json({ summary })
  } catch (error) {
    console.error("Summarization error:", error)
    
    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes("timeout")) {
        return NextResponse.json(
          { error: "Request timeout. Please try with a smaller file or try again later." },
          { status: 504 }
        )
      }
      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again in a few moments." },
          { status: 429 }
        )
      }
      if (error.message.includes("quota")) {
        return NextResponse.json(
          { error: "API quota exceeded. Please try again later." },
          { status: 503 }
        )
      }
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate summary. Please try again.",
      },
      { status: 500 },
    )
  }
}
