import type { UseChatHelpers } from "@ai-sdk/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  type Dispatch,
  memo,
  type SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import useSWR, { useSWRConfig } from "swr";
import { useDebounceCallback, useWindowSize } from "usehooks-ts";
import { useArtifact } from "@/hooks/use-artifact";
import { artifactDefinitions } from "./artifact-definitions";

import { ArtifactActions } from "./artifact-actions";
import { ArtifactCloseButton } from "./artifact-close-button";
import { ArtifactMessages } from "./artifact-messages";
import { InputArea } from "@/components/admin/ai-agent-chat/chat-input"; // Using existing InputArea

function PureArtifact({
  chatId,
  input,
  setInput,
  status,
  stop,
  messages,
  setMessages,
  sendMessage,
  isLoading,
}: {
  chatId: string;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  status: UseChatHelpers["status"];
  stop: UseChatHelpers["stop"];
  messages: any[];
  setMessages: UseChatHelpers["setMessages"];
  sendMessage: UseChatHelpers["sendMessage"];
  isLoading: boolean;
}) {
  const { artifact, setArtifact } = useArtifact();

  // We mock metadata for now as we don't have DB
  const [metadata, setMetadata] = useState<any>(null);

  const [mode, setMode] = useState<"edit" | "diff">("edit");
  const [isContentDirty, setIsContentDirty] = useState(false);

  // Simplified content change handler (local state mostly)
  const handleContentChange = useCallback(
    (updatedContent: string) => {
      if (!artifact) {
        return;
      }

      setArtifact(prev => ({ ...prev, content: updatedContent }));
      // Here we would sync with DB in a real app
    },
    [artifact, setArtifact]
  );

  const debouncedHandleContentChange = useDebounceCallback(
    handleContentChange,
    1000
  );

  const saveContent = useCallback(
    (updatedContent: string, debounce: boolean) => {
      if (updatedContent !== artifact.content) {
        setIsContentDirty(true);
        if (debounce) {
            debouncedHandleContentChange(updatedContent);
        } else {
            handleContentChange(updatedContent);
        }
        setTimeout(() => setIsContentDirty(false), 1000);
      }
    },
    [artifact.content, debouncedHandleContentChange, handleContentChange]
  );

  const handleVersionChange = (type: "next" | "prev" | "toggle" | "latest") => {
      // Mock version change
      console.log("Version change not implemented yet");
  };

  const { width: windowWidth = 0, height: windowHeight = 0 } = useWindowSize();
  const isMobile = windowWidth ? windowWidth < 768 : false;

  const artifactDefinition = artifactDefinitions.find(
    (definition) => definition.kind === artifact.kind
  );

  if (!artifactDefinition) {
     return null;
  }

  // Initialize
  useEffect(() => {
    if (artifact.documentId !== "init" && artifactDefinition.initialize) {
      artifactDefinition.initialize({
        documentId: artifact.documentId,
        setMetadata,
      });
    }
  }, [artifact.documentId, artifactDefinition]);

  return (
    <AnimatePresence>
      {artifact.isVisible && (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed top-0 left-0 z-50 flex h-[100dvh] w-[100dvw] flex-row bg-transparent"
          data-testid="artifact"
          exit={{ opacity: 0, transition: { delay: 0.4 } }}
          initial={{ opacity: 1 }}
        >
          {!isMobile && (
            <motion.div
              animate={{ width: windowWidth, right: 0 }}
              className="fixed h-[100dvh] bg-background/80 backdrop-blur-sm"
              initial={{
                width: windowWidth,
                right: 0,
              }}
            />
          )}

          {!isMobile && (
            <motion.div
              animate={{
                opacity: 1,
                x: 0,
                scale: 1,
                transition: {
                  delay: 0.1,
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                },
              }}
              className="relative h-[100dvh] w-[400px] shrink-0 bg-muted border-r border-border"
              initial={{ opacity: 0, x: 10, scale: 1 }}
            >
              <div className="flex h-full flex-col items-center justify-between">
                <ArtifactMessages
                  artifactStatus={artifact.status}
                  chatId={chatId}
                  isReadonly={false}
                  messages={messages}
                  regenerate={() => {}} // not impl
                  setMessages={setMessages}
                  status={status}
                  votes={[]}
                />

                <div className="relative flex w-full flex-row items-end gap-2 px-4 pb-4 pt-2 bg-muted border-t">
                  <InputArea
                    value={input}
                    onChange={setInput}
                    onSend={() => sendMessage({ role: 'user', content: input } as any)}
                    isLoading={isLoading}
                    models={[]} // Passed from page if needed, or context
                    selectedModel=""
                    onModelChange={() => {}}
                  />
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            animate={
              isMobile
                ? {
                    opacity: 1,
                    x: 0,
                    y: 0,
                    height: windowHeight,
                    width: windowWidth ? windowWidth : "calc(100dvw)",
                    borderRadius: 0,
                    transition: {
                      delay: 0,
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                      duration: 0.8,
                    },
                  }
                : {
                    opacity: 1,
                    x: 0, // Adjusted logic: we used flex row, so this sits next to sidebar
                    y: 0,
                    height: windowHeight,
                    width: windowWidth
                      ? windowWidth - 400
                      : "calc(100dvw-400px)",
                    borderRadius: 0,
                    transition: {
                      delay: 0,
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                      duration: 0.8,
                    },
                  }
            }
            className="flex h-[100dvh] flex-col overflow-hidden bg-background shadow-2xl"
            initial={
              isMobile
                ? {
                    opacity: 1,
                    x: artifact.boundingBox.left,
                    y: artifact.boundingBox.top,
                    height: artifact.boundingBox.height,
                    width: artifact.boundingBox.width,
                    borderRadius: 50,
                  }
                : {
                    opacity: 1,
                    x: 100, // Slide in from right slightly
                    y: 0,
                    height: windowHeight,
                    width: windowWidth ? windowWidth - 400 : 800,
                  }
            }
          >
            <div className="flex flex-row items-center justify-between p-2 border-b bg-muted/30">
              <div className="flex flex-row items-center gap-4">
                <ArtifactCloseButton />

                <div className="flex flex-col">
                  <div className="font-medium text-sm">{artifact.title || "Untitled Artifact"}</div>
                  {isContentDirty && (
                     <div className="text-xs text-muted-foreground">Saving...</div>
                  )}
                </div>
              </div>

              <ArtifactActions
                artifact={artifact}
                currentVersionIndex={0}
                handleVersionChange={handleVersionChange}
                isCurrentVersion={true}
                metadata={metadata}
                mode={mode}
                setMetadata={setMetadata}
              />
            </div>

            <div className="flex-1 overflow-y-auto bg-background relative">
              <artifactDefinition.content
                content={artifact.content}
                currentVersionIndex={0}
                getDocumentContentById={() => ""}
                isCurrentVersion={true}
                isInline={false}
                isLoading={false}
                metadata={metadata}
                mode={mode}
                onSaveContent={saveContent}
                setMetadata={setMetadata}
                status={artifact.status}
                suggestions={[]}
                title={artifact.title}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const Artifact = memo(PureArtifact, (prevProps, nextProps) => {
  if (prevProps.status !== nextProps.status) {
    return false;
  }
  if (prevProps.input !== nextProps.input) {
    return false;
  }
  if (prevProps.messages.length !== nextProps.messages.length) {
    return false;
  }

  return true;
});
