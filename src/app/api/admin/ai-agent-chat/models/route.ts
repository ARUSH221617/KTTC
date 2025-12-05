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

    return NextResponse.json({ models });
  } catch (error) {
    console.error("Error fetching OpenRouter models:", error);
    return NextResponse.json(
      { error: "Error fetching OpenRouter models" },
      { status: 500 }
    );
  }
}
