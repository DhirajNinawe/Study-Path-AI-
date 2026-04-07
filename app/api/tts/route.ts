// app/api/tts/route.ts
// POST: Accept text, call ElevenLabs eleven_multilingual_v2, return audio/mpeg buffer.
// Securely uses VOICE_API_KEY from server-side env — never exposed to the client.
// If generation fails for any reason, returns a 500 JSON error so the frontend
// can catch it gracefully and fall back to silent mode without crashing.

import { NextRequest, NextResponse } from "next/server";

// ElevenLabs voice ID for an Indian-accent, natural-sounding voice.
// "Rachel" (21m00Tcm4TlvDq8ikWAM) is a warm, clear multilingual voice.
// You can swap this for any voice ID from your ElevenLabs account.
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM";
const ELEVENLABS_MODEL = "eleven_multilingual_v2";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "text is required and must be a non-empty string." },
        { status: 400 }
      );
    }

    const apiKey = process.env.VOICE_API_KEY;
    if (!apiKey) {
      console.warn("[TTS] VOICE_API_KEY is not set — skipping audio generation.");
      return NextResponse.json(
        { error: "TTS service is not configured." },
        { status: 503 }
      );
    }

    // Strip markdown characters so the AI voice sounds natural
    const cleanText = text
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/`/g, "")
      .replace(/#{1,6}\s/g, "")
      .replace(/\n+/g, ". ")
      .trim()
      // Cap at 2500 chars — ElevenLabs free tier has per-request limits
      .slice(0, 2500);

    const elevenLabsRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: ELEVENLABS_MODEL,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.15,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!elevenLabsRes.ok) {
      const errText = await elevenLabsRes.text().catch(() => "Unknown ElevenLabs error");
      console.warn(`[TTS] ElevenLabs API error ${elevenLabsRes.status}:`, errText);
      return NextResponse.json(
        { error: `TTS generation failed: ${elevenLabsRes.status}` },
        { status: 502 }
      );
    }

    // Stream the audio buffer back to the client
    const audioBuffer = await elevenLabsRes.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
        // Prevent caching to avoid stale audio
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    // Never crash the UI — log the warning and return a clean error JSON
    console.warn("[TTS] Unexpected error during audio generation:", error?.message || error);
    return NextResponse.json(
      { error: "TTS generation encountered an unexpected error." },
      { status: 500 }
    );
  }
}
