import type { TestQuestion } from "./diagnostic-types"

export type TopicBand = "weak" | "moderate" | "strong"

export interface TopicPerformanceRow {
  topic: string
  correct: number
  total: number
  accuracyPercent: number
  band: TopicBand
}

export interface DiagnosticAnalysis {
  score: number
  total: number
  topicAccuracy: Record<string, { correct: number; total: number }>
  topicPerformance: TopicPerformanceRow[]
  weakTopics: string[]
  moderateTopics: string[]
  strongTopics: string[]
  wrongTopics: string[]
}

/** weak: &lt;50%, moderate: 50–70%, strong: &gt;70% */
export function topicBandFromAccuracy(percent: number): TopicBand {
  if (percent < 50) return "weak"
  if (percent <= 70) return "moderate"
  return "strong"
}

export function analyzeDiagnosticAttempt(
  questions: TestQuestion[],
  answers: Record<number, number>
): DiagnosticAnalysis {
  const topicAccuracy: Record<string, { correct: number; total: number }> = {}
  const wrongTopics: string[] = []
  let score = 0

  for (const q of questions) {
    const userAnswer = answers[q.id]
    const isCorrect = userAnswer === q.correctAnswer

    if (!topicAccuracy[q.topic]) {
      topicAccuracy[q.topic] = { correct: 0, total: 0 }
    }
    topicAccuracy[q.topic].total += 1
    if (isCorrect) {
      topicAccuracy[q.topic].correct += 1
      score += 1
    } else if (!wrongTopics.includes(q.topic)) {
      wrongTopics.push(q.topic)
    }
  }

  const topicPerformance: TopicPerformanceRow[] = []
  const weakTopics: string[] = []
  const moderateTopics: string[] = []
  const strongTopics: string[] = []

  for (const [topic, { correct, total }] of Object.entries(topicAccuracy)) {
    const accuracyPercent = total > 0 ? (correct / total) * 100 : 0
    const band = topicBandFromAccuracy(accuracyPercent)
    topicPerformance.push({
      topic,
      correct,
      total,
      accuracyPercent,
      band,
    })
    if (band === "weak") weakTopics.push(topic)
    else if (band === "moderate") moderateTopics.push(topic)
    else strongTopics.push(topic)
  }

  topicPerformance.sort((a, b) => a.accuracyPercent - b.accuracyPercent)

  return {
    score,
    total: questions.length,
    topicAccuracy,
    topicPerformance,
    weakTopics,
    moderateTopics,
    strongTopics,
    wrongTopics,
  }
}

export function buildMistakeInsights(analysis: DiagnosticAnalysis): string[] {
  return analysis.weakTopics.map((topic) => {
    const row = analysis.topicPerformance.find((r) => r.topic === topic)
    const pct = row ? Math.round(row.accuracyPercent) : 0
    return `${topic} is weak (${pct}% on this test). Review fundamentals and drill targeted questions.`
  })
}
