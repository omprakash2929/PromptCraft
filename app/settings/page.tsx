// app/settings/page.tsx
"use client"

import AppShell from "@/components/app-shell"
import AuthGate from "@/components/auth-gate"
import QueryProvider from "@/components/providers/query-provider"
import { useCurrentUser, getJWT } from "@/hooks/use-current-user"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

function SettingsInner() {
  const { user } = useCurrentUser()
  const { toast } = useToast()

  async function exportPrompts() {
    const jwt = await getJWT()
    if (!jwt) {
      toast({ title: "Not logged in", description: "Please log in again.", variant: "destructive" })
      return
    }
    const res = await fetch("/api/exportMyPrompts", { headers: { Authorization: `Bearer ${jwt}` } })
    if (!res.ok) {
      toast({ title: "Export failed", description: "Try again later.", variant: "destructive" })
      return
    }
    const data = await res.json()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "promptcraft-export.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card className="p-4 space-y-2">
        <h2 className="font-semibold text-lg">Profile</h2>
        <div className="text-sm">Name: {user?.name || "—"}</div>
        <div className="text-sm">Email: {user?.email || "—"}</div>
      </Card>

      <Card className="p-4 space-y-2">
        <h2 className="font-semibold text-lg">Theme</h2>
        <div className="text-sm text-muted-foreground">Use the theme toggle in your system or app header.</div>
      </Card>

      <Card className="p-4 space-y-3">
        <h2 className="font-semibold text-lg">Data</h2>
        <Button onClick={exportPrompts}>Export my prompts (JSON)</Button>
        <div className="text-xs text-muted-foreground">
          Gemini runs on a server key; you don’t need to paste your key for this MVP.
        </div>
      </Card>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <AppShell>
      <AuthGate>
        <QueryProvider>
          <SettingsInner />
        </QueryProvider>
      </AuthGate>
    </AppShell>
  )
}
