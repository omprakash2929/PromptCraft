// app/api/exportMyPrompts/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { getServerAppwrite } from "@/lib/appwriteServer"
import { Query } from "node-appwrite"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") || ""
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null
  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const { client, databases, account } = getServerAppwrite()
  client.setJWT(token)

  let userId: string
  try {
    const me = await account.get()
    userId = me.$id
  } catch {
    return NextResponse.json({ error: "invalid_jwt" }, { status: 401 })
  }

  const databaseId = process.env.APPWRITE_DATABASE_ID!
  const collectionId = process.env.APPWRITE_COLLECTION_PROMPTS_ID!
  try {
    const res = await databases.listDocuments(databaseId, collectionId, [
      Query.equal("userId", userId),
      Query.orderDesc("createdAt"),
      Query.limit(500),
    ])
    return NextResponse.json({ items: res.documents })
  } catch (e: any) {
    return NextResponse.json({ error: "db_error", details: e?.message || "unknown" }, { status: 500 })
  }
}
