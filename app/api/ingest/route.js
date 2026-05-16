import { NextResponse } from "next/server";
import OpenAI from "openai";
import Papa from "papaparse";
import { createClient } from "@/utils/supabase/server";

if (typeof global.DOMMatrix === 'undefined') {
  global.DOMMatrix = class DOMMatrix {};
}

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv")) {
      const rawText = buffer.toString("utf-8");
      const parsedCsv = Papa.parse(rawText, { header: false, skipEmptyLines: true });

      let transactions = [];
      const uniqueDescriptions = new Set();
      let skipGPT = false;

      // Detect format: our own export (header row: Date, Description, Category, Amount, Status)
      // vs bank statement (DD/MM/YYYY, raw description, amount, balance)
      const firstRow = parsedCsv.data[0] || [];
      const isExportFormat =
        firstRow[0]?.toString().toLowerCase().trim() === "date" &&
        firstRow[1]?.toString().toLowerCase().trim() === "description";

      if (isExportFormat) {
        // ── Finacle export format ──────────────────────────────────────────
        // Columns: Date (YYYY-MM-DD), Description, Category, Amount, Status
        skipGPT = true; // categories already assigned
        parsedCsv.data.slice(1).forEach(row => {
          if (row.length >= 4) {
            const isoDate    = row[0]?.trim();
            const description = (row[1]?.replace(/^"|"$/g, '') || "Unknown Transaction").substring(0, 60);
            const category   = row[2]?.trim() || "General";
            const amount     = parseFloat((row[3] || "0").toString().replace(/,/g, ''));

            if (!isNaN(amount) && isoDate && isoDate.includes('-')) {
              transactions.push({ date: isoDate, description, category, amount, original_details: row.join(', ') });
            }
          }
        });
      } else {
        // ── Bank statement format ──────────────────────────────────────────
        // Columns: DD/MM/YYYY, raw description, amount, balance
        parsedCsv.data.forEach(row => {
          if (row.length >= 3) {
            const dateStr  = row[0];
            const details  = row[1] ? row[1].trim() : "";
            const amountStr = row[2] ? row[2].toString() : "0";

            let dateParts = dateStr.split('/');
            let isoDate = dateStr;
            if (dateParts.length === 3) {
              isoDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
            } else if (!isNaN(Date.parse(dateStr))) {
              isoDate = new Date(dateStr).toISOString().split('T')[0];
            }

            const amount = parseFloat(amountStr.replace(/,/g, ''));

            if (!isNaN(amount) && isoDate.includes('-')) {
              let cleanDesc = details
                .replace(/CARD TRANSACTION|TRANSFER|PURCH|V DEBIT|ATM|UAESWCH|OW IPP RTP|PYMT/gi, '')
                .replace(/\d{2}[A-Za-z]{3}\d{2}/g, '')
                .replace(/Card Endi[a-z\s]*\d*/ig, '')
                .replace(/\d{6}[A-Z]{3}/g, '')
                .replace(/\b\d+\.\d{2}\b/g, '')
                .replace(/[A-Z0-9]{9,}/g, '')
                .replace(/NFC\s*\(AP-PAY\)/ig, '')
                .replace(/\s{2,}/g, ' ')
                .trim();

              if (!cleanDesc) cleanDesc = "Unknown Transaction";
              cleanDesc = cleanDesc.substring(0, 60);

              transactions.push({
                date: isoDate,
                description: cleanDesc,
                category: "General",
                amount: amount,
                original_details: row.join(', ')
              });
              uniqueDescriptions.add(cleanDesc);
            }
          }
        });
      }

      if (transactions.length === 0) {
        return NextResponse.json(
          { error: "No valid transactions found. Supported formats: bank statement (DD/MM/YYYY, description, amount, balance) or a Finacle CSV export." },
          { status: 400 }
        );
      }

      // Batch-categorise unique descriptions via GPT-4o (skip for Finacle exports)
      const descList = Array.from(uniqueDescriptions);
      if (!skipGPT && descList.length > 0) {
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
          transactions.forEach(t => {
            if (catMap[t.description]) t.category = catMap[t.description];
          });
        } catch (llmError) {
          console.warn("LLM categorization failed, using defaults:", llmError);
        }
      }

      const dbTransactions = transactions.map(t => ({
        user_id: user.id,
        date: t.date,
        description: t.description,
        category: t.category,
        amount: t.amount,
        original_details: t.original_details,
        status: 'Completed'
      }));

      const { data: insertedData, error: dbError } = await supabase
        .from('transactions')
        .insert(dbTransactions)
        .select();

      if (dbError) throw new Error(`Database error: ${dbError.message}`);

      return NextResponse.json({ success: true, transactions: insertedData || transactions });
    }

    return NextResponse.json(
      { error: "Unsupported file type. Please upload a CSV." },
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
