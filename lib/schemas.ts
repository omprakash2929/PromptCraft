// lib/schemas.ts
import { z } from "zod"

export const GeneratePayloadSchema = z.object({
  targetModel: z.enum(["ChatGPT", "Gemini", "Claude", "DALL·E/Midjourney", "Video", "Audio"]),
  useCase: z.enum(["Text", "Image", "Documentation", "Notes", "Presentation", "Audio Script", "Video Script"]),
  roughIdea: z.string().min(8, "Please provide at least 8 characters."),
  context: z.string().optional().nullable(),
  audience: z.string().optional().nullable(),
  tone: z.array(z.string()).optional().nullable(),
  outputFormat: z.enum(["bullets", "outline", "paragraphs", "table", "json"]).optional().nullable(),
  constraints: z.array(z.string()).optional().nullable(),
  language: z.string().optional().nullable(),
  negative: z.string().optional().nullable(),
})

export type GeneratePayload = z.infer<typeof GeneratePayloadSchema>

export const SavePromptSchema = z.object({
  refinedPrompt: z.string().min(1),
  targetModel: z.string().min(1),
  useCase: z.string().min(1),
  inputs: z.any(),
  title: z.string().optional(),
})

export type SavePromptPayload = z.infer<typeof SavePromptSchema>
