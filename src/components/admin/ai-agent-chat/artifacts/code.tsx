import { toast } from "sonner";
import { Artifact } from "../create-artifact";
import {
  CopyIcon,
  LogsIcon,
  MessageIcon,
  PlayIcon,
  RedoIcon,
  UndoIcon,
} from "../icons";
// import { CodeEditor } from "@/components/code-editor"; // Need to replace with a simple code editor or textarea
import { Button } from "@/components/ui/button";

// Simple Code Editor replacement
const CodeEditor = ({ value, onChange, language }: any) => (
    <textarea
        className="w-full h-full font-mono text-sm p-4 bg-muted text-foreground resize-none focus:outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
    />
);


type Metadata = {
  outputs: any[];
};

export const codeArtifact = new Artifact<"code", Metadata>({
  kind: "code",
  description: "Useful for code generation.",
  initialize: ({ setMetadata }) => {
    setMetadata({
      outputs: [],
    });
  },
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "code-delta") {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: draftArtifact.content + streamPart.textDelta,
        isVisible: true,
        status: "streaming",
      }));
    }
  },
  content: ({ metadata, setMetadata, content, onSaveContent, ...props }) => {
    return (
      <div className="flex flex-col h-full bg-[#1e1e1e] text-white">
          <CodeEditor value={content} onChange={(val: string) => onSaveContent(val, true)} language="python" />
      </div>
    );
  },
  actions: [
    {
      icon: <CopyIcon size={18} />,
      description: "Copy code to clipboard",
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success("Copied to clipboard!");
      },
    },
  ],
  toolbar: [
    {
      icon: <MessageIcon />,
      description: "Add comments",
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: "user",
          content: "Add comments to the code snippet for understanding",
        });
      },
    },
  ],
});
