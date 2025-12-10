import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { OpenRouter } from "@openrouter/sdk";

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id || (session.user.role !== 'admin' && session.user.role !== 'ADMIN')) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { prompt, model } = await req.json();

  if (!prompt || !model) {
    return NextResponse.json(
      { error: "Missing prompt or model" },
      { status: 400 }
    );
  }

  try {
    const openrouter = new OpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const response = await openrouter.completions[0].create({
      prompt: prompt,
      model: model,
    });

    // Assuming the API returns a URL to the generated image
    const imageUrl = response.generations[0]?.uri;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image generation failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Error calling OpenRouter image generation API:", error);
    return NextResponse.json(
      { error: "Error calling OpenRouter image generation API" },
      { status: 500 }
    );
  }
}
