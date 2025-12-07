import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/auth";
import { cookies } from "next/headers";
import { OpenRouter } from "@openrouter/sdk";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('admin_token')?.value;

  if (!adminToken || !(await validateAdminSession(adminToken))) {
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
