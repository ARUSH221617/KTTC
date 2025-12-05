"use client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Combobox } from "@/components/ui/combobox";

interface Model {
  id: string;
  name: string;
  architecture?: {
    modality: string;
  };
}

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SettingsSheet({
  open,
  onOpenChange,
}: SettingsSheetProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [selectedChatModel, setSelectedChatModel] = useState<string>("");
  const [selectedImageModel, setSelectedImageModel] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      const fetchModels = async () => {
        try {
          const res = await fetch("/api/admin/ai-agent-chat/models");
          const data = await res.json();
          if (res.ok) {
            setModels(data.models.data);
          } else {
            toast({
              title: "Error fetching models",
              description: data.error,
              variant: "destructive",
            });
          }
        } catch (error) {
          toast({
            title: "Error fetching models",
            description: "An unexpected error occurred.",
            variant: "destructive",
          });
        }
      };
      fetchModels();
      setSelectedChatModel(localStorage.getItem("ai-chat-model") || "");
      setSelectedImageModel(localStorage.getItem("ai-image-model") || "");
    }
  }, [open, toast]);

  const handleSave = () => {
    localStorage.setItem("ai-chat-model", selectedChatModel);
    localStorage.setItem("ai-image-model", selectedImageModel);
    toast({
      title: "Settings saved",
      description: "Your AI agent settings have been saved.",
    });
    onOpenChange(false);
  };

  const modelOptions = models.map((model) => ({
    label: model.name,
    value: model.id,
  }));

  const imageModelOptions = models
    .filter(
      (model) =>
        model.architecture?.modality === "text-to-image"
    )
    .map((model) => ({
      label: model.name,
      value: model.id,
    }));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>AI Agent Settings</SheetTitle>
          <SheetDescription>
            Configure the models for the AI agent.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="chat-model" className="text-right">
              Chat Model
            </Label>
            <div className="col-span-3">
              <Combobox
                options={modelOptions}
                value={selectedChatModel}
                onChange={setSelectedChatModel}
                placeholder="Select a chat model..."
                searchPlaceholder="Search models..."
                emptyPlaceholder="No models found."
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image-model" className="text-right">
              Image Model
            </Label>
            <div className="col-span-3">
              <Combobox
                options={imageModelOptions}
                value={selectedImageModel}
                onChange={setSelectedImageModel}
                placeholder="Select an image model..."
                searchPlaceholder="Search models..."
                emptyPlaceholder="No image models found."
              />
            </div>
          </div>
        </div>
        <SheetFooter>
          <Button onClick={handleSave}>Save changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
