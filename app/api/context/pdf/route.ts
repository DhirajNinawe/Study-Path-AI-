// app/api/context/pdf/route.ts
// POST: Accept a PDF file upload, extract raw text using unpdf (ESM-native, Turbopack-safe)
// Capped at 5,000 chars to stay within Groq context limits

import { NextRequest, NextResponse } from "next/server";
import { extractText, getDocumentProxy } from "unpdf";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    // 10 MB limit
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10 MB." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();

    // unpdf is ESM-native and fully Turbopack-compatible
    const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer));
    const { text } = await extractText(pdf, { mergePages: true });

    const trimmed = text?.trim();
    if (!trimmed || trimmed.length < 10) {
      return NextResponse.json(
        {
          error:
            "Could not extract text from this PDF. It may be a scanned image PDF with no selectable text.",
        },
        { status: 422 }
      );
    }

    // Cap context at 5,000 chars (~1,250 tokens) — strict safeguard against context window overflow
    const contextText = trimmed.slice(0, 5000);
    const pageCount = pdf.numPages || 1;

    return NextResponse.json({
      success: true,
      contextText,
      charCount: contextText.length,
      pageCount,
      fileName: file.name,
      truncated: trimmed.length > 15000,
    });
  } catch (error: any) {
    console.error("[PDF Context Error]:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to parse PDF. Please ensure it is a valid, text-based PDF." },
      { status: 500 }
    );
  }
}
