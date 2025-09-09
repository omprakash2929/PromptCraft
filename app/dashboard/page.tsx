// app/dashboard/page.tsx
import AppShell from "@/components/app-shell"
import AuthGate from "@/components/auth-gate"
import QueryProvider from "@/components/providers/query-provider"
import PromptBuilder from "@/components/prompt-builder"

export default function DashboardPage() {
  return (
    <AppShell>
      <AuthGate>
        <QueryProvider>
          <PromptBuilder />
        </QueryProvider>
      </AuthGate>
    </AppShell>
  )
}
