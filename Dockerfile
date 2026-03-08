# Stage 1: Build the frontend
FROM node:22-slim AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# The Gemini API key is baked into the frontend at build time.
# Pass it via --build-arg GEMINI_API_KEY=<your-key>
ARG GEMINI_API_KEY
ENV GEMINI_API_KEY=${GEMINI_API_KEY}

RUN npm run build

# Stage 2: Serve with a lightweight Node server
FROM node:22-slim AS production

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY server.ts ./
COPY --from=build /app/dist ./dist

EXPOSE 8080

CMD ["npx", "tsx", "server.ts"]
