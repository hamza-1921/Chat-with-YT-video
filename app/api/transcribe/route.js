import { NextRequest, NextResponse } from "next/server";
import { fetchTranscript } from "youtube-transcript";
import { TokenTextSplitter } from "@langchain/textsplitters";
import { Pinecone } from "@pinecone-database/pinecone";

export async function POST(req) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // 1. Fetch transcript
    const transcript = await fetchTranscript(url);

    const text = Array.isArray(transcript)
      ? transcript.map((t) => t.text).join(" ")
      : transcript?.text || "";

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "No transcript found" },
        { status: 400 }
      );
    }

    // 2. Split text
    const splitter = new TokenTextSplitter({
      encodingName: "cl100k_base",
      chunkSize: 1000,
      chunkOverlap: 100,
    });

    const chunks = await splitter.splitText(text);

    console.log("Chunks:", chunks.length);

    // 3. Embeddings
    const vectors = [];

    for (let i = 0; i < chunks.length; i++) {
      const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": process.env.GEMENI_API_KEY,
          },
          body: JSON.stringify({
            content: {
              parts: [{ text: chunks[i] }],
            },
          }),
        }
      );

      const data = await res.json();
      const embedding = data?.embedding?.values;

      if (!embedding || embedding.length === 0) {
        throw new Error("Embedding failed");
      }

      vectors.push(embedding);
    }

    console.log("Vectors:", vectors.length);
    console.log("Dimension:", vectors[0].length);

    // 4. Pinecone init
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_KEY,
    });

    const index = pc.index("rag");

    // 5. Safe ID
    const safeUrl = url
      .replace(/^https?:\/\//, "")
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .slice(0, 80);

    // 6. Build records (IMPORTANT for v3)
    const records = vectors.map((vector, i) => ({
      id: `${safeUrl}-${i}`,
      values: vector,
      metadata: {
        text: chunks[i].slice(0, 1000),
        url,
      },
    }));

    console.log("Valid records:", records.length);

    if (!records.length) {
      throw new Error("No valid records generated");
    }

    // 7. 🔥 FINAL PINECONE v3 UPSERT FIX
    for (let i = 0; i < records.length; i += 50) {
      const batch = records.slice(i, i + 50);

      console.log(`Upserting batch ${i} - ${i + batch.length}`);

      await index.upsert({
        records: batch, // ✅ THIS IS THE ONLY VALID FORMAT IN YOUR SDK
      });
    }

    // 8. Stats
    const stats = await index.describeIndexStats();

    return NextResponse.json({
      success: true,
      chunks: chunks.length,
      vectors: vectors.length,
      dimension: vectors[0].length,
      pineconeTotalVectors: stats.totalVectorCount,
    });

  } catch (err) {
    console.error("❌ Upload error:", err);

    return NextResponse.json(
      {
        error: "Upload failed",
        message: err.message,
      },
      { status: 500 }
    );
  }
}