// components/result-panel.tsx
"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CopyButton } from "./copy-button"
import { useToast } from "@/hooks/use-toast"
import { Save } from "lucide-react"
import { getAccount } from "@/lib/appwriteClient"
import type { SavePromptPayload } from "@/lib/schemas"

export function ResultPanel({
  refined,
  meta,
  onSaved,
}: {
  refined: string
  meta: Omit<SavePromptPayload, "refinedPrompt"> & { refinedPrompt?: never }
  onSaved?: () => void
}) {
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  async function save() {
    setSaving(true)
    try {
      // Mint a fresh short-lived JWT from current session
      const account = getAccount()
      const { jwt } = await account.createJWT()

      const res = await fetch("/api/savePrompt", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ ...meta, refinedPrompt: refined }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.error || payload?.message || `HTTP ${res.status}`)
      }
      toast({ title: "Saved", description: "Prompt saved to your library." })
      onSaved?.()
    } catch (e: any) {
      toast({ title: "Save failed", description: e?.message || "Unknown error", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="p-4 space-y-3">
      <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-6">{refined}</pre>
      <div className="flex items-center gap-2">
        <CopyButton text={refined} />
        <Button onClick={save} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          Save
        </Button>
      </div>
    </Card>
  )
}
