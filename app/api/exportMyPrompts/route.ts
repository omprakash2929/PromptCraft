import { type NextRequest, NextResponse } from "next/server"
import { getUserAppwrite } from "@/lib/appwriteServer"
import { Query } from "node-appwrite"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") || ""
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null
  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  let databases, account, userId: string
  try {
    const userAppwrite = getUserAppwrite(token)
    databases = userAppwrite.databases
    account = userAppwrite.account

    const me = await account.get()
    userId = me.$id
  } catch (e: any) {
    console.log("[v0] JWT validation failed:", e?.message)
    return NextResponse.json({ error: "invalid_jwt" }, { status: 401 })
  }

  const databaseId = process.env.APPWRITE_DATABASE_ID!
  const collectionId = process.env.APPWRITE_COLLECTION_PROMPTS_ID!

  console.log("[v0] Export - Environment check:", {
    databaseId: databaseId || "MISSING",
    collectionId: collectionId || "MISSING",
    userId,
  })

  if (!databaseId || !collectionId) {
    return NextResponse.json(
      {
        error: "server_misconfigured",
        details: "Missing APPWRITE_DATABASE_ID or APPWRITE_COLLECTION_PROMPTS_ID environment variables",
      },
      { status: 500 },
    )
  }

  try {
    console.log("[v0] Fetching prompts for user:", userId)
    const res = await databases.listDocuments(databaseId, collectionId, [
      Query.equal("userId", userId),
      Query.orderDesc("$createdAt"),
      Query.limit(500),
    ])
    console.log("[v0] Successfully fetched", res.documents.length, "prompts")
    return NextResponse.json({ items: res.documents })
  } catch (e: any) {
    console.log("[v0] Export failed:", {
      error: e?.message,
      code: e?.code,
      type: e?.type,
      databaseId,
      collectionId,
      userId,
    })

    let errorMessage = "db_error"
    let errorDetails = e?.message || "unknown"

    if (e?.code === 404) {
      errorMessage = "collection_not_found"
      errorDetails = "Database or collection does not exist"
    } else if (e?.code === 401) {
      errorMessage = "permission_denied"
      errorDetails = "Insufficient permissions to read documents"
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
        debug:
          process.env.NODE_ENV === "development"
            ? {
                databaseId,
                collectionId,
                userId,
                originalError: e?.message,
              }
            : undefined,
      },
      { status: 500 },
    )
  }
}
