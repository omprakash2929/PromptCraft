// app/api/generate/route.ts
import type { NextRequest } from "next/server"
import type { z } from "zod"
import { GeneratePayloadSchema } from "@/lib/schemas"
import { rateLimitOk, rateLimitHeaders, getClientKeyFromRequest } from "@/lib/rate-limiter"

export const runtime = "edge"

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
  lines.push(
    `You are an expert prompt engineer. Create a single, copy-ready prompt optimized for ${p.targetModel} to produce ${p.useCase}.`,
  )
  if (p.context && p.context.trim()) {
    lines.push("")
    lines.push("CONTEXT:")
    lines.push(p.context.trim())
  }
  lines.push("")
  lines.push("ROLE & GOAL:")
  lines.push(`- Act as: ${roleByUseCase[p.useCase] || "expert prompt engineer"}`)
  lines.push("- Goal: transform the rough idea into a precise, high-signal prompt that elicits the best outputs.")
  lines.push("")
  lines.push("INPUT SUMMARY:")
  lines.push(p.roughIdea.trim())

  const pushKV = (label: string, val?: string | string[] | null) => {
    if (!val) return
    const text = Array.isArray(val) ? val.join(", ") : val
    if (!text || !String(text).trim()) return
    lines.push(`${label}: ${text}`)
  }

  lines.push("")
  pushKV("AUDIENCE", p.audience || null)
  pushKV("TONE/STYLE", p.tone || null)
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

  // Guidance for non-text models
  if (["DALL·E/Midjourney", "Video", "Audio"].includes(p.targetModel)) {
    lines.push("")
    lines.push(
      "For non-text models, ensure the prompt guides scene/subject/style plus negatives (lighting, composition, camera where relevant).",
    )
  }

  lines.push("")
  lines.push("Return only the final prompt text, nothing else.")
  return lines.join("\n")
}

export async function POST(req: NextRequest) {
  const ip = getClientKeyFromRequest(req as any)
  if (!rateLimitOk(ip)) {
    const hdrs = {
      "content-type": "application/json",
      "retry-after": rateLimitHeaders(ip)["x-ratelimit-reset"], // seconds
      ...rateLimitHeaders(ip),
    }
    return new Response(
      JSON.stringify({ error: "rate_limited", message: "Rate limited. Please wait and try again." }),
      {
        status: 429,
        headers: hdrs,
      },
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

  if (parsed.data.roughIdea.includes("1/7 scale commercialized figurine")) {
    const customPrompt =
      "Create a 1/7 scale commercialized figurine of the characters in the picture, in a realistic style, in a real environment. The figurine is placed on a computer desk. The figurine has a round transparent acrylic base, with no text on the base. The content on the computer screen is a 3D modeling process of this figurine. Next to the computer screen is a toy packaging box, designed in a style reminiscent of high-quality collectible figures, printed with original artwork. The packaging features two-dimensional flat illustrations."

    return new Response(
      JSON.stringify({
        refinedPrompt: customPrompt,
        tokensUsed: undefined,
        model: "custom-template",
      }),
      {
        status: 200,
        headers: { "content-type": "application/json", "cache-control": "no-store", ...rateLimitHeaders(ip) },
      },
    )
  }

  const prompt = buildPrompt(parsed.data)
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "missing_gemini_key", message: "GEMINI_API_KEY is not set on the server." }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      },
    )
  }

  try {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
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
      } catch {
        // leave json null, keep rawText
      }

      const message = json?.error?.message || json?.message || rawText || "Upstream Gemini API returned an error."

      console.log("[v0] Gemini error", {
        status: resp.status,
        statusText: resp.statusText,
        message,
        raw: rawText?.slice(0, 500),
      })

      return new Response(
        JSON.stringify({
          error: "gemini_error",
          status: resp.status,
          message,
          code: json?.error?.status || json?.code || undefined,
        }),
        {
          status: resp.status,
          headers: { "content-type": "application/json", ...rateLimitHeaders(ip) },
        },
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

    return new Response(JSON.stringify({ refinedPrompt: text, tokensUsed: undefined, model: "gemini-1.5-flash" }), {
      status: 200,
      headers: { "content-type": "application/json", "cache-control": "no-store", ...rateLimitHeaders(ip) },
    })
  } catch (e: any) {
    console.log("[v0] Gemini request_failed", e?.message)
    return new Response(JSON.stringify({ error: "request_failed", message: e?.message || "unknown" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    })
  }
}
