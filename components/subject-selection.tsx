"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useApp, type UserProgress } from "@/lib/app-context"
import { SUBJECT_TOPICS } from "@/lib/questions"
import { 
  Database, 
  Binary, 
  Cpu, 
  Network, 
  ChevronRight, 
  ArrowLeft,
  GraduationCap,
  Target,
  Clock,
  Sparkles,
  BookOpen,
  Brain,
  Check
} from "lucide-react"
import { cn } from "@/lib/utils"

const subjects = [
  { id: "DBMS", name: "Database Management", icon: Database, description: "SQL, Normalization, Transactions", color: "from-blue-500/20 to-blue-500/5", iconColor: "text-blue-400" },
  { id: "DSA", name: "Data Structures & Algorithms", icon: Binary, description: "Arrays, Trees, Graphs, Sorting", color: "from-emerald-500/20 to-emerald-500/5", iconColor: "text-emerald-400" },
  { id: "OS", name: "Operating Systems", icon: Cpu, description: "Processes, Memory, Scheduling", color: "from-amber-500/20 to-amber-500/5", iconColor: "text-amber-400" },
  { id: "CN", name: "Computer Networks", icon: Network, description: "OSI Model, TCP/IP, Protocols", color: "from-purple-500/20 to-purple-500/5", iconColor: "text-purple-400" },
]

const skillLevels = [
  { id: "beginner", name: "Beginner", description: "Just starting out with this subject", icon: GraduationCap },
  { id: "intermediate", name: "Intermediate", description: "Have some knowledge, need practice", icon: BookOpen },
  { id: "advanced", name: "Advanced", description: "Good understanding, want to master", icon: Brain },
]

const goals = [
  { id: "exam", name: "Exam Preparation", description: "Preparing for upcoming exams", icon: Target },
  { id: "interview", name: "Interview Ready", description: "Technical interview preparation", icon: Sparkles },
  { id: "learn", name: "Self Learning", description: "Learning at my own pace", icon: Clock },
]

export function SubjectSelection() {
  const { setCurrentPage, setUserProgress } = useApp()
  const [step, setStep] = useState(1)
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedLevel, setSelectedLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner")
  const [selectedGoal, setSelectedGoal] = useState("")

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      const topics = SUBJECT_TOPICS[selectedSubject] || []
      const initialProgress: UserProgress = {
        subject: selectedSubject,
        skillLevel: selectedLevel,
        goal: selectedGoal,
        confidenceScore: 0,
        xp: 0,
        level: 1,
        streak: 0,
        weakAreas: [],
        moderateAreas: [],
        strongAreas: [],
        topicAccuracy: {},
        recentActivity: [],
        studyPlan: [],
        performanceHistory: [],
        mistakeInsights: [],
        topicReadiness: {},
        practiceSessions: [],
        practiceResults: [],
        unlockedTopics: topics,
        currentPracticeSession: null,
      }
      setUserProgress(initialProgress)
      setCurrentPage("test")
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      setCurrentPage("landing")
    }
  }

  const canProceed = 
    (step === 1 && selectedSubject) ||
    (step === 2 && selectedLevel) ||
    (step === 3 && selectedGoal)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-5 lg:px-12 border-b border-border/50">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Back</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground">StudyPath AI</span>
        </div>
        <div className="w-16" />
      </header>

      {/* Progress Steps */}
      <div className="px-6 py-8 lg:px-12">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-sm transition-all duration-300",
                    s < step
                      ? "bg-gradient-to-br from-success to-success/80 text-success-foreground"
                      : s === step
                        ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg"
                        : "bg-secondary text-muted-foreground"
                  )}
                >
                  {s < step ? <Check className="w-5 h-5" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={cn(
                      "w-16 sm:w-24 lg:w-32 h-1 mx-2 rounded-full transition-all duration-300",
                      s < step ? "bg-success" : "bg-border"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground px-1">
            <span>Subject</span>
            <span>Level</span>
            <span>Goal</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-8 lg:px-12">
        <div className="max-w-2xl mx-auto">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
                  Choose Your Subject
                </h1>
                <p className="text-muted-foreground mt-2">
                  Select the subject you want to master
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {subjects.map((subject) => {
                  const Icon = subject.icon
                  const isSelected = selectedSubject === subject.id
                  return (
                    <Card
                      key={subject.id}
                      className={cn(
                        "cursor-pointer transition-all duration-300 card-hover overflow-hidden",
                        isSelected
                          ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                          : "border-border/50 bg-card/50 hover:border-primary/50"
                      )}
                      onClick={() => setSelectedSubject(subject.id)}
                    >
                      <CardContent className="p-5">
                        <div className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br",
                          subject.color
                        )}>
                          <Icon className={cn("w-7 h-7", subject.iconColor)} />
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">{subject.name}</h3>
                        <p className="text-sm text-muted-foreground">{subject.description}</p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
                  Your Current Level
                </h1>
                <p className="text-muted-foreground mt-2">
                  How familiar are you with {subjects.find(s => s.id === selectedSubject)?.name}?
                </p>
              </div>
              <div className="space-y-4">
                {skillLevels.map((level) => {
                  const Icon = level.icon
                  const isSelected = selectedLevel === level.id
                  return (
                    <Card
                      key={level.id}
                      className={cn(
                        "cursor-pointer transition-all duration-300",
                        isSelected
                          ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                          : "border-border/50 bg-card/50 hover:border-primary/50"
                      )}
                      onClick={() => setSelectedLevel(level.id as "beginner" | "intermediate" | "advanced")}
                    >
                      <CardContent className="p-5 flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                          isSelected ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                        )}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{level.name}</h3>
                          <p className="text-sm text-muted-foreground">{level.description}</p>
                        </div>
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 transition-all",
                          isSelected ? "border-primary bg-primary" : "border-border"
                        )}>
                          {isSelected && (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
                  What&apos;s Your Goal?
                </h1>
                <p className="text-muted-foreground mt-2">
                  This helps us personalize your study plan
                </p>
              </div>
              <div className="space-y-4">
                {goals.map((goal) => {
                  const Icon = goal.icon
                  const isSelected = selectedGoal === goal.name
                  return (
                    <Card
                      key={goal.id}
                      className={cn(
                        "cursor-pointer transition-all duration-300",
                        isSelected
                          ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                          : "border-border/50 bg-card/50 hover:border-primary/50"
                      )}
                      onClick={() => setSelectedGoal(goal.name)}
                    >
                      <CardContent className="p-5 flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                          isSelected ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                        )}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{goal.name}</h3>
                          <p className="text-sm text-muted-foreground">{goal.description}</p>
                        </div>
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 transition-all",
                          isSelected ? "border-primary bg-primary" : "border-border"
                        )}>
                          {isSelected && (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 px-6 py-5 lg:px-12 bg-background/95 backdrop-blur-sm border-t border-border/50">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 text-base font-medium"
          >
            {step === 3 ? "Start Diagnostic Test" : "Continue"}
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
