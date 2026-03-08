import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Mic, Square, Activity, Database, FileText, Search, Plus, Trash2, FolderOpen, ChevronLeft, UserPlus, Network, CheckCircle2, Circle, Settings2, Lightbulb } from "lucide-react";
import { getLiveSession, extractPrimitives, researchGrounding, analyzePathways } from "../services/geminiService";

type Actor = { id: string, name: string, role: string };
type PrimitiveType = 'Claim' | 'Interest' | 'Constraint' | 'Leverage' | 'Commitment' | 'Event';
type Primitive = { id: string, type: PrimitiveType, actorId: string, description: string };
type Case = { id: string, title: string, updatedAt: string, transcript: string, actors: Actor[], primitives: Primitive[] };

const PRIMITIVE_TYPES: PrimitiveType[] = ['Claim', 'Interest', 'Constraint', 'Leverage', 'Commitment', 'Event'];

export default function Workspace() {
  const [cases, setCases] = useState<Case[]>([]);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState("IDLE");
  const [research, setResearch] = useState<any>(null);
  const [pathways, setPathways] = useState<any>(null);
  const [mediatorProfile, setMediatorProfile] = useState({ voice: "Zephyr", approach: "Facilitative" });
  const [showSettings, setShowSettings] = useState(false);
  
  const [liveMediationState, setLiveMediationState] = useState<{
    phase: string;
    targetActor: string;
    currentAction: string;
    missingItems: string[];
    structuredItems: { topic: string; summary: string; actor: string }[];
  } | null>(null);
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const activeCaseIdRef = useRef<string | null>(null);
  activeCaseIdRef.current = activeCaseId;

  // Load cases
  useEffect(() => {
    const saved = localStorage.getItem('concordia_cases');
    if (saved) {
      setCases(JSON.parse(saved));
    }
  }, []);

  // Save cases
  useEffect(() => {
    localStorage.setItem('concordia_cases', JSON.stringify(cases));
  }, [cases]);

  const createNewCase = () => {
    const newCase: Case = {
      id: Date.now().toString(),
      title: "New Conflict Case",
      updatedAt: new Date().toISOString(),
      transcript: "",
      actors: [
        { id: 'a1', name: 'Actor 1', role: 'Primary Disputant' },
        { id: 'a2', name: 'Actor 2', role: 'Secondary Disputant' }
      ],
      primitives: []
    };
    setCases([newCase, ...cases]);
    setActiveCaseId(newCase.id);
  };

  const activeCase = cases.find(c => c.id === activeCaseId);

  const updateActiveCase = (updates: Partial<Case>) => {
    setCases(prev => prev.map(c => c.id === activeCaseId ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c));
  };

  const startSession = async () => {
    try {
      setStatus("CONNECTING");
      
      // Pass the current ontology state to the Live API so it can act as a mediator
      const currentGraphContext = JSON.stringify({
        actors: activeCase?.actors,
        primitives: activeCase?.primitives
      }, null, 2);

      const session = await getLiveSession({
        onopen: () => {
          setStatus("LISTENING");
          setIsRecording(true);
          startAudioCapture();
        },
        onmessage: async (message: any) => {
          // Handle incoming audio
          const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (base64Audio) {
            playAudio(base64Audio);
          }
          
          // Handle transcription if available
          const aiText = message.serverContent?.modelTurn?.parts?.[0]?.text;
          const userText = message.clientContent?.turnComplete?.text || message.serverContent?.clientContent?.turnComplete?.text;
          
          if (aiText && activeCaseIdRef.current) {
            setCases(prev => prev.map(c => c.id === activeCaseIdRef.current ? { 
              ...c, 
              transcript: c.transcript + (c.transcript ? "\n\n" : "") + "[Concordia]: " + aiText 
            } : c));
          }
          if (userText && activeCaseIdRef.current) {
            setCases(prev => prev.map(c => c.id === activeCaseIdRef.current ? { 
              ...c, 
              transcript: c.transcript + (c.transcript ? "\n\n" : "") + "[User]: " + userText 
            } : c));
          }

          // Handle tool calls
          if (message.toolCall) {
            const functionCalls = message.toolCall.functionCalls;
            if (functionCalls && functionCalls.length > 0) {
              const responses = functionCalls.map((call: any) => {
                if (call.name === "updateMediationState") {
                  const args = call.args;
                  setLiveMediationState({
                    phase: args.phase || "Discovery",
                    targetActor: args.targetActor || "All",
                    currentAction: args.currentAction || "Analyzing conversation...",
                    missingItems: args.missingItems || [],
                    structuredItems: args.structuredItems || []
                  });
                  return {
                    id: call.id,
                    name: call.name,
                    response: { result: "UI updated successfully" }
                  };
                }
                return {
                  id: call.id,
                  name: call.name,
                  response: { error: "Unknown function" }
                };
              });
              
              if (sessionRef.current) {
                sessionRef.current.sendToolResponse({ functionResponses: responses });
              }
            }
          }
        },
        onclose: () => {
          setStatus("DISCONNECTED");
          setIsRecording(false);
          stopAudioCapture();
        },
        onerror: (err: any) => {
          console.error("Live API Error:", err);
          setStatus("ERROR");
          setIsRecording(false);
          stopAudioCapture();
        }
      }, currentGraphContext, mediatorProfile);
      sessionRef.current = session;
    } catch (error) {
      console.error("Failed to start session:", error);
      setStatus("ERROR");
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setIsRecording(false);
    setStatus("IDLE");
    stopAudioCapture();
    
    // Automatically trigger Phase 2: Structuring and Pathways
    if (activeCase?.transcript) {
      handleSimulateExtraction();
    }
  };

  const startAudioCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;
      
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      
      source.connect(processor);
      processor.connect(audioContext.destination);
      
      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcm16[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        
        const buffer = new ArrayBuffer(pcm16.length * 2);
        const view = new DataView(buffer);
        for (let i = 0; i < pcm16.length; i++) {
          view.setInt16(i * 2, pcm16[i], true);
        }
        
        const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        
        if (sessionRef.current) {
          sessionRef.current.sendRealtimeInput({
            media: { data: base64, mimeType: "audio/pcm;rate=16000" }
          });
        }
      };
    } catch (err) {
      console.error("Error capturing audio:", err);
    }
  };

  const stopAudioCapture = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const playAudio = async (base64Data: string) => {
    try {
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const audioContext = new AudioContext({ sampleRate: 24000 });
      const pcm16 = new Int16Array(bytes.buffer);
      const audioBuffer = audioContext.createBuffer(1, pcm16.length, 24000);
      const channelData = audioBuffer.getChannelData(0);
      for (let i = 0; i < pcm16.length; i++) {
        channelData[i] = pcm16[i] / 0x7FFF;
      }
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    } catch (err) {
      console.error("Error playing audio:", err);
    }
  };

  const handleSimulateExtraction = async () => {
    if (!activeCase?.transcript) return;
    setStatus("ANALYZING");
    try {
      const resultStr = await extractPrimitives(activeCase.transcript);
      const result = JSON.parse(resultStr);
      
      let newActors = [...activeCase.actors];
      let newPrimitives = [...activeCase.primitives];

      result.actors?.forEach((a: any) => {
        if (!newActors.find(existing => existing.name.toLowerCase() === a.name.toLowerCase())) {
          newActors.push({ id: Date.now().toString() + Math.random(), name: a.name, role: a.role || 'Unknown' });
        }
      });

      result.primitives?.forEach((p: any) => {
        const actor = newActors.find(a => a.name.toLowerCase() === p.actorName?.toLowerCase());
        const actorId = actor ? actor.id : newActors[0]?.id;
        if (actorId) {
          newPrimitives.push({
            id: Date.now().toString() + Math.random(),
            type: PRIMITIVE_TYPES.includes(p.type as PrimitiveType) ? p.type : 'Claim',
            actorId,
            description: p.description
          });
        }
      });

      updateActiveCase({ actors: newActors, primitives: newPrimitives });
      
      // Trigger research and pathways
      const currentGraphContext = JSON.stringify({ actors: newActors, primitives: newPrimitives }, null, 2);
      
      const [researchRes, pathwaysResStr] = await Promise.all([
        researchGrounding(activeCase.transcript),
        analyzePathways(activeCase.transcript, currentGraphContext)
      ]);
      
      setResearch(researchRes);
      try {
        setPathways(JSON.parse(pathwaysResStr));
      } catch(e) { console.error("Failed to parse pathways", e); }
      
      setStatus("IDLE");
    } catch (err) {
      console.error("Extraction error:", err);
      setStatus("ERROR");
    }
  };

  // Ontology Modifiers
  const addActor = () => {
    updateActiveCase({ actors: [...activeCase!.actors, { id: Date.now().toString(), name: "New Actor", role: "Role" }] });
  };
  const updateActor = (id: string, updates: Partial<Actor>) => {
    updateActiveCase({ actors: activeCase!.actors.map(a => a.id === id ? { ...a, ...updates } : a) });
  };
  const deleteActor = (id: string) => {
    updateActiveCase({ 
      actors: activeCase!.actors.filter(a => a.id !== id),
      primitives: activeCase!.primitives.filter(p => p.actorId !== id)
    });
  };

  const addPrimitive = (actorId: string) => {
    updateActiveCase({ primitives: [...activeCase!.primitives, { id: Date.now().toString(), type: 'Claim', actorId, description: "New description" }] });
  };
  const updatePrimitive = (id: string, updates: Partial<Primitive>) => {
    updateActiveCase({ primitives: activeCase!.primitives.map(p => p.id === id ? { ...p, ...updates } : p) });
  };
  const deletePrimitive = (id: string) => {
    updateActiveCase({ primitives: activeCase!.primitives.filter(p => p.id !== id) });
  };

  if (!activeCaseId) {
    return (
      <div className="flex-1 p-8 overflow-y-auto bg-[var(--color-bg)]">
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight">Case Management</h1>
          <p className="text-[var(--color-text-muted)] mt-2">Select an existing conflict case or create a new one to begin.</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <button 
            onClick={createNewCase}
            className="h-48 border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)] rounded-xl flex flex-col items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
          >
            <Plus className="w-8 h-8 mb-3" />
            <span className="font-medium">Create New Case</span>
          </button>
          
          {cases.map(c => (
            <div 
              key={c.id} 
              className="h-48 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 flex flex-col hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer group relative" 
              onClick={() => setActiveCaseId(c.id)}
            >
              <div className="flex items-start justify-between mb-auto">
                <h3 className="font-semibold text-lg line-clamp-2 pr-4">{c.title}</h3>
                <FolderOpen className="w-5 h-5 text-[var(--color-accent)] shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-sm text-[var(--color-text-muted)] mt-4 space-y-1">
                <p className="flex items-center gap-2"><UserPlus className="w-3 h-3"/> {c.actors.length} Actors</p>
                <p className="flex items-center gap-2"><Network className="w-3 h-3"/> {c.primitives.length} Primitives</p>
                <p className="text-xs mt-3 opacity-50">Updated: {new Date(c.updatedAt).toLocaleDateString()}</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setCases(cases.filter(x => x.id !== c.id)); }}
                className="absolute bottom-4 right-4 p-2 text-[var(--color-text-muted)] hover:text-[var(--color-danger)] opacity-0 group-hover:opacity-100 transition-opacity rounded-md hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Calculate Health Check
  const presentTypes = new Set(activeCase?.primitives.map(p => p.type));
  const healthScore = Math.round((presentTypes.size / PRIMITIVE_TYPES.length) * 100);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 gap-6 bg-[var(--color-bg)]">
      
      <header className="flex justify-between items-center pb-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveCaseId(null)}
            className="p-2 hover:bg-[var(--color-surface)] rounded-md text-[var(--color-text-muted)] hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <input 
              value={activeCase?.title}
              onChange={e => updateActiveCase({ title: e.target.value })}
              className="text-2xl font-bold tracking-tight bg-transparent border-none focus:outline-none focus:ring-0 p-0 m-0 w-full max-w-md"
            />
            <p className="text-sm text-[var(--color-text-muted)] mt-1">Live Mediation Workspace</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-[var(--color-surface)] rounded-md text-[var(--color-text-muted)] hover:text-white transition-colors"
              title="Mediator Settings"
            >
              <Settings2 className="w-5 h-5" />
            </button>
            
            {showSettings && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl p-4 z-50">
                <h3 className="text-sm font-semibold mb-3">Mediator Profile</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] block mb-1">Voice</label>
                    <select 
                      value={mediatorProfile.voice}
                      onChange={e => setMediatorProfile({...mediatorProfile, voice: e.target.value})}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-sm p-1.5 focus:outline-none focus:border-[var(--color-accent)]"
                    >
                      <option value="Zephyr">Zephyr (Calm, Neutral)</option>
                      <option value="Kore">Kore (Empathetic, Warm)</option>
                      <option value="Puck">Puck (Direct, Clear)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] block mb-1">Approach</label>
                    <select 
                      value={mediatorProfile.approach}
                      onChange={e => setMediatorProfile({...mediatorProfile, approach: e.target.value})}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-sm p-1.5 focus:outline-none focus:border-[var(--color-accent)]"
                    >
                      <option value="Facilitative">Facilitative (Guide process)</option>
                      <option value="Evaluative">Evaluative (Assess merits)</option>
                      <option value="Transformative">Transformative (Empowerment)</option>
                      <option value="Narrative">Narrative (Deconstruct stories)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm font-mono bg-[var(--color-surface)] px-3 py-1.5 rounded-md border border-[var(--color-border)]">
            <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></span>
            {status}
          </div>
          
          <button
            onClick={isRecording ? stopSession : startSession}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
              isRecording 
                ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20' 
                : 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]'
            }`}
          >
            {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {isRecording ? 'Stop Session' : 'Start Live Session'}
          </button>
        </div>
      </header>

      {isRecording && liveMediationState && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--color-surface)] border border-[var(--color-accent)] rounded-xl p-6 shadow-lg shadow-[var(--color-accent)]/10 shrink-0"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[var(--color-accent)] animate-pulse" />
              <h2 className="text-lg font-bold text-white">Live Mediation: {liveMediationState.phase} Phase</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-1.5 bg-[var(--color-surface-hover)] rounded-full border border-[var(--color-border)]">
                <span className="text-sm text-[var(--color-text-muted)]">Speaking: </span>
                <span className="text-sm font-bold text-[var(--color-accent)]">{liveMediationState.targetActor}</span>
              </div>
            </div>
          </div>

          <div className="mb-6 p-4 bg-[var(--color-bg)] border border-[var(--color-accent)]/30 rounded-lg flex items-start gap-3">
            <Activity className="w-5 h-5 text-[var(--color-accent)] mt-0.5 shrink-0" />
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)] mb-1">AI Mediator Focus</h3>
              <p className="text-sm text-white">{liveMediationState.currentAction || "Analyzing conversation..."}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Missing Items */}
            <div className="bg-[var(--color-bg)] rounded-lg p-4 border border-[var(--color-border)]">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-500 mb-3 flex items-center gap-2">
                <Search className="w-4 h-4" /> Information Needed
              </h3>
              {liveMediationState.missingItems.length > 0 ? (
                <ul className="space-y-2">
                  {liveMediationState.missingItems.map((item, idx) => (
                    <motion.li 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={idx} 
                      className="text-sm text-white flex items-start gap-2"
                    >
                      <span className="text-amber-500 mt-0.5">•</span> {item}
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[var(--color-text-muted)] italic">Gathering context...</p>
              )}
            </div>

            {/* Structured Items */}
            <div className="bg-[var(--color-bg)] rounded-lg p-4 border border-[var(--color-border)]">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-500 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Established Facts & Agreements
              </h3>
              {liveMediationState.structuredItems.length > 0 ? (
                <ul className="space-y-3">
                  {liveMediationState.structuredItems.map((item, idx) => (
                    <motion.li 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={idx} 
                      className="bg-[var(--color-surface)] p-3 rounded border border-[var(--color-border)]"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-semibold text-white">{item.topic}</span>
                        <span className="text-xs px-2 py-0.5 bg-[var(--color-surface-hover)] rounded text-[var(--color-text-muted)]">{item.actor}</span>
                      </div>
                      <p className="text-xs text-[var(--color-text-muted)]">{item.summary}</p>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[var(--color-text-muted)] italic">Awaiting structured input...</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
        
        {/* Left Column: Input & Transcript */}
        <div className="flex flex-col gap-6 overflow-hidden">
          <div className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex flex-col">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Phase 1: Context & Live Transcript
            </h2>
            <textarea
              value={activeCase?.transcript}
              onChange={(e) => updateActiveCase({ transcript: e.target.value })}
              placeholder="Enter initial context here, or start the Live Session to let Concordia gather information..."
              className="flex-1 bg-transparent border-none resize-none focus:ring-0 text-sm leading-relaxed text-white placeholder-[var(--color-text-muted)]"
            />
            <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex justify-end">
              <button 
                onClick={handleSimulateExtraction}
                disabled={!activeCase?.transcript || status === 'ANALYZING'}
                className="bg-[var(--color-surface-hover)] hover:bg-[#2a2a2a] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Network className="w-4 h-4" />
                Phase 2: Structure Resolution Path
              </button>
            </div>
          </div>

          {/* Pathways & Grounding */}
          <div className="h-1/3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex flex-col overflow-hidden">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-4 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Phase 2: Resolution Pathways & Intelligence
            </h2>
            <div className="flex-1 overflow-y-auto text-sm text-[var(--color-text-muted)] leading-relaxed pr-2 space-y-6">
              {pathways ? (
                <div className="space-y-6">
                  {pathways.commonGround && pathways.commonGround.length > 0 && (
                    <div>
                      <h3 className="text-emerald-400 font-semibold mb-2">Common Ground</h3>
                      <ul className="list-disc pl-4 space-y-1 text-white">
                        {pathways.commonGround.map((item: string, i: number) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  )}
                  {pathways.criticalQuestions && pathways.criticalQuestions.length > 0 && (
                    <div>
                      <h3 className="text-amber-400 font-semibold mb-2">Critical Questions to Ask</h3>
                      <ul className="list-disc pl-4 space-y-1 text-white">
                        {pathways.criticalQuestions.map((item: string, i: number) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  )}
                  {pathways.pathways && pathways.pathways.length > 0 && (
                    <div>
                      <h3 className="text-blue-400 font-semibold mb-2">Suggested Pathways</h3>
                      <ul className="list-disc pl-4 space-y-1 text-white">
                        {pathways.pathways.map((item: string, i: number) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              ) : research ? (
                <div className="space-y-4">
                  <p className="text-white">{research.text}</p>
                  {research.chunks && research.chunks.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                      <h4 className="text-xs font-semibold uppercase mb-2">Sources</h4>
                      <ul className="space-y-1">
                        {research.chunks.map((chunk: any, idx: number) => (
                          <li key={idx} className="text-xs text-[var(--color-accent)] hover:underline cursor-pointer truncate">
                            {chunk.web?.title || chunk.web?.uri}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center font-mono opacity-50">
                  Awaiting analysis...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Ontology Graph */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-2">
              <Database className="w-4 h-4" />
              Case Structure
            </h2>
            
            {/* Health Check Indicator */}
            <div className="flex items-center gap-3 bg-[var(--color-bg)] border border-[var(--color-border)] px-3 py-1.5 rounded-full">
              <div className="text-xs font-mono text-[var(--color-text-muted)]">Health Check</div>
              <div className="flex gap-1">
                {PRIMITIVE_TYPES.map(type => (
                  <div key={type} title={type} className="flex items-center justify-center">
                    {presentTypes.has(type) ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-[var(--color-border)]" />
                    )}
                  </div>
                ))}
              </div>
              <div className="text-xs font-mono font-bold text-[var(--color-accent)]">{healthScore}%</div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-6">
            {activeCase?.actors.map(actor => (
              <div key={actor.id} className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-2 flex-1 mr-4">
                    <input 
                      value={actor.name} 
                      onChange={e => updateActor(actor.id, { name: e.target.value })}
                      className="bg-transparent font-semibold text-white focus:outline-none border-b border-transparent focus:border-[var(--color-accent)] px-1 w-1/3"
                      placeholder="Actor Name"
                    />
                    <input 
                      value={actor.role} 
                      onChange={e => updateActor(actor.id, { role: e.target.value })}
                      className="bg-transparent text-sm text-[var(--color-text-muted)] focus:outline-none border-b border-transparent focus:border-[var(--color-accent)] px-1 flex-1"
                      placeholder="Actor Role / Stance"
                    />
                  </div>
                  <button onClick={() => deleteActor(actor.id)} className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] p-1 rounded transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-2 pl-4 border-l-2 border-[var(--color-surface-hover)]">
                  {activeCase.primitives.filter(p => p.actorId === actor.id).map(prim => (
                    <div key={prim.id} className="flex items-start gap-2 group">
                      <select 
                        value={prim.type}
                        onChange={e => updatePrimitive(prim.id, { type: e.target.value as PrimitiveType })}
                        className="bg-[var(--color-surface)] text-xs font-mono p-1 rounded border border-[var(--color-border)] text-[var(--color-accent)] focus:outline-none cursor-pointer"
                      >
                        {PRIMITIVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <input 
                        value={prim.description}
                        onChange={e => updatePrimitive(prim.id, { description: e.target.value })}
                        className="bg-transparent text-sm flex-1 focus:outline-none border-b border-transparent focus:border-[var(--color-accent)] px-1 text-white"
                        placeholder="Description..."
                      />
                      <button onClick={() => deletePrimitive(prim.id)} className="opacity-0 group-hover:opacity-100 text-[var(--color-text-muted)] hover:text-[var(--color-danger)] p-1 transition-opacity">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => addPrimitive(actor.id)}
                    className="text-xs text-[var(--color-text-muted)] hover:text-white flex items-center gap-1 mt-3 py-1 px-2 rounded hover:bg-[var(--color-surface-hover)] transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Add Primitive
                  </button>
                </div>
              </div>
            ))}
            
            <button 
              onClick={addActor}
              className="w-full py-4 border border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)] rounded-lg text-sm text-[var(--color-text-muted)] hover:text-white flex items-center justify-center gap-2 transition-colors"
            >
              <UserPlus className="w-4 h-4" /> Add Actor
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
