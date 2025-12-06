"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { InputArea } from "@/components/admin/ai-agent-chat/chat-input";
import { MessageList } from "@/components/admin/ai-agent-chat/message-list";
import { Artifact } from "@/components/admin/ai-agent-chat/artifact";
import { useChat } from "@ai-sdk/react";
import { useArtifact } from "@/hooks/use-artifact";
import { initialArtifactData } from "@/hooks/use-artifact";

interface Model {
  id: string;
  name: string;
}

export default function AIAgentChatPage() {
  const { toast } = useToast();
  const [models, setModels] = useState<Model[]>([]);
  const [chatModel, setChatModel] = useState<string>("");

  const { artifact, setArtifact } = useArtifact();

  // Load models
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await fetch("/api/admin/ai-agent-chat/models");
        const data = await res.json();
        if (res.ok) {
          setModels(data.models.data);
        }
      } catch (error) {
        console.error("Failed to fetch models", error);
      }
    };
    fetchModels();

    const savedModel = localStorage.getItem("ai-chat-model");
    if (savedModel) setChatModel(savedModel);
  }, []);

  const handleModelChange = (modelId: string) => {
    setChatModel(modelId);
    localStorage.setItem("ai-chat-model", modelId);
  };

  const { messages, input, setInput, append, isLoading, stop, setMessages, reload } = useChat({
    api: "/api/admin/ai-agent-chat",
    body: {
      model: chatModel,
    },
    onToolCall: ({ toolCall }) => {
        if (toolCall.toolName === 'text_artifact' || toolCall.toolName === 'code_artifact') {
            const args = toolCall.args as any;
            setArtifact({
                ...initialArtifactData,
                title: args.title,
                content: args.content,
                kind: toolCall.toolName === 'code_artifact' ? 'code' : 'text',
                isVisible: true,
                status: 'idle'
            });
        }
    },
    onFinish: (message) => {
        // Check for tool invocations in final message if needed, but onToolCall should handle it
    }
  });

  const handleSendMessage = async () => {
    if (!input.trim() && !isLoading) return;
    if (!chatModel) {
        toast({ title: "Select a model", variant: "destructive" });
        return;
    }
    await append({ role: 'user', content: input });
  };

  return (
    <div className="h-[calc(100vh-4rem)] bg-background overflow-hidden flex flex-col relative">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24">
        <div className="max-w-3xl mx-auto flex flex-col min-h-full">
          <MessageList
            messages={messages.map(m => ({
                id: m.id,
                role: m.role as any,
                content: m.content,
                // Adapt tool invocations to something visible if needed
            }))}
            isLoading={isLoading}
           />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full p-4 bg-background border-t z-10">
        <div className="max-w-3xl mx-auto">
            <InputArea
            value={input}
            onChange={setInput}
            onSend={handleSendMessage}
            isLoading={isLoading}
            models={models}
            selectedModel={chatModel}
            onModelChange={handleModelChange}
            />
            <p className="text-[10px] text-center text-muted-foreground mt-2">
            AI can make mistakes. Please verify important information.
            </p>
        </div>
      </div>

      <Artifact
        chatId="session-1"
        input={input}
        setInput={setInput}
        status={isLoading ? 'streaming' : 'idle'} // Map status
        stop={stop}
        messages={messages}
        setMessages={setMessages}
        sendMessage={append}
        isLoading={isLoading}
      />
    </div>
  );
}
