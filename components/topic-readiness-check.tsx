"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useApp } from "@/lib/app-context"
import { SUBJECT_TOPICS } from "@/lib/questions"
import {
  Check,
  X,
  ArrowRight,
  ArrowLeft,
  Play,
  Clock,
  Target,
  Trophy,
  Star,
  Lock,
  Unlock,
  Brain,
  BookOpen,
  RotateCcw,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

export function TopicReadinessCheck() {
  const {
    userProgress,
    currentPracticeSession,
    updateProgress,
    startReadinessTest,
    submitPracticeAnswer,
    completePracticeSession,
    evaluateReadiness,
    getTopicReadiness,
    setCurrentPage
  } = useApp() as any

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [testResults, setTestResults] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)


  useEffect(() => {
    if (currentPracticeSession?.type === 'readiness') {
      setSelectedAnswer(null)
      setShowResult(false)
      setStartTime(Date.now())
      setTestResults([])
      setCurrentIndex(0)
    }
  }, [currentPracticeSession?.id]) // Use ID to trigger on new session

  if (!currentPracticeSession || currentPracticeSession.type !== 'readiness') {
    return (
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
              Topic Readiness Check
            </h1>
          </div>
          <p className="text-muted-foreground">
            Test your understanding of each topic. Score 70% or higher to mark topics as completed and unlock the next one.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {(SUBJECT_TOPICS[userProgress?.subject] || ['JOINs', 'Normalization', 'Transactions', 'Indexes']).map((topic) => {
            const readiness = getTopicReadiness(topic)
            const accuracy = userProgress?.topicAccuracy[topic] || 0
            const isLocked = readiness.status === 'locked'
            const canAttempt = !isLocked && readiness.status !== 'completed'

            return (
              <Card key={topic} className={cn(
                "bg-card/50 border-border/50 transition-all duration-300 hover:shadow-md",
                isLocked && "opacity-60",
                readiness.status === 'completed' && "bg-gradient-to-br from-success/5 to-success/10 border-success/20"
              )}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <CardTitle className="text-xl font-semibold text-foreground">
                      {topic}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {isLocked ? (
                        <div className="flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
                          <Lock className="w-3 h-3" />
                          Locked
                        </div>
                      ) : readiness.status === 'completed' ? (
                        <div className="flex items-center gap-1 px-2 py-1 bg-success/10 text-success text-xs rounded-md">
                          <Trophy className="w-3 h-3" />
                          Completed
                        </div>
                      ) : readiness.status === 'needs-revision' ? (
                        <div className="flex items-center gap-1 px-2 py-1 bg-warning/10 text-warning text-xs rounded-md">
                          <RotateCcw className="w-3 h-3" />
                          Needs Revision
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                          <Play className="w-3 h-3" />
                          In Progress
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Practice Accuracy</span>
                      <span className="text-foreground font-medium">{accuracy}%</span>
                    </div>
                    <Progress value={accuracy} className="h-2" />

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Readiness Score</span>
                      <span className="text-foreground font-medium">{readiness.readinessScore}%</span>
                    </div>
                    <Progress value={readiness.readinessScore} className="h-2" />

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Attempts</span>
                      <span className="text-foreground font-medium">{readiness.attempts}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Status message */}
                  <div className={cn(
                    "p-4 rounded-lg border",
                    readiness.status === 'completed' && "bg-success/10 border-success/30",
                    readiness.status === 'needs-revision' && "bg-warning/10 border-warning/30",
                    readiness.status === 'in-progress' && "bg-primary/10 border-primary/30",
                    isLocked && "bg-muted/50 border-muted/30"
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      {readiness.status === 'completed' && <CheckCircle className="w-4 h-4 text-success" />}
                      {readiness.status === 'needs-revision' && <AlertCircle className="w-4 h-4 text-warning" />}
                      {readiness.status === 'in-progress' && <Brain className="w-4 h-4 text-primary" />}
                      {isLocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                      <span className="text-sm font-medium text-foreground">
                        {readiness.status === 'completed' && "Excellent! Topic Mastered"}
                        {readiness.status === 'needs-revision' && "Keep practicing to improve"}
                        {readiness.status === 'in-progress' && "Ready to test your knowledge"}
                        {isLocked && "Complete previous topics to unlock"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {readiness.status === 'completed' && `You scored ${readiness.readinessScore}% on the readiness test. Next topics are now unlocked!`}
                      {readiness.status === 'needs-revision' && `Your score was ${readiness.readinessScore}%. Practice more and try again.`}
                      {readiness.status === 'in-progress' && "Take the readiness test to check your understanding."}
                      {isLocked && "Complete the readiness test for previous topics to unlock this one."}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-2">
                    {readiness.status === 'completed' ? (
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => startReadinessTest(topic)}
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Retake Test
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setCurrentPage('practice')}
                        >
                          <Target className="w-4 h-4 mr-2" />
                          Practice More
                        </Button>
                      </div>
                    ) : (
                      <Button
                        className="w-full"
                        disabled={!canAttempt}
                        onClick={() => startReadinessTest(topic)}
                      >
                        {canAttempt ? (
                          <>
                            <Star className="w-4 h-4 mr-2" />
                            Start Readiness Test
                          </>
                        ) : isLocked ? (
                          <>
                            <Lock className="w-4 h-4 mr-2" />
                            Locked
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Completed
                          </>
                        )}
                      </Button>
                    )}

                    {readiness.status === 'needs-revision' && (
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage('practice')}
                        >
                          <Target className="w-3 h-3 mr-1" />
                          Practice
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage('revision')}
                        >
                          <BookOpen className="w-3 h-3 mr-1" />
                          Revise
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  const currentQuestionIndex = currentIndex
  const currentQuestion = currentPracticeSession.questions[currentQuestionIndex]

  if (!currentQuestion) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-xl font-semibold mb-2 text-foreground">Processing Results...</h2>
        <Button onClick={() => setCurrentPage('readiness')}>Return to Topics</Button>
      </div>
    )
  }

  const progress = ((currentQuestionIndex) / currentPracticeSession.questions.length) * 100

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return

    submitPracticeAnswer(currentQuestionIndex, selectedAnswer)
    setShowResult(true)

    // Store result for final evaluation
    const result = {
      questionIndex: currentQuestionIndex,
      correct: selectedAnswer === currentQuestion.correctAnswer,
      selectedAnswer,
      correctAnswer: currentQuestion.correctAnswer
    }
    setTestResults([...testResults, result])
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentPracticeSession.questions.length - 1) {
      setSelectedAnswer(null)
      setShowResult(false)
      setCurrentIndex(prev => prev + 1)
    } else {
      // Complete the readiness test
      const completedSession = completePracticeSession()
      if (completedSession) {
        // Evaluate readiness
        const readinessResult = evaluateReadiness(currentPracticeSession.topic, completedSession.score)

        // Show results or redirect
        if (readinessResult.status === 'completed') {
          // Success - topic completed
          setCurrentPage('study-plan')
        } else {
          // Needs more work - return to readiness check
          setCurrentPage('readiness')
        }
      }
    }
  }

  const isCorrect = selectedAnswer === currentQuestion.correctAnswer
  const timeSpent = Math.round((Date.now() - startTime) / 1000)

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateProgress({ currentPracticeSession: null })}
            >
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
              Back to Topics
            </Button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
                {currentPracticeSession.topic} Readiness Test
              </h1>
              <p className="text-muted-foreground">
                Score 70% or higher to complete this topic
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Time</div>
            <div className="flex items-center gap-1 text-foreground">
              <Clock className="w-4 h-4" />
              {timeSpent}s
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Question {currentQuestionIndex + 1} of {currentPracticeSession.questions.length}
            </span>
            <span className="text-foreground font-medium">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Question Card */}
      <Card className="bg-card/50 border-border/50 mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl text-foreground leading-relaxed">
              {currentQuestion.question}
            </CardTitle>
            <div className="px-2 py-1 bg-secondary/50 rounded text-xs text-muted-foreground">
              {currentQuestion.difficulty}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Options */}
          <RadioGroup
            value={selectedAnswer?.toString()}
            onValueChange={(value) => setSelectedAnswer(parseInt(value))}
            disabled={showResult}
            className="space-y-3"
          >
            {currentQuestion.options.map((option: string, index: number) => {
              const isSelected = selectedAnswer === index
              const isCorrectAnswer = index === currentQuestion.correctAnswer

              return (
                <div
                  key={index}
                  className={cn(
                    "flex items-center space-x-3 p-4 rounded-lg border transition-all",
                    showResult && isCorrectAnswer && "bg-success/10 border-success/30",
                    showResult && isSelected && !isCorrectAnswer && "bg-destructive/10 border-destructive/30",
                    !showResult && isSelected && "bg-primary/10 border-primary/30",
                    !showResult && !isSelected && "bg-secondary/30 border-border/50 hover:bg-secondary/50"
                  )}
                >
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-1 cursor-pointer text-foreground"
                  >
                    {option}
                  </Label>
                  {showResult && isCorrectAnswer && (
                    <Check className="w-5 h-5 text-success" />
                  )}
                  {showResult && isSelected && !isCorrectAnswer && (
                    <X className="w-5 h-5 text-destructive" />
                  )}
                </div>
              )
            })}
          </RadioGroup>

          {/* Result and Explanation */}
          {showResult && (
            <div className={cn(
              "p-4 rounded-lg border",
              isCorrect ? "bg-success/10 border-success/30" : "bg-destructive/10 border-destructive/30"
            )}>
              <div className="flex items-center gap-2 mb-2">
                {isCorrect ? (
                  <>
                    <Check className="w-5 h-5 text-success" />
                    <span className="font-medium text-success">Correct!</span>
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5 text-destructive" />
                    <span className="font-medium text-destructive">Incorrect</span>
                  </>
                )}
              </div>
              {currentQuestion.explanation && (
                <div className="mt-3 p-3 bg-background/50 rounded border border-border/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Explanation</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (currentQuestionIndex > 0) {
                    setSelectedAnswer(null)
                    setShowResult(false)
                    setCurrentIndex(prev => prev - 1)
                  }
                }}
                disabled={currentQuestionIndex === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {!showResult ? (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                  className="min-w-[120px]"
                >
                  Submit Answer
                </Button>
              ) : (
                <Button
                  onClick={handleNextQuestion}
                  className="min-w-[120px]"
                >
                  {currentQuestionIndex < currentPracticeSession.questions.length - 1 ? (
                    <>
                      Next Question
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Complete Test
                      <Trophy className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
