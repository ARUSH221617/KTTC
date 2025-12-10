"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/agent/ui/button";
import { Label } from "@/components/agent/ui/label";
import { toast } from "@/components/agent/toast";
import { LoaderIcon } from "@/components/agent/icons";
import { ModelSelectPopover } from "@/components/agent/model-select-popover";

interface Model {
  id: string;
  name: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  supported_parameters?: string[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function ModelConfigDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: settings, mutate: mutateSettings } = useSWR(
    "/api/settings",
    fetcher
  );
  const { data: modelsData, isLoading: isLoadingModels } = useSWR(
    "/api/openrouter/models",
    fetcher
  );

  const [agentModel, setAgentModel] = useState("");
  const [reasoningModel, setReasoningModel] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setAgentModel(settings.agentModel || "");
      setReasoningModel(settings.reasoningModel || "");
    }
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            agentModel,
            reasoningModel,
          },
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      await mutateSettings();
      toast({ type: "success", description: "Settings saved successfully" });
      onOpenChange(false);
    } catch (error) {
      toast({ type: "error", description: "Failed to save settings" });
    } finally {
      setIsSaving(false);
    }
  };

  const models: Model[] = modelsData?.data || [];

  const agentModels = models.filter((m) =>
    m.supported_parameters?.includes("tools")
  );
  const reasoningModels = models.filter(
    (m) =>
      m.supported_parameters?.includes("reasoning") ||
      m.supported_parameters?.includes("include_reasoning")
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] overflow-visible">
        <DialogHeader>
          <DialogTitle>Model Configuration</DialogTitle>
          <DialogDescription>
            Set the default models for Agent and Reasoning modes.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="agent-model" className="text-right">
              Agent
            </Label>
            <div className="col-span-3">
               {isLoadingModels ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <LoaderIcon size={16} className="animate-spin" />
                    Loading models...
                  </div>
               ) : (
                  <ModelSelectPopover
                    models={agentModels}
                    selectedModelId={agentModel}
                    onSelect={setAgentModel}
                    label="Agent Model"
                  />
               )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reasoning-model" className="text-right">
              Reasoning
            </Label>
            <div className="col-span-3">
               {isLoadingModels ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <LoaderIcon size={16} className="animate-spin" />
                    Loading models...
                  </div>
               ) : (
                  <ModelSelectPopover
                    models={reasoningModels}
                    selectedModelId={reasoningModel}
                    onSelect={setReasoningModel}
                    label="Reasoning Model"
                  />
               )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving && (
              <div className="mr-2 animate-spin">
                <LoaderIcon size={16} />
              </div>
            )}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
