"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useApp } from "@/lib/app-context"
import { SUBJECT_TOPICS } from "@/lib/questions"
import { topicBandFromAccuracy } from "@/lib/diagnostic-analysis"
import { 
  Trophy, 
  Flame, 
  Star, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Minus,
  Clock,
  BarChart3,
  ArrowRight,
  Zap,
  Target
} from "lucide-react"
import { cn } from "@/lib/utils"

export function Dashboard() {
  const { userProgress, setCurrentPage } = useApp()

  if (!userProgress) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
          <BarChart3 className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">No Data Yet</h2>
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          Complete a diagnostic test to see your dashboard with personalized insights.
        </p>
        <Button onClick={() => setCurrentPage("select")}>
          Get Started
        </Button>
      </div>
    )
  }

  const completedDays = userProgress.studyPlan.filter(d => d.completed).length
  const totalDays = userProgress.studyPlan.length
  const progressPercent = totalDays > 0 ? (completedDays / totalDays) * 100 : 0
  const lastTest = userProgress.performanceHistory[0]
  const lastTestPercent = lastTest ? Math.round((lastTest.score / lastTest.total) * 100) : 0

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Keep up the great work.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 bg-card rounded-xl border border-border/50">
          <Target className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">Studying:</span>
          <span className="text-sm font-semibold text-foreground">{userProgress.subject}</span>
        </div>
      </div>

      {/* Gamification Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GamificationCard
          icon={<Trophy className="w-6 h-6" />}
          label="Level"
          value={userProgress.level.toString()}
          subtext={`${userProgress.xp % 500}/500 to next`}
          color="text-amber-400"
          bgColor="bg-amber-400/10"
        />
        <GamificationCard
          icon={<Star className="w-6 h-6" />}
          label="Total XP"
          value={userProgress.xp.toString()}
          subtext="Experience points"
          color="text-primary"
          bgColor="bg-primary/10"
        />
        <GamificationCard
          icon={<Flame className="w-6 h-6" />}
          label="Streak"
          value={`${userProgress.streak}`}
          subtext="Days in a row"
          color="text-orange-500"
          bgColor="bg-orange-500/10"
        />
        <GamificationCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Confidence"
          value={`${userProgress.confidenceScore}%`}
          subtext="Based on tests"
          color="text-success"
          bgColor="bg-success/10"
        />
      </div>

      {/* Last Test Score & Progress */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Last Test Score */}
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center",
                lastTestPercent >= 70 ? "bg-success/10" : lastTestPercent >= 50 ? "bg-warning/10" : "bg-destructive/10"
              )}>
                <BarChart3 className={cn(
                  "w-7 h-7",
                  lastTestPercent >= 70 ? "text-success" : lastTestPercent >= 50 ? "text-warning" : "text-destructive"
                )} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Test Score</p>
                <p className="text-3xl font-bold text-foreground">{lastTestPercent}%</p>
              </div>
            </div>
            {lastTest && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{lastTest.score}/{lastTest.total} correct answers</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary hover:text-primary"
                  onClick={() => setCurrentPage("test")}
                >
                  Retake Test
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Study Progress */}
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Zap className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Study Plan Progress</p>
                  <p className="text-lg font-semibold text-foreground">
                    {completedDays} of {totalDays} days
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold text-primary">{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-2 mb-3" />
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary hover:text-primary w-full justify-center"
              onClick={() => setCurrentPage("study-plan")}
            >
              View Study Plan
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Practice & Readiness Status */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Practice Sessions */}
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Practice Sessions</p>
                  <p className="text-lg font-semibold text-foreground">
                    {userProgress.practiceSessions?.length || 0} completed
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2 mb-3">
              {userProgress.practiceSessions?.slice(0, 3).map((session: any, index: number) => (
                <div key={index} className="flex items-center justify-between text-sm p-2 bg-secondary/30 rounded-lg">
                  <span className="text-muted-foreground">{session.topic}</span>
                  <span className="font-medium">{Math.round((session.score / session.questions.length) * 100)}%</span>
                </div>
              ))}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary hover:text-primary w-full justify-center"
              onClick={() => setCurrentPage("practice")}
            >
              Practice More
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Topic Readiness */}
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-success/10 rounded-2xl flex items-center justify-center">
                  <Star className="w-7 h-7 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Topic Readiness</p>
                  <p className="text-lg font-semibold text-foreground">
                    {Object.values(userProgress.topicReadiness || {}).filter((r: any) => r.status === 'completed').length} completed
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2 mb-3">
              {(SUBJECT_TOPICS[userProgress.subject] || ['JOINs', 'Normalization', 'Transactions', 'Indexes']).slice(0, 3).map((topic) => {
                const readiness = userProgress.topicReadiness?.[topic]
                if (!readiness) return null
                return (
                  <div key={topic} className="flex items-center justify-between text-sm p-2 bg-secondary/30 rounded-lg">
                    <span className="text-muted-foreground">{topic}</span>
                    <span className={cn(
                      "font-medium",
                      readiness.status === 'completed' && "text-success",
                      readiness.status === 'needs-revision' && "text-warning",
                      readiness.status === 'in-progress' && "text-primary",
                      readiness.status === 'locked' && "text-muted-foreground"
                    )}>
                      {readiness.status === 'completed' ? '✓' : readiness.status === 'needs-revision' ? '!' : readiness.status === 'in-progress' ? '→' : '🔒'}
                    </span>
                  </div>
                )
              })}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary hover:text-primary w-full justify-center"
              onClick={() => setCurrentPage("readiness")}
            >
              Check Readiness
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Topic Accuracy */}
      {Object.keys(userProgress.topicAccuracy).length > 0 && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Topic Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(userProgress.topicAccuracy).map(([topic, accuracy]) => {
                const band = topicBandFromAccuracy(accuracy)
                return (
                  <div
                    key={topic}
                    className="p-4 bg-secondary/30 rounded-xl border border-border/30"
                  >
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <span className="text-sm font-medium text-foreground truncate">{topic}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={cn(
                            "text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded",
                            band === "strong" && "bg-success/15 text-success",
                            band === "moderate" && "bg-warning/15 text-warning",
                            band === "weak" && "bg-destructive/15 text-destructive"
                          )}
                        >
                          {band}
                        </span>
                        <span
                          className={cn(
                            "text-sm font-bold",
                            band === "strong" && "text-success",
                            band === "moderate" && "text-warning",
                            band === "weak" && "text-destructive"
                          )}
                        >
                          {Math.round(accuracy)}%
                        </span>
                      </div>
                    </div>
                    <Progress
                      value={accuracy}
                      className={cn(
                        "h-2",
                        band === "weak" && "[&>div]:bg-destructive",
                        band === "moderate" && "[&>div]:bg-warning",
                        band === "strong" && "[&>div]:bg-success"
                      )}
                    />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weak, Moderate, Strong — from latest diagnostic analysis */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center gap-3 pb-4">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-foreground">Weak</CardTitle>
              <p className="text-sm text-muted-foreground">&lt;50% on last test</p>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {userProgress.weakAreas.map((area, index) => {
                const accuracy = userProgress.topicAccuracy[area] ?? 0
                return (
                  <div
                    key={`${area}-${index}`}
                    className="flex items-center justify-between p-4 bg-destructive/5 rounded-xl border border-destructive/20"
                  >
                    <span className="text-foreground font-medium">{area}</span>
                    <span className="text-sm px-2 py-1 bg-destructive/10 text-destructive rounded-lg font-medium">
                      {Math.round(accuracy)}%
                    </span>
                  </div>
                )
              })}
              {userProgress.weakAreas.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
                  <p>No weak topics on the last run.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center gap-3 pb-4">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <Minus className="w-5 h-5 text-warning" />
            </div>
            <div>
              <CardTitle className="text-foreground">Moderate</CardTitle>
              <p className="text-sm text-muted-foreground">50–70% on last test</p>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {userProgress.moderateAreas.map((area, index) => {
                const accuracy = userProgress.topicAccuracy[area] ?? 0
                return (
                  <div
                    key={`${area}-${index}`}
                    className="flex items-center justify-between p-4 bg-warning/5 rounded-xl border border-warning/20"
                  >
                    <span className="text-foreground font-medium">{area}</span>
                    <span className="text-sm px-2 py-1 bg-warning/10 text-warning rounded-lg font-medium">
                      {Math.round(accuracy)}%
                    </span>
                  </div>
                )
              })}
              {userProgress.moderateAreas.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <Target className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p>No moderate band topics.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center gap-3 pb-4">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <CardTitle className="text-foreground">Strong</CardTitle>
              <p className="text-sm text-muted-foreground">&gt;70% on last test</p>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {userProgress.strongAreas.map((area, index) => {
                const accuracy = userProgress.topicAccuracy[area] ?? 0
                return (
                  <div
                    key={`${area}-${index}`}
                    className="flex items-center justify-between p-4 bg-success/5 rounded-xl border border-success/20"
                  >
                    <span className="text-foreground font-medium">{area}</span>
                    <span className="text-sm px-2 py-1 bg-success/10 text-success rounded-lg font-medium">
                      {Math.round(accuracy)}%
                    </span>
                  </div>
                )
              })}
              {userProgress.strongAreas.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <Target className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p>Keep practicing to build strengths!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="flex flex-row items-center gap-3 pb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-foreground">Recent Activity</CardTitle>
            <p className="text-sm text-muted-foreground">Your learning journey</p>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {userProgress.recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl border border-border/30"
              >
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground truncate">{activity.topic}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(activity.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
            {userProgress.recentActivity.length === 0 && (
              <p className="text-muted-foreground text-center py-6">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function GamificationCard({
  icon,
  label,
  value,
  subtext,
  color,
  bgColor
}: {
  icon: React.ReactNode
  label: string
  value: string
  subtext: string
  color: string
  bgColor: string
}) {
  return (
    <Card className="bg-card/50 border-border/50 card-hover">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", bgColor, color)}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{subtext}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
