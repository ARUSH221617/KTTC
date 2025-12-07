import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/auth";
import { cookies } from "next/headers";
import { OpenRouter } from "@openrouter/sdk";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('admin_token')?.value;

  if (!adminToken || !(await validateAdminSession(adminToken))) {
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
