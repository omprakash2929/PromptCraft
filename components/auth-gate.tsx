// components/auth-gate.tsx
"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCurrentUser } from "@/hooks/use-current-user"

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useCurrentUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [loading, user, router])

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Checking session…</div>
  }
  if (!user) return null
  return <>{children}</>
}
