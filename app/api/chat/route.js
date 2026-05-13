import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/utils/supabase/server";

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { message, history, context } = await request.json();
    if (!message?.trim()) return NextResponse.json({ error: "No message provided" }, { status: 400 });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const contextBlock = context
      ? `
USER'S FINANCIAL DATA (use only these numbers — never invent figures):
- Date range: ${context.dateRange}
- Transaction count: ${context.transactionCount}
- Total Income: AED ${Number(context.totalIncome).toLocaleString("en-US", { minimumFractionDigits: 2 })}
- Total Spending: AED ${Number(context.totalSpending).toLocaleString("en-US", { minimumFractionDigits: 2 })}
- Net Balance: AED ${Number(context.netBalance).toLocaleString("en-US", { minimumFractionDigits: 2 })}

Spending by Category:
${Object.entries(context.categoryBreakdown)
  .sort(([, a], [, b]) => b - a)
  .map(([k, v]) => `  - ${k}: AED ${Number(v).toLocaleString("en-US", { minimumFractionDigits: 2 })}`)
  .join("\n")}

Monthly Breakdown:
${Object.entries(context.monthlyBreakdown)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([month, d]) => `  - ${month}: Income AED ${Number(d.income).toLocaleString("en-US", { minimumFractionDigits: 2 })} | Spending AED ${Number(d.spending).toLocaleString("en-US", { minimumFractionDigits: 2 })}`)
  .join("\n")}

Most Recent Transactions (up to 20):
${context.recentTransactions
  .map(t => `  - ${t.date}: ${t.description} [${t.category}] — ${t.amount > 0 ? "+" : ""}AED ${Math.abs(t.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`)
  .join("\n")}
`
      : "The user has not loaded any transaction data yet. Encourage them to upload a bank CSV statement to get started.";

    const systemPrompt = `You are Finacle AI — a sharp, direct personal finance advisor for a UAE-based user.

Rules:
- Ground every answer in the financial data provided below. Never invent numbers.
- Be concise: 2–4 sentences for simple questions, bullet points for breakdowns.
- Skip filler phrases like "Great question!" or "Certainly!". Get straight to the point.
- Primary currency is AED. Format as "AED X,XXX.XX".
- If data doesn't cover the question, say exactly what's missing.
- Offer one concrete, actionable tip per response when appropriate.

${contextBlock}`;

    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...history.map(m => ({ role: m.role, content: m.content })),
        { role: "user", content: message },
      ],
      stream: true,
      temperature: 0.4,
      max_tokens: 500,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) controller.enqueue(encoder.encode(text));
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Failed to get response: " + error.message }, { status: 500 });
  }
}
