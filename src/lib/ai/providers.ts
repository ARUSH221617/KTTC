import { createOpenAI } from "@ai-sdk/openai";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { isTestEnvironment } from "../constants";
import { db } from "@/lib/db";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY ?? "",
});

export const getMyProvider = async () => {
  if (isTestEnvironment) {
    const {
      artifactModel,
      chatModel,
      reasoningModel,
      titleModel,
    } = require("./models.mock");
    return customProvider({
      languageModels: {
        "agent": chatModel,
        "reasoning": reasoningModel,
        "title-model": titleModel,
        "artifact-model": artifactModel,
      },
    });
  }

  const settings = await db.setting.findMany();
  const settingsMap = settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  const defaultModel = "google/gemma-2-9b-it:free";
  const agentModel = settingsMap["agentModel"] || defaultModel;
  const reasoningModel = settingsMap["reasoningModel"] || defaultModel;
  // We assume titleModel and artifactModel might be in settings, or default to agentModel or the hardcoded default
  const titleModel = settingsMap["titleModel"] || defaultModel;
  const artifactModel = settingsMap["artifactModel"] || defaultModel;

  return customProvider({
    languageModels: {
      "agent": openrouter(agentModel),
      "reasoning": wrapLanguageModel({
        model: openrouter(reasoningModel),
        middleware: extractReasoningMiddleware({ tagName: "think" }),
      }),
      "title-model": openrouter(titleModel),
      "artifact-model": openrouter(artifactModel),
    },
  });
};
