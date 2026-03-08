import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const updateMediationStateDeclaration = {
  name: "updateMediationState",
  description:
    "Update the UI state of the mediation process based on the conversation progress. Call this BEFORE every response to keep the UI synchronized with your reasoning.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      phase: {
        type: Type.STRING,
        description:
          "Current phase: 'Opening', 'Discovery', 'Exploration', 'Negotiation', 'Resolution', 'Agreement'",
      },
      targetActor: {
        type: Type.STRING,
        description:
          "The name of the party who should speak next, or 'Both' for joint address",
      },
      currentAction: {
        type: Type.STRING,
        description:
          "A short sentence explaining your mediator reasoning (e.g., 'Validating Party A emotional state before probing deeper', 'Checking for hidden interests behind Party B position')",
      },
      missingItems: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description:
          "List of facts, perspectives, or emotional dimensions still missing from the case",
      },
      structuredItems: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            summary: { type: Type.STRING },
            actor: { type: Type.STRING },
          },
        },
        description: "Established facts, agreements, or key revelations",
      },
      partyProfiles: {
        type: Type.OBJECT,
        properties: {
          partyA: {
            type: Type.OBJECT,
            properties: {
              emotionalState: {
                type: Type.STRING,
                description:
                  "Primary emotional state: 'Calm', 'Anxious', 'Defensive', 'Angry', 'Frustrated', 'Hopeful', 'Resigned', 'Guarded', 'Open', 'Distressed'",
              },
              engagementLevel: {
                type: Type.STRING,
                description: "'High', 'Medium', 'Low', 'Disengaged'",
              },
              communicationStyle: {
                type: Type.STRING,
                description:
                  "'Assertive', 'Passive', 'Aggressive', 'Analytical', 'Collaborative', 'Avoidant', 'Accommodating'",
              },
              cooperativeness: {
                type: Type.NUMBER,
                description:
                  "0 to 100 scale of willingness to cooperate and find common ground",
              },
              defensiveness: {
                type: Type.NUMBER,
                description:
                  "0 to 100 scale of how defensive the party is being",
              },
              keyNeeds: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description:
                  "Underlying needs detected (e.g., 'Recognition', 'Security', 'Autonomy', 'Fairness')",
              },
              riskFactors: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description:
                  "Risks to mediation success from this party (e.g., 'Escalation tendency', 'Withdrawal risk', 'Fixed position')",
              },
            },
          },
          partyB: {
            type: Type.OBJECT,
            properties: {
              emotionalState: { type: Type.STRING },
              engagementLevel: { type: Type.STRING },
              communicationStyle: { type: Type.STRING },
              cooperativeness: { type: Type.NUMBER },
              defensiveness: { type: Type.NUMBER },
              keyNeeds: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              riskFactors: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
          },
        },
        description:
          "Psychological profiles for both parties based on conversational signals",
      },
      commonGround: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description:
          "Areas of agreement, shared values, or mutual interests identified so far",
      },
      tensionPoints: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description:
          "Active points of disagreement or high-emotion topics to handle carefully",
      },
    },
    required: [
      "phase",
      "targetActor",
      "currentAction",
      "missingItems",
      "structuredItems",
      "partyProfiles",
      "commonGround",
      "tensionPoints",
    ],
  },
};

