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
