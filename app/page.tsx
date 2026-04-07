"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppProvider, useApp } from "@/lib/app-context"
import { useAuth } from "@/lib/auth-context"
import { HeroLanding } from "@/components/hero-landing"
import { SubjectSelection } from "@/components/subject-selection"
import { Dashboard } from "@/components/dashboard"
import { DiagnosticTest } from "@/components/diagnostic-test"
import { StudyPlan } from "@/components/study-plan"
import { AdaptiveRevisionSystem } from "@/components/adaptive-revision-system"
import { PracticeMode } from "@/components/practice-mode"
import { TopicReadinessCheck } from "@/components/topic-readiness-check"
import { AIAssistant } from "@/components/ai-assistant"
import { AppShell } from "@/components/app-shell"
import { ErrorBoundary } from "@/components/error-boundary"
import { Brain, Loader2 } from "lucide-react"

function AppContent() {
  const { currentPage, isHydrated } = useApp()
  const { user, loading, profileComplete, isNewUser } = useAuth()
  const router = useRouter()

  // Redirect new/incomplete-profile users to setup
  useEffect(() => {
    if (loading) return
    if (user && (!profileComplete || isNewUser)) {
      router.push("/profile-setup")
    }
  }, [user, loading, profileComplete, isNewUser, router])

  // Global loading state
  if (!isHydrated || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 mx-auto">
            <Brain className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground">Loading StudyPath AI...</p>
        </div>
      </div>
    )
  }

  // ── Unauthenticated: show the new hero landing page ─────────
  if (!user) {
    return <HeroLanding />
  }

  // ── Authenticated but profile incomplete: spinning redirect ──
  if (!profileComplete || isNewUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Setting up your profile…</p>
        </div>
      </div>
    )
  }

  // ── Authenticated + profile complete: render app ─────────────
  if (currentPage === "landing" || currentPage === "select") {
    return <SubjectSelection />
  }

  return (
    <AppShell>
      {currentPage === "dashboard" && <Dashboard />}
      {currentPage === "practice" && <PracticeMode />}
      {currentPage === "readiness" && <TopicReadinessCheck />}
      {currentPage === "test" && <DiagnosticTest />}
      {currentPage === "study-plan" && <StudyPlan />}
      {currentPage === "revision" && <AdaptiveRevisionSystem />}
      {currentPage === "assistant" && <AIAssistant />}
    </AppShell>
  )
}

export default function Page() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  )
}
