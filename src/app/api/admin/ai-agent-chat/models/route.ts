import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { OpenRouter } from "@openrouter/sdk";
import { NextApiRequest, NextApiResponse } from "next";

export async function GET(req: NextApiRequest, res: NextApiResponse) {
  const session = await auth(req, res);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const openrouter = new OpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const models = await openrouter.models.list();

    // Ensure the response structure matches what the frontend expects: { models: { data: [...] } }
    // The OpenRouter SDK returns { data: [...] } for models.list() usually, but let's verify.
    // If models is { data: [...] }, then returning { models } results in { models: { data: [...] } }.
    // So the frontend expectation of data.models.data is correct.

    return NextResponse.json({ models });
  } catch (error) {
    console.error("Error fetching OpenRouter models:", error);
    return NextResponse.json(
      { error: "Error fetching OpenRouter models" },
      { status: 500 }
    );
  }
}
