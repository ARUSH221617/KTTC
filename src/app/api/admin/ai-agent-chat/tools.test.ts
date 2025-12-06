/**
 * @jest-environment node
 */

// Mock OpenRouter SDK before importing tools
jest.mock("@openrouter/sdk", () => ({
  OpenRouter: class {
    chat = {
      send: jest.fn(),
    };
  },
}));

// Mock @/lib/db before importing tools
jest.mock("@/lib/db", () => ({
  db: {
    canvas: {
      create: jest.fn(),
    },
  },
}));

import { performSearch } from "./tools";

// Mock global fetch
global.fetch = jest.fn() as jest.Mock;

describe("performSearch", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return snippets when search is successful", async () => {
    const mockHtml = `
      <div class="result">
        <a class="result__snippet" href="#">First result snippet</a>
      </div>
      <div class="result">
        <a class="result__snippet" href="#">Second result snippet</a>
      </div>
    `;

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () => mockHtml,
    } as Response);

    const result = await performSearch("test query");
    expect(result).toContain("First result snippet");
    expect(result).toContain("Second result snippet");
  });

  it("should return 'No results found' when no snippets are found", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () => "<html><body>No results</body></html>",
    } as Response);

    const result = await performSearch("nothing found");
    expect(result).toBe("No results found.");
  });

  it("should return error message on fetch failure", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

    const result = await performSearch("error query");
    expect(result).toContain("Error performing search");
  });
});
