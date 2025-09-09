// app/page.tsx
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function LandingPage() {
  return (
    <main className="min-h-dvh bg-background">
      <section className="max-w-5xl mx-auto px-6 py-20 text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-pretty">Generate better prompts, get better AI results.</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          PromptCraft helps you turn rough ideas into precise, high-signal prompts for any model.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/dashboard">
            <Button size="lg">Launch App</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Log in
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-12">
          <div className="rounded-2xl border p-6 text-left">Refine prompts with structured controls.</div>
          <div className="rounded-2xl border p-6 text-left">Save, search, and reuse in your Library.</div>
          <div className="rounded-2xl border p-6 text-left">Export and share with your team.</div>
        </div>
        <div className="pt-10 text-sm text-muted-foreground">Pricing: Free for hackathon</div>
        <div className="pt-6">
          <Image
            src="/promptcraft-dashboard-screenshot-placeholder.png"
            alt="PromptCraft screenshot placeholder"
            width={960}
            height={360}
            className="rounded-2xl border shadow-sm mx-auto"
          />
        </div>
      </section>
    </main>
  )
}
