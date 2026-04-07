// app/api/auth/sync/route.ts
// POST: Called after any sign-in, upserts user in MongoDB

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, email, displayName, photoURL } = body;

    if (!uid || !email) {
      return NextResponse.json(
        { error: "uid and email are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // isNew detection: compare createdAt vs updatedAt within a 2-second window
    const existingUser = await User.findOne({ uid }).select("createdAt profileComplete");
    const isNewUser = !existingUser;

    // Upsert: create if new, update lastLoginAt if existing
    const user = await User.findOneAndUpdate(
      { uid },
      {
        $set: {
          uid,
          email: email.toLowerCase(),
          displayName: displayName || "",
          photoURL: photoURL || "",
          lastLoginAt: new Date(),
        },
        $setOnInsert: {
          chatHistory: [],
          profileComplete: false,
          name: "",
          age: null,
          gender: "",
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    return NextResponse.json({
      success: true,
      isNewUser,
      profileComplete: user.profileComplete || false,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error("[Auth Sync Error]:", error);
    return NextResponse.json(
      { error: "Failed to sync user to database" },
      { status: 500 }
    );
  }
}
