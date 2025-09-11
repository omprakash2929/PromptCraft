import type { NextRequest } from "next/server"
import type { z } from "zod"
import { GeneratePayloadSchema } from "@/lib/schemas"
import { rateLimitOk, rateLimitHeaders, getClientKeyFromRequest } from "@/lib/rate-limiter"

// Set runtime to edge for optimal performance
export const runtime = "edge"

// Enhanced buildPrompt function to create advanced, deep prompts
function buildPrompt(p: z.infer<typeof GeneratePayloadSchema>) {
  // Define roles for different use cases, expanded for specificity
  const roleByUseCase: Record<string, string> = {
    Text: "expert writer and prompt engineer with expertise in crafting clear, concise, and engaging content",
    Image: "expert visual prompt engineer specializing in detailed and vivid scene descriptions",
    Documentation: "senior technical writer skilled in structured, precise, and user-friendly documentation",
    Notes: "expert summarizer adept at distilling complex information into concise, actionable insights",
    Presentation: "presentation architect with expertise in persuasive and visually compelling slide design",
    "Audio Script": "audio scriptwriter experienced in crafting engaging, conversational scripts",
    "Video Script": "video scriptwriter skilled in dynamic storytelling and visual narrative design",
  }

  // Initialize prompt lines
  const lines: string[] = []

  // System-level instructions for advanced prompt engineering
  lines.push(
    `You are an advanced AI agent acting as an ${roleByUseCase[p.useCase] || "expert prompt engineer"}. Your goal is to produce a high-quality, precise, and optimized output for ${p.targetModel} based on the provided input. Follow these principles:`,
    "- Use clear, unambiguous language to minimize misinterpretation.",
    "- Incorporate chain-of-thought reasoning where applicable to ensure logical and structured outputs.",
    "- Avoid hallucinations by grounding outputs in provided context and input.",
    "- If the task involves creative output, balance creativity with adherence to constraints.",
    "- For non-text outputs (e.g., image, audio), provide vivid, detailed descriptions of scenes, styles, and elements.",
    "- If unsure about any aspect, make reasonable assumptions and explain them in the output.",
    "",
  )

  // Context section
  if (p.context && p.context.trim()) {
    lines.push("CONTEXT:")
    lines.push(p.context.trim())
    lines.push("")
  }

  // Role and goal
  lines.push("ROLE & GOAL:")
  lines.push(`- Role: ${roleByUseCase[p.useCase] || "expert prompt engineer"}`)
  lines.push(
    "- Goal: Transform the rough idea into a detailed, high-signal prompt that maximizes the quality and relevance of the output.",
    "- Ensure the output is tailored to the specified audience, tone, and format.",
    "",
  )

  // Input summary
  lines.push("INPUT SUMMARY:")
  lines.push(p.roughIdea.trim())
  lines.push("")

  // Helper function to add key-value pairs
  const pushKV = (label: string, val?: string | string[] | null) => {
    if (!val) return
    const text = Array.isArray(val) ? val.join(", ") : val
    if (!text || !String(text).trim()) return
    lines.push(`${label}: ${text}`)
  }

  // Add additional parameters
  pushKV("AUDIENCE", p.audience || null)
  pushKV("TONE/STYLE", p.tone || null)
  pushKV(
    "OUTPUT FORMAT",
    p.outputFormat === "table"
      ? "table (markdown, with clear headers and structured rows)"
      : p.outputFormat === "json"
        ? "JSON schema (well-formatted, with proper nesting and clear key names)"
        : p.outputFormat || "plain text (structured and readable)",
  )
  pushKV("CONSTRAINTS", p.constraints || null)
  pushKV("LANGUAGE", p.language || "English (default)")
  pushKV("AVOID", p.negative || null)

  // Advanced prompt engineering instructions
  lines.push("")
  lines.push("ADVANCED INSTRUCTIONS:")
  lines.push(
    "- Break down the task into logical steps before generating the final output.",
    "- If the output requires reasoning, explicitly outline the thought process.",
    "- For creative tasks, include vivid details (e.g., colors, textures, emotions) to enhance quality.",
    "- If examples are relevant, include 1-2 concise examples to guide the output.",
    `- Optimize for ${p.targetModel} by ensuring prompt length and complexity match its capabilities.`,
    "- If the output format is structured (e.g., table, JSON), ensure consistency and clarity.",
    "- Avoid vague terms or assumptions not grounded in the input or context.",
    "",
  )

  // Model-specific guidance for non-text outputs
  if (["DALL·E/Midjourney", "Video", "Audio"].includes(p.targetModel)) {
    lines.push("NON-TEXT MODEL GUIDANCE:")
    lines.push(
      "- For images/videos: Describe the scene, subjects, lighting, composition, and camera angles in vivid detail.",
      "- For audio: Specify tone, pacing, background sounds, and emotional delivery.",
      "- Include negative prompts to exclude unwanted elements (e.g., blurry images, distorted faces).",
      "- Example: For an image, 'A serene forest at sunset, vibrant orange and pink hues, soft light filtering through tall trees, no humans, hyper-realistic, 4K resolution.'",
      "",
    )
  }

  // Special case handling for figurine-related prompts
  if (p.roughIdea.toLowerCase().includes("figurine")) {
    lines.push("SPECIAL CASE (FIGURINE):")
    lines.push(
      "- Create a detailed description of a figurine, including scale (e.g., 1/7), style (e.g., realistic, anime), and environment (e.g., placed on a desk).",
      "- Specify base details (e.g., round transparent acrylic, no text).",
      "- Include context like a computer screen showing the 3D modeling process or a high-quality collectible packaging box with original artwork.",
      "- Example: 'A 1/7 scale realistic figurine of a fantasy warrior, standing on a transparent acrylic base, placed on a modern desk. The computer screen displays a 3D modeling interface of the figurine. A sleek packaging box with vibrant character art sits nearby.'",
      "",
    )
  }

  // Final output instructions
  lines.push("OUTPUT INSTRUCTIONS:")
  lines.push(
    `- Return only the final, polished prompt text, optimized for ${p.targetModel}.`,
    "- Do not include explanations, metadata, or additional commentary unless specified.",
    "- Ensure the prompt is concise yet comprehensive, avoiding redundancy.",
    "",
  )

  return lines.join("\n")
}

// POST handler for the API route
export async function POST(req: NextRequest) {
  // Apply rate limiting
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

  // Parse request body
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    })
  }

  // Validate payload against schema
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

  // Generate advanced prompt
  const prompt = buildPrompt(parsed.data)

  // Retrieve Gemini API key
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

  // Make API call to Gemini
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

    // Handle non-200 responses
    if (!resp.ok) {
      let rawText = ""
      let json: any = null
      try {
        rawText = await resp.text()
        json = JSON.parse(rawText)
      } catch {
        // Keep rawText, leave json as null
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

    // Parse successful response
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
