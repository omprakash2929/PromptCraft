import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "PromptCraft",
  description: "PromptCraft is a web app built for the **Appwrite Hackathon** that helps you generate professional AI prompts effortlessly. It transforms rough, simple ideas into precise, structured prompts compatible with any AI model (like Google Gemini, GPT, etc.).",
  generator: "PromptCraft is a web app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Analytics />
            <Toaster />
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  )
}
