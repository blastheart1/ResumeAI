import { NextResponse } from "next/server";
import OpenAI from "openai";

let lastCallTime = 0; // timestamp in ms
const RATE_LIMIT_MS = 1500; // 1.5s between requests

export async function POST(req: Request) {
  const now = Date.now();
  if (now - lastCallTime < RATE_LIMIT_MS) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again in a moment." },
      { status: 429 }
    );
  }

  lastCallTime = now;

  try {
    const body = await req.json();
    const { matched, missing } = body;

    if (!matched || !missing) {
      return NextResponse.json(
        { error: "Missing matched or missing skills" },
        { status: 400 }
      );
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a detailed resume analysis assistant. Provide actionable, structured insights. Highlight strengths, skill gaps, and grouped missing skills."
        },
        {
          role: "user",
          content: `Resume matched: ${matched.join(", ")}. Missing: ${missing.join(", ")}.
Please provide:
1. One-line emoji summary of resume strengths.
2. Detailed recommendations to improve resume for missing skills.
3. Contextual grouping of missing skills by category.
Return JSON with keys: insight (string), recommendations (array), grouped (object).`
        }
      ],
      temperature: 0.3,
      max_tokens: 350
    });

    const raw = response.choices?.[0]?.message?.content?.trim() || "";
    try {
      const parsed = JSON.parse(raw);
      console.log("OpenAI response parsed:", parsed); // log for terminal
      return NextResponse.json(parsed);
    } catch {
      console.log("OpenAI response raw:", raw);
      return NextResponse.json({ insight: raw, recommendations: [], grouped: {} });
    }
  } catch (err: any) {
    console.error("OpenAI request failed:", err);
    return NextResponse.json({ error: err.message || "OpenAI request failed" }, { status: 500 });
  }
}
