"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";

export function ChatWidget({ txList = [], currency = "AED" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your Finacle AI Advisor. Ask me anything about your spending, income, or financial trends." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  // Build a summarised context from txList so we don't send hundreds of raw rows
  const txSummary = useMemo(() => {
    if (!txList.length) return null;

    const expenses = txList.filter(t => Number(t.amount) < 0);
    const incomes  = txList.filter(t => Number(t.amount) > 0);

    const totalIncome   = incomes.reduce((s, t) => s + Number(t.amount), 0);
    const totalSpending = Math.abs(expenses.reduce((s, t) => s + Number(t.amount), 0));

    const categoryBreakdown = {};
    expenses.forEach(t => {
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + Math.abs(Number(t.amount));
    });

    const monthlyBreakdown = {};
    txList.forEach(t => {
      const [y, m] = t.date.split("-");
      const key = `${y}-${m}`;
      if (!monthlyBreakdown[key]) monthlyBreakdown[key] = { income: 0, spending: 0 };
      if (Number(t.amount) > 0) monthlyBreakdown[key].income   += Number(t.amount);
      else                      monthlyBreakdown[key].spending += Math.abs(Number(t.amount));
    });

    return {
      totalIncome,
      totalSpending,
      netBalance: totalIncome - totalSpending,
      categoryBreakdown,
      monthlyBreakdown,
      recentTransactions: txList.slice(0, 20).map(t => ({
        date: t.date,
        description: t.description,
        category: t.category,
        amount: Number(t.amount),
      })),
      dateRange: `${txList[txList.length - 1]?.date} to ${txList[0]?.date}`,
      transactionCount: txList.length,
    };
  }, [txList]);

  // Drag-to-reposition logic
  const handlePointerDown = (e) => {
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      setIsDragging(true);
      setPos(p => ({ x: p.x + e.movementX, y: p.y + e.movementY }));
    }
  };

  const handlePointerUp = (e) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (!isDragging) setIsOpen(true);
    setTimeout(() => setIsDragging(false), 50);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userContent = input.trim();
    // History sent to API: all messages except the initial greeting
    const historyToSend = messages.slice(1);

    setMessages(prev => [...prev, { role: "user", content: userContent }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userContent, history: historyToSend, context: txSummary }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Server error");
      }

      // Add empty assistant message then stream into it
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: updated[updated.length - 1].content + chunk,
          };
          return updated;
        });
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I ran into an issue. Please try again.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const isStreamingLastMessage =
    isLoading &&
    messages.length > 0 &&
    messages[messages.length - 1].role === "assistant";

  return (
    <>
      {/* Floating toggle button */}
      <button
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }}
        className={`fixed bottom-20 sm:bottom-6 right-4 sm:right-6 p-4 rounded-2xl border border-indigo-500/50 bg-gradient-to-br from-indigo-600 to-indigo-900 text-white shadow-[0_4px_24px_rgba(99,102,241,0.5)] hover:scale-105 hover:shadow-[0_4px_32px_rgba(99,102,241,0.7)] transition-[transform,opacity,scale] z-50 overflow-hidden group touch-none ${isOpen ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100"} ${isDragging ? "cursor-grabbing transition-none" : "cursor-grab"}`}
        aria-label="Open AI Advisor Chat"
      >
        <div className="shimmer-overlay shimmer-overlay-indigo pointer-events-none"></div>
        <MessageSquare size={24} className="relative z-10 pointer-events-none" />
      </button>

      {/* Chat window */}
      <div
        className={`fixed bottom-20 sm:bottom-6 right-4 left-4 sm:left-auto sm:right-6 sm:w-80 md:w-96 max-h-[600px] h-[75dvh] border border-indigo-500/20 dark:border-indigo-500/50 bg-white/95 dark:bg-gradient-to-br dark:from-slate-900/95 dark:to-slate-950/95 backdrop-blur-xl shadow-[0_4px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_40px_rgba(0,0,0,0.5)] rounded-2xl flex flex-col z-50 transition-all duration-300 transform sm:origin-bottom-right overflow-hidden ${isOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 sm:translate-y-0 sm:scale-50 opacity-0 pointer-events-none"}`}
      >
        <div className="shimmer-overlay shimmer-overlay-indigo opacity-10 dark:opacity-20 pointer-events-none"></div>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-white/5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">AI Advisor</h3>
              {txList.length > 0 && (
                <p className="text-[10px] text-emerald-500 dark:text-emerald-400 font-medium">
                  {txList.length} transactions loaded
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors text-slate-500 dark:text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => {
            const isCurrentlyStreaming = isStreamingLastMessage && i === messages.length - 1;
            const isEmpty = msg.content === "";

            return (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-2 max-w-[85%] sm:max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-lg" : "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"}`}>
                    {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`p-3 text-sm ${msg.role === "user" ? "bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-2xl rounded-tr-sm shadow-lg" : "bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-sm border border-slate-100 dark:border-slate-700"}`}>
                    {/* Typing dots while waiting for first chunk */}
                    {isCurrentlyStreaming && isEmpty ? (
                      <div className="flex items-center gap-1 py-0.5">
                        <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    ) : (
                      <p className="leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                        {/* Blinking cursor while streaming */}
                        {isCurrentlyStreaming && !isEmpty && (
                          <span className="inline-block w-[2px] h-[1em] bg-current align-middle ml-0.5 animate-pulse" />
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 border-t border-[var(--color-card-border)] bg-[var(--color-background)]/50 rounded-b-2xl">
          {!txList.length && (
            <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mb-2">
              Upload a CSV to get personalised advice
            </p>
          )}
          <div className="flex items-center gap-2 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={txList.length ? "Ask about your finances…" : "Load your data first…"}
              className="w-full bg-[var(--color-background)] text-[var(--color-foreground)] border border-[var(--color-card-border)] rounded-full pl-4 pr-12 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]/50 transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-1 p-1.5 bg-[var(--color-accent-primary)] text-white rounded-full hover:bg-[var(--color-accent-secondary)] disabled:opacity-50 disabled:hover:bg-[var(--color-accent-primary)] transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
