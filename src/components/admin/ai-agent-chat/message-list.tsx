import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { Message } from "@/app/(admin)/admin/ai-agent-chat/page";
import Image from "next/image";
// Note: If you have a markdown renderer, import it here. For now, we'll render text directly.
// import ReactMarkdown from 'react-markdown';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4 my-auto min-h-[50vh]">
        <div className="p-4 bg-muted/50 rounded-full">
          <Bot className="h-12 w-12 opacity-50" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-lg font-medium text-foreground">
            How can I help you today?
          </p>
          <p className="text-sm">Start a conversation or generate an image.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex gap-4 w-full group",
            message.role === "user" ? "flex-row-reverse" : "flex-row"
          )}
        >
          {/* Avatar */}
          <Avatar
            className={cn(
              "h-8 w-8 border shadow-sm mt-1",
              message.role === "assistant"
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            )}
          >
            {message.role === "assistant" ? (
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            ) : (
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            )}
          </Avatar>

          {/* Message Content */}
          <div
            className={cn(
              "flex flex-col gap-2 max-w-[85%] md:max-w-[75%]",
              message.role === "user" ? "items-end" : "items-start"
            )}
          >
            {/* Image Attachment */}
            {message.image && (
              <div className="relative rounded-lg overflow-hidden border shadow-sm mb-1">
                <Image
                  src={message.image}
                  fill
                  alt="Attachment"
                  className="max-w-full md:max-w-sm h-auto object-contain bg-muted"
                />
              </div>
            )}

            {/* Text Bubble */}
            {message.content && (
              <div
                className={cn(
                  "rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm whitespace-pre-wrap",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-white dark:bg-muted/30 border text-foreground rounded-tl-sm"
                )}
              >
                {message.content}
              </div>
            )}

            {/* Timestamp or Meta (Optional) */}
            {/* <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              {new Date(parseInt(message.id)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span> */}
          </div>
        </div>
      ))}

      {/* Loading State Indicator */}
      {isLoading && (
        <div className="flex gap-4 w-full">
          <Avatar className="h-8 w-8 border bg-primary text-primary-foreground mt-1">
            <AvatarFallback className="bg-primary text-primary-foreground">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="bg-white dark:bg-muted/30 border rounded-2xl rounded-tl-sm px-4 py-4 text-sm flex items-center gap-1.5 w-fit shadow-sm">
            <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce"></span>
          </div>
        </div>
      )}
    </div>
  );
}
