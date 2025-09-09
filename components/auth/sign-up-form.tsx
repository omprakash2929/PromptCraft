"use client"

import { useState } from "react"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ID } from "appwrite"
import { useToast } from "@/hooks/use-toast"
import { getAccount } from "@/lib/appwriteClient"

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

type FormValues = z.infer<typeof schema>

export function SignUpForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  })

  async function onSubmit(values: FormValues) {
    try {
      setLoading(true)

      const account = getAccount()

      // Create the account
      await account.create(ID.unique(), values.email, values.password, values.name)

      // If email verification is required in Appwrite settings:
      // await account.createVerification(`${window.location.origin}/verify`)

      // Log in immediately (mirrors the login page API)
      await account.createEmailPasswordSession(values.email, values.password)

      toast({ title: "Welcome!", description: "Your account has been created." })
      router.replace("/dashboard")
    } catch (err: any) {
      const msg = err?.message || "Unable to create account"
      toast({ title: "Sign up failed", description: msg, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border">
      <CardHeader>
        <CardTitle className="text-balance">Create your account</CardTitle>
        <CardDescription className="text-pretty">
          Sign up with your email and a password to start using PromptCraft.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" placeholder="Ada Lovelace" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...form.register("email")} />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" {...form.register("password")} />
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center"></CardFooter>
    </Card>
  )
}
