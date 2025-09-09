// app/library/page.tsx
"use client"

import AppShell from "@/components/app-shell"
import AuthGate from "@/components/auth-gate"
import QueryProvider from "@/components/providers/query-provider"
import { useQuery } from "@tanstack/react-query"
import { getDatabases } from "@/lib/appwriteClient"
import { Query } from "appwrite"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { CopyButton } from "@/components/copy-button"
import { featuredTemplates } from "@/data/templates"

function LibraryInner() {
  const [search, setSearch] = useState("")
  const [useCase, setUseCase] = useState<string>("all")
  const [model, setModel] = useState<string>("all")
  const db = getDatabases()

  const docs = useQuery({
    queryKey: ["library", search, useCase, model],
    queryFn: async () => {
      const filters = []
      if (search) filters.push(Query.search("title", search))
      if (useCase !== "all") filters.push(Query.equal("useCase", useCase))
      if (model !== "all") filters.push(Query.equal("modelTarget", model))
      filters.push(Query.orderDesc("createdAt"))
      return db.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "",
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROMPTS_ID || "",
        filters,
      )
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={useCase} onValueChange={setUseCase}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Use case" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Text">Text</SelectItem>
            <SelectItem value="Image">Image</SelectItem>
            <SelectItem value="Documentation">Documentation</SelectItem>
            <SelectItem value="Notes">Notes</SelectItem>
            <SelectItem value="Presentation">Presentation</SelectItem>
            <SelectItem value="Audio Script">Audio Script</SelectItem>
            <SelectItem value="Video Script">Video Script</SelectItem>
          </SelectContent>
        </Select>
        <Select value={model} onValueChange={setModel}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="ChatGPT">ChatGPT</SelectItem>
            <SelectItem value="Gemini">Gemini</SelectItem>
            <SelectItem value="Claude">Claude</SelectItem>
            <SelectItem value="DALL·E/Midjourney">DALL·E/Midjourney</SelectItem>
            <SelectItem value="Video">Video</SelectItem>
            <SelectItem value="Audio">Audio</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {docs.isLoading && (
          <>
            <Card className="p-4 animate-pulse">Loading…</Card>
            <Card className="p-4 animate-pulse">Loading…</Card>
          </>
        )}
        {!docs.isLoading && docs.data?.documents?.length === 0 && (
          <Card className="p-6 text-sm text-muted-foreground">No prompts found. Try adjusting filters.</Card>
        )}
        {docs.data?.documents?.map((d: any) => (
          <Card key={d.$id} className="p-4 space-y-2">
            <div className="font-medium">{d.title}</div>
            <div className="text-xs text-muted-foreground">
              {d.modelTarget} • {d.useCase} • {new Date(d.createdAt).toLocaleString()}
            </div>
            <div className="line-clamp-4 text-sm text-muted-foreground">{d.refinedPrompt}</div>
            <div className="pt-2">
              <CopyButton text={d.refinedPrompt} />
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold">Featured Templates</h3>
        <div className="grid md:grid-cols-3 gap-3">
          {featuredTemplates.map((t) => (
            <Card key={t.id} className="p-4 space-y-2">
              <div className="font-medium">{t.title}</div>
              <div className="text-sm text-muted-foreground">Read-only template</div>
              <a href="/dashboard" className="text-sm underline">
                Use template
              </a>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function LibraryPage() {
  return (
    <AppShell>
      <AuthGate>
        <QueryProvider>
          <LibraryInner />
        </QueryProvider>
      </AuthGate>
    </AppShell>
  )
}
