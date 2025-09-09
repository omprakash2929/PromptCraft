// components/app-shell.tsx
"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, Library, LayoutDashboard, Settings, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCurrentUser } from "@/hooks/use-current-user"
import { getAccount } from "@/lib/appwriteClient"
import { useToast } from "@/hooks/use-toast"

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const items = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/library", label: "Library", icon: <Library className="h-4 w-4" /> },
    { href: "/settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
  ]
  return (
    <nav className="hidden md:flex flex-col min-w-56 border-r bg-background">
      <div className="p-4 font-semibold text-sm text-muted-foreground">Navigation</div>
      <ul className="px-2 space-y-1">
        {items.map((it) => (
          <li key={it.href}>
            <Link
              onClick={onNavigate}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-accent ${
                pathname === it.href ? "bg-accent" : ""
              }`}
              href={it.href}
            >
              {it.icon}
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function Navbar() {
  const [model, setModel] = useState("Gemini")
  const { user } = useCurrentUser()
  const { toast } = useToast()

  async function logout() {
    try {
      const account = getAccount()
      await account.deleteSessions()
      window.location.href = "/login"
    } catch (e) {
      toast({ title: "Error", description: "Failed to log out", variant: "destructive" })
    }
  }

  return (
    <header className="h-14 border-b flex items-center justify-between px-3 md:px-6 bg-background">
      <div className="flex items-center gap-2">
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <div className="p-4 border-b flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span className="font-semibold">PromptCraft</span>
            </div>
            <Sidebar />
          </SheetContent>
        </Sheet>
        <Link className="hidden md:flex items-center gap-2" href="/dashboard" aria-label="Go to dashboard">
          <Bot className="h-5 w-5" />
          <span className="font-semibold">PromptCraft</span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <Select value={model} onValueChange={setModel}>
          <SelectTrigger className="w-[160px]" aria-label="Target model">
            <SelectValue placeholder="Model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ChatGPT">ChatGPT</SelectItem>
            <SelectItem value="Gemini">Gemini</SelectItem>
            <SelectItem value="Claude">Claude</SelectItem>
            <SelectItem value="DALL·E/Midjourney">DALL·E/Midjourney</SelectItem>
            <SelectItem value="Video">Video</SelectItem>
            <SelectItem value="Audio">Audio</SelectItem>
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="rounded-full bg-transparent" aria-label="Open user menu">
              {user?.email || "Account"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Link href="/library">
              <DropdownMenuItem>Library</DropdownMenuItem>
            </Link>
            <Link href="/settings">
              <DropdownMenuItem>Settings</DropdownMenuItem>
            </Link>
            <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 max-w-6xl">{children}</main>
      </div>
    </div>
  )
}
