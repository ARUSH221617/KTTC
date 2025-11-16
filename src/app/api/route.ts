import { NextResponse } from "next/server";

/**
 * Handles GET requests to the /api endpoint.
 *
 * @returns {Promise<NextResponse>} A JSON response with a "Hello, world!" message.
 */
export async function GET() {
  return NextResponse.json({ message: "Hello, world!" });
}