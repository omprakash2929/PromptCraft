// hooks/use-current-user.ts
"use client"

import { useEffect, useState } from "react"
import { getAccount } from "@/lib/appwriteClient"

export type CurrentUser = {
  $id: string
  name?: string
  email?: string
} | null

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const account = getAccount()
    account
      .get()
      .then((u) => setUser({ $id: u.$id, name: u.name, email: u.email }))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  return { user, loading }
}

export async function getJWT(): Promise<string | null> {
  try {
    const account = getAccount()
    const jwt = await account.createJWT()
    return jwt.jwt
  } catch {
    return null
  }
}
