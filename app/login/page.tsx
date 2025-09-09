// app/login/page.tsx
"use client"

import type React from "react"
import { ID } from "appwrite"
import { useState } from "react"
import { getAccount } from "@/lib/appwriteClient"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  async function onLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const account = getAccount()
      await account.createEmailPasswordSession(email, password)
      router.push("/dashboard")
    } catch (e: any) {
      toast({ title: "Login failed", description: e?.message || "Unknown error", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function onRegister() {
    setLoading(true)
    try {
      // const account = getAccount()
      // await account.create(ID.unique(), email, password)
      // await account.createEmailPasswordSession(email, password)
      router.push("/signup")
    } catch (e: any) {
      toast({ title: "Sign up failed", description: e?.message || "Unknown error", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  function googleOAuth() {
    const account = getAccount()
    const success = `${window.location.origin}/dashboard`
    const failure = `${window.location.origin}/login`
    account.createOAuth2Session("google", success, failure)
  }

  return (
    <main className="min-h-dvh flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-center">Welcome to PromptCraft</h1>
        <form onSubmit={onLogin} className="space-y-3">
          <div className="grid gap-2">
            <label className="text-sm">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <label className="text-sm">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button disabled={loading} className="w-full" type="submit">
            Log in
          </Button>
        </form>
        <Button variant="outline" disabled={loading} className="w-full bg-transparent" onClick={onRegister}>
          Create account
        </Button>
        <Button variant="secondary" disabled={loading} className="w-full" onClick={googleOAuth}>
          Continue with Google
        </Button>
      </Card>
    </main>
  )
}