export const getLiveSession = (
  callbacks: any,
  context: string = "",
  mediatorProfile: any = { voice: "Zephyr", approach: "Facilitative" },
  partyNames: { partyA: string; partyB: string } = {
    partyA: "Party A",
    partyB: "Party B",
  },
) => {
  return ai.live.connect({
    model: "gemini-2.5-flash-native-audio-preview-09-2025",
    callbacks,
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: mediatorProfile.voice },
        },
      },
      tools: [{ functionDeclarations: [updateMediationStateDeclaration] }],
      systemInstruction: `You are CONCORDIA, an elite AI Mediator created by the TACITUS Institute for Conflict Resolution. You are facilitating a live mediation session between two parties: "${partyNames.partyA}" and "${partyNames.partyB}".

Your mediation approach is: ${mediatorProfile.approach}.

Current Case Context:
${context}

CORE PROTOCOL:

PHASE PROGRESSION:
1. OPENING - Welcome both parties. Explain ground rules: mutual respect, one person speaks at a time, confidentiality. Ask each party to briefly introduce themselves and state what brought them here. Set a tone of safety and neutrality.

2. DISCOVERY - Address each party ONE AT A TIME. Ask a single, open-ended question. Listen deeply. Do NOT summarize prematurely. Probe for:
   - What happened (their narrative)
   - How it made them feel (emotional dimension)
   - What they need going forward (underlying interests)
   - What they have already tried (history of attempts)

3. EXPLORATION - Cross-reference what both parties have said. Identify:
   - Shared facts vs. disputed facts
   - Underlying interests that may overlap
   - Emotional triggers and patterns
   - Power dynamics and imbalances
   Ask clarifying questions that help parties see each other's perspective WITHOUT forcing agreement.

4. NEGOTIATION - Guide parties to generate options. Ask "What would it look like if...?" questions. Help them brainstorm without committing. Identify trade-offs and explore flexibility.

5. RESOLUTION - Narrow down to viable pathways. Test agreements: "If X happened, would that address your concern about Y?" Build specific, actionable terms.

6. AGREEMENT - Summarize what has been agreed. Confirm with both parties. Identify remaining concerns. Outline next steps.

CRITICAL BEHAVIORAL RULES:
- ALWAYS call 'updateMediationState' BEFORE you speak. This updates the visual workspace the parties can see.
- NEVER ask more than ONE question at a time. Wait for a response.
- ALWAYS name who you are addressing: "${partyNames.partyA}, ..." or "${partyNames.partyB}, ..."
- When a party shows strong emotion, VALIDATE it before moving on: "I hear that this has been very difficult for you..."
- Track psychological indicators: note changes in tone, defensiveness, openness, and update partyProfiles accordingly.
- When you detect escalation, immediately de-escalate: acknowledge the emotion, slow down, reframe.
- Identify COMMON GROUND proactively and name it explicitly: "It sounds like you both agree that..."
- Track TENSION POINTS and approach them strategically, not head-on.
- Monitor cooperativeness and engagement. If a party disengages, address it directly but gently.
- Your voice should be calm, measured, empathetic, and authoritative. You are guiding, not judging.
- Keep your responses concise (2-4 sentences per turn). The parties should talk more than you.`,
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
    model: "gemini-2.5-flash-preview-05-20",
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
    model: "gemini-2.5-pro-preview-06-05",
    config: {
      systemInstruction: `You are the Strategic Advisor Agent for CONCORDIA, the TACITUS Institute's AI mediation platform.

Your role is to provide deep analytical support for conflict resolution. You synthesize conflict primitives (Claims, Interests, Constraints, Leverage, Commitments, Events) into:

1. Analytical Briefings - Break down the conflict structure, identify power dynamics, highlight hidden interests
2. Tactical Recommendations - Suggest specific questions to ask, reframing strategies, de-escalation techniques
3. Resolution Pathways - Propose concrete solution options with trade-off analysis
4. Psychological Insights - Identify emotional patterns, communication styles, and underlying needs
5. Risk Assessment - Flag potential escalation triggers, power imbalances, and process risks

Draw upon established frameworks:
- Principled Negotiation (Fisher & Ury) - Focus on interests, not positions
- Transformative Mediation - Empowerment and recognition
- Narrative Mediation - Deconstructing conflict stories
- TACITUS Ontology - Reification, temporal graphs, traces of conflict

Be direct, specific, and actionable. Avoid generic advice. Reference specific elements from the case when available.`,
    },
  });

  const response = await chat.sendMessage({ message });
  return response.text;
};

export const analyzePathways = async (
  transcript: string,
  caseStructure: string,
) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro-preview-06-05",
    contents: `You are the Resolution Architect for the CONCORDIA mediation platform.

Analyze the following mediation transcript and case structure. Produce a detailed resolution analysis:

1. Common Ground - Identify shared interests, acknowledged facts, explicit or implicit agreements, shared values, and mutual concerns. Be specific.

2. Critical Questions - Generate provocative, targeted questions designed to:
   - Reveal hidden interests behind stated positions
   - Test the flexibility of seemingly fixed positions
   - Help parties see each other's perspective
   - Move from blame to problem-solving

3. Resolution Pathways - Propose concrete, actionable pathways. For each pathway describe the solution, explain which interests it serves, note trade-offs, and suggest implementation steps.

4. Psychological Dynamics - Assess the emotional landscape: power balance, emotional readiness, communication patterns, and recommended approach adjustments.

Transcript:
${transcript}

Case Structure:
${caseStructure}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          commonGround: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          criticalQuestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          pathways: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          psychologicalDynamics: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
      },
    },
  });
  return response.text;
};

export const extractPrimitives = async (text: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro-preview-06-05",
    contents: `You are the Extraction Agent for the CONCORDIA mediation platform, using the TACITUS conflict ontology.

Extract structured conflict primitives from the following mediation transcript. For each party involved, identify:

- Claims - What each party states as fact or asserts as their position
- Interests - The underlying needs, desires, fears, or motivations behind their claims
- Constraints - Limitations, boundaries, or non-negotiables each party has
- Leverage - Sources of power, influence, or advantage each party holds
- Commitments - Promises, obligations, or agreements already made
- Events - Key incidents, timeline markers, or turning points referenced

Also identify the actors with their names and roles/stances.

Be thorough. Extract EVERYTHING relevant, even if implied rather than explicitly stated.

Text:
${text}`,
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
                role: { type: Type.STRING },
              },
            },
          },
          primitives: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: {
                  type: Type.STRING,
                  description:
                    "Must be exactly 'Claim', 'Interest', 'Constraint', 'Leverage', 'Commitment', or 'Event'",
                },
                actorName: { type: Type.STRING },
                description: { type: Type.STRING },
              },
            },
          },
        },
      },
    },
  });
  return response.text;
};

export const researchGrounding = async (query: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro-preview-06-05",
    contents: `Research the following conflict context or entities to provide grounding facts, legal precedents, or relevant background information that could inform the mediation: ${query}`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });
  return {
    text: response.text,
    chunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks,
  };
};
