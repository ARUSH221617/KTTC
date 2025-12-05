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
  isThinking: boolean;
  onToggleThinking: () => void;
  isLoading: boolean;
  setIsSettingsOpen: (open: boolean) => void;
}

export const InputArea: React.FC<InputAreaProps> = ({
  value,
  onChange,
  onSend,
  isThinking,
  onToggleThinking,
  isLoading,
  setIsSettingsOpen
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
      <div className="relative bg-[#1E1F20] rounded-[28px] border border-transparent focus-within:border-gray-600 transition-all duration-200">
        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Gemini"
          className="w-full bg-transparent text-gemini-text placeholder-[#444746] px-6 py-4 outline-none resize-none min-h-14 max-h-[200px] rounded-[28px]"
          rows={1}
        />

        {/* Action Bar inside Input */}
        <div className="flex items-center justify-between px-4 pb-3">
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-full hover:bg-[#2D2E2F] text-gemini-text transition-colors"
              title="Add attachment"
            >
              <PlusIcon />
            </button>

            <button
              className="p-2 rounded-full hover:bg-[#2D2E2F] text-gemini-text transition-colors"
              title="Settings"
              onClick={() => setIsSettingsOpen(true)}
            >
              <Settings />
            </button>

            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[#2D2E2F] text-gemini-subtext text-sm transition-colors border border-transparent hover:border-[#444746]/50">
              <ToolsIcon />
              <span>Tools</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleThinking}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors border ${
                isThinking
                  ? "bg-[#2D2E2F] text-blue-300 border-[#444746]"
                  : "text-gemini-subtext hover:bg-[#2D2E2F] border-transparent"
              }`}
            >
              <span>Thinking</span>
              <ChevronDownIcon />
            </button>

            {value.trim() ? (
              <button
                onClick={onSend}
                disabled={isLoading}
                className={`p-2 rounded-full ${
                  isLoading
                    ? "opacity-50"
                    : "hover:bg-[#2D2E2F] text-gemini-text"
                } transition-colors`}
              >
                <SendIcon />
              </button>
            ) : (
              <button className="p-2 rounded-full hover:bg-[#2D2E2F] text-gemini-text transition-colors">
                <MicIcon />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
