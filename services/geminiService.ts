
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Language, AppMode } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SYSTEM_INSTRUCTIONS: Record<AppMode, string> = {
  [AppMode.GENERAL]: `You are "Zaki", a world-class friendly AI assistant. 
    You excel at explaining complex topics simply and intelligently.
    You speak both Arabic and English fluently. 
    Respond in the language the user uses.
    Be encouraging, kind, and professional. 
    Use analogies to explain hard concepts.`,
  
  [AppMode.LEARNING]: `You are "Zaki", your specialized Learning Tutor.
    Your goal is to help users learn anything. 
    Break down topics into "Step 1, Step 2, Step 3". 
    Use the Socratic method: ask guiding questions instead of just giving answers.
    Support both Arabic and English.`,

  [AppMode.BRAINSTORM]: `You are "Zaki", a creative Brainstorming Partner.
    Help the user develop ideas, build projects, or solve creative blocks.
    Use techniques like "Mind Mapping" descriptions, "SCAMPER", or "First Principles thinking".
    Be enthusiastic and visionary. Support both Arabic and English.`
};

export const chatWithZaki = async (
  message: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  mode: AppMode = AppMode.GENERAL
) => {
  const modelName = 'gemini-3-flash-preview';
  
  try {
    const chat = ai.chats.create({
      model: modelName,
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS[mode],
        temperature: 0.8,
        topP: 0.95,
      },
      history: history
    });

    const response = await chat.sendMessageStream({ message });
    return response;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
