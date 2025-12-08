export const DEFAULT_CHAT_MODEL: string = "chat-model";

export type ChatModel = {
  id: string;
  name: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  {
    id: "chat-model",
    name: "Gemma Free",
    description: "Fast and efficient open model by Google",
  },
  {
    id: "chat-model-reasoning",
    name: "Gemma Free (Reasoning)",
    description:
      "Uses chain-of-thought reasoning (simulated) for complex problems",
  },
];
