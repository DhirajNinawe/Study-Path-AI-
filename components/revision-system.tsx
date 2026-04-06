"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useApp } from "@/lib/app-context"
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
  BarChart3
} from "lucide-react"
import { cn } from "@/lib/utils"

interface RevisionQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

const topicRevisionContent: Record<string, { concept: string; questions: RevisionQuestion[] }> = {
  "Normalization": {
    concept: "Normalization is the process of organizing data in a database to reduce redundancy and improve data integrity.\n\n**Key Normal Forms:**\n- **1NF (First Normal Form)**: Eliminate repeating groups; each cell contains a single value\n- **2NF (Second Normal Form)**: Must be in 1NF + no partial dependencies on composite primary keys\n- **3NF (Third Normal Form)**: Must be in 2NF + no transitive dependencies\n- **BCNF (Boyce-Codd Normal Form)**: Every determinant must be a candidate key\n\n**Why Normalize?**\n1. Reduces data redundancy\n2. Improves data consistency\n3. Makes updates easier\n4. Saves storage space",
    questions: [
      { question: "A table has columns: StudentID, StudentName, CourseID, CourseName, Grade. StudentID+CourseID is the primary key. Which normal form violation exists?", options: ["1NF violation", "2NF violation - CourseName depends only on CourseID", "3NF violation", "No violation"], correctAnswer: 1, explanation: "CourseName depends only on CourseID (part of the composite key), not the full key. This is a partial dependency, violating 2NF." },
      { question: "Which statement best describes 3NF?", options: ["No repeating groups", "No partial dependencies", "No transitive dependencies", "All attributes depend on candidate keys"], correctAnswer: 2, explanation: "3NF eliminates transitive dependencies - where a non-key attribute depends on another non-key attribute." },
      { question: "What is denormalization?", options: ["Breaking 1NF", "Intentionally adding redundancy for performance", "Removing primary keys", "Deleting tables"], correctAnswer: 1, explanation: "Denormalization is the intentional introduction of redundancy to improve read performance, often used in data warehousing." },
      { question: "A table stores: EmployeeID, DeptID, DeptName, DeptManager. What dependency causes normalization issues?", options: ["EmployeeID → DeptID", "DeptID → DeptName, DeptManager", "DeptName → DeptManager", "None"], correctAnswer: 1, explanation: "DeptName and DeptManager depend on DeptID, not the primary key. This transitive dependency should be moved to a separate Departments table." },
      { question: "Which normal form requires atomic values in each cell?", options: ["1NF", "2NF", "3NF", "BCNF"], correctAnswer: 0, explanation: "1NF (First Normal Form) requires that each cell contains only atomic (indivisible) values - no repeating groups or arrays." }
    ]
  },
  "JOIN Operations": {
    concept: "JOIN operations combine rows from two or more tables based on related columns.\n\n**Types of JOINs:**\n- **INNER JOIN**: Returns rows that have matching values in both tables\n- **LEFT (OUTER) JOIN**: Returns all rows from the left table, and matched rows from the right\n- **RIGHT (OUTER) JOIN**: Returns all rows from the right table, and matched rows from the left\n- **FULL (OUTER) JOIN**: Returns all rows when there's a match in either table\n- **CROSS JOIN**: Returns Cartesian product (all combinations)\n- **SELF JOIN**: Joins a table with itself\n\n**Key Tips:**\n1. Always specify the join condition (ON clause)\n2. Use table aliases for readability\n3. Consider NULL handling with outer joins",
    questions: [
      { question: "Which JOIN returns all employees even if they have no department?", options: ["INNER JOIN", "LEFT JOIN (Employee LEFT JOIN Department)", "RIGHT JOIN (Employee RIGHT JOIN Department)", "CROSS JOIN"], correctAnswer: 1, explanation: "LEFT JOIN returns all rows from the left table (Employee), regardless of whether there's a matching department." },
      { question: "What does INNER JOIN return?", options: ["All rows from both tables", "Only rows with matches in both tables", "All rows from left table", "Cartesian product"], correctAnswer: 1, explanation: "INNER JOIN returns only the rows where there is a match in both tables based on the join condition." },
      { question: "How many rows does CROSS JOIN return if Table A has 5 rows and Table B has 3 rows?", options: ["8 rows", "5 rows", "15 rows", "3 rows"], correctAnswer: 2, explanation: "CROSS JOIN returns the Cartesian product: 5 × 3 = 15 rows (every combination of rows)." },
      { question: "Which clause specifies the join condition?", options: ["WHERE", "ON", "HAVING", "GROUP BY"], correctAnswer: 1, explanation: "The ON clause specifies the condition for joining tables. WHERE can also be used but ON is the standard for joins." },
      { question: "What is a SELF JOIN used for?", options: ["Joining with system tables", "Joining a table with itself", "Joining without conditions", "Joining all databases"], correctAnswer: 1, explanation: "A SELF JOIN joins a table with itself, useful for hierarchical data like employee-manager relationships." }
    ]
  },
  "Transactions": {
    concept: "A transaction is a sequence of operations performed as a single logical unit of work.\n\n**ACID Properties:**\n- **Atomicity**: All operations complete or none do (all-or-nothing)\n- **Consistency**: Database moves from one valid state to another\n- **Isolation**: Concurrent transactions don't interfere with each other\n- **Durability**: Committed changes are permanent, surviving system failures\n\n**Transaction States:**\n1. Active - Being executed\n2. Partially Committed - After final operation\n3. Committed - Successfully completed\n4. Failed - Cannot proceed\n5. Aborted - Rolled back\n\n**Isolation Levels:**\n- Read Uncommitted (lowest)\n- Read Committed\n- Repeatable Read\n- Serializable (highest)",
    questions: [
      { question: "Which ACID property ensures a transaction is 'all or nothing'?", options: ["Atomicity", "Consistency", "Isolation", "Durability"], correctAnswer: 0, explanation: "Atomicity ensures that either all operations in a transaction complete successfully, or none of them do." },
      { question: "What problem does the Isolation property prevent?", options: ["Data loss", "Interference between concurrent transactions", "Hardware failure", "SQL syntax errors"], correctAnswer: 1, explanation: "Isolation ensures that concurrent transactions execute as if they were running one after another, preventing interference." },
      { question: "After a power failure, committed transactions are still saved. Which property is this?", options: ["Atomicity", "Consistency", "Isolation", "Durability"], correctAnswer: 3, explanation: "Durability guarantees that once a transaction is committed, its changes persist even after system failures." },
      { question: "What is a dirty read?", options: ["Reading corrupted data", "Reading uncommitted data from another transaction", "Reading old data", "Reading duplicate data"], correctAnswer: 1, explanation: "A dirty read occurs when one transaction reads data that another transaction has modified but not yet committed." },
      { question: "Which isolation level prevents phantom reads?", options: ["Read Uncommitted", "Read Committed", "Repeatable Read", "Serializable"], correctAnswer: 3, explanation: "Serializable is the strictest isolation level and prevents all concurrency problems including phantom reads." }
    ]
  },
  "Indexing": {
    concept: "An index is a database structure that improves the speed of data retrieval operations.\n\n**Types of Indexes:**\n- **Clustered Index**: Sorts and stores data rows in the table based on key values. One per table.\n- **Non-clustered Index**: Separate structure from data rows, contains pointers. Multiple allowed.\n- **B-tree Index**: Balanced tree structure, good for range queries\n- **Hash Index**: Uses hash function, good for equality searches\n- **Bitmap Index**: Uses bitmaps, good for low-cardinality columns\n\n**When to Use Indexes:**\n1. Frequently searched columns\n2. Columns used in WHERE clauses\n3. Columns used in JOIN conditions\n4. Columns used in ORDER BY\n\n**Trade-offs:**\n- Speeds up reads but slows down writes\n- Requires additional storage space",
    questions: [
      { question: "How many clustered indexes can a table have?", options: ["Unlimited", "One", "Two", "Depends on database"], correctAnswer: 1, explanation: "A table can have only one clustered index because the data rows can only be sorted in one order." },
      { question: "Which index type is best for equality searches (= operator)?", options: ["B-tree", "Hash", "Bitmap", "Clustered"], correctAnswer: 1, explanation: "Hash indexes use a hash function for direct lookup, making them ideal for equality comparisons." },
      { question: "What is a covering index?", options: ["Index on all columns", "Index that includes all columns needed for a query", "Primary key index", "Foreign key index"], correctAnswer: 1, explanation: "A covering index contains all the columns needed to satisfy a query, avoiding the need to access the actual table data." },
      { question: "Indexes slow down which operation?", options: ["SELECT", "WHERE filtering", "INSERT/UPDATE/DELETE", "JOIN"], correctAnswer: 2, explanation: "Indexes must be updated when data changes, so INSERT, UPDATE, and DELETE operations become slower." },
      { question: "Which structure do most database indexes use?", options: ["Linked List", "Array", "B-tree", "Stack"], correctAnswer: 2, explanation: "B-trees are the most common index structure because they keep data sorted and allow efficient insertion, deletion, and search." }
    ]
  },
  "Keys & Constraints": {
    concept: "Keys and constraints ensure data integrity and define relationships in databases.\n\n**Types of Keys:**\n- **Primary Key**: Uniquely identifies each row, no NULLs allowed\n- **Foreign Key**: References primary key of another table\n- **Candidate Key**: Minimal set of attributes that can uniquely identify a row\n- **Super Key**: Any set of attributes that uniquely identifies rows\n- **Composite Key**: Primary key made of multiple columns\n\n**Types of Constraints:**\n- **NOT NULL**: Column cannot have NULL values\n- **UNIQUE**: All values must be different\n- **CHECK**: Values must satisfy a condition\n- **DEFAULT**: Provides default value\n- **REFERENCES**: Establishes foreign key relationship\n\n**Referential Integrity Actions:**\n- ON DELETE CASCADE\n- ON DELETE SET NULL\n- ON UPDATE CASCADE",
    questions: [
      { question: "What makes a primary key different from a unique key?", options: ["Primary key allows NULL", "Primary key can be duplicated", "Primary key does not allow NULL", "No difference"], correctAnswer: 2, explanation: "Primary keys cannot contain NULL values, while unique constraints allow one NULL value in most databases." },
      { question: "What does ON DELETE CASCADE do?", options: ["Prevents deletion", "Deletes child records when parent is deleted", "Sets child values to NULL", "Logs the deletion"], correctAnswer: 1, explanation: "ON DELETE CASCADE automatically deletes all child records when the parent record is deleted." },
      { question: "Which key establishes a relationship between tables?", options: ["Primary Key", "Foreign Key", "Candidate Key", "Super Key"], correctAnswer: 1, explanation: "Foreign keys reference the primary key of another table, creating a relationship between the two tables." },
      { question: "A composite key is:", options: ["An encrypted key", "A key made of multiple columns", "A key in multiple tables", "A temporary key"], correctAnswer: 1, explanation: "A composite key (or compound key) is a primary key consisting of two or more columns." },
      { question: "Which constraint ensures a column always has a value?", options: ["UNIQUE", "CHECK", "NOT NULL", "DEFAULT"], correctAnswer: 2, explanation: "NOT NULL constraint ensures that a column cannot have a NULL value - it must always contain data." }
    ]
  },
  "SQL Commands": {
    concept: "SQL commands are categorized into different types based on their functionality.\n\n**DDL (Data Definition Language):**\n- CREATE, ALTER, DROP, TRUNCATE\n- Define database structure\n\n**DML (Data Manipulation Language):**\n- SELECT, INSERT, UPDATE, DELETE\n- Manipulate data within tables\n\n**DCL (Data Control Language):**\n- GRANT, REVOKE\n- Control access permissions\n\n**TCL (Transaction Control Language):**\n- COMMIT, ROLLBACK, SAVEPOINT\n- Manage transactions\n\n**Key Differences:**\n- DELETE vs TRUNCATE: DELETE can be rolled back, TRUNCATE cannot (in most DBMS)\n- WHERE vs HAVING: WHERE filters rows, HAVING filters groups\n- GROUP BY: Used with aggregate functions (COUNT, SUM, AVG, MAX, MIN)",
    questions: [
      { question: "Which command removes all rows but can be rolled back?", options: ["DROP", "TRUNCATE", "DELETE", "REMOVE"], correctAnswer: 2, explanation: "DELETE removes rows and can be rolled back within a transaction. TRUNCATE typically cannot be rolled back." },
      { question: "HAVING clause is used to filter:", options: ["Individual rows", "Columns", "Grouped results", "Tables"], correctAnswer: 2, explanation: "HAVING filters the results of GROUP BY (grouped results), while WHERE filters individual rows before grouping." },
      { question: "Which SQL category does GRANT belong to?", options: ["DDL", "DML", "DCL", "TCL"], correctAnswer: 2, explanation: "GRANT is a DCL (Data Control Language) command used to give permissions to users." },
      { question: "What does TRUNCATE do compared to DROP?", options: ["Same thing", "TRUNCATE removes data, DROP removes table structure", "DROP removes data, TRUNCATE removes structure", "Both remove data only"], correctAnswer: 1, explanation: "TRUNCATE removes all data but keeps the table structure. DROP removes both the data and the table structure." },
      { question: "Which aggregate function finds the average?", options: ["SUM", "COUNT", "AVG", "MEAN"], correctAnswer: 2, explanation: "AVG calculates the average value of a numeric column. Note: MEAN is not a standard SQL function." }
    ]
  }
}

