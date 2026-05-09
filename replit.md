# MedScan

A mobile app that uses the camera to scan any medicine (pill, tablet, capsule, bottle, or packaging) and returns AI-powered information including dosage, primary use, approximate price, and general details.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/mobile run dev` — run the Expo mobile app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 (artifacts/api-server)
- Mobile: Expo / React Native (artifacts/mobile)
- AI: OpenAI GPT vision via Replit AI Integrations (no API key required)
- DB: PostgreSQL + Drizzle ORM (available but unused in first build)
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod schemas
- `artifacts/api-server/src/routes/medicine.ts` — medicine analysis route
- `artifacts/mobile/app/index.tsx` — camera scan screen
- `artifacts/mobile/app/result.tsx` — AI analysis results screen
- `artifacts/mobile/constants/colors.ts` — design tokens (dark navy + sky blue theme)

## Architecture decisions

- AI vision runs server-side (api-server) to keep API keys off the device
- Images sent as base64 over HTTPS from mobile → server → OpenAI
- Express body limit raised to 25MB to handle base64 image payloads
- No local DB for first build — results are ephemeral (scan → view)
- Single-screen navigation (no tabs): scan screen → result screen via expo-router push

## Product

MedScan lets users point their phone camera at any medicine and instantly get:
- Medicine name (brand + generic)
- Recommended dosage & frequency
- Primary medical use / indication
- Approximate retail price range
- General information (drug class, mechanism)
- Key warnings and side effects

## User preferences

- App uses OpenAI vision via Replit AI Integrations (billed to Replit credits, no user API key needed)

## Gotchas

- Camera permission screen shows in web preview (expected — camera not available in browser iframe)
- On a physical device via Expo Go, the camera works natively
- AI_INTEGRATIONS_OPENAI_BASE_URL and AI_INTEGRATIONS_OPENAI_API_KEY are auto-set by Replit

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
