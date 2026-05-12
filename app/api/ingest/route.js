import { NextResponse } from "next/server";
import OpenAI from "openai";
import pdfParse from "pdf-parse";

// We require OPENAI_API_KEY in the environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let rawText = "";

    // Parse the file based on its type
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      const pdfData = await pdfParse(buffer);
      rawText = pdfData.text;
    } else if (file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv")) {
      rawText = buffer.toString("utf-8");
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a CSV or PDF." },
        { status: 400 }
      );
    }

    // Since bank statements can be long, we should limit the text sent to the LLM to prevent massive token usage or timeouts.
    // For a real production app, we would chunk this or use a more deterministic first-pass parser.
    // Here we'll truncate it to a reasonable limit (e.g., first 15,000 characters) just for safety, 
    // or pass it entirely if it's within limits. We'll pass it entirely for now but rely on gpt-4o.
    
    const prompt = `
      You are a precise financial data extraction engine.
      Below is raw text extracted from a bank statement (could be CSV or PDF).
      Extract ALL transactions found in this text and return them as a JSON array of objects.
      
      IMPORTANT RULES:
      1. Base the transaction date strictly on the details inside the row itself, NOT on the file title or any overarching header. For example, if the file says "Dec 25" but the row says "24/02/2026", use "2026-02-24".
      2. Dates must be formatted as YYYY-MM-DD.
      3. For "amount", return a positive number for income/credits, and a negative number for expenses/debits.
      4. Infer a short, professional "category" based on the description (e.g., "Food & Dining", "Transportation", "Housing", "Transfer", "Entertainment", "Utilities", "Shopping", "Income", "Subscription").
      5. "description" should be a cleaned up version of the raw details.
      6. "original_details" should contain the raw, unedited line of text for that transaction exactly as it appeared.

      Return ONLY valid JSON in this structure:
      {
        "transactions": [
          {
            "date": "YYYY-MM-DD",
            "description": "Cleaned description",
            "category": "Inferred Category",
            "amount": -125.50,
            "original_details": "Raw text line here"
          }
        ]
      }
      
      Raw Data:
      ${rawText.substring(0, 30000)} 
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const resultText = response.choices[0].message.content;
    const parsedData = JSON.parse(resultText);

    return NextResponse.json({ 
      success: true, 
      transactions: parsedData.transactions 
    });

  } catch (error) {
    console.error("Ingestion error:", error);
    return NextResponse.json(
      { error: "Failed to process the document: " + error.message },
      { status: 500 }
    );
  }
}
