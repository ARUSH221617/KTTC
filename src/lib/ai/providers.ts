import { createOpenAI } from "@ai-sdk/openai";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { isTestEnvironment } from "../constants";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY ?? "",
});

export const myProvider = isTestEnvironment
  ? (() => {
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
    })()
  : customProvider({
      languageModels: {
        "agent": openrouter("google/gemma-2-9b-it:free"),
        "reasoning": wrapLanguageModel({
          model: openrouter("google/gemma-2-9b-it:free"),
          middleware: extractReasoningMiddleware({ tagName: "think" }),
        }),
        "title-model": openrouter("google/gemma-2-9b-it:free"),
        "artifact-model": openrouter("google/gemma-2-9b-it:free"),
      },
    });
