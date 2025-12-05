import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { OpenRouter } from "@openrouter/sdk";

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messages, model } = await req.json();

  if (!messages || !model) {
    return NextResponse.json(
      { error: "Missing messages or model" },
      { status: 400 }
    );
  }

  try {
    const openrouter = new OpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const completion = await openrouter.chat.completions.create({
      model: model,
      messages: messages,
    });

    const response = completion.choices?.[0]?.message?.content;

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error calling OpenRouter API:", error);
    return NextResponse.json(
      { error: "Error calling OpenRouter API" },
      { status: 500 }
    );
  }
}
