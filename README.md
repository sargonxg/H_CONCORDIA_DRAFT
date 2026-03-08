# CONCORDIA by TACITUS

**AI-Powered Live Mediation Platform**

Concordia is a real-time conflict resolution application that guides two parties through structured mediation. It uses live audio conversation with an AI mediator to extract psychological indicators, map conflict primitives, identify common ground, and suggest actionable resolution pathways — all in real time as the parties speak.

## What It Does

1. **Live Mediation Session** — Two parties sit in front of the app. The AI mediator (via live audio) guides a structured conversation, addressing each party individually, asking targeted questions, and de-escalating tension.

2. **Real-Time Case Structuring** — As parties speak, the system extracts Claims, Interests, Constraints, Leverage, Commitments, and Events and maps them to each party.

3. **Psychological Indicators** — The system tracks emotional states (anxiety, defensiveness, openness, cooperativeness), communication styles, and engagement levels for each party in real time.

4. **Resolution Pathways** — After the discovery phase, the system identifies common ground, generates critical questions, and proposes structured resolution pathways drawing on established mediation frameworks (Principled Negotiation, Transformative, Narrative).

## Architecture

- **Listener Agent** (Live Audio API) — Real-time voice I/O, maintains conversational flow, calls tools to update UI state
- **Extraction Agent** — Parses transcripts into structured JSON primitives (TACITUS ontology)
- **Advisor Agent** — Analyzes the case graph to generate pathways, critical questions, and common ground
- **Profiler Agent** — Assesses psychological indicators and emotional state of each party

## Run Locally

**Prerequisites:** Node.js 18+

```bash
npm install
```

Create a `.env.local` file with your Gemini API key:

```
GEMINI_API_KEY=your-api-key-here
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Google Cloud Run

### Using the Dockerfile

```bash
# Build the container (pass your API key as a build arg)
gcloud builds submit --tag gcr.io/YOUR_PROJECT/concordia \
  --build-arg GEMINI_API_KEY=your-api-key

# Deploy to Cloud Run
gcloud run deploy concordia \
  --image gcr.io/YOUR_PROJECT/concordia \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Using Docker locally

```bash
docker build --build-arg GEMINI_API_KEY=your-api-key -t concordia .
docker run -p 8080:8080 concordia
```

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS 4, Framer Motion
- **AI:** Gemini Live Audio API, Gemini Pro (extraction, analysis, pathways)
- **Deployment:** Docker, Google Cloud Run
- **State:** Client-side with localStorage persistence

## License

Apache-2.0
