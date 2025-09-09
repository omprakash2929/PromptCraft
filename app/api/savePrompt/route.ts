// app/api/savePrompt/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { SavePromptSchema } from "@/lib/schemas"
import { getUserAppwrite, getAdminAppwrite } from "@/lib/appwriteServer"
import { ID, Permission, Role } from "node-appwrite"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") || ""
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null
  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const json = await req.json().catch(() => null)
  const parsed = SavePromptSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload", details: parsed.error.flatten() }, { status: 400 })
  }

  let userId: string
  let db: ReturnType<typeof getUserAppwrite>["databases"]
  try {
    const { databases, account } = getUserAppwrite(token)
    // Verify JWT by fetching current user
    const me = await account.get()
    userId = me.$id
    db = databases
  } catch (e: any) {
    return NextResponse.json({ error: "invalid_jwt", details: e?.message || "failed_to_verify" }, { status: 401 })
  }

  const databaseId = process.env.APPWRITE_DATABASE_ID!
  const collectionId = process.env.APPWRITE_COLLECTION_PROMPTS_ID!
  if (!databaseId || !collectionId) {
    return NextResponse.json({ error: "server_misconfigured" }, { status: 500 })
  }

  const { refinedPrompt, targetModel, useCase, inputs, title } = parsed.data
  const createdAt = new Date().toISOString()
  const autoTitle = title || `${useCase}: ${refinedPrompt.split(/\s+/).slice(0, 6).join(" ")}`.slice(0, 80)

  const { databases: adminDb } = getAdminAppwrite()
  const permissions = [
    Permission.read(Role.user(userId)),
    Permission.write(Role.user(userId)),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId)),
  ]

  try {
    const doc = await adminDb.createDocument(
      databaseId,
      collectionId,
      ID.unique(), // proper unique ID helper
      {
        userId,
        modelTarget: String(targetModel),
        useCase: String(useCase),
        inputs,
        refinedPrompt,
        title: autoTitle,
        createdAt,
      },
      permissions,
    )
    return NextResponse.json(doc, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: "db_error", details: e?.message || "unknown" }, { status: 500 })
  }
}
