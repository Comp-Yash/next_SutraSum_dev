import { type NextRequest, NextResponse } from "next/server"

const SUTRA_API_KEY = "sutra_guk0VYktZkUSuFzVYZ6X9GmRKOy6JxZhRGYMTN6njJNmxIz6X00K4a7VEG5h"

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage } = await request.json()

    if (!text || !targetLanguage) {
      return NextResponse.json(
        {
          error: "Text and target language are required",
        },
        { status: 400 },
      )
    }

    console.log("Translating to language:", targetLanguage)

    const response = await fetch("https://api.two.ai/v2/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUTRA_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        model: "sutra-v2",
        messages: [
          {
            role: "user",
            content: `Translate the following English text to ${targetLanguage} language. Maintain the meaning and context. Only provide the translation, no additional text:\n\n${text}`,
          },
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Sutra API error:", response.status, errorText)
      return NextResponse.json(
        {
          error: `Translation service error: ${response.status}`,
        },
        { status: 500 },
      )
    }

    const result = await response.json()
    console.log("Sutra API response:", result)

    const translation = result.choices?.[0]?.message?.content

    if (!translation) {
      console.error("No translation in response:", result)
      return NextResponse.json(
        {
          error: "No translation received from service",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ translation })
  } catch (error) {
    console.error("Translation error:", error)
    return NextResponse.json(
      {
        error: "Failed to translate text. Please try again.",
      },
      { status: 500 },
    )
  }
}
