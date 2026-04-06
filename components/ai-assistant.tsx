"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useApp } from "@/lib/app-context"
import { SUBJECT_TOPICS, topicExplanations } from "@/lib/questions"
import { Send, Bot, User, Sparkles, Lightbulb, Brain } from "lucide-react"
import { cn } from "@/lib/utils"

export function AIAssistant() {
  const { chatMessages, addChatMessage, userProgress, setCurrentPage } = useApp() as any
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  // Generate dynamic suggested questions based on user state
  const getSuggestedQuestions = () => {
    if (!userProgress) {
      return [
        "Tell me about StudyPath AI",
        "How does the learning system work?",
        "What topics can I learn?"
      ]
    }

    const questions = []
    
    // Add weak topic questions
    if (userProgress.weakAreas.length > 0) {
      const weakestTopic = userProgress.weakAreas.reduce((prev: string, current: string) => {
        return (userProgress.topicAccuracy[prev] || 0) < (userProgress.topicAccuracy[current] || 0) ? prev : current
      })
      questions.push(`Help me understand ${weakestTopic}`)
      questions.push(`Explain ${weakestTopic} with examples`)
    }

    // Add performance-based questions
    const lastTest = userProgress.performanceHistory[0]
    if (lastTest) {
      const score = Math.round((lastTest.score / lastTest.total) * 100)
      if (score < 50) {
        questions.push("Give me a study plan to improve")
        questions.push("What should I focus on first?")
      } else if (score < 70) {
        questions.push("How can I reach the next level?")
        questions.push("Suggest practice questions")
      } else {
        questions.push("Give me advanced challenges")
        questions.push("What's next to master?")
      }
    }

    // Add readiness-based questions
    const incompleteTopics = (SUBJECT_TOPICS[userProgress.subject] || ['JOINs', 'Normalization', 'Transactions', 'Indexes']).filter((topic: string) => {
      const readiness = userProgress.topicReadiness[topic]
      return readiness && readiness.status !== 'completed'
    })
    
    if (incompleteTopics.length > 0) {
      questions.push(`Check my readiness for ${incompleteTopics[0]}`)
    }

    // Add confidence-based questions
    if (userProgress.confidenceScore < 60) {
      questions.push("Boost my confidence")
      questions.push("Quick tips for improvement")
    }

    // Add generic questions if needed
    if (questions.length < 4) {
      if (userProgress.subject === 'DBMS') {
        questions.push("Explain normalization simply")
        questions.push("Practice JOIN operations")
        questions.push("How do transactions work?")
      } else {
        const topics = SUBJECT_TOPICS[userProgress.subject] || []
        if (topics.length > 0) questions.push(`Explain ${topics[0]} simply`)
        if (topics.length > 1) questions.push(`Practice ${topics[1]} questions`)
        if (topics.length > 2) questions.push(`How does ${topics[2]} work?`)
      }
    }

    return questions.slice(0, 4)
  }

  // Generate dynamic AI responses based on user data
  const generateDynamicResponse = (userMessage: string): string => {
    if (!userProgress) {
      return "Welcome to StudyPath AI! 🎓 Take a diagnostic test first so I can provide personalized help based on your performance."
    }

    const lowerMessage = userMessage.toLowerCase()
    
    // Analyze user's current state
    const weakTopics = userProgress.weakAreas
    const strongTopics = userProgress.strongAreas
    const confidence = userProgress.confidenceScore
    const lastTest = userProgress.performanceHistory[0]
    const recentAccuracy = lastTest ? Math.round((lastTest.score / lastTest.total) * 100) : 0

    // Help with weak topics
    if (lowerMessage.includes("help") || lowerMessage.includes("understand") || lowerMessage.includes("explain")) {
      for (const topic of weakTopics) {
        if (lowerMessage.includes(topic.toLowerCase())) {
          const accuracy = userProgress.topicAccuracy[topic] || 0
          if (accuracy < 50) {
            return `I notice you're finding ${topic} challenging (only ${accuracy}% accuracy). Let's break it down simply:\n\n**${topic} Basics:**\n${getBasicExplanation(topic)}\n\n**Next Steps:**\n1. 📚 Start with the adaptive revision module\n2. 🎯 Practice with easy questions first\n3. 📊 Take the readiness test when ready\n\nWould you like me to guide you through practice?`
          } else if (accuracy < 70) {
            return `You're making progress with ${topic} (${accuracy}% accuracy)! Here's how to improve:\n\n**Intermediate Tips:**\n${getIntermediateExplanation(topic)}\n\n**Practice Strategy:**\n1. Try mixed difficulty questions\n2. Focus on common mistakes\n3. Review the explanations carefully\n\nReady for some targeted practice?`
          }
        }
      }
    }

    // Practice questions request
    if (lowerMessage.includes("practice") || lowerMessage.includes("questions")) {
      if (weakTopics.length > 0) {
        const targetTopic = weakTopics[0]
        return `Perfect! Let's focus on your weakest area: ${targetTopic}.\n\n**Recommended Practice:**\n• Start with easy questions to build confidence\n• Progress to medium difficulty\n• Review explanations for each answer\n\n**Your Current Stats:**\n• ${targetTopic}: ${userProgress.topicAccuracy[targetTopic] || 0}% accuracy\n• Confidence Score: ${confidence}%\n\nClick "Practice" in the navigation to begin!`
      } else {
        return `Great job! You don't have weak areas right now. Let's challenge you:\n\n**Advanced Practice Options:**\n• Try hard difficulty questions\n• Attempt readiness tests for all topics\n• Explore complex scenarios\n\n**Your Strengths:** ${strongTopics.join(', ')}\n\nReady for a challenge?`
      }
    }

    // Weak topics inquiry
    if (lowerMessage.includes("weak") || lowerMessage.includes("struggle") || lowerMessage.includes("improve")) {
      if (weakTopics.length === 0) {
        return `Excellent! 🎉 You don't have any weak areas currently. Your strong topics are: ${strongTopics.join(', ')}.\n\n**Keep the momentum:**\n• Take readiness tests to complete topics\n• Try advanced practice questions\n• Help others by explaining concepts\n\nConfidence Score: ${confidence}% - You're doing great!`
      } else {
        const topicDetails = weakTopics.map((topic: string) => 
          `• ${topic}: ${userProgress.topicAccuracy[topic] || 0}% accuracy`
        ).join('\n')
        
        return `Based on your recent performance, here are your focus areas:\n\n${topicDetails}\n\n**Personalized Improvement Plan:**\n1. 🎯 Start with ${weakTopics[0]} (your weakest)\n2. 📚 Use adaptive revision for tailored content\n3. 🔄 Practice consistently (15-20 min daily)\n4. 📊 Take readiness tests to track progress\n\nYour confidence score is ${confidence}%. With focused practice, you can improve by 20-30% this week!`
      }
    }

    // Performance analysis
    if (lowerMessage.includes("score") || lowerMessage.includes("performance") || lowerMessage.includes("progress")) {
      if (!lastTest) {
        return "Take a diagnostic test first to see your performance analysis. I'll provide detailed insights based on your results!"
      }
      
      const trend = userProgress.performanceHistory.length > 1 ? 
        (userProgress.performanceHistory[0].score - userProgress.performanceHistory[1].score) : 0
      
      return `📊 **Your Performance Analysis**\n\n**Recent Test:** ${lastTest.score}/${lastTest.total} (${recentAccuracy}%)\n**Trend:** ${trend > 0 ? '📈 Improving' : trend < 0 ? '📉 Needs attention' : '➡️ Stable'}\n**Confidence:** ${confidence}%\n\n**Key Insights:**\n• Strong areas: ${strongTopics.join(', ') || 'None yet'}\n• Focus areas: ${weakTopics.join(', ') || 'None - great job!'}\n• Study streak: ${userProgress.streak} days 🔥\n\n**Recommendation:** ${confidence > 70 ? 'Ready for advanced challenges!' : confidence > 50 ? 'Focus on weak areas with targeted practice' : 'Start with fundamentals and build gradually'}`
    }

    // Default intelligent response
    return `I'm here to help you learn SQL effectively! Based on your progress:\n\n**Your Status:**\n• Confidence: ${confidence}%\n• Weak areas: ${weakTopics.length || 0} topics\n• Study streak: ${userProgress.streak} days 🔥\n\n**How can I help you today?**\n• Ask me to explain any concept\n• Request practice questions\n• Check your weak areas\n• Get study tips\n• Analyze your performance\n\nWhat would you like to work on?`
  }

  const getBasicExplanation = (topic: string): string => {
    return (topicExplanations[topic] as any)?.basic || 'Start with the basics and build up gradually.'
  }

  const getIntermediateExplanation = (topic: string): string => {
    return (topicExplanations[topic] as any)?.intermediate || 'Focus on understanding patterns and exceptions.'
  }

  useEffect(() => {
    if (chatMessages.length > 0 && chatMessages[chatMessages.length - 1].role === "user") {
      setIsTyping(true)
      
      // Generate dynamic response based on user data
      const lastUserMessage = chatMessages[chatMessages.length - 1].content
      const response = generateDynamicResponse(lastUserMessage)
      
      // Simulate typing delay based on response length
      const typingDelay = Math.min(2000, Math.max(800, response.length * 10))
      
      const timer = setTimeout(() => {
        addChatMessage("assistant", response)
        setIsTyping(false)
      }, typingDelay)
      
      return () => clearTimeout(timer)
    }
  }, [chatMessages, userProgress])

  const handleSend = () => {
    if (!input.trim()) return
    addChatMessage("user", input)
    setInput("")
  }

  const handleSuggestedQuestion = (question: string) => {
    addChatMessage("user", question)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
            AI Learning Assistant
          </h1>
        </div>
        <p className="text-muted-foreground">
          Personalized help based on your progress and performance
        </p>
      </div>

      {/* User Status Card */}
      {userProgress && (
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{userProgress.confidenceScore}%</div>
                  <div className="text-xs text-muted-foreground">Confidence</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">{userProgress.weakAreas.length}</div>
                  <div className="text-xs text-muted-foreground">Weak Areas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">{userProgress.streak}</div>
                  <div className="text-xs text-muted-foreground">Day Streak</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Level {userProgress.level}</div>
                <div className="text-xs text-muted-foreground">{userProgress.xp} XP</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat Messages */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-6">
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
            {chatMessages.length === 0 && (
              <div className="text-center py-8">
                <Bot className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Welcome to your AI Assistant!
                </h3>
                <p className="text-muted-foreground mb-4">
                  I provide personalized help based on your learning progress.
                </p>
                {userProgress ? (
                  <p className="text-sm text-primary">
                    I can see you're at {userProgress.confidenceScore}% confidence. 
                    {userProgress.weakAreas.length > 0 && ` Let's work on ${userProgress.weakAreas[0]}!`}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Take a diagnostic test to get personalized recommendations.
                  </p>
                )}
              </div>
            )}
            
            {chatMessages.map((message: any, index: number) => (
              <div
                key={index}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg p-3",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-secondary/50 text-foreground"
                  )}
                >
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-secondary/50 rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {chatMessages.length === 0 && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-3">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {getSuggestedQuestions().map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestedQuestion(question)}
                    className="text-xs"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your learning..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
