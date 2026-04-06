"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useApp } from "@/lib/app-context"
import { SUBJECT_TOPICS } from "@/lib/questions"
import { 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  Lightbulb, 
  RotateCcw,
  Target,
  Clock,
  Trophy,
  Play,
  BarChart3,
  Brain,
  Star,
  Lock,
  Unlock
} from "lucide-react"
import { cn } from "@/lib/utils"

export function AdaptiveRevisionSystem() {
  const { 
    userProgress, 
    currentPracticeSession,
    startPracticeSession,
    submitPracticeAnswer,
    completePracticeSession,
    startReadinessTest,
    evaluateReadiness,
    getTopicReadiness,
    getRevisionContent,
    startRevisionSession,
    setCurrentPage
  } = useApp() as any

  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [startTime, setStartTime] = useState<number>(Date.now())


  if (!selectedTopic) {
    return (
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
              Adaptive Revision System
            </h1>
          </div>
          <p className="text-muted-foreground">
            Personalized revision content based on your performance. Each topic adapts to your current skill level.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(SUBJECT_TOPICS[userProgress?.subject] || ['JOINs', 'Normalization', 'Transactions', 'Indexes']).map((topic) => {
            const readiness = getTopicReadiness(topic)
            const accuracy = userProgress?.topicAccuracy[topic] || 0
            const isLocked = readiness.status === 'locked'
            
            return (
              <Card key={topic} className={cn(
                "bg-card/50 border-border/50 transition-all duration-300 hover:shadow-md",
                isLocked && "opacity-60"
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
                      ) : (
                        <div className={cn(
                          "flex items-center gap-1 px-2 py-1 text-xs rounded-md",
                          readiness.status === 'completed' && "bg-success/10 text-success",
                          readiness.status === 'needs-revision' && "bg-warning/10 text-warning",
                          readiness.status === 'in-progress' && "bg-primary/10 text-primary"
                        )}>
                          {readiness.status === 'completed' && <Trophy className="w-3 h-3" />}
                          {readiness.status === 'needs-revision' && <RotateCcw className="w-3 h-3" />}
                          {readiness.status === 'in-progress' && <Play className="w-3 h-3" />}
                          {readiness.status.replace('-', ' ')}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Accuracy</span>
                      <span className="text-foreground font-medium">{accuracy}%</span>
                    </div>
                    <Progress value={accuracy} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Readiness</span>
                      <span className="text-foreground font-medium">{readiness.readinessScore}%</span>
                    </div>
                    <Progress value={readiness.readinessScore} className="h-2" />
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Performance-based content description */}
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">
                        {accuracy < 50 && "Focus on Fundamentals"}
                        {accuracy >= 50 && accuracy < 70 && "Build on Basics"}
                        {accuracy >= 70 && "Challenge Yourself"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {accuracy < 50 && "Basic explanations and easy questions to build foundation."}
                      {accuracy >= 50 && accuracy < 70 && "Mixed difficulty questions with quick revision notes."}
                      {accuracy >= 70 && "Advanced concepts and challenging problems."}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      disabled={isLocked}
                      onClick={() => {
                        const content = startRevisionSession(topic)
                        setSelectedTopic(topic)
                        setCurrentIndex(0)
                        setSelectedAnswer(null)
                        setShowResult(false)
                        setStartTime(Date.now())
                      }}
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Start Revision
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isLocked}
                        onClick={() => setCurrentPage('practice')}
                      >
                        <Target className="w-3 h-3 mr-1" />
                        Practice
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isLocked}
                        onClick={() => {
                          startReadinessTest(topic)
                          setCurrentPage('practice')
                        }}
                      >
                        <Star className="w-3 h-3 mr-1" />
                        Test
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  const revisionContent = getRevisionContent(selectedTopic)
  const currentQuestion = revisionContent.questions[currentIndex]
  
  if (!currentQuestion) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-xl font-semibold mb-2 text-foreground">Loading Revision...</h2>
        <Button onClick={() => setSelectedTopic(null)}>Back to Topics</Button>
      </div>
    )
  }

  const progress = ((currentIndex + 1) / revisionContent.questions.length) * 100

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !currentQuestion) return
    
    submitPracticeAnswer(currentIndex, selectedAnswer)
    setShowResult(true)
  }

  const handleNextQuestion = () => {
    if (currentIndex < revisionContent.questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer(null)
      setShowResult(false)
      setStartTime(Date.now())
    } else {
      // Complete revision session
      const completedSession = completePracticeSession()
      if (completedSession) {
        // Evaluate readiness based on revision performance
        evaluateReadiness(selectedTopic, completedSession.score)
        setSelectedTopic(null)
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
              onClick={() => setSelectedTopic(null)}
            >
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
              Back to Topics
            </Button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
                {selectedTopic} Revision
              </h1>
              <p className="text-muted-foreground">
                Adaptive content based on your performance
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
              Question {currentIndex + 1} of {revisionContent.questions.length}
            </span>
            <span className="text-foreground font-medium">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Explanation Section */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg text-foreground">Key Concepts</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            {revisionContent.explanation.split('\n').map((line: string, index: number) => (
              <p key={index} className="text-sm text-muted-foreground leading-relaxed mb-2">
                {line}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-xl text-foreground leading-relaxed">
            {currentQuestion.question}
          </CardTitle>
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
                    <CheckCircle className="w-5 h-5 text-success" />
                  )}
                  {showResult && isSelected && !isCorrectAnswer && (
                    <XCircle className="w-5 h-5 text-destructive" />
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
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span className="font-medium text-success">Correct!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-destructive" />
                    <span className="font-medium text-destructive">Incorrect</span>
                  </>
                )}
              </div>
              {currentQuestion.explanation && (
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
                onClick={() => {
                  if (currentIndex > 0) {
                    setCurrentIndex(currentIndex - 1)
                    setSelectedAnswer(null)
                    setShowResult(false)
                  }
                }}
                disabled={currentIndex === 0}
              >
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
                  {currentIndex < revisionContent.questions.length - 1 ? (
                    <>
                      Next Question
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Complete Revision
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
