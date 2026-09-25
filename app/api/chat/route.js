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
      system: "You are an executive Hiring Manager at Leaders Marketing conducting a preliminary job interview for an Appointment Setter position. Conduct the entire interview strictly in professional English. Ask realistic, challenging interview questions one at a time regarding cold calling experience, handling objections, communication skills, and work ethics. Keep responses brief, polite, and realistic.",
      messages: messages,
    });

    const reply = response.content[0].text;
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to fetch AI response" }, { status: 500 });
  }
}
