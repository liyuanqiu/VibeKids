import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/ai/openai-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userMessage,
      previousResponseId,
      language,
    }: {
      userMessage: string;
      previousResponseId: string | null;
      language?: string;
    } = body;

    if (!userMessage || typeof userMessage !== "string") {
      return NextResponse.json({ error: "Missing userMessage" }, { status: 400 });
    }

    const result = await chat({ userMessage, previousResponseId, language });

    return NextResponse.json({
      ...result.aiResponse,
      responseId: result.responseId,
      usage: result.usage,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
