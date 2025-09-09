import { type NextRequest, NextResponse } from "next/server"
import { SavePromptSchema } from "@/lib/schemas"
import { getUserAppwrite, getAdminAppwrite } from "@/lib/appwriteServer"
import { ID, Permission, Role, Query } from "node-appwrite"

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
    console.log("[v0] User verification failed:", e?.message)
    return NextResponse.json({ error: "invalid_jwt", details: e?.message || "failed_to_verify" }, { status: 401 })
  }

  const databaseId = process.env.APPWRITE_DATABASE_ID!
  const collectionId = process.env.APPWRITE_COLLECTION_PROMPTS_ID!

  console.log("[v0] Environment check:", {
    databaseId: databaseId || "MISSING",
    collectionId: collectionId || "MISSING",
    hasAppwriteApiKey: !!process.env.APPWRITE_API_KEY,
    hasAppwriteEndpoint: !!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
    hasAppwriteProjectId: !!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
  })

  if (!databaseId || !collectionId) {
    console.log("[v0] Missing database config - databaseId:", !!databaseId, "collectionId:", !!collectionId)
    return NextResponse.json(
      {
        error: "server_misconfigured",
        details: "Missing APPWRITE_DATABASE_ID or APPWRITE_COLLECTION_PROMPTS_ID environment variables",
      },
      { status: 500 },
    )
  }

  const { refinedPrompt, targetModel, useCase, inputs, title } = parsed.data
  const autoTitle = title || `${useCase}: ${refinedPrompt.split(/\s+/).slice(0, 6).join(" ")}`.slice(0, 80)

  const documentData = {
    userId,
    modelTarget: String(targetModel),
    useCase: String(useCase),
    inputs: JSON.stringify(inputs),
    refinedPrompt,
    title: autoTitle,
  }

  console.log("[v0] Attempting to save prompt for user:", userId)
  console.log("[v0] Document data:", { ...documentData, refinedPrompt: refinedPrompt.slice(0, 100) + "..." })

  const { databases: adminDb } = getAdminAppwrite()
  const permissions = [
    Permission.read(Role.user(userId)),
    Permission.write(Role.user(userId)),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId)),
  ]

  try {
    console.log("[v0] Testing collection access...")
    await adminDb.listDocuments(databaseId, collectionId, [Query.limit(1)])
    console.log("[v0] Collection access confirmed")

    const doc = await adminDb.createDocument(databaseId, collectionId, ID.unique(), documentData, permissions)
    console.log("[v0] Successfully saved prompt with ID:", doc.$id)
    return NextResponse.json(doc, { status: 201 })
  } catch (e: any) {
    console.log("[v0] Database operation failed:", {
      error: e?.message,
      code: e?.code,
      type: e?.type,
      databaseId,
      collectionId,
      userId,
      step: e?.message?.includes("listDocuments") ? "collection_access_test" : "document_creation",
    })

    let errorMessage = "db_error"
    let errorDetails = e?.message || "unknown"

    if (e?.code === 404) {
      errorMessage = "collection_not_found"
      errorDetails = "Database or collection does not exist"
    } else if (e?.code === 401) {
      errorMessage = "permission_denied"
      errorDetails = "Insufficient permissions to create document"
    } else if (e?.code === 400) {
      errorMessage = "invalid_document"
      errorDetails = "Document data validation failed - collection may be missing required attributes"
    } else if (e?.message?.includes("attribute") || e?.message?.includes("column")) {
      errorMessage = "missing_attributes"
      errorDetails =
        "Collection exists but is missing required attributes. Please set up the following attributes in your Appwrite collection: userId (string), modelTarget (string), useCase (string), inputs (string), refinedPrompt (string), title (string). Note: createdAt and updatedAt are handled automatically by Appwrite as $createdAt and $updatedAt."
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
        requiredAttributes:
          errorMessage === "missing_attributes" || errorMessage === "invalid_document"
            ? [
                { name: "userId", type: "string", required: true },
                { name: "modelTarget", type: "string", required: true },
                { name: "useCase", type: "string", required: true },
                { name: "inputs", type: "string", required: true },
                { name: "refinedPrompt", type: "string", required: true },
                { name: "title", type: "string", required: true },
              ]
            : undefined,
        debug:
          process.env.NODE_ENV === "development"
            ? {
                databaseId,
                collectionId,
                userId,
                originalError: e?.message,
                documentData: Object.keys(documentData),
              }
            : undefined,
      },
      { status: 500 },
    )
  }
}
