"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { TestQuestion } from "./diagnostic-types"
import {
  analyzeDiagnosticAttempt,
  buildMistakeInsights,
  type TopicPerformanceRow,
} from "./diagnostic-analysis"
import { getDiagnosticQuestionsForSubject } from "./diagnostic-questions"
import type { PracticeQuestion } from "./questions"
import { 
  sqlQuestions, 
  topicExplanations, 
  getRandomQuestions, 
  getReadinessTestQuestions,
  SUBJECT_TOPICS
} from "./questions"

export type { TestQuestion } from "./diagnostic-types"
export type { TopicPerformanceRow } from "./diagnostic-analysis"
export type { PracticeQuestion } from "./questions"

export interface TestResult {
  score: number
  total: number
  topicAccuracy: Record<string, { correct: number; total: number }>
  topicPerformance: TopicPerformanceRow[]
  weakTopics: string[]
  moderateTopics: string[]
  strongTopics: string[]
  wrongTopics: string[]
  date: string
}

export interface PracticeSession {
  id: string
  topic: string
  questions: PracticeQuestion[]
  answers: Record<number, number>
  score: number
  startTime: string
  endTime: string
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed'
  type: 'practice' | 'readiness' | 'revision'
}

export interface TopicReadiness {
  topic: string
  status: 'locked' | 'in-progress' | 'needs-revision' | 'completed'
  readinessScore: number
  lastTestDate: string
  attempts: number
  unlockedTopics: string[]
}

