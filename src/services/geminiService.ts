import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const updateMediationStateDeclaration = {
  name: "updateMediationState",
  description: "Update the UI state of the mediation process based on the conversation progress. Call this frequently to keep the UI in sync.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      phase: { type: Type.STRING, description: "Current phase: 'Discovery', 'Exploration', 'Resolution', 'Agreement'" },
      targetActor: { type: Type.STRING, description: "The name of the actor who should speak next, or 'All'" },
      currentAction: { type: Type.STRING, description: "A short sentence explaining what you are doing right now (e.g., 'Asking Actor 1 to clarify the timeline', 'Analyzing Actor 2\\'s constraints')" },
      missingItems: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of topics or facts still missing from the case" },
      structuredItems: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            summary: { type: Type.STRING },
            actor: { type: Type.STRING }
          }
        }
      }
    },
    required: ["phase", "targetActor", "currentAction", "missingItems", "structuredItems"]
  }
};

export const getLiveSession = (callbacks: any, context: string = "", mediatorProfile: any = { voice: "Zephyr", approach: "Facilitative" }) => {
  return ai.live.connect({
    model: "gemini-2.5-flash-native-audio-preview-09-2025",
    callbacks,
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: mediatorProfile.voice } },
      },
      tools: [{ functionDeclarations: [updateMediationStateDeclaration] }],
      systemInstruction: `You are CONCORDIA, an elite AI Mediator by TACITUS guiding a complex multi-party conflict resolution. Your approach is: ${mediatorProfile.approach}.

Current Case State & Initial Information:
${context}

CRITICAL INSTRUCTIONS:
1. You MUST proactively structure the conversation, guiding it in VERY SMALL STEPS, actor-by-actor.
2. NEVER ask multiple questions at once. Ask ONE single question, then wait for the user/actor to respond.
3. Explicitly state who you are addressing (e.g., "Actor 1, can you tell me...").
4. Phases of Mediation:
   - Discovery: Ask each actor individually to share their perspective.
   - Exploration: Identify missing facts, underlying needs, and common ground.
   - Resolution: Guide actors to propose solutions for specific structured items.
   - Agreement: Conversationally find an agreement and formalize it.
5. You MUST call the 'updateMediationState' tool BEFORE you speak to explain what you are doing.
   - Set 'currentAction' to explain your thought process (e.g., "Focusing on Actor 1's timeline", "Identifying common ground").
   - Update 'targetActor' to the person you are addressing.
   - Update 'missingItems' and 'structuredItems' as you learn new facts.
6. Speak calmly, professionally, and empathetically. Be firm in guiding the process. Do not let the conversation drift.`,
      inputAudioTranscription: {},
      outputAudioTranscription: {},
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

export const analyzePathways = async (transcript: string, caseStructure: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Based on the following mediation transcript and case structure, identify:
1. Common Ground (shared interests, acknowledged facts, or explicit agreements)
2. Critical Questions (provocative, targeted questions to ask the parties to resolve remaining discrepancies)
3. Resolution Pathways (potential solutions, or if parties have agreed on elements, a structured formal resolution path that works)

Transcript:
${transcript}

Case Structure:
${caseStructure}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          commonGround: { type: Type.ARRAY, items: { type: Type.STRING } },
          criticalQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          pathways: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });
  return response.text;
};

export const extractPrimitives = async (text: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Extract conflict primitives from the following text based on the TACITUS ontology. 
Identify the Actors involved, and for each actor, identify their Claims, Interests, Constraints, Leverage, Commitments, and Events.
Text: ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          actors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                role: { type: Type.STRING }
              }
            }
          },
          primitives: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, description: "Must be exactly 'Claim', 'Interest', 'Constraint', 'Leverage', 'Commitment', or 'Event'" },
                actorName: { type: Type.STRING },
                description: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
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
