// app/api/auth/profile/route.ts
// POST: Save user profile (name, age, gender) and mark profileComplete=true

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, email, name, age, gender } = body;

    if (!uid) {
      return NextResponse.json({ error: "uid is required" }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOneAndUpdate(
      { uid },
      {
        $set: {
          name: name?.trim() || "",
          age: age ? Number(age) : null,
          gender: gender || "",
          profileComplete: true,
          lastLoginAt: new Date(),
        },
        // setOnInsert handles required fields if user doc was never created by sync
        $setOnInsert: {
          email: (email || "").toLowerCase(),
          displayName: name?.trim() || "",
          chatHistory: [],
        },
      },
      { upsert: true, new: true, runValidators: false }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      profileComplete: true,
    });
  } catch (error: any) {
    console.error("[Profile API Error]:", error);
    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");

    if (!uid) {
      return NextResponse.json({ error: "uid is required" }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({ uid }).select("profileComplete name age gender");

    if (!user) {
      return NextResponse.json({ profileComplete: false });
    }

    return NextResponse.json({
      profileComplete: user.profileComplete || false,
      name: user.name || "",
      age: user.age || null,
      gender: user.gender || "",
    });
  } catch (error: any) {
    console.error("[Profile GET Error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
