"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Send } from "lucide-react";

interface ChatInputProps {
    input: string;
    setInput: (input: string) => void;
    handleSendMessage: () => void;
  }

export default function ChatInput({ input, setInput, handleSendMessage} : ChatInputProps) {
    return(
        <div className="p-4">
        <div className="relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type a message..."
            className="pr-20"
          />
          <div className="absolute top-1/2 right-2 -translate-y-1/2 flex items-center space-x-2">
            <Button variant="ghost" size="icon" disabled>
              <Paperclip className="h-5 w-5" />
            </Button>
            <Button onClick={handleSendMessage}>
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    )
}
