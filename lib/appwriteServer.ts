// lib/appwriteServer.ts
// For server functions (Node runtime) only
import { Client, Databases, Users, Account } from "node-appwrite"

export function getAdminAppwrite() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
  const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
  const apiKey = process.env.APPWRITE_API_KEY

  if (!endpoint || !project || !apiKey) {
    throw new Error("Missing Appwrite server env vars.")
  }

  const client = new Client().setEndpoint(endpoint).setProject(project).setKey(apiKey)

  const databases = new Databases(client)
  const users = new Users(client)
  const account = new Account(client)

  return { client, databases, users, account }
}

export function getUserAppwrite(jwt: string) {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
  const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
  if (!endpoint || !project) {
    throw new Error("Missing Appwrite endpoint/project.")
  }
  if (!jwt) {
    throw new Error("Missing user JWT.")
  }

  // Important: DO NOT setKey() here. Use only the user's JWT.
  const client = new Client().setEndpoint(endpoint).setProject(project).setJWT(jwt)
  const databases = new Databases(client)
  const account = new Account(client)

  return { client, databases, account }
}

export function getServerAppwrite() {
  // Backwards compatible alias for admin client (API key based)
  return getAdminAppwrite()
}