// Default content for topics not in the predefined list
const getDefaultRevisionContent = (topic: string) => ({
  concept: `**${topic}** is an important concept in your subject area.\n\nKey points to remember:\n1. Understand the fundamental principles\n2. Practice with examples\n3. Connect concepts to real-world applications\n4. Review regularly for better retention\n\nTake time to study the core concepts and practice with the questions below.`,
  questions: [
    { question: `What is the primary purpose of ${topic}?`, options: ["Improve efficiency", "Ensure correctness", "Both A and B", "Neither"], correctAnswer: 2, explanation: `${topic} typically aims to improve both efficiency and correctness in your system.` },
    { question: `Which is a key consideration when working with ${topic}?`, options: ["Performance", "Security", "Maintainability", "All of the above"], correctAnswer: 3, explanation: `When working with ${topic}, you should consider performance, security, and maintainability.` },
    { question: `Best practices for ${topic} include:`, options: ["Following standards", "Testing thoroughly", "Documentation", "All of the above"], correctAnswer: 3, explanation: `Following standards, testing, and documentation are all important best practices.` },
  ]
})

export function RevisionSystem() {
  const { userProgress, updateProgress, setCurrentPage } = useApp()
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [showConcept, setShowConcept] = useState(true)

  if (!userProgress) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Please complete a diagnostic test first
      </div>
    )
  }

  if (userProgress.weakAreas.length === 0) {
    return (
      <div className="p-6 lg:p-8">
        <Card className="bg-card border-border text-center py-12">
          <CardContent>
            <div className="w-16 h-16 mx-auto bg-success/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Great Job!</h2>
            <p className="text-muted-foreground mb-6">
              You don't have any weak areas. Keep practicing to maintain your skills!
            </p>
            <Button onClick={() => setCurrentPage("test")}>
              Take Another Test
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getRevisionContent = (topic: string) => {
    return topicRevisionContent[topic] || getDefaultRevisionContent(topic)
  }

  if (!selectedTopic) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Revision System</h1>
          <p className="text-muted-foreground mt-1">
            Practice your weak areas with concept reviews and questions
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {userProgress.weakAreas.map((topic) => {
            const content = getRevisionContent(topic)
            return (
              <Card 
                key={topic} 
                className="bg-card border-border hover:border-primary transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedTopic(topic)
                  setCurrentQuestionIndex(0)
                  setSelectedAnswer(null)
                  setShowExplanation(false)
                  setCorrectCount(0)
                  setShowConcept(true)
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-destructive" />
                    </div>
                    <span className="text-xs px-2 py-1 bg-destructive/10 text-destructive rounded-full">
                      Needs Practice
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{topic}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {content.questions.length} practice questions + concept explanation
                  </p>
                  <Button className="w-full">
                    Start Revision
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  const content = getRevisionContent(selectedTopic)
  const currentQuestion = content.questions[currentQuestionIndex]
  const isComplete = currentQuestionIndex >= content.questions.length

  if (showConcept) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => setSelectedTopic(null)}
          className="mb-4"
        >
          Back to Topics
        </Button>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              {selectedTopic} - Concept Review
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-invert max-w-none">
              {content.concept.split('\n').map((line, i) => {
                if (line.startsWith('**') && line.endsWith('**')) {
                  return <h3 key={i} className="text-foreground font-bold mt-4">{line.replace(/\*\*/g, '')}</h3>
                }
                if (line.startsWith('- **')) {
                  const [term, ...desc] = line.replace('- **', '').split('**:')
                  return (
                    <p key={i} className="text-foreground ml-4">
                      <strong className="text-primary">{term}</strong>: {desc.join('')}
                    </p>
                  )
                }
                if (line.startsWith('- ')) {
                  return <p key={i} className="text-foreground ml-4">{line}</p>
                }
                if (line.match(/^\d\./)) {
                  return <p key={i} className="text-foreground ml-4">{line}</p>
                }
                return line ? <p key={i} className="text-foreground">{line}</p> : <br key={i} />
              })}
            </div>
            <div className="pt-4">
              <Button onClick={() => setShowConcept(false)} size="lg" className="w-full">
                Start Practice Questions
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isComplete) {
    const percentage = Math.round((correctCount / content.questions.length) * 100)
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <Card className="bg-card border-border text-center py-12">
          <CardContent>
            <div className={cn(
              "w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4",
              percentage >= 80 ? "bg-success/20" : percentage >= 60 ? "bg-yellow-500/20" : "bg-destructive/20"
            )}>
              {percentage >= 80 ? (
                <CheckCircle className="w-8 h-8 text-success" />
              ) : (
                <RotateCcw className="w-8 h-8 text-yellow-500" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {selectedTopic} Revision Complete
            </h2>
            <p className="text-muted-foreground mb-2">
              You got {correctCount} out of {content.questions.length} correct ({percentage}%)
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              {percentage >= 80 
                ? "Excellent! You're mastering this topic!"
                : percentage >= 60 
                ? "Good progress! Keep practicing for mastery."
                : "Keep studying! Review the concept and try again."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline"
                onClick={() => {
                  setCurrentQuestionIndex(0)
                  setSelectedAnswer(null)
                  setShowExplanation(false)
                  setCorrectCount(0)
                  setShowConcept(true)
                }}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retry Topic
              </Button>
              <Button onClick={() => setSelectedTopic(null)}>
                Choose Another Topic
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleAnswer = (index: number) => {
    if (showExplanation) return
    setSelectedAnswer(index)
  }

  const handleConfirm = () => {
    if (selectedAnswer === null) return
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setCorrectCount(correctCount + 1)
    }
    setShowExplanation(true)
  }

  const handleNext = () => {
    setCurrentQuestionIndex(currentQuestionIndex + 1)
    setSelectedAnswer(null)
    setShowExplanation(false)
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setSelectedTopic(null)}>
          Back to Topics
        </Button>
        <span className="text-muted-foreground">
          Question {currentQuestionIndex + 1} of {content.questions.length}
        </span>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="text-xs text-primary mb-2">{selectedTopic}</div>
          <CardTitle className="text-xl text-foreground leading-relaxed">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index
            const isCorrect = index === currentQuestion.correctAnswer

            return (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={showExplanation}
                className={cn(
                  "w-full p-4 rounded-lg border text-left transition-all flex items-center gap-3",
                  !showExplanation && isSelected && "border-primary bg-primary/10",
                  !showExplanation && !isSelected && "border-border bg-secondary hover:border-muted-foreground",
                  showExplanation && isCorrect && "border-success bg-success/10",
                  showExplanation && isSelected && !isCorrect && "border-destructive bg-destructive/10",
                  showExplanation && "cursor-not-allowed"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-medium",
                  !showExplanation && isSelected && "bg-primary text-primary-foreground",
                  !showExplanation && !isSelected && "bg-muted text-muted-foreground",
                  showExplanation && isCorrect && "bg-success text-success-foreground",
                  showExplanation && isSelected && !isCorrect && "bg-destructive text-destructive-foreground"
                )}>
                  {showExplanation ? (
                    isCorrect ? <CheckCircle className="w-5 h-5" /> : isSelected ? <XCircle className="w-5 h-5" /> : String.fromCharCode(65 + index)
                  ) : (
                    String.fromCharCode(65 + index)
                  )}
                </div>
                <span className="text-foreground">{option}</span>
              </button>
            )
          })}

          {showExplanation && (
            <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground mb-1">Explanation</p>
                  <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        {!showExplanation ? (
          <Button onClick={handleConfirm} disabled={selectedAnswer === null} size="lg">
            Check Answer
          </Button>
        ) : (
          <Button onClick={handleNext} size="lg">
            {currentQuestionIndex < content.questions.length - 1 ? "Next Question" : "View Results"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}
