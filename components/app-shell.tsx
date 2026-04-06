"use client"

import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  LayoutDashboard, 
  BookOpen, 
  ClipboardCheck,
  MessageSquare, 
  Brain, 
  Menu,
  X,
  Trophy,
  Flame,
  Star,
  GraduationCap,
  RotateCcw,
  Zap,
  Target
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface AppShellProps {
  children: React.ReactNode
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "practice", label: "Practice", icon: Target },
  { id: "readiness", label: "Readiness Test", icon: Star },
  { id: "test", label: "Take Test", icon: ClipboardCheck },
  { id: "study-plan", label: "Study Plan", icon: BookOpen },
  { id: "revision", label: "Revision", icon: GraduationCap },
  { id: "assistant", label: "AI Assistant", icon: MessageSquare },
]

export function AppShell({ children }: AppShellProps) {
  const { currentPage, setCurrentPage, userProgress, clearAllData } = useApp()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all progress? This cannot be undone.")) {
      clearAllData()
    }
  }

  const xpToNext = userProgress ? 500 - (userProgress.xp % 500) : 0
  const xpProgress = userProgress ? ((userProgress.xp % 500) / 500) * 100 : 0

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <span className="text-lg font-bold text-sidebar-foreground">StudyPath</span>
              <span className="text-lg font-bold gradient-text ml-1">AI</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Gamification Stats */}
        {userProgress && (
          <div className="p-4 border-b border-sidebar-border space-y-4">
            {/* Level Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium text-sidebar-foreground">Level {userProgress.level}</span>
                </div>
                <span className="text-xs text-muted-foreground">{xpToNext} XP to next</span>
              </div>
              <Progress value={xpProgress} className="h-2" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center p-3 bg-sidebar-accent rounded-xl">
                <Star className="w-5 h-5 text-primary mb-1" />
                <span className="text-sm font-bold text-sidebar-foreground">{userProgress.xp}</span>
                <span className="text-[10px] text-muted-foreground">XP</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-sidebar-accent rounded-xl">
                <Flame className="w-5 h-5 text-orange-500 mb-1" />
                <span className="text-sm font-bold text-sidebar-foreground">{userProgress.streak}</span>
                <span className="text-[10px] text-muted-foreground">Streak</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-sidebar-accent rounded-xl">
                <Zap className="w-5 h-5 text-success mb-1" />
                <span className="text-sm font-bold text-sidebar-foreground">{userProgress.confidenceScore}%</span>
                <span className="text-[10px] text-muted-foreground">Score</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-3">Menu</p>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id)
                  setSidebarOpen(false)
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-sidebar-primary to-sidebar-primary/80 text-sidebar-primary-foreground shadow-lg"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "drop-shadow-sm")} />
                {item.label}
                {item.id === "study-plan" && userProgress && userProgress.studyPlan.length > 0 && (
                  <span className="ml-auto text-xs px-2 py-0.5 bg-background/20 rounded-full">
                    {userProgress.studyPlan.filter(d => d.completed).length}/{userProgress.studyPlan.length}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border space-y-3">
          <div className="flex items-center gap-3 px-3 py-2.5 bg-sidebar-accent rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center">
              <span className="text-sm font-bold text-sidebar-foreground">
                {userProgress?.subject?.charAt(0) || "S"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">Student</p>
              <p className="text-xs text-muted-foreground truncate">
                {userProgress?.subject || "No subject selected"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={handleReset}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Progress
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-30">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="hover:bg-secondary"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">StudyPath AI</span>
          </div>
          {userProgress && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-card rounded-lg border border-border/50">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-bold text-foreground">{userProgress.streak}</span>
            </div>
          )}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
