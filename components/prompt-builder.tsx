// components/prompt-builder.tsx
"use client"

import { useState, useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { z } from "zod"
import { GeneratePayloadSchema } from "@/lib/schemas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CopyButton } from "./copy-button"
import { ResultPanel } from "./result-panel"
import { PromptAnatomy } from "./prompt-anatomy"
import { useToast } from "@/hooks/use-toast"
import { featuredTemplates } from "@/data/templates"
import { getAccount } from "@/lib/appwriteClient"

type FormState = z.infer<typeof GeneratePayloadSchema>

const defaults: FormState = {
  targetModel: "Gemini",
  useCase: "Text",
  roughIdea: "",
  context: "",
  audience: "",
  tone: [],
  outputFormat: "outline",
  constraints: [],
  language: "auto",
  negative: "",
}

export default function PromptBuilder() {
  const [form, setForm] = useState<FormState>(defaults)
  const [constraintInput, setConstraintInput] = useState("")
  const [refined, setRefined] = useState<string | null>(null)
  const [rateLimited, setRateLimited] = useState(false)
  const { toast } = useToast()
  const qc = useQueryClient()
  const [inFlight, setInFlight] = useState(false)

  const valid = useMemo(() => {
    const res = GeneratePayloadSchema.safeParse(form)
    return res.success
  }, [form])

  const gen = useMutation({
    mutationFn: async (payload: FormState) => {
      if (inFlight) return Promise.reject(new Error("Please wait for the current request to finish."))
      setInFlight(true)
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.status === 429) {
        setRateLimited(true)
        // Try to surface remaining wait time from headers
        const retryAfter = res.headers.get("retry-after") || res.headers.get("x-ratelimit-reset")
        const seconds = retryAfter ? Number.parseInt(retryAfter, 10) : undefined
        throw new Error(
          seconds && !Number.isNaN(seconds)
            ? `Rate limited. Please wait ~${seconds}s and try again.`
            : "Rate limited. Please wait and try again.",
        )
      }
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || data?.error || "Failed to generate")
      return data.refinedPrompt as string
    },
    onSuccess: (text) => {
      setRefined(text)
      setRateLimited(false)
      qc.invalidateQueries({ queryKey: ["recent-prompts"] })
    },
    onError: (e: any) => {
      toast({ title: "Generation failed", description: e?.message || "Unknown error", variant: "destructive" })
    },
    onSettled: () => {
      setInFlight(false)
    },
  })

  const recent = useQuery({
    queryKey: ["recent-prompts"],
    queryFn: async () => {
      const { jwt } = await getAccount().createJWT()
      const res = await fetch("/api/exportMyPrompts", {
        headers: { Authorization: `Bearer ${jwt}` },
      })
      if (!res.ok) throw new Error("Failed to fetch recent prompts")
      const data = await res.json()
      return data.items?.slice(0, 5) || []
    },
    retry: false,
  })

  const featuredTemplatesData = featuredTemplates.map((t) => ({
    id: t.id,
    title: t.title,
    preset: t.preset,
  }))

  const applyPreset = (preset: Partial<FormState>) => {
    setForm((f) => ({ ...f, ...preset }))
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function addConstraint() {
    if (!constraintInput.trim()) return
    update("constraints", [...(form.constraints || []), constraintInput.trim()])
    setConstraintInput("")
  }

  function removeConstraint(i: number) {
    update(
      "constraints",
      (form.constraints || []).filter((_, idx) => idx !== i),
    )
  }

  function reset() {
    setForm(defaults)
    setRefined(null)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card className="p-4 md:p-6 space-y-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Prompt Builder</h2>
          </div>

          {rateLimited && (
            <div className="rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
              You have hit the rate limit. Please wait up to a minute and try again.
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm">Target Model</label>
              <Select value={form.targetModel} onValueChange={(v) => update("targetModel", v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ChatGPT">ChatGPT</SelectItem>
                  <SelectItem value="Gemini">Gemini</SelectItem>
                  <SelectItem value="Claude">Claude</SelectItem>
                  <SelectItem value="DALL·E/Midjourney">DALL·E/Midjourney</SelectItem>
                  <SelectItem value="Video">Video</SelectItem>
                  <SelectItem value="Audio">Audio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm">Use Case</label>
              <Select value={form.useCase} onValueChange={(v) => update("useCase", v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Use case" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Text">Text</SelectItem>
                  <SelectItem value="Image">Image</SelectItem>
                  <SelectItem value="Documentation">Documentation</SelectItem>
                  <SelectItem value="Notes">Notes/Summary</SelectItem>
                  <SelectItem value="Presentation">Presentation</SelectItem>
                  <SelectItem value="Audio Script">Audio Script</SelectItem>
                  <SelectItem value="Video Script">Video Script</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm">Your rough idea</label>
            <Textarea value={form.roughIdea} onChange={(e) => update("roughIdea", e.target.value)} rows={4} required />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm">Context (optional)</label>
              <Textarea value={form.context || ""} onChange={(e) => update("context", e.target.value)} rows={3} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm">Audience</label>
              <Input value={form.audience || ""} onChange={(e) => update("audience", e.target.value)} />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <label className="text-sm">Tone/Style</label>
              <Input
                placeholder="Comma separated (e.g., formal, friendly)"
                value={(form.tone || []).join(", ")}
                onChange={(e) =>
                  update(
                    "tone",
                    e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  )
                }
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm">Output format</label>
              <Select value={form.outputFormat || "outline"} onValueChange={(v) => update("outputFormat", v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bullets">Bullets</SelectItem>
                  <SelectItem value="outline">Outline</SelectItem>
                  <SelectItem value="paragraphs">Paragraphs</SelectItem>
                  <SelectItem value="table">Table (markdown)</SelectItem>
                  <SelectItem value="json">JSON schema</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm">Language</label>
              <Input value={form.language || "auto"} onChange={(e) => update("language", e.target.value)} />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm">Constraints</label>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Add constraint (press Add)"
                value={constraintInput}
                onChange={(e) => setConstraintInput(e.target.value)}
              />
              <Button type="button" variant="secondary" onClick={addConstraint}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {(form.constraints || []).map((c, i) => (
                <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => removeConstraint(i)}>
                  {c} ✕
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm">Negative prompt / avoid (optional)</label>
            <Textarea value={form.negative || ""} onChange={(e) => update("negative", e.target.value)} rows={3} />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button disabled={!valid || gen.isPending || inFlight} onClick={() => gen.mutate(form)}>
              Generate
            </Button>
            <Button variant="secondary" onClick={reset}>
              Reset
            </Button>
            <CopyButton text={JSON.stringify(form)} label="Copy JSON" />
          </div>
        </Card>

        <div className="grid gap-4">
          <h3 className="font-semibold">Result</h3>
          {!refined && gen.isPending && <Card className="p-4 animate-pulse rounded-2xl">Generating…</Card>}
          {refined && (
            <ResultPanel
              refined={refined}
              meta={{ targetModel: form.targetModel, useCase: form.useCase, inputs: form }}
              onSaved={() => {
                qc.invalidateQueries({ queryKey: ["recent-prompts"] })
              }}
            />
          )}
        </div>

        <div className="grid gap-4">
          <h3 className="font-semibold">Recent prompts</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {recent.isLoading && (
              <>
                <Card className="p-4 animate-pulse">Loading…</Card>
                <Card className="p-4 animate-pulse">Loading…</Card>
              </>
            )}
            {recent.data?.length === 0 && !recent.isLoading && (
              <Card className="p-4 text-sm text-muted-foreground">No prompts yet.</Card>
            )}
            {recent.data?.map((d: any) => {
              const title = d.title || `${d.useCase}: ${(d.refinedPrompt || "").split(/\s+/).slice(0, 6).join(" ")}`
              return (
                <Card key={d.$id} className="p-4 space-y-2">
                  <div className="font-medium">{title}</div>
                  <div className="text-xs text-muted-foreground">
                    {d.modelTarget} • {new Date(d.createdAt).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <CopyButton text={d.refinedPrompt} />
                    <a className="text-sm underline" href="/library">
                      Open in Library
                    </a>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="p-4 rounded-2xl">
          <PromptAnatomy />
        </Card>

        <Card className="p-4 space-y-3 rounded-2xl">
          <h3 className="font-semibold">Presets</h3>
          <div className="space-y-2">
            {featuredTemplatesData.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-2 border rounded-xl p-3">
                <div className="text-sm">{t.title}</div>
                <Button size="sm" variant="secondary" onClick={() => applyPreset(t.preset)}>
                  Use this preset
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
