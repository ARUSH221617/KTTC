import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { OpenRouter } from "@openrouter/sdk";
import { tools, performSearch } from "./tools";

export async function POST(req: any|NextRequest, res: any|NextResponse) {
  const session = await auth(req, res);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messages, model } = await req.json();

  if (!messages || !model) {
    return NextResponse.json(
      { error: "Missing messages or model" },
      { status: 400 }
    );
  }

  try {
    const openrouter = new OpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    let currentMessages = [...messages];
    let turnCount = 0;
    const maxTurns = 5;

    while (turnCount < maxTurns) {
      const completion = await openrouter.chat.send({
        model: model,
        messages: currentMessages,
        tools: tools,
      });

      const choice = completion.choices?.[0];
      const message = choice?.message;

      if (!message) {
        throw new Error("No response from OpenRouter");
      }

      // If there are no tool calls, return the response immediately
      if (!message.tool_calls) {
        return NextResponse.json({ response: message.content });
      }

      // Add the assistant's message (with tool calls) to history
      currentMessages.push(message);

      // Process all tool calls
      for (const toolCall of message.tool_calls) {
        if (toolCall.function.name === 'search') {
          let args;
          try {
             args = JSON.parse(toolCall.function.arguments);
          } catch (e) {
             console.error("Failed to parse tool arguments", e);
             args = { query: "" };
          }

          const searchResult = await performSearch(args.query);

          currentMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: searchResult,
            name: toolCall.function.name
          } as any); // Cast to any to avoid strict type issues with OpenRouter SDK depending on version
        }
      }

      turnCount++;
    }

    return NextResponse.json({ response: "I'm sorry, I couldn't complete the request within the tool limit." });

  } catch (error) {
    console.error("Error calling OpenRouter API:", error);
    return NextResponse.json(
      { error: "Error calling OpenRouter API" },
      { status: 500 }
    );
  }
}
