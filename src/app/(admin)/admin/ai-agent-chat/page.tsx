"use client";

import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import SettingsSheet from "@/components/admin/ai-agent-chat/settings-sheet";
import { InputArea } from "@/components/admin/ai-agent-chat/chat-input";
import { MessageList } from "@/components/admin/ai-agent-chat/message-list";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string;
}

interface Model {
  id: string;
  name: string;
}

export default function AIAgentChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(""); // Managed state for the rolled-back input
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [chatModel, setChatModel] = useState<string>("");

  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch models and load settings on mount
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
    if (savedModel) {
      setChatModel(savedModel);
    }
  }, []);

  const handleModelChange = (modelId: string) => {
    setChatModel(modelId);
    localStorage.setItem("ai-chat-model", modelId);
  };

  const handleSendMessage = async () => {
    if (!input.trim() && !isLoading) return;

    const content = input;
    setInput(""); // Clear input immediately

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
    };

    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      if (content.startsWith("/imagine ")) {
        await handleImageGeneration(content.substring(9).trim());
      } else {
        await handleChatCompletion(newMessages);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setInput(content); // Restore input on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatCompletion = async (currentMessages: Message[]) => {
    // Use state if available, fallback to localStorage
    const currentModel = chatModel || localStorage.getItem("ai-chat-model");

    if (!currentModel) {
      toast({
        title: "Configuration Missing",
        description: "Please select a chat model.",
        variant: "destructive",
      });
      return;
    }

    try {
      const apiMessages = currentMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/admin/ai-agent-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          model: currentModel,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: data.response,
          },
        ]);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error) {
      throw error;
    }
  };

  const handleImageGeneration = async (prompt: string) => {
    const imageModel = localStorage.getItem("ai-image-model");
    if (!imageModel) {
      toast({
        title: "Configuration Missing",
        description: "Please select an image model in settings.",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch("/api/admin/ai-agent-chat/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, model: imageModel }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: `Generated image for: "${prompt}"`,
            image: data.imageUrl,
          },
        ]);
      } else {
        throw new Error(data.error || "Failed to generate image");
      }
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-3xl mx-auto flex flex-col min-h-full">
          <MessageList messages={messages} isLoading={isLoading} />
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Input Area - Fixed at Bottom */}
      <div className="p-4 bg-background">
        <InputArea
          value={input}
          onChange={setInput}
          onSend={handleSendMessage}
          isLoading={isLoading}
          setIsSettingsOpen={setIsSettingsOpen}
          models={models}
          selectedModel={chatModel}
          onModelChange={handleModelChange}
        />
        <p className="text-[10px] text-center text-muted-foreground mt-2">
          AI can make mistakes. Please verify important information.
        </p>
      </div>

      <SettingsSheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </div>
  );
}
