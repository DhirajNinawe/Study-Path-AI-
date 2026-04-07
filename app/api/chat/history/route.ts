// app/api/chat/history/route.ts
// GET: Fetch chat history for a user
// POST: Append new messages to a user's chat history

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";

// GET /api/chat/history?uid=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");

    if (!uid) {
      return NextResponse.json(
        { error: "uid query parameter is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ uid }, { chatHistory: 1 }).lean();

    if (!user) {
      return NextResponse.json({ chatHistory: [] });
    }

    return NextResponse.json({ chatHistory: user.chatHistory || [] });
  } catch (error: any) {
    console.error("[Chat History GET Error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}

// POST /api/chat/history
// Body: { uid, messages: [{ role, content }] }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, messages } = body;

    if (!uid || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "uid and messages array are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Stamp each message with a timestamp
    const timestampedMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
      timestamp: new Date(),
    }));

    // Push new messages; if total exceeds 200, slice the oldest from the front
    const user = await User.findOne({ uid });

    if (!user) {
      return NextResponse.json(
        { error: "User not found. Please sign in again." },
        { status: 404 }
      );
    }

    const combined = [...user.chatHistory, ...timestampedMessages];
    // Keep only the most recent 200 messages
    user.chatHistory = combined.slice(-200);
    await user.save();

    return NextResponse.json({ success: true, count: user.chatHistory.length });
  } catch (error: any) {
    console.error("[Chat History POST Error]:", error);
    return NextResponse.json(
      { error: "Failed to save chat history" },
      { status: 500 }
    );
  }
}
