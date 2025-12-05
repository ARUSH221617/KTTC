"use client";

import { useState } from "react";
import MessageList, { Message } from "@/components/admin/ai-agent-chat/message-list";
import SettingsSheet from "@/components/admin/ai-agent-chat/settings-sheet";
import { useToast } from "@/hooks/use-toast";
import { InputArea } from "@/components/admin/ai-agent-chat/chat-input";
import React from "react";

export default function AIAgentChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (input.trim() && !isLoading) {
      const newMessages = [...messages, { text: input, sender: "user" }];
      setMessages(newMessages);
      setInput("");
      setIsLoading(true);

      if (input.startsWith("/imagine ")) {
        await handleImageGeneration(input.substring(8).trim());
      } else {
        await handleChatCompletion(newMessages);
      }

      setIsLoading(false);
    }
  };

  const handleChatCompletion = async (newMessages: any[]) => {
    const chatModel = localStorage.getItem("ai-chat-model");
    if (!chatModel) {
      toast({
        title: "No chat model selected",
        description: "Please select a chat model in the settings.",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch("/api/admin/ai-agent-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text,
          })),
          model: chatModel,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessages([
          ...newMessages,
          { text: data.response, sender: "assistant" },
        ]);
      } else {
        toast({
          title: "Error from AI",
          description: data.error || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error sending message",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleImageGeneration = async (prompt: string) => {
    const imageModel = localStorage.getItem("ai-image-model");
    if (!imageModel) {
      toast({
        title: "No image model selected",
        description: "Please select an image model in the settings.",
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
          { text: data.imageUrl, sender: "assistant", type: "image" },
        ]);
      } else {
        toast({
          title: "Error generating image",
          description: data.error || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error generating image",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden justify-between h-full w-full relative">
      <MessageList messages={messages} />
      {isLoading && (
        <div className="p-4 text-center text-sm text-muted-foreground">
          AI is working...
        </div>
      )}
      <InputArea
        isLoading={isLoading}
        isThinking={false}
        onChange={setInput}
        onSend={handleSendMessage}
        onToggleThinking={() => {}}
        value={input}
        setIsSettingsOpen={setIsSettingsOpen}
      />
      <SettingsSheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </div>
  );
}