export interface PracticeResult {
  questionId: string
  correct: boolean
  selectedAnswer: number
  timeSpent: number
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface UserProgress {
  subject: string
  skillLevel: "beginner" | "intermediate" | "advanced"
  goal: string
  confidenceScore: number
  xp: number
  level: number
  streak: number
  weakAreas: string[]
  moderateAreas: string[]
  strongAreas: string[]
  topicAccuracy: Record<string, number>
  recentActivity: { action: string; date: string; topic: string }[]
  studyPlan: { day: number; title: string; description: string; completed: boolean; details: string[] }[]
  performanceHistory: TestResult[]
  mistakeInsights: string[]
  // New practice and readiness fields
  practiceSessions: PracticeSession[]
  practiceResults: PracticeResult[]
  topicReadiness: Record<string, TopicReadiness>
  currentPracticeSession: PracticeSession | null
  unlockedTopics: string[]
}

export const GOAL_NAMES: Record<string, string> = {
  exam: "Exam Preparation",
  interview: "Interview Ready",
  learn: "Self Learning"
}

function calculateConfidenceScore(topicAccuracy: Record<string, number>): number {
  const accuracies = Object.values(topicAccuracy)
  
  if (accuracies.length === 0) return 50
  
  // Calculate average accuracy
  const averageAccuracy = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length
  
  // Calculate consistency (lower variance = higher confidence)
  const variance = accuracies.reduce((sum, acc) => {
    const diff = acc - averageAccuracy
    return sum + diff * diff
  }, 0) / accuracies.length
  
  const consistency = Math.max(0, 100 - Math.sqrt(variance))
  
  // Weighted combination: 70% average accuracy, 30% consistency
  return Math.round(averageAccuracy * 0.7 + consistency * 0.3)
}

function generateDynamicStudyPlan(
  weakTopics: string[], 
  moderateTopics: string[], 
  strongTopics: string[],
  topicAccuracy: Record<string, number>,
  subject?: string,
  goal?: string
): UserProgress["studyPlan"] {
  const plan: UserProgress["studyPlan"] = []
  let dayCounter = 1
  
  // If no diagnostic data yet, populate with all topics for the subject
  let effectiveWeak = [...weakTopics]
  let effectiveModerate = [...moderateTopics]
  let effectiveStrong = [...strongTopics]
  
  if (effectiveWeak.length === 0 && effectiveModerate.length === 0 && effectiveStrong.length === 0 && subject) {
    effectiveWeak = SUBJECT_TOPICS[subject] || []
  }
  
  // Sort weak topics by accuracy
  const sortedWeakTopics = [...effectiveWeak].sort((a, b) => 
    (topicAccuracy[a] || 0) - (topicAccuracy[b] || 0)
  )
  
  // Customization based on goal
  const isExamPrep = goal === 'exam'
  const isSelfLearning = goal === 'learn'
  
  // Generate study plan
  sortedWeakTopics.forEach((topic) => {
    // Learning phase
    plan.push({
      day: dayCounter++,
      title: `Learn ${topic} Basics`,
      description: `Grasp core concepts of ${topic} for practical use.`,
      completed: false,
      details: [
        `Study the fundamental definitions and syntax of ${topic}.`,
        `Watch a 15-minute conceptual video on ${topic}.`,
        `Solve 3 basic problems to reinforce understanding.`,
        `Summarize key takeaways in your own words.`
      ]
    })
    
    // Practice phase
    plan.push({
      day: dayCounter++,
      title: `${topic} Practice Session`,
      description: `Apply knowledge through targeted practice`,
      completed: false,
      details: [
        `Solve 10+ MCQ questions on ${topic}`,
        `Complete practical exercises`,
        `Review mistakes and understand corrections`,
        `Track improvement in ${topic}`
      ]
    })

    // Additional deep dive if Self Learning
    if (isSelfLearning) {
      plan.push({
        day: dayCounter++,
        title: `${topic} Advanced Exploration`,
        description: `Explore advanced use cases and performance optimization.`,
        completed: false,
        details: [
          `Read documentation on advanced properties of ${topic}.`,
          `Analyze real-world scenarios where ${topic} is used.`,
          `Discuss potential pitfalls and edge cases.`,
          `Implement a mini-project specifically using ${topic}.`
        ]
      })
    }
  })
  
  // Add moderate topics
  effectiveModerate.slice(0, 3).forEach((topic) => {
    plan.push({
      day: dayCounter++,
      title: `Strengthen ${topic} Understanding`,
      description: `Improve proficiency in ${topic}`,
      completed: false,
      details: [
        `Review ${topic} concepts`,
        `Practice 5-7 questions on ${topic}`,
        `Identify and fill knowledge gaps`,
        `Build confidence in ${topic}`
      ]
    })
  })
  
  return plan
}

function buildStudyPlanFromWeakAreas(weakTopics: string[]): UserProgress["studyPlan"] {
  // Legacy function - kept for backward compatibility
  return generateDynamicStudyPlan(weakTopics, [], [], {} as Record<string, number>)
}

function normalizeStoredProgress(raw: unknown): UserProgress | null {
  if (!raw || typeof raw !== "object") return null
  const p = raw as Record<string, unknown>
  if (typeof p.subject !== "string") return null

  const history = Array.isArray(p.performanceHistory)
    ? (p.performanceHistory as Partial<TestResult>[]).map((r) => ({
        score: r.score ?? 0,
        total: r.total ?? 0,
        topicAccuracy: r.topicAccuracy ?? {},
        topicPerformance: r.topicPerformance ?? [],
        weakTopics: r.weakTopics ?? [],
        moderateTopics: r.moderateTopics ?? [],
        strongTopics: r.strongTopics ?? [],
        wrongTopics: r.wrongTopics ?? [],
        date: typeof r.date === "string" ? r.date : new Date().toISOString(),
      }))
    : []

  return {
    ...(p as unknown as UserProgress),
    moderateAreas: Array.isArray(p.moderateAreas) ? (p.moderateAreas as string[]) : [],
    performanceHistory: history,
    // Initialize new fields with defaults if not present
    practiceSessions: Array.isArray(p.practiceSessions) ? (p.practiceSessions as any[]) : [],
    practiceResults: Array.isArray(p.practiceResults) ? (p.practiceResults as any[]) : [],
    topicReadiness: typeof p.topicReadiness === "object" ? (p.topicReadiness as Record<string, any>) : {},
    currentPracticeSession: null,
    unlockedTopics: (Array.isArray(p.unlockedTopics) && p.unlockedTopics.length > 0) ? (p.unlockedTopics as string[]) : (p.subject && SUBJECT_TOPICS[p.subject as string] ? SUBJECT_TOPICS[p.subject as string] : []) 
  }
}

interface AppContextType {
  currentPage: string
  setCurrentPage: (page: string) => void
  userProgress: UserProgress | null
  setUserProgress: (progress: UserProgress | null) => void
  updateProgress: (updates: Partial<UserProgress>) => void
  completeDiagnosticAttempt: (questions: TestQuestion[], answers: Record<number, number>) => TestResult | null
  generateStudyPlan: () => void
  regenerateStudyPlan: () => void
  updateTopicPerformance: (topic: string, accuracy: number) => void
  startRevisionSession: (topic: string) => PracticeSession
  recalculateConfidenceScore: () => void
  chatMessages: { role: "user" | "assistant"; content: string }[]
  addChatMessage: (role: "user" | "assistant", content: string) => void
  getQuestionsForSubject: (subject: string) => TestQuestion[]
  // New practice and readiness functions
  startPracticeSession: (topic: string, difficulty: 'easy' | 'medium' | 'hard' | 'mixed', count: number) => PracticeSession
  submitPracticeAnswer: (questionIndex: number, answer: number) => void
  completePracticeSession: () => PracticeSession | null
  startReadinessTest: (topic: string) => PracticeSession
  evaluateReadiness: (topic: string, score: number) => TopicReadiness
  getTopicReadiness: (topic: string) => TopicReadiness
  unlockTopic: (topic: string) => void
  getRevisionContent: (topic: string) => { explanation: string; questions: PracticeQuestion[] }
  currentPracticeSession: PracticeSession | null
  // Data management functions
  exportUserData: () => string
  importUserData: (jsonData: string) => boolean
  clearAllData: () => void
  isHydrated: boolean
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const mockResponses: Record<string, string> = {
  "explain join": "A JOIN in SQL is used to combine rows from two or more tables based on a related column. Think of it like linking two spreadsheets together using a common ID!\n\nThere are 4 main types:\n- INNER JOIN: Returns only matching rows\n- LEFT JOIN: All rows from left table + matches\n- RIGHT JOIN: All rows from right table + matches\n- FULL JOIN: All rows from both tables",
  "practice questions": "Here are some practice questions for you:\n\n1. Write a query to find all students who scored above 80%\n2. Create a table with proper constraints\n3. Explain the difference between WHERE and HAVING\n4. What is normalization and why is it important?\n\nWould you like me to explain any of these?",
  "weak topics": "Based on your recent performance, I can see areas that need improvement. Focus on understanding the core concepts first, then practice with questions. I recommend spending at least 30 minutes daily on each weak topic.",
  normalization: "Normalization is the process of organizing data to minimize redundancy:\n\n**1NF**: No repeating groups, atomic values\n**2NF**: No partial dependencies (for composite keys)\n**3NF**: No transitive dependencies\n**BCNF**: Every determinant is a candidate key\n\nStart with 1NF and work your way up!",
  transaction: "A transaction is a unit of work that must be completed entirely or not at all.\n\n**ACID Properties:**\n- **Atomicity**: All or nothing\n- **Consistency**: Valid state to valid state\n- **Isolation**: Transactions don't interfere\n- **Durability**: Changes are permanent\n\nThink of a bank transfer - both debit and credit must succeed!",
  index: "An index is like a book's index - it helps find data faster!\n\n**Types:**\n- **Clustered**: Sorts actual data rows\n- **Non-clustered**: Separate structure pointing to data\n- **Hash**: For equality searches\n- **B-tree**: For range queries\n\nUse indexes on frequently searched columns, but don't over-index!",
  default: "I'm here to help you with your studies! You can ask me to:\n- Explain concepts in simple terms\n- Give you practice questions\n- Help identify your weak areas\n- Create a study schedule\n\nWhat would you like to know?",
}

const LOCAL_STORAGE_KEY = "studypath_progress"
const CHAT_STORAGE_KEY = "studypath_chat"
const PAGE_STORAGE_KEY = "studypath_page"

// Comprehensive persistence functions
const saveToLocalStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error(`Failed to save ${key}:`, e)
  }
}

