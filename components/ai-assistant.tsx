"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useApp } from "@/lib/app-context"
import { SUBJECT_TOPICS } from "@/lib/questions"
import {
  Send,
  Bot,
  User,
  Brain,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
interface Message {
  role: "user" | "assistant"
  content: string
}

/* ─────────────────────────────────────────────────────────────
   SPEECH API HELPERS
   The Web Speech API (SpeechRecognition + SpeechSynthesis) is
   built into modern browsers — no external SDK needed for STT.
   For TTS we also use the browser SpeechSynthesis API.
───────────────────────────────────────────────────────────── */
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

/* ─────────────────────────────────────────────────────────────
   LOADING SKELETON
───────────────────────────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex gap-3 items-end justify-start">
      <div className="w-8 h-8 bg-primary/15 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
        <Bot className="w-4 h-4 text-primary" />
      </div>
      <div className="bg-muted/60 border border-border/40 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[200px]">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground mr-1">Thinking</span>
          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   MESSAGE BUBBLE
───────────────────────────────────────────────────────────── */
function MessageBubble({
  message,
  onSpeak,
  isSpeaking,
}: {
  message: Message
  onSpeak: (text: string) => void
  isSpeaking: boolean
}) {
  const isUser = message.role === "user"

  // Simple markdown-to-JSX renderer for bold, bullets, and code
  const renderContent = (content: string) => {
    const lines = content.split("\n")
    return lines.map((line, i) => {
      // Code blocks handled inline
      const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/)
      const rendered = parts.map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={j}>{part.slice(2, -2)}</strong>
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={j}
              className="bg-background/60 text-primary px-1.5 py-0.5 rounded text-xs font-mono"
            >
              {part.slice(1, -1)}
            </code>
          )
        }
        return part
      })
      return (
        <span key={i}>
          {rendered}
          {i < lines.length - 1 && <br />}
        </span>
      )
    })
  }

  return (
    <div className={cn("flex gap-2.5 items-end group", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border border-primary/10">
          <Bot className="w-4 h-4 text-primary" />
        </div>
      )}

      <div className="flex flex-col gap-1 max-w-[80%]">
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
            isUser
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-muted/60 border border-border/40 text-foreground rounded-bl-sm"
          )}
        >
          <p className="whitespace-pre-wrap break-words">{renderContent(message.content)}</p>
        </div>

        {/* TTS button for assistant messages */}
        {!isUser && (
          <button
            onClick={() => onSpeak(message.content)}
            className={cn(
              "self-start flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-all opacity-0 group-hover:opacity-100",
              isSpeaking
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            title={isSpeaking ? "Stop speaking" : "Listen to this message"}
          >
            {isSpeaking ? (
              <><VolumeX className="w-3 h-3" /> Stop</>
            ) : (
              <><Volume2 className="w-3 h-3" /> Listen</>
            )}
          </button>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
          <User className="w-4 h-4 text-primary-foreground" />
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   SUGGESTED CHIP
───────────────────────────────────────────────────────────── */
function SuggestedQuestion({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-xs bg-muted/60 hover:bg-muted border border-border/50 hover:border-primary/30 text-muted-foreground hover:text-foreground rounded-full px-3 py-1.5 transition-all duration-200 hover:shadow-sm"
    >
      <Sparkles className="w-3 h-3 text-primary/70" />
      {text}
    </button>
  )
}

/* ─────────────────────────────────────────────────────────────
   MAIN AI ASSISTANT COMPONENT
───────────────────────────────────────────────────────────── */
export function AIAssistant() {
  const { chatMessages, addChatMessage, userProgress } = useApp() as any

  // Local state for the input and UI
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null)
  const [micSupported, setMicSupported] = useState(false)

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  /* ── Scroll to bottom on new message ─────────────── */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages, isLoading, scrollToBottom])

  /* ── Check browser speech support ─────────────────── */
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition
      setMicSupported(!!SR)
      synthRef.current = window.speechSynthesis || null
    }
  }, [])

  /* ── Suggested questions based on user state ─────── */
  const getSuggestedQuestions = (): string[] => {
    if (!userProgress) {
      return [
        "Tell me about StudyPath AI",
        "How do I get started?",
        "What subjects can I learn?",
        "How does the study plan work?",
      ]
    }

    const questions: string[] = []
    const { weakAreas, strongAreas, confidenceScore, subject, performanceHistory } = userProgress

    if (weakAreas?.length > 0) {
      questions.push(`Explain ${weakAreas[0]} with examples`)
      questions.push(`How do I improve in ${weakAreas[0]}?`)
    }

    const lastTest = performanceHistory?.[0]
    if (lastTest) {
      const score = Math.round((lastTest.score / lastTest.total) * 100)
      if (score < 50) questions.push("Create a recovery study plan for me")
      else if (score < 70) questions.push("How can I reach 70%+ accuracy?")
      else questions.push("Give me advanced challenges")
    }

    const topics = SUBJECT_TOPICS[subject] || []
    if (topics.length > 0 && questions.length < 4) {
      questions.push(`What are the most important topics in ${subject}?`)
    }

    if (confidenceScore < 60) questions.push("How do I boost my confidence score?")
    if (strongAreas?.length > 0) questions.push(`What should I learn after ${strongAreas[0]}?`)

    // Fill to 4
    const fallbacks = [
      "Suggest a study schedule for me",
      "What are common exam mistakes?",
      "Explain database normalization",
      "How do JOINs work in SQL?",
    ]
    for (const fb of fallbacks) {
      if (questions.length >= 4) break
      questions.push(fb)
    }

    return questions.slice(0, 4)
  }

  /* ── Call Groq API via /api/chat ─────────────────── */
  const sendMessage = useCallback(
    async (messageText: string) => {
      const trimmed = messageText.trim()
      if (!trimmed || isLoading) return

      setError(null)
      setInput("")
      addChatMessage("user", trimmed)

      // Build message history for context (last 20 messages)
      const history: Message[] = chatMessages.slice(-20).map((m: Message) => ({
        role: m.role,
        content: m.content,
      }))
      history.push({ role: "user", content: trimmed })

      setIsLoading(true)

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history,
            userProgressContext: userProgress || null,
          }),
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => ({ error: "Unknown error" }))
          throw new Error(errData.error || `HTTP ${res.status}`)
        }

        const data = await res.json()
        const reply = data.message || "Sorry, I couldn't generate a response."
        addChatMessage("assistant", reply)
      } catch (err: any) {
        const msg = err?.message || "Something went wrong. Please try again."
        setError(msg)
        addChatMessage(
          "assistant",
          `⚠️ I encountered an error: ${msg}. Please try sending your message again.`
        )
      } finally {
        setIsLoading(false)
        setTimeout(() => textareaRef.current?.focus(), 100)
      }
    },
    [chatMessages, userProgress, isLoading, addChatMessage]
  )

  /* ── Keyboard submit ─────────────────────────────── */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  /* ── Speech to Text (STT) ─────────────────────────── */
  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return

    const recognition: any = new SR()
    recognitionRef.current = recognition
    recognition.lang = "en-IN" // Supports English, Hindi, Hinglish
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.continuous = false

    recognition.onstart = () => setIsListening(true)

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput((prev) => (prev ? prev + " " + transcript : transcript))
    }

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }, [])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  const toggleMic = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  /* ── Text to Speech (TTS) ─────────────────────────── */
  const speakMessage = useCallback((text: string, index: number) => {
    if (!synthRef.current) return

    // Stop if already speaking this message
    if (speakingIndex === index) {
      synthRef.current.cancel()
      setSpeakingIndex(null)
      return
    }

    // Stop any current speech
    synthRef.current.cancel()

    // Strip markdown characters for cleaner speech
    const cleanText = text
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/`/g, "")
      .replace(/#{1,6}\s/g, "")
      .replace(/\n+/g, ". ")

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = "en-IN"
    utterance.rate = 0.9
    utterance.pitch = 1.0
    utterance.volume = 1.0

    // Prefer a natural voice if available
    const voices = synthRef.current.getVoices()
    const preferred = voices.find(
      (v) =>
        v.lang.includes("en-IN") ||
        v.name.includes("Google") ||
        v.name.includes("Natural")
    )
    if (preferred) utterance.voice = preferred

    utterance.onstart = () => setSpeakingIndex(index)
    utterance.onend = () => setSpeakingIndex(null)
    utterance.onerror = () => setSpeakingIndex(null)

    synthRef.current.speak(utterance)
  }, [speakingIndex])

  /* ── Clear chat ──────────────────────────────────── */
  const clearChat = useCallback(() => {
    // Reset to initial welcome
    addChatMessage("assistant", "Hi! I'm your AI Study Assistant powered by Groq 🤖✨. I'm ready to help you with personalized study guidance, concept explanations, and smart study path suggestions. What would you like to learn today?")
  }, [addChatMessage])

  /* ── User progress stats bar ─────────────────────── */
  const StatsBar = () => {
    if (!userProgress) return null
    return (
      <div className="flex items-center gap-4 px-4 py-2.5 bg-gradient-to-r from-primary/5 via-primary/8 to-transparent rounded-xl border border-primary/10 mb-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-bold text-primary">{userProgress.confidenceScore}%</span>
          <span className="text-xs text-muted-foreground">Confidence</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-bold text-orange-500">{userProgress.weakAreas?.length || 0}</span>
          <span className="text-xs text-muted-foreground">Weak Areas</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-bold text-green-500">{userProgress.streak || 0}🔥</span>
          <span className="text-xs text-muted-foreground">Day Streak</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-bold text-foreground">Lv.{userProgress.level || 1}</span>
          <span className="text-xs text-muted-foreground">{userProgress.xp || 0} XP</span>
        </div>
        {userProgress.subject && (
          <>
            <div className="h-4 w-px bg-border" />
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {userProgress.subject}
            </span>
          </>
        )}
      </div>
    )
  }

  /* ── Empty state ─────────────────────────────────── */
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mb-4 shadow-inner border border-primary/10">
        <Brain className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Your AI Study Assistant is Ready!
      </h3>
      <p className="text-muted-foreground text-sm max-w-sm">
        Ask me anything — I speak <span className="font-medium text-foreground">English, Hindi, Hinglish & Marathi</span>.
        I'm powered by Groq AI and know your entire Study-Path-AI platform.
      </p>
      {!userProgress && (
        <p className="mt-3 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg border border-border/50">
          💡 Tip: Take the Diagnostic Test first so I can give you personalized advice!
        </p>
      )}
    </div>
  )

  /* ── Error banner ────────────────────────────────── */
  const ErrorBanner = () => {
    if (!error) return null
    return (
      <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 mb-3">
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{error}</span>
        <button
          onClick={() => setError(null)}
          className="ml-auto text-destructive/60 hover:text-destructive"
        >
          ✕
        </button>
      </div>
    )
  }

  const suggested = getSuggestedQuestions()
  const showSuggestions = chatMessages.length <= 1

  /* ── RENDER ──────────────────────────────────────── */
  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center border border-primary/10 shadow-sm">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-foreground tracking-tight">
              AI Study Assistant
            </h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Powered by Groq · Multilingual
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearChat}
          className="text-muted-foreground hover:text-foreground gap-1.5"
          title="Clear chat history"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-xs">Clear</span>
        </Button>
      </div>

      {/* Stats Bar */}
      <StatsBar />

      {/* Chat Container */}
      <Card className="flex-1 flex flex-col bg-card/40 border-border/50 min-h-0 overflow-hidden shadow-sm">
        <CardContent className="flex flex-col flex-1 p-4 min-h-0 gap-0">
          {/* Messages Scrollable Area */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scroll-smooth min-h-0"
            style={{ maxHeight: "calc(100vh - 380px)", minHeight: "300px" }}
          >
            {chatMessages.length <= 1 && chatMessages[0]?.role === "assistant" ? (
              <>
                {chatMessages.length === 1 && (
                  <MessageBubble
                    message={chatMessages[0]}
                    onSpeak={(text) => speakMessage(text, 0)}
                    isSpeaking={speakingIndex === 0}
                  />
                )}
                <EmptyState />
              </>
            ) : (
              chatMessages.map((msg: Message, i: number) => (
                <MessageBubble
                  key={i}
                  message={msg}
                  onSpeak={(text) => speakMessage(text, i)}
                  isSpeaking={speakingIndex === i}
                />
              ))
            )}

            {/* Typing Indicator */}
            {isLoading && <TypingIndicator />}

            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {showSuggestions && !isLoading && (
            <div className="pt-3 pb-1 border-t border-border/30 mt-3">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-primary" />
                Suggested questions:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {suggested.map((q, i) => (
                  <SuggestedQuestion
                    key={i}
                    text={q}
                    onClick={() => sendMessage(q)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Error Banner */}
          <ErrorBanner />

          {/* Input Area */}
          <div className="pt-3 border-t border-border/30 mt-2">
            <div className="flex gap-2 items-end">
              {/* Mic Button */}
              {micSupported && (
                <Button
                  variant={isListening ? "default" : "outline"}
                  size="icon"
                  onClick={toggleMic}
                  disabled={isLoading}
                  className={cn(
                    "flex-shrink-0 h-10 w-10 rounded-xl transition-all",
                    isListening && "animate-pulse bg-red-500 hover:bg-red-600 border-red-500 text-white shadow-lg shadow-red-500/30"
                  )}
                  title={isListening ? "Stop recording" : "Start voice input"}
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </Button>
              )}

              {/* Text Input */}
              <div className="relative flex-1">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isListening
                      ? "🎙️ Listening... speak now"
                      : "Ask anything — English, Hindi, Hinglish, Marathi..."
                  }
                  rows={1}
                  disabled={isLoading}
                  className={cn(
                    "resize-none min-h-[40px] max-h-[120px] pr-2 rounded-xl border-border/50 transition-all",
                    "focus:border-primary/50 focus:ring-1 focus:ring-primary/20",
                    isListening && "border-red-400/50 bg-red-50/5"
                  )}
                  style={{ height: "auto" }}
                  onInput={(e) => {
                    const el = e.currentTarget
                    el.style.height = "auto"
                    el.style.height = Math.min(el.scrollHeight, 120) + "px"
                  }}
                />
              </div>

              {/* Send Button */}
              <Button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="flex-shrink-0 h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 shadow-sm transition-all"
                title="Send message (Enter)"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Keyboard hint */}
            <p className="text-xs text-muted-foreground/60 mt-1.5 ml-1">
              Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Enter</kbd> to send ·{" "}
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Shift+Enter</kbd> for new line
              {micSupported && " · 🎙️ Mic for voice input"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
