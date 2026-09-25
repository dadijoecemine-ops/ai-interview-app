import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req) {
  try {
    const { messages } = await req.json();

    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      system: "Ikaw usa ka maayo, propesyonal, ug accommodating nga AI Job Interviewer para sa recruitment portal. Tubag lang sa Bisaya/Cebuano o English depende sa gamit sa applicant. Pagpangutana ug usa ka interview question kada usag-usa.",
      messages: messages,
    });

    const reply = response.content[0].text;
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to fetch AI response" }, { status: 500 });
  }
}
