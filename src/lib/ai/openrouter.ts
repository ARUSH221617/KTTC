import { ChatSDKError } from "@/lib/errors";

export async function checkOpenRouterLimits() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/key", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      next: { revalidate: 60 }, // Check once per minute
    });

    if (!response.ok) {
      console.warn("Failed to check OpenRouter limits:", response.status);
      return;
    }

    const data = await response.json();
    const keyInfo = data.data;

    if (!keyInfo) return;

    const { limit_remaining } = keyInfo;

    // limit_remaining: Number of credits for the key, or null if unlimited
    if (limit_remaining !== null && limit_remaining <= 0) {
      throw new ChatSDKError("rate_limit:chat");
    }
  } catch (error) {
    if (error instanceof ChatSDKError) throw error;
    // Log other errors but don't block chat if the check fails (fail open)
    console.error("Error checking OpenRouter limits:", error);
  }
}
