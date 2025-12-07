import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/auth";
import { cookies } from "next/headers";
import { OpenRouter } from "@openrouter/sdk";
import { tools, performSearch, generateContent } from "./tools";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('admin_token')?.value;

  if (!adminToken || !(await validateAdminSession(adminToken))) {
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

    const systemMessage = {
      role: "system",
      content: `You are a helpful AI assistant for the admin panel.
      You have access to tools:
      - 'search': Search the web for information.
      - 'generate_content': Generate and save long-form content (articles, documents) to the Canvas.

      When the user asks to "write a[n] [article/post/document] about X" or "put X in the canvas", use the 'generate_content' tool.
      For simple questions, just answer.
      `
    };

    // Prepend system message if not present (or as context)
    let currentMessages = [systemMessage, ...messages];

    // Check if we already have a system message at the beginning from the client
    if (messages.length > 0 && messages[0].role === 'system') {
        currentMessages = [...messages]; // Use client provided system message or trust the flow
    }

    let turnCount = 0;
    const maxTurns = 5;

    // Variables to track canvas side effects
    let generatedCanvasContent: string | undefined = undefined;
    let generatedCanvasId: string | undefined = undefined;

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
        return NextResponse.json({
            response: message.content,
            canvasContent: generatedCanvasContent,
            canvasId: generatedCanvasId
        });
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
          } as any);
        } else if (toolCall.function.name === 'generate_content') {
            let args;
            try {
               args = JSON.parse(toolCall.function.arguments);
            } catch (e) {
               console.error("Failed to parse tool arguments", e);
               args = { prompt: "" };
            }

            try {
                // Call generation logic
                const { content, id } = await generateContent(args.prompt, model);

                // Track for final response
                generatedCanvasContent = content;
                generatedCanvasId = id;

                currentMessages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: `Content generated successfully and saved to Canvas (ID: ${id}). You can now summarize or confirm this to the user.`,
                    name: toolCall.function.name
                } as any);

            } catch (error) {
                 currentMessages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: "Error generating content: " + (error instanceof Error ? error.message : "Unknown error"),
                    name: toolCall.function.name
                 } as any);
            }
        }
      }

      turnCount++;
    }

    return NextResponse.json({
        response: "I'm sorry, I couldn't complete the request within the tool limit.",
        canvasContent: generatedCanvasContent,
        canvasId: generatedCanvasId
    });

  } catch (error) {
    console.error("Error calling OpenRouter API:", error);
    return NextResponse.json(
      { error: "Error calling OpenRouter API" },
      { status: 500 }
    );
  }
}
