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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/agent/ui/select";
import { Label } from "@/components/agent/ui/label";
import { toast } from "@/components/agent/toast";
import { LoaderIcon } from "@/components/agent/icons";

interface Model {
  id: string;
  name: string;
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Model Configuration</DialogTitle>
          <DialogDescription>
            Set the default models for Agent and Reasoning modes.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="agent-model" className="text-right">
              Agent
            </Label>
            <div className="col-span-3">
              <Select value={agentModel} onValueChange={setAgentModel}>
                <SelectTrigger id="agent-model">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingModels ? (
                    <div className="p-2 flex justify-center">
                        <div className="animate-spin">
                          <LoaderIcon size={16} />
                        </div>
                    </div>
                  ) : (
                    models.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reasoning-model" className="text-right">
              Reasoning
            </Label>
            <div className="col-span-3">
               <Select value={reasoningModel} onValueChange={setReasoningModel}>
                <SelectTrigger id="reasoning-model">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                   {isLoadingModels ? (
                    <div className="p-2 flex justify-center">
                        <div className="animate-spin">
                          <LoaderIcon size={16} />
                        </div>
                    </div>
                  ) : (
                    models.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
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
