# PromptCraft

Generate better prompts, get better AI results.

Tech: Next.js App Router, TypeScript, TailwindCSS, shadcn/ui, Appwrite (Auth + DB), React Query, Google Gemini (REST).

## Routes

- `/` Landing
- `/login` Auth (email/password + Google OAuth)
- `/dashboard` Prompt Builder + Recent
- `/library` Saved prompts with search/filters
- `/settings` Profile, theme note, export

## Environment

Copy `.env.example` and set:

- NEXT_PUBLIC_APPWRITE_ENDPOINT
- NEXT_PUBLIC_APPWRITE_PROJECT_ID
- NEXT_PUBLIC_APPWRITE_DATABASE_ID          ← used by client queries
- NEXT_PUBLIC_APPWRITE_COLLECTION_PROMPTS_ID← used by client queries
- APPWRITE_API_KEY
- APPWRITE_DATABASE_ID
- APPWRITE_COLLECTION_PROMPTS_ID
- GEMINI_API_KEY

Note: In this environment, `.env` is for configuration only; server-side variables are read at runtime.

## Appwrite Setup

- Database: `promptcraft_db` (use its ID in APPWRITE_DATABASE_ID)
- Collection: `prompts` (use its ID in APPWRITE_COLLECTION_PROMPTS_ID)
- Attributes:
  - `userId` string required
  - `modelTarget` string required
  - `useCase` string required
  - `inputs` object/JSON required
  - `refinedPrompt` string required
  - `title` string required
  - `createdAt` string required
- Permissions: user read/write on own docs.
- Auth: Email/password and Google OAuth enabled.

## API

- `POST /api/generate` (Edge)
  - Validates payload (zod)
  - Rate limit: 20/min per IP (in-memory)
  - Calls Gemini 1.5 Flash via REST
  - Returns `{ refinedPrompt, tokensUsed, model }`
- `POST /api/savePrompt` (Node)
  - Auth via Appwrite JWT in `Authorization: Bearer <jwt>`
  - Saves document with fields: `{ userId, modelTarget, useCase, inputs, refinedPrompt, title, createdAt }`
- `GET /api/exportMyPrompts` (Node)
  - Auth via JWT, returns all user prompts JSON

Test payload for `/api/generate`:

\`\`\`
{
  "targetModel": "ChatGPT",
  "useCase": "Text",
  "roughIdea": "Write a blog on beginner-friendly strength training tips",
  "context": "Audience is 18-25, limited equipment, motivation needed",
  "audience": "Gen Z beginners",
  "tone": ["motivational", "friendly"],
  "outputFormat": "outline",
  "constraints": ["900-1200 words", "avoid jargon"],
  "language": "English",
  "negative": "No dangerous advice"
}
\`\`\`

## UI/UX

- shadcn/ui components (Button, Input, Textarea, Select, Tabs, Card, Badge, Dialog, DropdownMenu, Sheet, Toaster)
- Responsive, dark/light mode compatible
- Rounded-2xl cards and soft shadows
- Navbar with model switcher and user menu; collapsible sidebar on mobile

## Notes

- Keep secrets out of logs.
- Inputs are sanitized and validated with zod.
- Edge vs Node: Gemini route is Edge; Appwrite save/export are Node.