const loadFromLocalStorage = (key: string) => {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : null
  } catch (e) {
    console.error(`Failed to load ${key}:`, e)
    return null
  }
}

const clearAllAppData = () => {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY)
    localStorage.removeItem(CHAT_STORAGE_KEY)
    localStorage.removeItem(PAGE_STORAGE_KEY)
  } catch (e) {
    console.error("Failed to clear app data:", e)
  }
}

// Navigation state management
const createNavigationTransition = (fromPage: string, toPage: string, callback?: () => void) => {
  // Save current page before transition
  saveToLocalStorage(PAGE_STORAGE_KEY, toPage)
  callback?.()
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPageState] = useState("landing")
  const [userProgress, setUserProgressState] = useState<UserProgress | null>(null)
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your AI study assistant. How can I help you today? You can ask me about any topic you're struggling with, request practice questions, or ask for study tips!",
    },
  ])
  const [isHydrated, setIsHydrated] = useState(false)

  const setCurrentPage = useCallback((page: string) => {
    createNavigationTransition(currentPage, page, () => {
      setCurrentPageState(page)
    })
  }, [currentPage])

  const setUserProgress = useCallback((progress: UserProgress | null) => {
    setUserProgressState(progress)
    if (progress === null) {
      clearAllAppData()
    }
  }, [])

  const updateProgress = useCallback((updates: Partial<UserProgress>) => {
    console.log('updateProgress called with:', updates)
    setUserProgressState(current => {
      console.log('Current userProgress before update:', current)
      if (!current) {
        console.log('No current userProgress, returning null')
        return current
      }
      const updated = { ...current, ...updates }
      console.log('Updated userProgress:', updated)
      return updated
    })
  }, [])

  const addChatMessage = useCallback((role: "user" | "assistant", content: string) => {
    setChatMessages(prev => [...prev, { role, content }])
  }, [])

  useEffect(() => {
    // Load all persisted data
    const savedProgress = loadFromLocalStorage(LOCAL_STORAGE_KEY)
    const savedChat = loadFromLocalStorage(CHAT_STORAGE_KEY)
    const savedPage = loadFromLocalStorage(PAGE_STORAGE_KEY)
    
    if (savedProgress) {
      try {
        const normalized = normalizeStoredProgress(savedProgress)
        if (normalized) {
          setUserProgressState(normalized)
          setCurrentPage(savedPage || "dashboard")
        }
      } catch (e) {
        console.error("Failed to normalize saved progress")
      }
    }
    
    if (savedChat && Array.isArray(savedChat)) {
      setChatMessages(savedChat)
    }
    
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated) {
      // Save user progress
      if (userProgress) {
        saveToLocalStorage(LOCAL_STORAGE_KEY, userProgress)
      }
      
      // Save current page
      saveToLocalStorage(PAGE_STORAGE_KEY, currentPage)
    }
  }, [userProgress, currentPage, isHydrated])
  
  useEffect(() => {
    if (isHydrated) {
      // Save chat messages
      saveToLocalStorage(CHAT_STORAGE_KEY, chatMessages)
    }
  }, [chatMessages, isHydrated])

  const completeDiagnosticAttempt = useCallback(
    (questions: TestQuestion[], answers: Record<number, number>): TestResult | null => {
      if (!userProgress) return null

      const analysis = analyzeDiagnosticAttempt(questions, answers)
      const testResult: TestResult = {
        score: analysis.score,
        total: analysis.total,
        topicAccuracy: analysis.topicAccuracy,
        topicPerformance: analysis.topicPerformance,
        weakTopics: analysis.weakTopics,
        moderateTopics: analysis.moderateTopics,
        strongTopics: analysis.strongTopics,
        wrongTopics: analysis.wrongTopics,
        date: new Date().toISOString(),
      }

      setUserProgressState((prev) => {
        if (!prev) return prev

        const percentage = analysis.total > 0 ? (analysis.score / analysis.total) * 100 : 0
        const newTopicAccuracy = { ...prev.topicAccuracy }
        for (const row of analysis.topicPerformance) {
          newTopicAccuracy[row.topic] = row.accuracyPercent
        }

        // Calculate new confidence score using the enhanced algorithm
        const newConfidence = calculateConfidenceScore(newTopicAccuracy)
        const xpGained = Math.round(
          analysis.score * 15 + (percentage >= 70 ? 50 : percentage >= 50 ? 25 : 10)
        )
        const newXp = prev.xp + xpGained
        const newLevel = Math.floor(newXp / 500) + 1
        
        // Generate dynamic study plan based on performance
        const studyPlan = generateDynamicStudyPlan(
          analysis.weakTopics,
          analysis.moderateTopics,
          analysis.strongTopics,
          newTopicAccuracy,
          prev.subject,
          prev.goal
        )

        return {
          ...prev,
          confidenceScore: newConfidence,
          xp: newXp,
          level: newLevel,
          streak: prev.streak + 1,
          weakAreas: [...new Set(analysis.weakTopics)],
          moderateAreas: [...new Set(analysis.moderateTopics)],
          strongAreas: [...new Set(analysis.strongTopics)],
          topicAccuracy: newTopicAccuracy,
          performanceHistory: [testResult, ...prev.performanceHistory],
          recentActivity: [
            {
              action: "Completed Diagnostic Test",
              date: new Date().toISOString(),
              topic: `Score: ${analysis.score}/${analysis.total} (${Math.round(percentage)}%)`,
            },
            ...prev.recentActivity.slice(0, 4),
          ],
          mistakeInsights: [...new Set(buildMistakeInsights(analysis))],
          studyPlan,
        }
      })

      return testResult
    },
    [userProgress]
  )

  const generateStudyPlan = () => {
    if (!userProgress) return
    const plan = generateDynamicStudyPlan(
      userProgress.weakAreas,
      userProgress.moderateAreas,
      userProgress.strongAreas,
      userProgress.topicAccuracy,
      userProgress.subject,
      userProgress.goal
    )
    updateProgress({ studyPlan: plan })
  }

  const regenerateStudyPlan = () => {
    if (!userProgress) return
    
    // Recalculate areas based on recent performance
    const recentPerformance = userProgress.performanceHistory[0]
    if (recentPerformance) {
      const updatedProgress = {
        ...userProgress,
        weakAreas: recentPerformance.weakTopics,
        moderateAreas: recentPerformance.moderateTopics,
        strongAreas: recentPerformance.strongTopics,
      }
      
      const plan = generateDynamicStudyPlan(
        updatedProgress.weakAreas,
        updatedProgress.moderateAreas,
        updatedProgress.strongAreas,
        updatedProgress.topicAccuracy,
        updatedProgress.subject,
        updatedProgress.goal
      )
      
      updateProgress({ 
        studyPlan: plan,
        weakAreas: updatedProgress.weakAreas,
        moderateAreas: updatedProgress.moderateAreas,
        strongAreas: updatedProgress.strongAreas
      })
    } else {
      generateStudyPlan()
    }
  }

  const updateTopicPerformance = (topic: string, accuracy: number) => {
    if (!userProgress) return
    
    const newTopicAccuracy = { ...userProgress.topicAccuracy, [topic]: accuracy }
    const newConfidence = calculateConfidenceScore(newTopicAccuracy)
    
    // Update recent activity
    const newActivity = {
      action: "Practice Session",
      date: new Date().toISOString(),
      topic: `${topic}: ${accuracy}% accuracy`
    }
    
    updateProgress({
      topicAccuracy: newTopicAccuracy,
      confidenceScore: newConfidence,
      recentActivity: [newActivity, ...userProgress.recentActivity.slice(0, 4)]
    })
    
    // Automatically regenerate study plan if significant change
    const oldAccuracy = userProgress.topicAccuracy[topic] || 0
    if (Math.abs(accuracy - oldAccuracy) > 10) {
      setTimeout(() => regenerateStudyPlan(), 100)
    }
  }

  const recalculateConfidenceScore = () => {
    if (!userProgress) return
    const newConfidence = calculateConfidenceScore(userProgress.topicAccuracy)
    updateProgress({ confidenceScore: newConfidence })
  }

  const getQuestionsForSubject = useCallback((subject: string) => getDiagnosticQuestionsForSubject(subject), [])

  // New practice and readiness functions
  const initializeTopicReadiness = (topic: string): TopicReadiness => {
    const isUnlocked = userProgress?.unlockedTopics.includes(topic) || false
    return {
      topic,
      status: isUnlocked ? 'in-progress' : 'locked',
      readinessScore: 0,
      lastTestDate: '',
      attempts: 0,
      unlockedTopics: []
    }
  }

  const startPracticeSession = (topic: string, difficulty: 'easy' | 'medium' | 'hard' | 'mixed', count: number): PracticeSession => {
    console.log('=== startPracticeSession called ===')
    console.log('Parameters:', { topic, difficulty, count })
    
    const questions = getRandomQuestions(topic, count, difficulty)
    console.log('Questions from getRandomQuestions:', questions)
    
    if (questions.length === 0) {
      console.error('No questions found for topic:', topic, 'difficulty:', difficulty)
      return null as any
    }
    
    const session: PracticeSession = {
      id: `practice_${Date.now()}`,
      topic,
      questions,
      answers: {},
      score: 0,
      startTime: new Date().toISOString(),
      endTime: '',
      difficulty,
      type: 'practice'
    }
    
    console.log('Created session:', session)
    console.log('Calling updateProgress with currentPracticeSession:', session)
    updateProgress({ currentPracticeSession: session })
    console.log('updateProgress called')
    
    return session
  }

  const submitPracticeAnswer = (questionIndex: number, answer: number) => {
    if (!userProgress?.currentPracticeSession) return
    
    const session = { ...userProgress.currentPracticeSession }
    session.answers[questionIndex] = answer
    
    updateProgress({ currentPracticeSession: session })
  }

  const completePracticeSession = (): PracticeSession | null => {
    if (!userProgress?.currentPracticeSession) return null
    
    const session = { ...userProgress.currentPracticeSession }
    session.endTime = new Date().toISOString()
    
    // Calculate score
    let correctCount = 0
    const results: PracticeResult[] = []
    
    session.questions.forEach((question, index) => {
      const userAnswer = session.answers[index]
      const isCorrect = userAnswer === question.correctAnswer
      if (isCorrect) correctCount++
      
      results.push({
        questionId: question.id,
        correct: isCorrect,
        selectedAnswer: userAnswer,
        timeSpent: 0, // Could be tracked with timestamps
        topic: question.topic,
        difficulty: question.difficulty
      })
    })
    
    session.score = Math.round((correctCount / session.questions.length) * 100)
    
    // Update progress
    const newPracticeSessions = [...(userProgress?.practiceSessions || []), session]
    const newPracticeResults = [...(userProgress?.practiceResults || []), ...results]
    
    // Update topic accuracy
    const topicAccuracy = { ...userProgress.topicAccuracy }
    const currentAccuracy = topicAccuracy[session.topic] || 50
    const newAccuracy = Math.round((currentAccuracy * 0.7) + (session.score * 0.3))
    topicAccuracy[session.topic] = newAccuracy
    
    // Add activity
    const newActivity = {
      action: `Completed ${session.type} session`,
      date: new Date().toISOString(),
      topic: `${session.topic}: ${session.score}%`
    }
    
    updateProgress({
      practiceSessions: newPracticeSessions,
      practiceResults: newPracticeResults,
      topicAccuracy,
      currentPracticeSession: null,
      recentActivity: [newActivity, ...userProgress.recentActivity.slice(0, 4)],
      confidenceScore: calculateConfidenceScore(topicAccuracy)
    })
    
    // Trigger study plan regeneration if significant improvement
    if (session.score - currentAccuracy > 15) {
      setTimeout(() => regenerateStudyPlan(), 1000)
    }
    
    return session
  }

  const startReadinessTest = (topic: string): PracticeSession => {
    const questions = getReadinessTestQuestions(userProgress?.subject || 'DBMS', topic)
    const session: PracticeSession = {
      id: `readiness_${Date.now()}`,
      topic,
      questions,
      answers: {},
      score: 0,
      startTime: new Date().toISOString(),
      endTime: '',
      difficulty: 'mixed',
      type: 'readiness'
    }
    
    updateProgress({ currentPracticeSession: session })
    return session
  }

  const evaluateReadiness = (topic: string, score: number): TopicReadiness => {
    const currentReadiness = userProgress?.topicReadiness?.[topic] || initializeTopicReadiness(topic)
    const newReadiness: TopicReadiness = {
      ...currentReadiness,
      readinessScore: score,
      lastTestDate: new Date().toISOString(),
      attempts: currentReadiness.attempts + 1,
      status: score >= 70 ? 'completed' : score >= 50 ? 'needs-revision' : 'in-progress'
    }
    
    // Unlock next topic if completed
    if (score >= 70 && userProgress) {
      const currentSubjectTopics = SUBJECT_TOPICS[userProgress.subject] || ['JOINs', 'Normalization', 'Transactions', 'Indexes']
      const currentIndex = currentSubjectTopics.indexOf(topic)
      if (currentIndex !== -1 && currentIndex < currentSubjectTopics.length - 1) {
        const nextTopic = currentSubjectTopics[currentIndex + 1]
        newReadiness.unlockedTopics.push(nextTopic)
        
        const updatedUnlockedTopics = [...(userProgress?.unlockedTopics || []), nextTopic]
        updateProgress({ unlockedTopics: updatedUnlockedTopics })
      }
    }
    
    const updatedTopicReadiness = {
      ...userProgress?.topicReadiness,
      [topic]: newReadiness
    }
    
    updateProgress({ topicReadiness: updatedTopicReadiness })
    return newReadiness
  }

  const getTopicReadiness = (topic: string): TopicReadiness => {
    if (!userProgress || !userProgress.topicReadiness) return initializeTopicReadiness(topic)
    return userProgress.topicReadiness[topic] || initializeTopicReadiness(topic)
  }

  const unlockTopic = (topic: string) => {
    if (!userProgress) return
    
    const updatedUnlockedTopics = [...(userProgress?.unlockedTopics || []), topic]
    const updatedReadiness = {
      ...(userProgress?.topicReadiness || {}),
      [topic]: {
        ...(userProgress?.topicReadiness?.[topic] || {}),
        status: 'in-progress' as const
      }
    }
    
    updateProgress({
      unlockedTopics: updatedUnlockedTopics,
      topicReadiness: updatedReadiness
    })
  }

  const getRevisionContent = (topic: string) => {
    const accuracy = userProgress?.topicAccuracy[topic] || 0
    const { topicExplanations } = require('./questions')
    
    let explanation = ''
    let difficulty: 'easy' | 'medium' | 'hard' = 'easy'
    
    if (accuracy < 50) {
      explanation = topicExplanations[topic]?.basic || 'Basic explanation not available'
      difficulty = 'easy'
    } else if (accuracy < 70) {
      explanation = topicExplanations[topic]?.intermediate || 'Intermediate explanation not available'
      difficulty = 'medium'
    } else {
      explanation = topicExplanations[topic]?.advanced || 'Advanced explanation not available'
      difficulty = 'hard'
    }
    
    const questions = getRandomQuestions(topic, 5, difficulty)
    
    return { explanation, questions }
  }
  
  const startRevisionSession = (topic: string): PracticeSession => {
    const { explanation, questions } = getRevisionContent(topic)
    const session: PracticeSession = {
      id: `revision_${Date.now()}`,
      topic,
      questions,
      answers: {},
      score: 0,
      startTime: new Date().toISOString(),
      endTime: '',
      difficulty: 'mixed',
      type: 'revision'
    }
    
    updateProgress({ currentPracticeSession: session })
    return session
  }
  
  // Data export/import functions for backup
  const exportUserData = () => {
    const data = {
      userProgress,
      chatMessages,
      currentPage,
      exportDate: new Date().toISOString(),
      version: "1.0"
    }
    return JSON.stringify(data, null, 2)
  }
  
  const importUserData = (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData)
      
      if (data.userProgress) {
        const normalized = normalizeStoredProgress(data.userProgress)
        if (normalized) {
          setUserProgressState(normalized)
        }
      }
      
      if (data.chatMessages && Array.isArray(data.chatMessages)) {
        setChatMessages(data.chatMessages)
      }
      
      if (data.currentPage) {
        setCurrentPage(data.currentPage)
      }
      
      return true
    } catch (e) {
      console.error("Failed to import user data:", e)
      return false
    }
  }
  
  const clearAllData = () => {
    clearAllAppData()
    setUserProgressState(null)
    setChatMessages([{
      role: "assistant",
      content: "Hi! I'm your AI study assistant. How can I help you today? You can ask me about any topic you're struggling with, request practice questions, or ask for study tips!"
    }])
    setCurrentPage("landing")
  }

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        userProgress,
        setUserProgress,
        updateProgress,
        completeDiagnosticAttempt,
        generateStudyPlan,
        regenerateStudyPlan,
        updateTopicPerformance,
        recalculateConfidenceScore,
        chatMessages,
        addChatMessage,
        getQuestionsForSubject,
        // New practice and readiness functions
        startPracticeSession,
        submitPracticeAnswer,
        completePracticeSession,
        startReadinessTest,
        evaluateReadiness,
        getTopicReadiness,
        unlockTopic,
        getRevisionContent,
        startRevisionSession,
        currentPracticeSession: userProgress?.currentPracticeSession || null,
        // Data management functions
        exportUserData,
        importUserData,
        clearAllData,
        isHydrated,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within AppProvider")
  }
  return context
}
