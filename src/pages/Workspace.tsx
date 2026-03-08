import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import {
  Mic,
  Square,
  Activity,
  Database,
  FileText,
  Search,
} from "lucide-react";
import {
  getLiveSession,
  extractPrimitives,
  researchGrounding,
} from "../services/geminiService";

export default function Workspace() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string>("");
  const [primitives, setPrimitives] = useState<any[]>([]);
  const [research, setResearch] = useState<any>(null);
  const [status, setStatus] = useState("IDLE");

  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startSession = async () => {
    try {
      setStatus("CONNECTING");
      const session = await getLiveSession({
        onopen: () => {
          setStatus("LISTENING");
          setIsRecording(true);
          startAudioCapture();
        },
        onmessage: async (message: any) => {
          // Handle incoming audio
          const base64Audio =
            message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (base64Audio) {
            playAudio(base64Audio);
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
        },
      });
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
          pcm16[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7fff;
        }

        const buffer = new ArrayBuffer(pcm16.length * 2);
        const view = new DataView(buffer);
        for (let i = 0; i < pcm16.length; i++) {
          view.setInt16(i * 2, pcm16[i], true); // true for little-endian
        }

        const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));

        if (sessionRef.current) {
          sessionRef.current.sendRealtimeInput({
            media: { data: base64, mimeType: "audio/pcm;rate=16000" },
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
      streamRef.current.getTracks().forEach((track) => track.stop());
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
      // In a real app, we'd decode the PCM data properly.
      // For simplicity here, we assume the model returns a format we can decode, or we handle PCM decoding manually.
      // The Live API returns raw PCM 16-bit 24kHz.

      const pcm16 = new Int16Array(bytes.buffer);
      const audioBuffer = audioContext.createBuffer(1, pcm16.length, 24000);
      const channelData = audioBuffer.getChannelData(0);
      for (let i = 0; i < pcm16.length; i++) {
        channelData[i] = pcm16[i] / 0x7fff;
      }

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    } catch (err) {
      console.error("Error playing audio:", err);
    }
  };

  // Mock function to simulate extracting primitives from a text input
  const handleSimulateExtraction = async () => {
    if (!transcript) return;
    setStatus("ANALYZING");
    try {
      const result = await extractPrimitives(transcript);
      setPrimitives(JSON.parse(result));

      // Also trigger research
      const researchRes = await researchGrounding(transcript);
      setResearch(researchRes);

      setStatus("IDLE");
    } catch (err) {
      console.error("Extraction error:", err);
      setStatus("ERROR");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 gap-6">
      <header className="flex justify-between items-center pb-4 border-b border-[var(--color-border)]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Live Workspace</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Real-time conflict analysis and primitive extraction.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-mono bg-[var(--color-surface)] px-3 py-1.5 rounded-md border border-[var(--color-border)]">
            <span
              className={`w-2 h-2 rounded-full ${isRecording ? "bg-red-500 animate-pulse" : "bg-gray-500"}`}
            ></span>
            {status}
          </div>

          <button
            onClick={isRecording ? stopSession : startSession}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
              isRecording
                ? "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20"
                : "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]"
            }`}
          >
            {isRecording ? (
              <Square className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
            {isRecording ? "Stop Session" : "Start Live Session"}
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        {/* Left Column: Input & Transcript */}
        <div className="lg:col-span-1 flex flex-col gap-6 overflow-hidden">
          <div className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex flex-col">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Scenario Input
            </h2>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Describe the conflict scenario here, or use the Live Session to speak..."
              className="flex-1 bg-transparent border-none resize-none focus:ring-0 text-sm leading-relaxed text-white placeholder-[var(--color-text-muted)]"
            />
            <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex justify-end">
              <button
                onClick={handleSimulateExtraction}
                disabled={!transcript || status === "ANALYZING"}
                className="bg-[var(--color-surface-hover)] hover:bg-[#2a2a2a] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
              >
                Extract Primitives
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Analysis & Primitives */}
        <div className="lg:col-span-2 flex flex-col gap-6 overflow-hidden">
          {/* Primitives Grid */}
          <div className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex flex-col overflow-hidden">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-4 flex items-center gap-2">
              <Database className="w-4 h-4" />
              Extracted Primitives
            </h2>

            <div className="flex-1 overflow-y-auto">
              <div className="data-grid-header data-grid">
                <div>Type</div>
                <div>Entity</div>
                <div>Description</div>
              </div>

              {primitives.length === 0 ? (
                <div className="p-8 text-center text-[var(--color-text-muted)] text-sm font-mono">
                  No primitives extracted yet.
                </div>
              ) : (
                primitives.map((prim, idx) => (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={idx}
                    className="data-grid hover:bg-[var(--color-surface-hover)] transition-colors"
                  >
                    <div className="text-[var(--color-accent)] font-semibold">
                      {prim.type}
                    </div>
                    <div className="text-white">{prim.entity}</div>
                    <div className="text-[var(--color-text-muted)]">
                      {prim.description}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Research Grounding */}
          <div className="h-1/3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex flex-col overflow-hidden">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-4 flex items-center gap-2">
              <Search className="w-4 h-4" />
              Live Intelligence (Grounding)
            </h2>
            <div className="flex-1 overflow-y-auto text-sm text-[var(--color-text-muted)] leading-relaxed">
              {research ? (
                <div className="space-y-4">
                  <p className="text-white">{research.text}</p>
                  {research.chunks && research.chunks.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                      <h4 className="text-xs font-semibold uppercase mb-2">
                        Sources
                      </h4>
                      <ul className="space-y-1">
                        {research.chunks.map((chunk: any, idx: number) => (
                          <li
                            key={idx}
                            className="text-xs text-[var(--color-accent)] hover:underline cursor-pointer truncate"
                          >
                            {chunk.web?.title || chunk.web?.uri}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center font-mono">
                  Awaiting analysis...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
