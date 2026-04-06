"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useApp } from "@/lib/app-context"
import { getRandomQuestions, SUBJECT_TOPICS } from "@/lib/questions"
import { 
  Check, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Play, 
  Clock, 
  Target,
  Trophy,
  RefreshCw,
  BookOpen,
  Lightbulb
} from "lucide-react"
import { cn } from "@/lib/utils"

export function PracticeMode() {
  const { 
    userProgress, 
    currentPracticeSession,
    startPracticeSession,
    submitPracticeAnswer,
    completePracticeSession,
    setCurrentPage,
    getTopicReadiness,
    updateProgress
  } = useApp() as any

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set())
  const [currentIndex, setCurrentIndex] = useState(0)
  const [startTime, setStartTime] = useState<number>(Date.now())

  useEffect(() => {
    if (currentPracticeSession) {
      setSelectedAnswer(null)
      setShowResult(false)
      setStartTime(Date.now())
      setCurrentIndex(0)
    }
  }, [currentPracticeSession?.questions])

  if (!currentPracticeSession) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
              Practice Mode
            </h1>
          </div>
          <p className="text-muted-foreground">
            Practice specific topics to improve your understanding and build confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {(SUBJECT_TOPICS[userProgress?.subject] || ['JOINs', 'Normalization', 'Transactions', 'Indexes']).map((topic) => {
            // For testing, unlock all topics
            const readiness = userProgress?.topicReadiness[topic] || {
              status: 'in-progress', // Always unlocked for testing
              readinessScore: 0,
              lastTestDate: '',
              attempts: 0,
              unlockedTopics: []
            }
            const isLocked = false // Force unlock for testing
            const accuracy = userProgress?.topicAccuracy[topic] || 0
            
            return (
              <Card key={topic} className={cn(
                "bg-card/50 border-border/50 transition-all duration-300 hover:shadow-md",
                isLocked && "opacity-60"
              )}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-foreground">
                      {topic}
                    </CardTitle>
                    {isLocked ? (
                      <div className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
                        Locked
                      </div>
                    ) : (
                      <div className="px-2 py-1 bg-success/10 text-success text-xs rounded-md">
                        {accuracy}% Complete
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-foreground font-medium">{accuracy}%</span>
                    </div>
                    <Progress value={accuracy} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground mb-3">Ready to practice?</p>
                  </div>
                  
                  <Button
                    className="w-full"
                    disabled={isLocked}
                    onClick={() => startPracticeSession(topic, 'mixed', 5)}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Practice
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  if (!currentPracticeSession || !currentPracticeSession.questions || currentPracticeSession.questions.length === 0) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 mx-auto">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">No Practice Session</h2>
          <p className="text-muted-foreground mb-6">
            Select a topic and difficulty to start practicing.
          </p>
          <Button onClick={() => setCurrentPage('practice')}>
            Back to Practice Selection
          </Button>
        </div>
      </div>
    )
  }

  const currentQuestionIndex = currentIndex
  const currentQuestion = currentPracticeSession.questions[currentQuestionIndex]
  
  if (!currentQuestion) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-xl font-semibold mb-2 text-foreground">Loading Question...</h2>
        <Button onClick={() => setCurrentPage('study-plan')}>Return to Dashboard</Button>
      </div>
    )
  }

  const progress = ((currentQuestionIndex) / currentPracticeSession.questions.length) * 100

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !currentQuestion) return
    
    submitPracticeAnswer(currentQuestionIndex, selectedAnswer)
    setShowResult(true)
    setAnsweredQuestions(new Set([...answeredQuestions, currentQuestionIndex]))
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentPracticeSession.questions.length - 1) {
      setSelectedAnswer(null)
      setShowResult(false)
      setCurrentIndex(prev => prev + 1)
    } else {
      // Complete the session
      const completedSession = completePracticeSession()
      if (completedSession) {
        setCurrentPage('study-plan')
      }
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setSelectedAnswer(null)
      setShowResult(false)
      setCurrentIndex(prev => prev - 1)
    }
  }

  const isCorrect = currentQuestion ? selectedAnswer === currentQuestion.correctAnswer : false
  const timeSpent = Math.round((Date.now() - startTime) / 1000)

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
                {currentPracticeSession.topic} Practice
              </h1>
              <p className="text-muted-foreground">
                {currentPracticeSession.difficulty.charAt(0).toUpperCase() + currentPracticeSession.difficulty.slice(1)} • {currentPracticeSession.questions.length} questions
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage('study-plan')}
          >
            Exit Practice
          </Button>
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
              {currentQuestion?.question || 'Loading question...'}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {timeSpent}s
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
            {currentQuestion?.options?.map((option: string, index: number) => {
              const isSelected = selectedAnswer === index
              const isCorrectAnswer = currentQuestion ? index === currentQuestion.correctAnswer : false
              
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
              {currentQuestion?.explanation && (
                <div className="mt-3 p-3 bg-background/50 rounded border border-border/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-primary" />
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
                onClick={handlePreviousQuestion}
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
                  className="min-w-[100px]"
                >
                  Submit Answer
                </Button>
              ) : (
                <Button
                  onClick={handleNextQuestion}
                  className="min-w-[100px]"
                >
                  {currentQuestionIndex < currentPracticeSession.questions.length - 1 ? (
                    <>
                      Next Question
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Complete Practice
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
