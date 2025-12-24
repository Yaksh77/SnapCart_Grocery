import connectDB from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

function extractSuggestions(text: string): string[] {
  try {
    if (!text || typeof text !== "string") return [];

    // Remove markdown
    const cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    // 1️⃣ Try parsing full JSON
    try {
      const parsed = JSON.parse(cleaned);

      // ✅ Case: array
      if (Array.isArray(parsed)) return parsed;

      // ✅ Case: object with message
      if (parsed?.message && typeof parsed.message === "string") {
        return [parsed.message];
      }
    } catch {
      // ignore, try regex fallback
    }

    // 2️⃣ Fallback: extract array inside text
    const match = cleaned.match(/\[[\s\S]*?\]/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return Array.isArray(parsed) ? parsed : [];
    }

    // 3️⃣ Final fallback: plain text → single suggestion
    if (cleaned.length > 0) {
      return [cleaned];
    }

    return [];
  } catch (error) {
    console.error("Suggestion parse error:", error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { message, role } = await request.json();
    console.log(message);

    const GEMINI_CHAT_SUGGESTION_PROMPT = `
You are an AI assistant inside a grocery delivery app chat system called SnapCart.

Your role is to generate SHORT, NATURAL, and POLITE chat suggestions.

-------------------------
CONTEXT
-------------------------
User Role: {{role}}
Incoming Message: {{incomingMessage}}

-------------------------
RULES
-------------------------
1. Respond in simple, friendly language
2. Messages must sound human, not robotic
3. Each suggestion under 15 words
4. Do NOT include emojis
5. Do NOT mention AI or system messages
6. Match the role and situation exactly

-------------------------
ROLE BEHAVIOR
-------------------------
If role = "user":
- Ask about delivery time
- Confirm address
- Ask politely about delays
- Thank the delivery boy

If role = "deliveryBoy":
- Confirm pickup
- Share ETA
- Ask for directions
- Apologize politely for delay

-------------------------
OUTPUT FORMAT
-------------------------
Return ONLY a valid JSON array of exactly 3 short messages.

Example:
[
  "I am nearby, please confirm address",
  "Will you arrive in 10 minutes?",
  "Thank you for the update"
]
`;

    const prompt = GEMINI_CHAT_SUGGESTION_PROMPT.replace(
      "{{role}}",
      role
    ).replace("{{incomingMessage}}", message);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const suggestions = extractSuggestions(rawText);

    return NextResponse.json({ suggestions }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "AI suggestions error", error },
      { status: 500 }
    );
  }
}
