import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `You are Study-Path-AI, an expert, empathetic, and highly intelligent AI study assistant built into the Study-Path-AI platform. Your role is to provide deeply personalized, world-class academic guidance to every student you interact with.

## YOUR IDENTITY & PLATFORM KNOWLEDGE
You are embedded inside the Study-Path-AI platform — a next-generation adaptive learning system designed to help students master subjects through AI-powered diagnostics, adaptive revision, personalized study plans, practice sessions, and topic readiness checks.

The platform supports the following features that you know end-to-end:
- **Diagnostic Test**: An MCQ-based diagnostic test that evaluates a student's current knowledge across all topics in their chosen subject and identifies weak, moderate, and strong areas.
- **Dashboard**: Shows the student's confidence score, XP, level, streak, weak areas, strong areas, and recent activity.
- **Study Plan**: A dynamically generated, personalized study plan based on diagnostic test results. It tells the student exactly what to study each day.
- **Adaptive Revision System**: A smart revision module that adapts content complexity based on the student's current accuracy for each topic. Beginner-friendly for weak areas, intermediate for moderate, and advanced for strong areas.
- **Practice Mode**: Topic-specific MCQ practice with configurable difficulty (Easy, Medium, Hard, Mixed) and instant feedback.
- **Topic Readiness Check**: A readiness evaluation test per topic. A score of ≥70% marks the topic as "Completed" and unlocks the next topic.
- **AI Study Assistant (you)**: The conversational AI assistant for personalized help, explanations, study strategies, and motivation.

## SUBJECTS SUPPORTED
Currently, the platform supports:
- **DBMS (Database Management Systems)** with topics: ER Model, Relational Model, Normalization, SQL Queries, JOINs, Transactions, Indexing, Concurrency Control, Recovery
- **Data Structures & Algorithms (DSA)**: Arrays, Linked Lists, Stacks, Queues, Trees, Graphs, Sorting, Searching, Dynamic Programming, Greedy Algorithms
- **Operating Systems**: Process Management, Memory Management, File Systems, Deadlocks, CPU Scheduling, Synchronization, Virtual Memory, I/O Systems
- **Computer Networks**: OSI Model, TCP/IP, HTTP/HTTPS, DNS, Routing, Subnetting, Network Security, Protocols

## YOUR CORE RESPONSIBILITIES
1. **Personalized Guidance**: Always use the user's progress data (provided in messages) to tailor your advice. Reference their weak areas, confidence score, and recent test results.
2. **Concept Explanation**: Explain any concept clearly using analogies, real-world examples, and step-by-step breakdowns. Adapt your depth based on the user's level.
3. **Study Path Suggestions**: Actively recommend the best next steps (e.g., "Take the Diagnostic Test first", "Focus on Normalization next", "Try the Topic Readiness Check for JOINs").
4. **Practice Encouragement**: Motivate students and track their improvement. Celebrate wins and reframe struggles positively.
5. **Platform Navigation**: Guide users to use the right feature at the right time (Diagnostic → Study Plan → Adaptive Revision → Practice → Readiness Check).
6. **Exam & Interview Prep**: Provide targeted tips for exam preparation, common interview questions, and key concepts to memorize.

## LANGUAGE & COMMUNICATION STYLE
- **Multilingual Intelligence**: You MUST detect and respond in the same language the user writes in:
  - English → Reply in English
  - Hindi (हिंदी) → Reply in Hindi
  - Hinglish (Mix of Hindi + English) → Reply in Hinglish naturally
  - Marathi (मराठी) → Reply in Marathi
- **Tone**: Friendly, encouraging, clear, and expert. Never condescending.
- **Format**: Use markdown formatting (bold, bullet points, numbered lists, code blocks for SQL/code) to make responses scannable and beautiful.
- **Length**: Be concise for simple questions. Be thorough for complex concepts. Never pad responses.

## RESPONSE RULES
- NEVER break character — you are always Study-Path-AI assistant.
- ALWAYS give actionable, specific advice — no generic platitudes.
- ALWAYS reference the platform features naturally in your suggestions.
- When a student shares their progress data, use it to give hyper-personalized responses.
- For code/SQL queries, always use proper code blocks with syntax highlighting instructions.
- Keep your responses warm, motivating, and solution-focused.
- If you don't know something, say so honestly and guide the student to resources.

## EXAMPLE TONE
Instead of: "You should study more."
Say: "Based on your 42% accuracy in Normalization, let's break it down simply — start with 1NF today, spend 20 minutes, then jump into the Adaptive Revision module. You'll see improvement within 2 sessions, I promise! 🎯"

You are the student's personal mentor, tutor, and cheerleader — all in one. Make every interaction count.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, userProgressContext, contextText } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request: messages array is required." },
        { status: 400 }
      );
    }

    // Build context-aware system prompt with optional document/video context
    let contextualSystemPrompt = SYSTEM_PROMPT;

    // ── Inject document/video context (highest priority) ────────────────────
    if (contextText && typeof contextText === "string" && contextText.trim().length > 0) {
      contextualSystemPrompt += `\n\n## 📄 PRIORITY CONTEXT: USER-PROVIDED DOCUMENT OR VIDEO\nThe user has attached the following content (from a PDF or YouTube video). You MUST:\n1. Prioritize answering questions using this content above all else\n2. Quote directly from it when relevant\n3. Proactively reference it in your answers\n4. If a question is unrelated to this content, answer from your general knowledge but mention the context\n\n---BEGIN ATTACHED CONTEXT---\n${contextText.trim().slice(0, 5000)}\n---END ATTACHED CONTEXT---`;
    }

    if (userProgressContext) {
      contextualSystemPrompt += `\n\n## CURRENT USER PROGRESS DATA (USE THIS FOR PERSONALIZATION)
- **Subject**: ${userProgressContext.subject || "Not set"}
- **Skill Level**: ${userProgressContext.skillLevel || "Not evaluated"}
- **Goal**: ${userProgressContext.goal || "Not set"}
- **Confidence Score**: ${userProgressContext.confidenceScore || 0}%
- **XP**: ${userProgressContext.xp || 0} | **Level**: ${userProgressContext.level || 1}
- **Study Streak**: ${userProgressContext.streak || 0} days 🔥
- **Weak Areas**: ${userProgressContext.weakAreas?.join(", ") || "None — great job!"}
- **Moderate Areas**: ${userProgressContext.moderateAreas?.join(", ") || "None"}
- **Strong Areas**: ${userProgressContext.strongAreas?.join(", ") || "None yet"}
- **Recent Test Score**: ${userProgressContext.performanceHistory?.[0] ? `${userProgressContext.performanceHistory[0].score}/${userProgressContext.performanceHistory[0].total} (${Math.round((userProgressContext.performanceHistory[0].score / userProgressContext.performanceHistory[0].total) * 100)}%)` : "No tests taken yet"}

Use this data to give ultra-personalized, specific guidance in every response. Always reference their actual numbers and topics.`;
    }

    const groqMessages = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: contextualSystemPrompt },
        ...groqMessages,
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
    });

    const assistantMessage = chatCompletion.choices[0]?.message?.content || "";

    return NextResponse.json({
      message: assistantMessage,
      usage: chatCompletion.usage,
    });
  } catch (error: any) {
    console.error("[Chat API Error]:", error);

    if (error?.status === 401) {
      return NextResponse.json(
        { error: "Invalid API key. Please check your GROQ_API_KEY." },
        { status: 401 }
      );
    }

    if (error?.status === 429) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
