"use client"

import { AppProvider, useApp } from "@/lib/app-context"
import { LandingPage } from "@/components/landing-page"
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
import { Brain } from "lucide-react"

function AppContent() {
  const { currentPage, isHydrated } = useApp()

  // Show loading state during hydration to prevent mismatches
  if (!isHydrated) {
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

  // Landing and selection pages don't need the app shell
  if (currentPage === "landing") {
    return <LandingPage />
  }

  if (currentPage === "select") {
    return <SubjectSelection />
  }

  // All other pages use the app shell with navigation
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
