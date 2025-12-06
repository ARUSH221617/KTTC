import { OpenRouter } from "@openrouter/sdk";
import { db } from "@/lib/db";

export const tools = [
  {
    type: "function",
    function: {
      name: "search",
      description: "Search for information on the web. Use this when the user asks for current events, facts, or explicitly requests a search.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_content",
      description: "Generate text content based on a prompt and save it to the canvas database. Use this when the user asks to write a document, article, or save content to canvas.",
      parameters: {
        type: "object",
        properties: {
          prompt: {
            type: "string",
            description: "The prompt or topic to generate content for",
          },
        },
        required: ["prompt"],
      },
    },
  }
];

export async function performSearch(query: string) {
  try {
    // Attempt to use DuckDuckGo Instant Answer API for a quick, keyless search
    // This is a placeholder for a real search API like Google Custom Search or Serper.
    // WARNING: This implementation relies on HTML scraping which is brittle.
    const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
    });

    if (!response.ok) {
        throw new Error(`Search request failed with status ${response.status}`);
    }

    const html = await response.text();
    const snippets: string[] = [];

    // Simple regex to extract snippets from DuckDuckGo HTML
    // Class names like 'result__snippet' are typical but may change.
    const regex = /<a[^>]*class="[^"]*result__snippet[^"]*"[^>]*>(.*?)<\/a>/g;
    let match;
    while ((match = regex.exec(html)) !== null && snippets.length < 3) {
        snippets.push(match[1].replace(/<[^>]*>/g, ""));
    }

    if (snippets.length > 0) {
        return snippets.join("\n\n");
    }

    return "No results found.";
  } catch (error) {
    console.error("Search error:", error);
    return "Error performing search. Please check your network or search provider configuration.";
  }
}

export async function generateContent(prompt: string, model?: string) {
    // Use OpenRouter to generate content
    try {
        const openrouter = new OpenRouter({
            apiKey: process.env.OPENROUTER_API_KEY,
        });

        const completion = await openrouter.chat.send({
            model: model || "openai/gpt-4o", // Default model if none provided
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant writing content for a document. Write clear, well-structured text based on the user's prompt. Use markdown formatting if appropriate."
                },
                {
                    role: "user",
                    content: prompt
                }
            ]
        });

        const content = completion.choices?.[0]?.message?.content || "";

        if (!content) {
            throw new Error("No content generated");
        }

        // Save to DB
        // We use 'admin' as generic userId since we might not have a real user session or it's an admin tool
        const canvas = await db.canvas.create({
            data: {
                content,
                prompt,
                userId: 'admin'
            }
        });

        return { content, id: canvas.id };
    } catch (error) {
        console.error("Error generating content:", error);
        throw error;
    }
}
