// app/api/generate/route.ts
import type { NextRequest } from "next/server"
import type { z } from "zod"
import { GeneratePayloadSchema } from "@/lib/schemas"
import { rateLimitOk, rateLimitHeaders, getClientKeyFromRequest } from "@/lib/rate-limiter"

export const runtime = "edge"

// Build a more structured, deeper prompt
function buildPrompt(p: z.infer<typeof GeneratePayloadSchema>) {
  const roleByUseCase: Record<string, string> = {
    Text: "expert writer and prompt engineer",
    Image: "expert visual prompt engineer",
    Documentation: "senior technical writer",
    Notes: "expert summarizer",
    Presentation: "presentation architect",
    "Audio Script": "audio scriptwriter",
    "Video Script": "video scriptwriter",
  }

  const lines: string[] = []

  // System instruction
  lines.push(`You are an expert prompt engineer specializing in ${p.useCase}. 
Your task is to craft a **single, highly optimized, copy-ready prompt** for the model: ${p.targetModel}.
The generated prompt must be clear, structured, and designed to maximize creativity, depth, and usefulness.`)

  // Context
  if (p.context && p.context.trim()) {
    lines.push("")
    lines.push("### CONTEXT")
    lines.push(p.context.trim())
  }

  // Role & Goal
  lines.push("")
  lines.push("### ROLE & GOAL")
  lines.push(`- Act as: ${roleByUseCase[p.useCase] || "expert prompt engineer"}`)
  lines.push("- Goal: Transform the rough idea into a precise, high-signal, multi-layered prompt.")
  lines.push("- The prompt should encourage depth, creativity, and nuanced outputs.")
  lines.push("- Avoid shallow or generic instructions.")

  // Input
  lines.push("")
  lines.push("### INPUT SUMMARY")
  lines.push(p.roughIdea.trim())

  // Add additional details
  const pushKV = (label: string, val?: string | string[] | null) => {
    if (!val) return
    const text = Array.isArray(val) ? val.join(", ") : val
    if (!text || !String(text).trim()) return
    lines.push(`${label}: ${text}`)
  }

  lines.push("")
  pushKV("AUDIENCE", p.audience || null)
  pushKV("TONE / STYLE", p.tone || null)
  pushKV(
    "OUTPUT FORMAT",
    p.outputFormat === "table"
      ? "table (markdown)"
      : p.outputFormat === "json"
        ? "JSON schema"
        : p.outputFormat || null,
  )
  pushKV("CONSTRAINTS", p.constraints || null)
  pushKV("LANGUAGE", p.language || null)
  pushKV("AVOID", p.negative || null)

  // Deep guidance for non-text models
  if (["DALL·E/Midjourney", "Video", "Audio"].includes(p.targetModel)) {
    lines.push("")
    lines.push("### SPECIAL INSTRUCTIONS (Non-Text Models)")
    lines.push("- Be explicit about scene, subject, style, lighting, mood, and composition.")
    lines.push("- Include strong positive descriptions and meaningful negatives (things to avoid).")
    lines.push("- Ensure clarity so the model generates consistent results.")
  }

  // Final requirement
  lines.push("")
  lines.push("### FINAL INSTRUCTION")
  lines.push("Return only the final **deep, structured prompt** text. Do not explain, just output the optimized prompt.")

  return lines.join("\n")
}

export async function POST(req: NextRequest) {
  const ip = getClientKeyFromRequest(req as any)
  if (!rateLimitOk(ip)) {
    const hdrs = {
      "content-type": "application/json",
      "retry-after": rateLimitHeaders(ip)["x-ratelimit-reset"],
      ...rateLimitHeaders(ip),
    }
    return new Response(
      JSON.stringify({ error: "rate_limited", message: "Rate limited. Please wait and try again." }),
      { status: 429, headers: hdrs },
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    })
  }

  const parsed = GeneratePayloadSchema.safeParse(body)
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "invalid_payload", details: parsed.error.flatten() }), {
      status: 400,
      headers: { "content-type": "application/json" },
    })
  }

  const prompt = buildPrompt(parsed.data)
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "missing_gemini_key", message: "GEMINI_API_KEY is not set on the server." }),
      { status: 500, headers: { "content-type": "application/json" } },
    )
  }

  try {
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
    })

    if (!resp.ok) {
      let rawText = ""
      let json: any = null
      try {
        rawText = await resp.text()
        json = JSON.parse(rawText)
      } catch {}
      const message = json?.error?.message || json?.message || rawText || "Upstream Gemini API error."

      return new Response(
        JSON.stringify({
          error: "gemini_error",
          status: resp.status,
          message,
          code: json?.error?.status || json?.code || undefined,
        }),
        { status: resp.status, headers: { "content-type": "application/json", ...rateLimitHeaders(ip) } },
      )
    }

    const data = await resp.json()
    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: any) => p?.text)
        .filter(Boolean)
        .join("\n") ||
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      ""

    return new Response(
      JSON.stringify({ refinedPrompt: text, tokensUsed: undefined, model: "gemini-1.5-flash" }),
      { status: 200, headers: { "content-type": "application/json", "cache-control": "no-store", ...rateLimitHeaders(ip) } },
    )
  } catch (e: any) {
    return new Response(JSON.stringify({ error: "request_failed", message: e?.message || "unknown" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    })
  }
}
