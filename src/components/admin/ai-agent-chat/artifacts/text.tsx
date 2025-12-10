import { toast } from "sonner";
import { Artifact } from "../create-artifact";
// import { DiffView } from "@/components/diffview"; // Skipping diff view for now
// import { DocumentSkeleton } from "@/components/document-skeleton"; // Skipping skeleton
import {
  ClockRewind,
  CopyIcon,
  MessageIcon,
  PenIcon,
  RedoIcon,
  UndoIcon,
} from "../icons";
// import { Editor } from "@/components/text-editor"; // Using our Editor
import Editor from "@/components/ui/editor";
import { Button } from "@/components/ui/button";

type TextArtifactMetadata = {
  suggestions: any[];
};

export const textArtifact = new Artifact<"text", TextArtifactMetadata>({
  kind: "text",
  description: "Useful for text content, like drafting essays and emails.",
  initialize: async ({ documentId, setMetadata }) => {
    // Mock suggestions fetch
    setMetadata({
      suggestions: [],
    });
  },
  onStreamPart: ({ streamPart, setMetadata, setArtifact }) => {
    // In Vercel AI SDK, streamPart is DataStreamDelta
    // but here we are receiving raw object or part
    if (streamPart.type === "data-suggestion") {
        // ...
    }

    if (streamPart.type === "text-delta") {
      setArtifact((draftArtifact) => {
        return {
          ...draftArtifact,
          content: draftArtifact.content + streamPart.textDelta,
          isVisible:
            draftArtifact.status === "streaming" &&
            draftArtifact.content.length > 400 &&
            draftArtifact.content.length < 450
              ? true
              : draftArtifact.isVisible,
          status: "streaming",
        };
      });
    }
  },
  content: ({
    mode,
    status,
    content,
    isCurrentVersion,
    currentVersionIndex,
    onSaveContent,
    getDocumentContentById,
    isLoading,
    metadata,
  }) => {
    // Simplified render
    return (
      <div className="flex flex-col h-full p-4 bg-background">
        <Editor
            value={content}
            onChange={(val) => onSaveContent(val, true)}
        />
      </div>
    );
  },
  actions: [
    {
      icon: <CopyIcon size={18} />,
      description: "Copy to clipboard",
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success("Copied to clipboard!");
      },
    },
  ],
  toolbar: [
    {
      icon: <PenIcon />,
      description: "Add final polish",
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: "user",
          content: "Please add final polish and check for grammar, add section titles for better structure, and ensure everything reads smoothly.",
        });
      },
    },
    {
      icon: <MessageIcon />,
      description: "Request suggestions",
      onClick: ({ sendMessage }) => {
        sendMessage({
            role: "user",
            content: "Please add suggestions you have that could improve the writing.",
        });
      },
    },
  ],
});
