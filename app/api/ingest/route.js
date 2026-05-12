import { NextResponse } from "next/server";
import OpenAI from "openai";
import Papa from "papaparse";

// Polyfill DOMMatrix for pdf-parse in Next.js Server environments
if (typeof global.DOMMatrix === 'undefined') {
  global.DOMMatrix = class DOMMatrix {};
}

export async function POST(request) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "dummy_key",
    });
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // --- CSV PARSING (Optimized for speed and infinite size) ---
    if (file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv")) {
      const rawText = buffer.toString("utf-8");
      const parsedCsv = Papa.parse(rawText, { header: false, skipEmptyLines: true });
      
      let transactions = [];
      const uniqueDescriptions = new Set();

      parsedCsv.data.forEach(row => {
        if (row.length >= 3) {
           const dateStr = row[0]; // e.g., 23/04/2026
           const details = row[1] ? row[1].trim() : "";
           const amountStr = row[2] ? row[2].toString() : "0";
           
           // Parse Date (DD/MM/YYYY -> YYYY-MM-DD)
           let dateParts = dateStr.split('/');
           let isoDate = dateStr;
           if(dateParts.length === 3) {
             isoDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
           } else if (!isNaN(Date.parse(dateStr))) {
             isoDate = new Date(dateStr).toISOString().split('T')[0];
           }

           // Clean Amount (handle commas and quotes)
           const amount = parseFloat(amountStr.replace(/,/g, ''));
           
           if(!isNaN(amount) && isoDate.includes('-')) {
             // Strip out common junk from bank statements to expose the actual vendor name
             let cleanDesc = details
                .replace(/CARD TRANSACTION|TRANSFER|PURCH|V DEBIT|ATM|UAESWCH|OW IPP RTP|PYMT/gi, '')
                .replace(/\d{2}[A-Za-z]{3}\d{2}/g, '') // e.g. 21APR26
                .replace(/Card Endi[a-z\s]*\d*/ig, '') // Catch "Card Endi" or "Card Ending with 6338"
                .replace(/\d{6}[A-Z]{3}/g, '') // e.g. 004974AED
                .replace(/\b\d+\.\d{2}\b/g, '') // e.g. 100.00
                .replace(/[A-Z0-9]{9,}/g, '') // Long alphanumeric references like A89574520
                .replace(/NFC\s*\(AP-PAY\)/ig, '')
                .replace(/\s{2,}/g, ' ')
                .trim();
                
             // Provide a fallback if regex stripped everything
             if (!cleanDesc) cleanDesc = "Unknown Transaction";
             cleanDesc = cleanDesc.substring(0, 60); // safe limit after cleanup

             transactions.push({
               date: isoDate,
               description: cleanDesc,
               category: "General", // Default
               amount: amount,
               original_details: row.join(', ')
             });
             uniqueDescriptions.add(cleanDesc);
           }
        }
      });

      // Use LLM to categorize unique descriptions
      const descList = Array.from(uniqueDescriptions); // Send all unique vendors
      if (descList.length > 0) {
        const prompt = `
          You are a precise financial categorization engine.
          Categorize these transaction descriptions into one of these short categories:
          "Food & Dining", "Transportation", "Housing", "Shopping", "Income", "Transfer", "Entertainment", "Utilities", "Subscription", "General".
          
          Return ONLY a valid JSON object mapping the exact description to its category.
          Example: { "categories": { "UBER EATS": "Food & Dining", "NETFLIX": "Subscription" } }
          
          Descriptions:
          ${JSON.stringify(descList)}
        `;

        try {
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.1,
          });

          const catMap = JSON.parse(response.choices[0].message.content).categories || {};

          // Apply categories and clean descriptions
          transactions.forEach(t => {
            if (catMap[t.description]) {
              t.category = catMap[t.description];
            }
            // Make descriptions prettier
            t.description = t.description
              .replace(/CARD TRANSACTION|TRANSFER|PURCH|V DEBIT|ATM/g, '')
              .replace(/\s+/g, ' ')
              .trim();
          });
        } catch (llmError) {
          console.warn("LLM Categorization failed, using defaults:", llmError);
        }
      }

      return NextResponse.json({ success: true, transactions });
    }

    // --- PDF PARSING (Using LLM for unstructured data) ---
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      const pdfParse = require("pdf-parse");
      const pdfData = await pdfParse(buffer);
      
      // Limit text to ~10,000 characters to prevent 16k output token limits (Unterminated JSON error)
      const safeText = pdfData.text.substring(0, 10000); 
      
      const prompt = `
        You are a precise financial data extraction engine.
        Below is raw text extracted from a bank statement PDF.
        Extract ALL transactions found in this text and return them as a JSON array of objects.
        
        IMPORTANT RULES:
        1. Base the transaction date strictly on the details inside the row itself, NOT on the file title.
        2. Dates must be formatted as YYYY-MM-DD.
        3. For "amount", return a positive number for income/credits, and a negative number for expenses/debits.
        4. Infer a short, professional "category" based on the description (e.g., "Food & Dining", "Transportation", "Income").
        5. "description" should be a cleaned up version of the raw details.
        6. "original_details" should contain the raw, unedited line of text.

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
        ${safeText} 
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      const resultText = response.choices[0].message.content;
      
      try {
        const parsedData = JSON.parse(resultText);
        return NextResponse.json({ 
          success: true, 
          transactions: parsedData.transactions || []
        });
      } catch (parseError) {
        // If it still cuts off, we can try to recover by appending ]} but throwing is safer for now
        throw new Error("JSON parsing failed, document may be too large. Try uploading a CSV or a shorter PDF.");
      }
    }

    return NextResponse.json(
      { error: "Unsupported file type. Please upload a CSV or PDF." },
      { status: 400 }
    );

  } catch (error) {
    console.error("Ingestion error:", error);
    return NextResponse.json(
      { error: "Failed to process the document: " + error.message },
      { status: 500 }
    );
  }
}
