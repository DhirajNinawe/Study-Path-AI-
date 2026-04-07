"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { X, Mic, MicOff, Phone } from "lucide-react"
import { cn } from "@/lib/utils"
import { useApp } from "@/lib/app-context"

/* ═══════════════════════════════════════════════════════════════
   LIVE VOICE MODE — J.A.R.V.I.S.-Style Speech-to-Speech

   Architecture:
   ┌──────────┐    ┌──────────┐    ┌──────────┐
   │ LISTENING │───▶│ THINKING │───▶│ SPEAKING │──┐
   └──────────┘    └──────────┘    └──────────┘  │
        ▲                                        │
        └────────────────────────────────────────┘
        audio.onended = () => startListening()

   Critical design decisions:
   - All mutable session state uses REFS (not useState) to avoid
     stale closures in useCallback/event handlers.
   - Audio is created fresh per response via `new Audio(url)` —
     matching the exact pattern requested by the user.
   - Every error path either auto-recovers or resets cleanly.
   - The component is 100% self-contained — no backend changes.
   ═══════════════════════════════════════════════════════════════ */

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

type VoiceState = "idle" | "listening" | "thinking" | "speaking" | "error"

interface LiveVoiceModeProps {
  onClose: () => void
}

export function LiveVoiceMode({ onClose }: LiveVoiceModeProps) {
  const { userProgress } = useApp() as any

  /* ── React state (for UI rendering only) ──────────────────── */
  const [voiceState, setVoiceState] = useState<VoiceState>("idle")
  const [transcript, setTranscript] = useState("")
  const [aiText, setAiText] = useState("")
  const [error, setError] = useState<string | null>(null)

  /* ── Refs (mutable, never stale in closures) ──────────────── */
  const sessionRef = useRef(false)          // is the loop active?
  const mountedRef = useRef(true)           // is component still mounted?
  const recognitionRef = useRef<any>(null)
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const historyRef = useRef<Array<{ role: "user" | "assistant"; content: string }>>([])

  /* ── Cleanup on unmount ───────────────────────────────────── */
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      sessionRef.current = false
      try { recognitionRef.current?.stop() } catch {}
      try { currentAudioRef.current?.pause() } catch {}
      try { abortRef.current?.abort() } catch {}
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
    }
  }, [])

  /* ════════════════════════════════════════════════════════════
     STEP 1 — LISTENING (Web Speech API)
     ════════════════════════════════════════════════════════════ */
  const startListening = useCallback(() => {
    // Guard: only proceed if session is active and component is mounted
    if (!sessionRef.current || !mountedRef.current) return

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      console.warn("[Voice] SpeechRecognition not supported")
      setError("Speech recognition not supported. Please use Chrome.")
      setVoiceState("error")
      return
    }

    // Stop any previous recognition instance safely
    try { recognitionRef.current?.stop() } catch {}

    let finalTranscript = ""

    try {
      const recognition = new SR()
      recognitionRef.current = recognition
      recognition.lang = "en-IN"
      recognition.interimResults = true
      recognition.continuous = true
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        if (!mountedRef.current) return
        setVoiceState("listening")
        setTranscript("")
        setAiText("")
        finalTranscript = ""
      }

      recognition.onresult = (event: any) => {
        if (!mountedRef.current) return

        let interim = ""
        let accumulated = ""
        for (let i = 0; i < event.results.length; i++) {
          const r = event.results[i]
          if (r.isFinal) {
            accumulated += r[0].transcript + " "
          } else {
            interim = r[0].transcript
          }
        }
        finalTranscript = accumulated.trim()
        setTranscript(finalTranscript + (interim ? " " + interim : ""))

        // Reset silence timer — after 1.8s of silence, process the speech
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
        silenceTimerRef.current = setTimeout(() => {
          const text = finalTranscript.trim()
          if (text.length > 0 && mountedRef.current && sessionRef.current) {
            try { recognition.stop() } catch {}
            processUserSpeech(text)
          }
        }, 1800)
      }

      recognition.onerror = (event: any) => {
        if (!mountedRef.current) return
        const err = event.error

        // These are normal/expected — silently retry
        if (err === "no-speech" || err === "aborted") {
          console.warn("[Voice] Non-critical STT error:", err, "— retrying")
          setTimeout(() => startListening(), 400)
          return
        }

        // "network" error — warn and retry
        if (err === "network") {
          console.warn("[Voice] Network error in STT — retrying in 1s")
          setTimeout(() => startListening(), 1000)
          return
        }

        // Fatal errors — show to user, auto-recover after 3s
        console.warn("[Voice] Recognition error:", err)
        setError(`Microphone error: ${err}`)
        setVoiceState("error")
        setTimeout(() => {
          if (mountedRef.current && sessionRef.current) {
            setError(null)
            startListening()
          }
        }, 3000)
      }

      recognition.onend = () => {
        // Intentionally empty — the loop is driven by our own logic,
        // not by the browser's auto-restart behavior.
      }

      recognition.start()
    } catch (err: any) {
      // Catch synchronous .start() exceptions (e.g., mic permission denied)
      console.warn("[Voice] Failed to start STT:", err?.message || err)
      setError("Could not access microphone")
      setVoiceState("error")
      setTimeout(() => {
        if (mountedRef.current && sessionRef.current) {
          setError(null)
          startListening()
        }
      }, 3000)
    }
  }, []) // No deps — uses only refs

  /* ════════════════════════════════════════════════════════════
     STEP 2 — THINKING (send transcript to Groq via /api/chat)
     ════════════════════════════════════════════════════════════ */
  const processUserSpeech = useCallback(async (userText: string) => {
    if (!mountedRef.current || !sessionRef.current) return

    setVoiceState("thinking")
    setTranscript(userText)

    // Add user message to conversation history
    historyRef.current = [
      ...historyRef.current,
      { role: "user", content: userText },
    ]

    try {
      abortRef.current = new AbortController()

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyRef.current.slice(-20),
          userProgressContext: userProgress || null,
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Unknown API error" }))
        throw new Error(errData.error || `HTTP ${res.status}`)
      }

      const data = await res.json()
      const reply: string = data.message || "Sorry, I couldn't generate a response."

      if (!mountedRef.current || !sessionRef.current) return

      // Add assistant reply to history
      historyRef.current = [
        ...historyRef.current,
        { role: "assistant", content: reply },
      ]
      setAiText(reply)

      // ─── STEP 3: Speak the reply ───
      await speakReply(reply)

    } catch (err: any) {
      if (err?.name === "AbortError") return
      console.warn("[Voice] Groq API error:", err?.message || err)
      if (mountedRef.current) {
        setError(err?.message || "AI response failed")
        setVoiceState("error")
        // Auto-recover: go back to listening after 2.5s
        setTimeout(() => {
          if (mountedRef.current && sessionRef.current) {
            setError(null)
            startListening()
          }
        }, 2500)
      }
    }
  }, [userProgress, startListening])

  /* ════════════════════════════════════════════════════════════
     STEP 3 — SPEAKING (ElevenLabs TTS via /api/tts)

     CRITICAL: Uses the exact pattern:
       const blob = await response.blob()
       const audioUrl = URL.createObjectURL(blob)
       const audio = new Audio(audioUrl)
       audio.onended = () => startListening()  // THE LOOP
       await audio.play()
     ════════════════════════════════════════════════════════════ */
  const speakReply = useCallback(async (text: string) => {
    if (!mountedRef.current || !sessionRef.current) return

    setVoiceState("speaking")

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        console.warn("[Voice] TTS API returned", response.status)
        if (mountedRef.current && sessionRef.current) {
          setError(`TTS failed: ${response.status}`)
          setVoiceState("error")
        }
        return
      }

      // ─── THE EXACT PLAYBACK PATTERN ───
      const blob = await response.blob()
      const audioUrl = URL.createObjectURL(blob)
      const audio = new Audio(audioUrl)

      // Store ref so we can stop it on exit
      currentAudioRef.current = audio

      // End this turn in idle mode; user must explicitly tap to speak again.
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl)
        currentAudioRef.current = null
        if (mountedRef.current && sessionRef.current) {
          setVoiceState("idle")
        }
      }

      audio.onerror = () => {
        console.warn("[Voice] Audio element playback error")
        URL.revokeObjectURL(audioUrl)
        currentAudioRef.current = null
        // Do not force idle here; idle reset is reserved for onended only.
        if (mountedRef.current && sessionRef.current) {
          setError("Audio playback error")
          setVoiceState("error")
        }
      }

      await audio.play()

    } catch (err: any) {
      console.warn("[Voice] TTS/playback failed:", err?.message || err)
      currentAudioRef.current = null
      // Do not force idle here; idle reset is reserved for onended only.
      if (mountedRef.current && sessionRef.current) {
        setError(err?.message || "TTS/playback failed")
        setVoiceState("error")
      }
    }
  }, [])

  /* ════════════════════════════════════════════════════════════
     SESSION CONTROL
     ════════════════════════════════════════════════════════════ */
  const startSession = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      setError("Your browser doesn't support voice input. Use Chrome or Edge.")
      setVoiceState("error")
      return
    }
    sessionRef.current = true
    setError(null)
    setAiText("")
    setTranscript("")
    historyRef.current = []
    startListening()
  }, [startListening])

  const endSession = useCallback(() => {
    sessionRef.current = false
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
    try { recognitionRef.current?.stop() } catch {}
    try {
      currentAudioRef.current?.pause()
      if (currentAudioRef.current) currentAudioRef.current.src = ""
      currentAudioRef.current = null
    } catch {}
    try { abortRef.current?.abort() } catch {}
    setVoiceState("idle")
    setTranscript("")
    setAiText("")
    setError(null)
  }, [])

  const handleClose = useCallback(() => {
    endSession()
    onClose()
  }, [endSession, onClose])

  /* ── Status labels ──────────────────────────────────────────── */
  const statusLabel: Record<VoiceState, string> = {
    idle: "Tap to Start",
    listening: "Listening…",
    thinking: "Thinking…",
    speaking: "Speaking…",
    error: error || "Error",
  }

  const statusSub: Record<VoiceState, string> = {
    idle: "Start a hands-free conversation with your AI tutor",
    listening: "Speak naturally — I'll respond when you pause",
    thinking: "Processing with Groq AI…",
    speaking: "Playing response via ElevenLabs",
    error: "Will auto-recover shortly",
  }

  /* ═══════════════════════════════════════════════════════════
     RENDER — fullscreen dark overlay with animated orb
     ═══════════════════════════════════════════════════════════ */
  return (
    <div className="voice-overlay">
      {/* Starfield background */}
      <div className="voice-particles" />

      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-2 h-2 rounded-full",
            sessionRef.current ? "bg-green-400 animate-pulse" : "bg-white/30"
          )} />
          <span className="text-sm font-medium text-white/70 tracking-widest uppercase">
            Live Voice Mode
          </span>
        </div>
        <button
          onClick={handleClose}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm backdrop-blur-sm"
        >
          <X className="w-4 h-4" />
          Exit
        </button>
      </div>

      {/* ── Center orb ──────────────────────────────────────── */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="flex flex-col items-center gap-8">
          {/* Orb + rings */}
          <div className="relative flex items-center justify-center" style={{ width: 260, height: 260 }}>
            {/* Outer ring 2 */}
            <div
              className={cn(
                "absolute rounded-full transition-all duration-700",
                voiceState === "listening" && "voice-ring-listening-2",
                voiceState === "thinking" && "voice-ring-thinking-2",
                voiceState === "speaking" && "voice-ring-speaking-2"
              )}
              style={{ width: 260, height: 260 }}
            />
            {/* Outer ring 1 */}
            <div
              className={cn(
                "absolute rounded-full transition-all duration-700",
                voiceState === "listening" && "voice-ring-listening",
                voiceState === "thinking" && "voice-ring-thinking",
                voiceState === "speaking" && "voice-ring-speaking"
              )}
              style={{ width: 220, height: 220 }}
            />

            {/* Main orb button */}
            <button
              onClick={() => {
                if (voiceState === "idle") {
                  if (sessionRef.current) {
                    setError(null)
                    startListening()
                  } else {
                    startSession()
                  }
                } else if (voiceState === "listening") {
                  // Force-send what we have
                  const text = transcript.trim()
                  if (text) {
                    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
                    try { recognitionRef.current?.stop() } catch {}
                    processUserSpeech(text)
                  }
                } else if (voiceState === "speaking") {
                  // Skip current response
                  try { currentAudioRef.current?.pause() } catch {}
                  if (currentAudioRef.current) currentAudioRef.current.src = ""
                  currentAudioRef.current = null
                  startListening()
                } else if (voiceState === "error") {
                  setError(null)
                  startSession()
                }
              }}
              className={cn(
                "voice-orb relative w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 cursor-pointer focus:outline-none",
                voiceState === "idle" && "voice-orb-idle",
                voiceState === "listening" && "voice-orb-listening",
                voiceState === "thinking" && "voice-orb-thinking",
                voiceState === "speaking" && "voice-orb-speaking",
                voiceState === "error" && "voice-orb-error"
              )}
              aria-label={statusLabel[voiceState]}
            >
              <div className="relative z-10">
                {voiceState === "idle" && (
                  <Mic className="w-10 h-10 text-white/80" />
                )}
                {voiceState === "listening" && (
                  <Mic className="w-10 h-10 text-white animate-pulse" />
                )}
                {voiceState === "thinking" && (
                  <div className="w-10 h-10 border-[3px] border-white/20 border-t-white rounded-full animate-spin" />
                )}
                {voiceState === "speaking" && (
                  <div className="flex items-end gap-[5px] h-10">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <span
                        key={i}
                        className="w-[5px] bg-white rounded-full animate-[voiceBar_0.8s_ease-in-out_infinite]"
                        style={{
                          height: [40, 70, 55, 85, 45][i] + "%",
                          animationDelay: `${i * 110}ms`,
                        }}
                      />
                    ))}
                  </div>
                )}
                {voiceState === "error" && (
                  <MicOff className="w-10 h-10 text-red-300" />
                )}
              </div>
            </button>
          </div>

          {/* Status text */}
          <div className="text-center space-y-2 select-none">
            <p className={cn(
              "text-xl font-semibold tracking-wide transition-colors duration-500",
              voiceState === "idle" && "text-white/80",
              voiceState === "listening" && "text-cyan-400",
              voiceState === "thinking" && "text-violet-400",
              voiceState === "speaking" && "text-emerald-400",
              voiceState === "error" && "text-red-400"
            )}>
              {statusLabel[voiceState]}
            </p>
            <p className="text-xs text-white/40 max-w-xs mx-auto">
              {statusSub[voiceState]}
            </p>
          </div>
        </div>
      </div>

      {/* ── Bottom panel — transcript & controls ────────────── */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-6 pb-8 pt-16 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        {/* Live transcript */}
        {transcript && (voiceState === "listening" || voiceState === "thinking") && (
          <div className="mb-4 text-center animate-in fade-in duration-300">
            <p className="text-[10px] text-cyan-400/60 uppercase tracking-[0.2em] mb-1.5">You said</p>
            <p className="text-base text-white/90 max-w-lg mx-auto leading-relaxed font-light">
              &ldquo;{transcript}&rdquo;
            </p>
          </div>
        )}

        {/* AI response preview */}
        {aiText && voiceState === "speaking" && (
          <div className="mb-4 text-center animate-in fade-in duration-300">
            <p className="text-[10px] text-emerald-400/60 uppercase tracking-[0.2em] mb-1.5">AI Response</p>
            <p className="text-sm text-white/60 max-w-lg mx-auto leading-relaxed font-light line-clamp-3">
              {aiText.length > 200 ? aiText.slice(0, 200) + "…" : aiText}
            </p>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="mb-4 text-center">
            <p className="text-xs text-red-400/80 max-w-sm mx-auto">{error}</p>
          </div>
        )}

        {/* End call / start hint */}
        <div className="flex justify-center">
          {sessionRef.current && voiceState !== "idle" ? (
            <button
              onClick={handleClose}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 hover:text-red-300 transition-all text-sm backdrop-blur-sm"
            >
              <Phone className="w-4 h-4 rotate-[135deg]" />
              End Conversation
            </button>
          ) : voiceState === "idle" ? (
            <p className="text-xs text-white/30 animate-pulse">
              Tap the orb to begin
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
