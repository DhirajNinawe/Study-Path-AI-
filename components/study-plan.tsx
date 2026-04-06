"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useApp, GOAL_NAMES } from "@/lib/app-context"
import { SUBJECT_TOPICS } from "@/lib/questions"
import { 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  BookOpen, 
  Target, 
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Clock,
  Zap,
  BarChart3,
  Play,
  Star,
  Lock,
  Trophy,
  RotateCcw,
  Brain
} from "lucide-react"
import { cn } from "@/lib/utils"

export function StudyPlan() {
  const { 
    userProgress, 
    updateProgress, 
    setCurrentPage,
    regenerateStudyPlan,
    updateTopicPerformance,
    recalculateConfidenceScore,
    getTopicReadiness
  } = useApp() as any
  const [expandedDay, setExpandedDay] = useState<number | null>(null)

  if (!userProgress) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">No Study Plan Yet</h2>
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          Take a diagnostic test first to generate a personalized study plan based on your weak areas.
        </p>
        <Button onClick={() => setCurrentPage("test")}>
          Take Diagnostic Test
        </Button>
      </div>
    )
  }

  if (userProgress.studyPlan.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 bg-warning/10 rounded-2xl flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-warning" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">No Weak Areas Detected</h2>
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          Great job! You scored well on all topics. Retake the test or try a different subject.
        </p>
        <Button onClick={() => setCurrentPage("test")} variant="outline">
          Retake Test
        </Button>
      </div>
    )
  }

  const toggleExpand = (day: number) => {
    setExpandedDay(expandedDay === day ? null : day)
  }

  const toggleComplete = (dayIndex: number) => {
    const newPlan = [...userProgress.studyPlan]
    newPlan[dayIndex] = { ...newPlan[dayIndex], completed: !newPlan[dayIndex].completed }
    
    const xpGained = newPlan[dayIndex].completed ? 50 : -50
    const newXp = Math.max(0, userProgress.xp + xpGained)
    const newLevel = Math.floor(newXp / 500) + 1

    const newActivity = newPlan[dayIndex].completed 
      ? [
          { action: "Completed Study Day", date: new Date().toISOString(), topic: newPlan[dayIndex].title },
          ...userProgress.recentActivity.slice(0, 4)
        ]
      : userProgress.recentActivity

    updateProgress({ 
      studyPlan: newPlan,
      xp: newXp,
      level: newLevel,
      streak: newPlan[dayIndex].completed ? userProgress.streak + 1 : userProgress.streak,
      recentActivity: newActivity
    })
    
    // If this was a practice session, simulate topic performance improvement
    if (newPlan[dayIndex].completed && newPlan[dayIndex].title.includes("Practice")) {
      // Extract topic from title (simple approach)
      const topicMatch = newPlan[dayIndex].title.match(/([A-Za-z]+) Practice/)
      if (topicMatch && userProgress.topicAccuracy[topicMatch[1]] !== undefined) {
        const currentAccuracy = userProgress.topicAccuracy[topicMatch[1]] || 0
        // Simulate improvement after practice
        const newAccuracy = Math.min(100, currentAccuracy + Math.random() * 15 + 5)
        setTimeout(() => updateTopicPerformance(topicMatch[1], newAccuracy), 500)
      }
    }
  }
  
  const handlePracticeSession = (topic: string) => {
    // Simulate a practice session and update performance
    const currentAccuracy = userProgress.topicAccuracy[topic] || 0
    const practiceImprovement = Math.random() * 20 + 10 // 10-30% improvement
    const newAccuracy = Math.min(100, currentAccuracy + practiceImprovement)
    
    updateTopicPerformance(topic, newAccuracy)
    
    // Navigate to practice page (you could implement a dedicated practice component)
    setCurrentPage("revision")
  }
  
  const regeneratePlan = () => {
    regenerateStudyPlan()
    // Add activity for regeneration
    const newActivity = {
      action: "Regenerated Study Plan",
      date: new Date().toISOString(),
      topic: "Updated based on latest performance"
    }
    updateProgress({
      recentActivity: [newActivity, ...userProgress.recentActivity.slice(0, 4)]
    })
  }

  const completedCount = userProgress.studyPlan.filter((d: any) => d.completed).length
  const totalCount = userProgress.studyPlan.length
  const progressPercent = (completedCount / totalCount) * 100

  // Get last test score for display
  const lastTest = userProgress.performanceHistory[0]
  const lastTestPercent = lastTest ? Math.round((lastTest.score / lastTest.total) * 100) : 0

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
              Your Study Plan
            </h1>
          </div>
          <p className="text-muted-foreground">
            Personalized roadmap for <span className="text-foreground font-medium">{userProgress.subject}</span> based on your test performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-card rounded-xl border border-border/50">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">{GOAL_NAMES[userProgress.goal] || userProgress.goal}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={regeneratePlan}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Regenerate Plan
          </Button>
        </div>
      </div>

      {/* Test Score Summary */}
      {lastTest && (
        <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center",
                  lastTestPercent >= 70 ? "bg-success/10" : lastTestPercent >= 50 ? "bg-warning/10" : "bg-destructive/10"
                )}>
                  <BarChart3 className={cn(
                    "w-8 h-8",
                    lastTestPercent >= 70 ? "text-success" : lastTestPercent >= 50 ? "text-warning" : "text-destructive"
                  )} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Test Score</p>
                  <p className="text-3xl font-bold text-foreground">{lastTestPercent}%</p>
                  <p className="text-xs text-muted-foreground">{lastTest.score}/{lastTest.total} correct</p>
                </div>
              </div>
              
              <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-3 bg-secondary/50 rounded-xl">
                  <p className="text-xs text-muted-foreground mb-1">Weak</p>
                  <p className="text-lg font-semibold text-destructive">{userProgress.weakAreas.length}</p>
                </div>
                <div className="p-3 bg-secondary/50 rounded-xl">
                  <p className="text-xs text-muted-foreground mb-1">Moderate</p>
                  <p className="text-lg font-semibold text-warning">{userProgress.moderateAreas.length}</p>
                </div>
                <div className="p-3 bg-secondary/50 rounded-xl">
                  <p className="text-xs text-muted-foreground mb-1">Strong</p>
                  <p className="text-lg font-semibold text-success">{userProgress.strongAreas.length}</p>
                </div>
                <div className="p-3 bg-secondary/50 rounded-xl">
                  <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                  <p className="text-lg font-semibold text-primary">{userProgress.confidenceScore}%</p>
                </div>
                <div className="p-3 bg-secondary/50 rounded-xl col-span-2 md:col-span-1">
                  <p className="text-xs text-muted-foreground mb-1">Study Days</p>
                  <p className="text-lg font-semibold text-foreground">{totalCount} days</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Topic Status & Actions */}
      <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              Topic Status & Actions
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              View your progress and take action on each topic
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {(SUBJECT_TOPICS[userProgress.subject] || ['JOINs', 'Normalization', 'Transactions', 'Indexes']).map((topic: string) => {
                const accuracy = userProgress.topicAccuracy[topic] || 0
                const readiness = getTopicReadiness(topic)
                const isWeak = userProgress.weakAreas.includes(topic)
                const isLocked = readiness.status === 'locked'
                
                if (!isWeak && !isLocked && readiness.status === 'completed') return null
                
                return (
                  <div 
                    key={topic}
                    className={cn(
                      "p-4 border rounded-lg",
                      isWeak && "bg-destructive/5 border-destructive/20",
                      isLocked && "bg-muted/50 border-muted/30 opacity-60"
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-foreground">{topic}</span>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-xs px-2 py-1 rounded",
                            accuracy < 50 && "bg-destructive/10 text-destructive",
                            accuracy >= 50 && accuracy < 70 && "bg-warning/10 text-warning",
                            accuracy >= 70 && "bg-success/10 text-success"
                          )}>
                            {Math.round(accuracy)}% Accuracy
                          </span>
                          <div className={cn(
                            "flex items-center gap-1 text-xs px-2 py-1 rounded",
                            readiness.status === 'completed' && "bg-success/10 text-success",
                            readiness.status === 'needs-revision' && "bg-warning/10 text-warning",
                            readiness.status === 'in-progress' && "bg-primary/10 text-primary",
                            readiness.status === 'locked' && "bg-muted/50 text-muted-foreground"
                          )}>
                            {readiness.status === 'completed' && <Trophy className="w-3 h-3" />}
                            {readiness.status === 'needs-revision' && <RotateCcw className="w-3 h-3" />}
                            {readiness.status === 'in-progress' && <Brain className="w-3 h-3" />}
                            {readiness.status === 'locked' && <Lock className="w-3 h-3" />}
                            {readiness.status.replace('-', ' ')}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isLocked}
                        onClick={() => setCurrentPage('practice')}
                        className="flex-1"
                      >
                        <Target className="w-3 h-3 mr-1" />
                        Practice
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isLocked}
                        onClick={() => setCurrentPage('revision')}
                        className="flex-1"
                      >
                        <BookOpen className="w-3 h-3 mr-1" />
                        Revise
                      </Button>
                      <Button
                        size="sm"
                        disabled={isLocked || readiness.status === 'completed'}
                        onClick={() => setCurrentPage('readiness')}
                        className="flex-1"
                      >
                        <Star className="w-3 h-3 mr-1" />
                        {readiness.status === 'completed' ? 'Completed' : 'Test'}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

      {/* Progress Overview */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center">
                <Calendar className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-lg">Study Progress</h3>
                <p className="text-sm text-muted-foreground">
                  {completedCount} of {totalCount} days completed
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold gradient-text">
                {Math.round(progressPercent)}%
              </p>
              <p className="text-sm text-muted-foreground">Complete</p>
            </div>
          </div>
          
          {/* Visual Timeline */}
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              {userProgress.studyPlan.map((day: any, index: number) => (
                <div key={index} className="flex flex-col items-center relative z-10">
                  <button
                    onClick={() => toggleExpand(index)}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                      day.completed
                        ? "bg-gradient-to-br from-success to-success/80 text-success-foreground shadow-lg"
                        : index === completedCount
                          ? "bg-primary/20 text-primary border-2 border-primary animate-pulse"
                          : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    )}
                  >
                    {day.completed ? <Check className="w-5 h-5" /> : index + 1}
                  </button>
                </div>
              ))}
            </div>
            {/* Progress Line */}
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-border -z-0">
              <div
                className="h-full bg-gradient-to-r from-success to-primary transition-all duration-500"
                style={{ width: `${(completedCount / (totalCount - 1)) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Study Days Timeline */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Daily Schedule
        </h3>
        
        {userProgress?.studyPlan?.map((day: any, index: number) => {
          const isCurrentDay = index === completedCount
          const topicName = day.title.replace("Learn ", "").replace(" Basics", "").replace("Practice ", "")
          const accuracy = userProgress.topicAccuracy[topicName] || 0
          
          return (
            <Card
              key={index}
              className={cn(
                "bg-card/50 border-border/50 transition-all duration-300 overflow-hidden",
                day.completed && "border-success/30 bg-success/5",
                isCurrentDay && "border-primary/50 ring-1 ring-primary/20"
              )}
            >
              <CardContent className="p-0">
                {/* Day Header */}
                <div
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-secondary/30 transition-colors"
                  onClick={() => toggleExpand(index)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-bold transition-all",
                        day.completed
                          ? "bg-gradient-to-br from-success to-success/80 text-success-foreground"
                          : isCurrentDay
                            ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground"
                            : "bg-secondary text-muted-foreground"
                      )}
                    >
                      {day.completed ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <>
                          <span className="text-xs opacity-70">Day</span>
                          <span className="text-lg leading-none">{day.day}</span>
                        </>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{day.title}</h3>
                        {isCurrentDay && (
                          <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full flex items-center gap-1">
                            <Play className="w-3 h-3" />
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{day.description}</p>
                      {accuracy > 0 && !day.title.includes("Revision") && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">Current accuracy:</span>
                          <span className={cn(
                            "text-xs font-medium px-1.5 py-0.5 rounded",
                            accuracy >= 70 ? "bg-success/10 text-success" : 
                            accuracy >= 50 ? "bg-warning/10 text-warning" : 
                            "bg-destructive/10 text-destructive"
                          )}>
                            {Math.round(accuracy)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {day.completed && (
                      <span className="px-3 py-1.5 text-xs bg-success/10 text-success rounded-full font-medium flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Done
                      </span>
                    )}
                    {expandedDay === index ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedDay === index && (
                  <div className="px-5 pb-5 border-t border-border/50">
                    <div className="pt-5 space-y-5">
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-primary" />
                          Learning Objectives
                        </h4>
                        <ul className="space-y-2">
                          {day.details.map((detail: string, detailIndex: number) => (
                            <li
                              key={detailIndex}
                              className="flex items-start gap-3 text-sm text-muted-foreground p-3 bg-secondary/30 rounded-lg"
                            >
                              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs text-primary font-medium">{detailIndex + 1}</span>
                              </div>
                              <span className="text-foreground/80">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Estimated Time */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        Estimated time: 45-60 minutes
                      </div>
                      
                      <Button
                        variant={day.completed ? "outline" : "default"}
                        className={cn(
                          "w-full h-11",
                          day.completed 
                            ? "border-border hover:bg-secondary" 
                            : "bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 text-primary-foreground"
                        )}
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleComplete(index)
                        }}
                      >
                        {day.completed ? (
                          "Mark as Incomplete"
                        ) : (
                          <>
                            Mark as Complete
                            <span className="ml-2 text-xs opacity-75 flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              +50 XP
                            </span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Completion CTA */}
      {completedCount === totalCount && (
        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/30">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-success/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-success" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Study Plan Complete!</h3>
            <p className="text-muted-foreground mb-6">
              Great work! Take the test again to measure your improvement.
            </p>
            <Button 
              onClick={() => setCurrentPage("test")}
              className="bg-success hover:bg-success/90 text-success-foreground"
            >
              Retake Diagnostic Test
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
