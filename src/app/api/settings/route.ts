import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const settings = await db.setting.findMany();
  const settingsMap = settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  return NextResponse.json(settingsMap);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const { key, value } = body;

  if (key && value) {
      await db.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
      return NextResponse.json({ success: true });
  }

  const { settings } = body;
  if (settings) {
       const updates = Array.isArray(settings) ? settings : Object.entries(settings).map(([k, v]) => ({ key: k, value: v }));
       for (const { key, value } of updates) {
        await db.setting.upsert({
            where: { key },
            update: { value: String(value) },
            create: { key, value: String(value) },
        });
        }
        return NextResponse.json({ success: true });
  }

  return new NextResponse("Missing settings", { status: 400 });
}
