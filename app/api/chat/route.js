import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone } from "@pinecone-database/pinecone";

export async function POST(req) {
  try {
    const { prompt, url } = await req.json();



    
    
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }
    
    if (!url) {
      return NextResponse.json(
        { error: "Video URL is required" },
        { status: 400 }
      );
    }
    
    // =========================
    // 1. EMBEDDINGS
    // =========================
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: 'AIzaSyCV6wRd7U5DZmjMa9_1e_cEgK-0vAYLmkg',
      model: "gemini-embedding-001",
    });
    
    const queryEmbedding = await embeddings.embedQuery(prompt);
    
    console.log("Query vector dimension:", queryEmbedding.length);
    
    // =========================
    // 2. PINECONE QUERY
    // =========================
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_KEY,
    });
    
    const index = pc.index("rag");
    
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: 5,
      includeMetadata: true,
      filter: {
        url: { $eq: url },
      },
    });
    
    
    const matches = queryResponse.matches || [];

    console.log(`Found ${matches.length} relevant chunks`);

    if (matches.length === 0) {
      return NextResponse.json({
        answer:
          "No relevant content found in this video for your question.",
        sources: [],
        relevantChunks: 0,
      });
    }

    // =========================
    // 3. BUILD CONTEXT
    // =========================
    const context = matches
      .map((m) => m.metadata?.text)
      .filter(Boolean)
      .join("\n\n");

    // =========================
    // 4. GEMINI LLM (FIXED)
    // =========================
    const apiKey = process.env.GEMENI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing in environment variables");
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // 🔥 FIXED MODEL (important)
    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.5-flash",
    });
    
    
    const enhancedPrompt = `
You are a helpful assistant answering ONLY from the provided context.

Context:
${context}

Question:
${prompt}

Rules:
- Only use context
- If not found, say you don't know
- Be concise
`;

    const result = await model.generateContent(enhancedPrompt);
    const answer = result.response.text();

   

    // =========================
    // 5. SOURCES
    // =========================
    const sources = matches.map((m, i) => ({
      id: i + 1,
      text: m.metadata?.text?.slice(0, 200) + "...",
      score: m.score,
      url: m.metadata?.url,
    }));

    return NextResponse.json({
      success: true,
      answer,
      sources,
      relevantChunks: matches.length,
    });
  } catch (error) {
    console.error("Error in RAG query:", error);

    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}