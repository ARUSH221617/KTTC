export const DEFAULT_CHAT_MODEL: string = "agent";

export type ChatModel = {
  id: string;
  name: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  {
    id: "agent",
    name: "Agent",
    description: "Standard conversational agent",
  },
  {
    id: "reasoning",
    name: "Reasoning",
    description: "Agent with advanced reasoning capabilities",
  },
];
