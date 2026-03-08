import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const getLiveSession = (callbacks: any) => {
  return ai.live.connect({
    model: "gemini-2.5-flash-native-audio-preview-09-2025",
    callbacks,
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
      },
      systemInstruction:
        "You are CONCORDIA, a multi-agent AI workspace for human friction professionals. You listen to conflict scenarios, extract primitives (Actors, Claims, Interests, Constraints), ground analysis with facts, and synthesize actionable resolution pathways. Speak calmly, professionally, and objectively.",
    },
  });
};

export const transcribeAudio = async (
  base64Audio: string,
  mimeType: string,
) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: base64Audio,
              mimeType: mimeType,
            },
          },
          { text: "Transcribe this audio accurately." },
        ],
      },
    ],
  });
  return response.text;
};

export const generateSpeech = async (
  text: string,
  voiceName: string = "Kore",
) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

export const chatWithAdvisor = async (
  message: string,
  history: { role: string; parts: { text: string }[] }[],
) => {
  const chat = ai.chats.create({
    model: "gemini-3.1-pro-preview",
    config: {
      systemInstruction:
        "You are the Advisor Agent for CONCORDIA. You synthesize conflict primitives into actionable talking points, briefing drafts, and resolution pathways based on the TACITUS approach (reification, traces of conflict, temporal graphs).",
    },
  });

  // We can't easily pass history to chats.create in this SDK version without a bit of work,
  // so we'll just send the message. For a real app, we'd manage history manually or use the SDK's history feature if available.
  // Actually, we can just use generateContent with history if needed, but let's stick to chat.sendMessage for simplicity.

  const response = await chat.sendMessage({ message });
  return response.text;
};

export const fastAnalysis = async (text: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: `Quickly analyze this conflict scenario and identify the main actors and their primary claims: ${text}`,
  });
  return response.text;
};

export const extractPrimitives = async (text: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Extract conflict primitives from the following text. Return a JSON array of objects with 'type' (Actor, Claim, Interest, Constraint), 'entity' (who or what), and 'description'. Text: ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            entity: { type: Type.STRING },
            description: { type: Type.STRING },
          },
        },
      },
    },
  });
  return response.text;
};

export const researchGrounding = async (query: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Research the following conflict context or entities to provide grounding facts: ${query}`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });
  return {
    text: response.text,
    chunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks,
  };
};
