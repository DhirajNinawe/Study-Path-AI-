/** One diagnostic MCQ — four options, zero-based correct index. */
export interface TestQuestion {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  topic: string
}
