"use client";

import React, { useRef, useEffect } from "react";
import {
  PlusIcon,
  MicIcon,
  LayoutDashboard as ToolsIcon,
  ChevronDownIcon,
  SendIcon,
  Settings,
} from "lucide-react";

interface InputAreaProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  isThinking?: boolean;
  onToggleThinking?: () => void;
  isLoading: boolean;
  setIsSettingsOpen: (open: boolean) => void;
}

export const InputArea: React.FC<InputAreaProps> = ({
  value,
  onChange,
  onSend,
  isThinking = false,
  onToggleThinking = () => {},
  isLoading,
  setIsSettingsOpen,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto relative group">
      {/* Changed bg-[#1E1F20] to bg-muted/50 and added border for better contrast in light mode */}
      <div className="relative bg-muted/50 dark:bg-[#1E1F20] rounded-[28px] border border-border/50 focus-within:border-primary/50 transition-all duration-200 shadow-sm">
        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask the AI Agent..."
          className="w-full bg-transparent text-foreground placeholder:text-muted-foreground px-6 py-4 outline-none resize-none min-h-14 max-h-[200px] rounded-[28px] text-base"
          rows={1}
          disabled={isLoading}
        />

        {/* Action Bar inside Input */}
        <div className="flex items-center justify-between px-4 pb-3">
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Add attachment"
            >
              <PlusIcon className="w-5 h-5" />
            </button>

            <button
              className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Settings"
              onClick={() => setIsSettingsOpen(true)}
            >
              <Settings className="w-5 h-5" />
            </button>

            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground text-sm transition-colors border border-transparent hover:border-border">
              <ToolsIcon className="w-4 h-4" />
              <span>Tools</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleThinking}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors border ${
                isThinking
                  ? "bg-muted text-primary border-border"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground border-transparent"
              }`}
            >
              <span>Thinking</span>
              <ChevronDownIcon className="w-4 h-4" />
            </button>

            {value.trim() ? (
              <button
                onClick={onSend}
                disabled={isLoading}
                className={`p-2 rounded-full transition-colors ${
                  isLoading
                    ? "opacity-50 cursor-not-allowed text-muted-foreground"
                    : "bg-primary text-primary-foreground hover:opacity-90"
                }`}
              >
                <SendIcon className="w-5 h-5" />
              </button>
            ) : (
              <button className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <MicIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
