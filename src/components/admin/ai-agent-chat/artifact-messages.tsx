import type { UseChatHelpers } from "@ai-sdk/react";
import equal from "fast-deep-equal";
import { AnimatePresence, motion } from "framer-motion";
import { memo } from "react";
// import { useMessages } from "@/hooks/use-messages"; // We don't have this, we'll adapt
import type { Message } from "ai";
import type { UIArtifact } from "@/hooks/use-artifact";
import { MessageList } from "./message-list"; // Use our existing component

type ArtifactMessagesProps = {
  chatId: string;
  status: UseChatHelpers["status"];
  votes: any[] | undefined;
  messages: Message[];
  setMessages: UseChatHelpers["setMessages"];
  regenerate: UseChatHelpers["regenerate"];
  isReadonly: boolean;
  artifactStatus: UIArtifact["status"];
};

function PureArtifactMessages({
  chatId,
  status,
  messages,
  // setMessages, // Not used in MessageList currently
  // regenerate, // Not used
  // isReadonly, // Not used
}: ArtifactMessagesProps) {

  // Simplified version using existing MessageList
  return (
    <div className="flex h-full flex-col items-center gap-4 overflow-y-scroll px-4 pt-20 w-full">
        <MessageList messages={messages.map(m => ({ id: m.id, role: m.role as any, content: m.content, image: undefined }))} isLoading={status === 'streaming'} />
    </div>
  );
}

function areEqual(
  prevProps: ArtifactMessagesProps,
  nextProps: ArtifactMessagesProps
) {
  if (
    prevProps.artifactStatus === "streaming" &&
    nextProps.artifactStatus === "streaming"
  ) {
    return true;
  }

  if (prevProps.status !== nextProps.status) {
    return false;
  }
  if (prevProps.messages.length !== nextProps.messages.length) {
    return false;
  }

  return true;
}

export const ArtifactMessages = memo(PureArtifactMessages, areEqual);
