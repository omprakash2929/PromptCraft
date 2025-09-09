// lib/appwriteClient.ts
// Uses NEXT_PUBLIC_* for endpoint and project
import { Client, Account, Databases } from "appwrite"

let client: Client | null = null
let account: Account | null = null
let databases: Databases | null = null

export function getAppwriteClient() {
  if (client) return client
  client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "")
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")
  return client
}

export function getAccount() {
  if (account) return account
  account = new Account(getAppwriteClient())
  return account
}

export function getDatabases() {
  if (databases) return databases
  databases = new Databases(getAppwriteClient())
  return databases
}
