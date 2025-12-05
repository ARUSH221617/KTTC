"use client"
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";

export interface Message {
  text: string;
  sender: string;
  type?: "text" | "image";
}

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-3 rounded-lg max-w-sm ${
                message.sender === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {message.type === "image" ? (
                <Image
                  src={message.text}
                  alt="Generated image"
                  width={256}
                  height={256}
                  className="rounded-md"
                />
              ) : (
                message.text
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
