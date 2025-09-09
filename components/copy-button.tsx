// components/copy-button.tsx
"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Copy } from "lucide-react"

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const { toast } = useToast()
  return (
    <Button
      type="button"
      variant="secondary"
      onClick={async () => {
        await navigator.clipboard.writeText(text)
        toast({ title: "Copied", description: "Text copied to clipboard." })
      }}
      className="gap-2"
    >
      <Copy className="h-4 w-4" />
      {label}
    </Button>
  )
}
