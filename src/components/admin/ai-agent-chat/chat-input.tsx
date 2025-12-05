"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  PlusIcon,
  MicIcon,
  LayoutDashboard as ToolsIcon,
  ChevronDownIcon,
  SendIcon,
  Settings,
  StopCircleIcon,
  Search,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Model {
  id: string;
  name: string;
}

interface InputAreaProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  isLoading: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  models: Model[];
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

export const InputArea: React.FC<InputAreaProps> = ({
  value,
  onChange,
  onSend,
  isLoading,
  setIsSettingsOpen,
  models,
  selectedModel,
  onModelChange,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Refs to keep track of latest values without triggering re-initialization of SpeechRecognition
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Initialize SpeechRecognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }

          if (finalTranscript) {
             const currentValue = valueRef.current;
             const newValue = currentValue + (currentValue && !currentValue.endsWith(' ') ? ' ' : '') + finalTranscript;
             onChangeRef.current(newValue);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsRecording(false);
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };
      }
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsRecording(true);
      } else {
        alert("Speech recognition is not supported in this browser.");
      }
    }
  };


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

  const selectedModelName = models.find((m) => m.id === selectedModel)?.name || "Select Model";

  const filteredModels = models.filter((model) =>
    model.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-3xl mx-auto relative group">
      {/* Changed bg-[#1E1F20] to bg-muted/50 and added border for better contrast in light mode */}
      <div className={cn(
        "relative bg-muted/50 dark:bg-[#1E1F20] rounded-[28px] border border-border/50 focus-within:border-primary/50 transition-all duration-200 shadow-sm",
        isRecording && "border-red-500/50 ring-1 ring-red-500/20"
      )}>
        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isRecording ? "Listening..." : "Ask the AI Agent..."}
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
            <DropdownMenu onOpenChange={(open) => {
              if (!open) setSearchQuery("");
            }}>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors border text-muted-foreground hover:bg-muted hover:text-foreground border-transparent"
                >
                  <span className="max-w-[100px] truncate">{selectedModelName}</span>
                  <ChevronDownIcon className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[260px]">
                <div className="p-2 sticky top-0 bg-popover z-10 border-b">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search models..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 h-9"
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                <div className="max-h-[300px] overflow-y-auto p-1">
                  {filteredModels.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No models found
                    </div>
                  ) : (
                    filteredModels.map((model) => (
                      <DropdownMenuItem
                        key={model.id}
                        onClick={() => {
                          onModelChange(model.id);
                          setSearchQuery("");
                        }}
                        className="cursor-pointer"
                      >
                        {model.name}
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {isRecording ? (
               <button
                onClick={toggleRecording}
                className="p-2 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors animate-pulse"
                title="Stop recording"
              >
                <StopCircleIcon className="w-5 h-5" />
              </button>
            ) : value.trim() ? (
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
              <button
                onClick={toggleRecording}
                className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Start voice dictation"
              >
                <MicIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
