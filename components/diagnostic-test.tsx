"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useApp, type TestQuestion, type TestResult } from "@/lib/app-context"
import { CheckCircle, XCircle, ArrowRight, RotateCcw, Trophy, AlertTriangle, Target, BookOpen, Sparkles, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

export function DiagnosticTest() {
  const { userProgress, getQuestionsForSubject, completeDiagnosticAttempt, setCurrentPage } = useApp()
  const [questions, setQuestions] = useState<TestQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [showResults, setShowResults] = useState(false)
  const [isAnswerLocked, setIsAnswerLocked] = useState(false)
  const [completedResult, setCompletedResult] = useState<TestResult | null>(null)

  useEffect(() => {
    if (userProgress) {
      setQuestions(getQuestionsForSubject(userProgress.subject))
    }
  }, [userProgress, getQuestionsForSubject])

  if (!userProgress || questions.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">No Subject Selected</h2>
        <p className="text-muted-foreground text-center mb-6">
          Please select a subject first to take the diagnostic test.
        </p>
        <Button onClick={() => setCurrentPage("select")}>
          Select Subject
        </Button>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100

  const handleSelectAnswer = (index: number) => {
    if (isAnswerLocked) return
    setSelectedAnswer(index)
  }

  const handleConfirmAnswer = () => {
    if (selectedAnswer === null) return

    setIsAnswerLocked(true)
    setAnswers({ ...answers, [currentQuestion.id]: selectedAnswer })
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer(null)
      setIsAnswerLocked(false)
    } else {
      const result = completeDiagnosticAttempt(questions, answers)
      if (result) {
        setCompletedResult(result)
        setShowResults(true)
      }
    }
  }

  const handleRetake = () => {
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setAnswers({})
    setShowResults(false)
    setIsAnswerLocked(false)
    setCompletedResult(null)
  }

  if (showResults && completedResult) {
    const score = completedResult.score
    const percentage = completedResult.total > 0 ? Math.round((score / completedResult.total) * 100) : 0

    return (
      <div className="p-6 lg:p-8 space-y-8 max-w-3xl mx-auto">
        <div className="text-center space-y-6">
          <div
            className={cn(
              "w-24 h-24 mx-auto rounded-3xl flex items-center justify-center shadow-lg",
              percentage >= 70
                ? "bg-gradient-to-br from-success to-success/80"
                : percentage >= 50
                  ? "bg-gradient-to-br from-warning to-warning/80"
                  : "bg-gradient-to-br from-destructive to-destructive/80"
            )}
          >
            {percentage >= 70 ? (
              <Trophy className="w-12 h-12 text-success-foreground" />
            ) : percentage >= 50 ? (
              <Target className="w-12 h-12 text-warning-foreground" />
            ) : (
              <AlertTriangle className="w-12 h-12 text-destructive-foreground" />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Test Complete!</h1>
            <p className="text-5xl font-bold gradient-text mb-2">{percentage}%</p>
            <p className="text-muted-foreground">
              You scored <span className="font-semibold text-foreground">{score}</span> out of{" "}
              <span className="font-semibold text-foreground">{completedResult.total}</span> questions
            </p>
          </div>
        </div>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-foreground flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Performance by Topic
            </CardTitle>
            <p className="text-sm text-muted-foreground font-normal">
              {"Weak <50% · Moderate 50–70% · Strong >70%"}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {completedResult.topicPerformance.map((row) => {
              const accuracy = row.accuracyPercent
              return (
                <div key={row.topic} className="space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-foreground font-medium">{row.topic}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded capitalize",
                          row.band === "strong" && "bg-success/15 text-success",
                          row.band === "moderate" && "bg-warning/15 text-warning",
                          row.band === "weak" && "bg-destructive/15 text-destructive"
                        )}
                      >
                        {row.band}
                      </span>
                      <span
                        className={cn(
                          "text-sm font-bold px-2 py-0.5 rounded",
                          row.band === "strong" && "bg-success/10 text-success",
                          row.band === "moderate" && "bg-warning/10 text-warning",
                          row.band === "weak" && "bg-destructive/10 text-destructive"
                        )}
                      >
                        {row.correct}/{row.total} ({Math.round(accuracy)}%)
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={accuracy}
                    className={cn(
                      "h-2",
                      row.band === "weak" && "[&>div]:bg-destructive",
                      row.band === "moderate" && "[&>div]:bg-warning",
                      row.band === "strong" && "[&>div]:bg-success"
                    )}
                  />
                </div>
              )
            })}
          </CardContent>
        </Card>

        {userProgress.mistakeInsights && userProgress.mistakeInsights.length > 0 && (
          <Card className="bg-warning/5 border-warning/30">
            <CardHeader className="pb-4">
              <CardTitle className="text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-warning" />
                Performance insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {userProgress.mistakeInsights.map((insight, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 p-4 bg-background/50 rounded-xl border border-border/30"
                  >
                    <div className="w-7 h-7 bg-warning/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-warning">{i + 1}</span>
                    </div>
                    <span className="text-foreground/90">{insight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={handleRetake} variant="outline" className="flex-1 h-12">
            <RotateCcw className="w-4 h-4 mr-2" />
            Retake Test
          </Button>
          <Button
            onClick={() => setCurrentPage("study-plan")}
            className="flex-1 h-12 bg-gradient-to-r from-primary to-primary/80"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            View Study Plan
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-3xl mx-auto">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">Diagnostic Test</h1>
            <p className="text-muted-foreground mt-1">
              {userProgress.subject} · {questions.length} questions
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-card rounded-lg border border-border/50">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{questions.length - currentIndex} left</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="font-medium text-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
              {currentQuestion.topic}
            </span>
          </div>
          <CardTitle className="text-xl text-foreground leading-relaxed font-medium">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index
            const isCorrect = index === currentQuestion.correctAnswer
            const showCorrectness = isAnswerLocked

            return (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectAnswer(index)}
                disabled={isAnswerLocked}
                className={cn(
                  "w-full p-4 rounded-xl border text-left transition-all duration-200 flex items-center gap-4 group",
                  !showCorrectness && isSelected && "border-primary bg-primary/10 shadow-sm",
                  !showCorrectness &&
                    !isSelected &&
                    "border-border/50 bg-secondary/30 hover:border-primary/50 hover:bg-secondary/50",
                  showCorrectness && isCorrect && "border-success bg-success/10",
                  showCorrectness && isSelected && !isCorrect && "border-destructive bg-destructive/10",
                  isAnswerLocked && "cursor-default"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-medium transition-all",
                    !showCorrectness && isSelected && "bg-primary text-primary-foreground",
                    !showCorrectness &&
                      !isSelected &&
                      "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary",
                    showCorrectness && isCorrect && "bg-success text-success-foreground",
                    showCorrectness && isSelected && !isCorrect && "bg-destructive text-destructive-foreground"
                  )}
                >
                  {showCorrectness ? (
                    isCorrect ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : isSelected ? (
                      <XCircle className="w-5 h-5" />
                    ) : (
                      String.fromCharCode(65 + index)
                    )
                  ) : (
                    String.fromCharCode(65 + index)
                  )}
                </div>
                <span className={cn("text-foreground flex-1", showCorrectness && isCorrect && "font-medium")}>
                  {option}
                </span>
              </button>
            )
          })}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        {!isAnswerLocked ? (
          <Button
            onClick={handleConfirmAnswer}
            disabled={selectedAnswer === null}
            size="lg"
            className="h-12 px-8 bg-gradient-to-r from-primary to-primary/80"
          >
            Confirm Answer
          </Button>
        ) : (
          <Button onClick={handleNext} size="lg" className="h-12 px-8 bg-gradient-to-r from-primary to-primary/80">
            {currentIndex < questions.length - 1 ? (
              <>
                Next Question
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              "View Results"
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
