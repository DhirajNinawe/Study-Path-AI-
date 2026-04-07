// lib/models/User.js
// Mongoose User schema — stores Firebase-authenticated users, profile, and chat history

import mongoose from "mongoose";

const ChatMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      default: "",
    },
    photoURL: {
      type: String,
      default: "",
    },
    // ── Profile fields (collected during onboarding) ──
    name: {
      type: String,
      default: "",
      trim: true,
    },
    age: {
      type: Number,
      default: null,
      min: 5,
      max: 100,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Prefer not to say", ""],
      default: "",
    },
    profileComplete: {
      type: Boolean,
      default: false,
    },
    // ── Chat history — capped to last 200 messages ──
    chatHistory: {
      type: [ChatMessageSchema],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 200;
        },
        message: "Chat history cannot exceed 200 messages",
      },
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model re-compilation on hot-reload
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
