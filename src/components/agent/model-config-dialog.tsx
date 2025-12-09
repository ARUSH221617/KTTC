"use client";

import { useEffect, useState, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import { toast } from "@/components/agent/toast";
import { LoaderIcon } from "@/components/agent/icons";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
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

  const filteredModels = useMemo(() => {
    return models.filter((model) => {
      const matchesSearch =
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.id.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (maxPrice) {
        // Pricing is usually a string like "0.000005" per token.
        // We compare price per million tokens.
        const pricePerMillion = parseFloat(model.pricing.prompt) * 1000000;
        if (!isNaN(pricePerMillion) && pricePerMillion > parseFloat(maxPrice)) {
          return false;
        }
      }
      return true;
    });
  }, [models, searchQuery, maxPrice]);

  const agentModels = filteredModels.filter((m) =>
    m.supported_parameters?.includes("tools")
  );
  const reasoningModels = filteredModels.filter(
    (m) =>
      m.supported_parameters?.includes("reasoning") ||
      m.supported_parameters?.includes("include_reasoning")
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Model Configuration</DialogTitle>
          <DialogDescription>
            Set the default models for Agent and Reasoning modes.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-row gap-2">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="search">Search Models</Label>
              <Input
                id="search"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="grid w-1/3 items-center gap-1.5">
              <Label htmlFor="price">Max Price</Label>
              <Input
                id="price"
                type="number"
                placeholder="$/1M"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

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
                  ) : agentModels.length > 0 ? (
                    agentModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No models found
                    </div>
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
                  ) : reasoningModels.length > 0 ? (
                    reasoningModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No models found
                    </div>
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
