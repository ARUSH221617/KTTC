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
  fetch: async (url, options) => {
    if (options && options.body) {
      try {
        const body = JSON.parse(options.body as string);
        if (body.messages) {
          body.messages = body.messages.map((m: any) => {
            if (m.role === "developer") return { ...m, role: "system" };
            return m;
          });
          options.body = JSON.stringify(body);
        }
      } catch (error) {
        console.error("OpenRouter fetch interceptor failed to parse body", error);
      }
    }
    return fetch(url, options);
  },
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

  const defaultModel = "openai/gpt-oss-20b:free";
  const agentModel = settingsMap["agentModel"] || defaultModel;
  const reasoningModel = settingsMap["reasoningModel"] || defaultModel;
  // We assume titleModel and artifactModel might be in settings, or default to agentModel or the hardcoded default
  const titleModel = settingsMap["titleModel"] || defaultModel;
  const artifactModel = settingsMap["artifactModel"] || defaultModel;

  return customProvider({
    languageModels: {
      "agent": openrouter.chat(agentModel),
      "reasoning": wrapLanguageModel({
        model: openrouter.chat(reasoningModel),
        middleware: extractReasoningMiddleware({ tagName: "think" }),
      }),
      "title-model": openrouter.chat(titleModel),
      "artifact-model": openrouter.chat(artifactModel),
    },
  });
};
