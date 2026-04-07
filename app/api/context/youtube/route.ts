// app/api/context/youtube/route.ts
// POST: Accept a YouTube URL, fetch transcript (EN/HI/auto), return joined text
// Capped at 5,000 chars to stay within Groq context limits

import { NextRequest, NextResponse } from "next/server";

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#\s]+)/,
    /youtube\.com\/shorts\/([^&\n?#\s]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "YouTube URL is required" }, { status: 400 });
    }

    const videoId = extractVideoId(url.trim());
    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL. Please paste a valid youtube.com or youtu.be link." },
        { status: 400 }
      );
    }

    const { YoutubeTranscript } = await import("youtube-transcript");

    // Try English first, then Hindi, then auto-detect
    let transcriptItems: Array<{ text: string }> = [];
    let langUsed = "en";

    const tryLangs = ["en", "hi", "en-IN", "en-US"];
    let lastError: Error | null = null;

    for (const lang of tryLangs) {
      try {
        transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, { lang });
        langUsed = lang;
        break;
      } catch (err: any) {
        lastError = err;
        continue;
      }
    }

    // If all language attempts failed, try without lang parameter (auto)
    if (transcriptItems.length === 0) {
      try {
        transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
        langUsed = "auto";
      } catch (err: any) {
        const msg =
          err?.message?.includes("disabled") || lastError?.message?.includes("disabled")
            ? "Transcripts are disabled for this video."
            : "Could not fetch transcript. The video may have no captions or they may be private.";
        return NextResponse.json({ error: msg }, { status: 422 });
      }
    }

    if (!transcriptItems || transcriptItems.length === 0) {
      return NextResponse.json(
        { error: "No transcript found for this video." },
        { status: 422 }
      );
    }

    // Join all transcript segments into clean text
    const fullText = transcriptItems
      .map((t) => t.text.replace(/\[.*?\]/g, "").trim())
      .filter(Boolean)
      .join(" ");

    const contextText = fullText.slice(0, 5000);

    return NextResponse.json({
      success: true,
      contextText,
      charCount: contextText.length,
      segmentCount: transcriptItems.length,
      videoId,
      language: langUsed,
      truncated: fullText.length > 5000,
    });
  } catch (error: any) {
    console.error("[YouTube Context Error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch transcript. Please check the URL and try again." },
      { status: 500 }
    );
  }
}
