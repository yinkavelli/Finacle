"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";

export function ChatWidget({ txList = [], currency = "AED" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your Axy Folio AI Advisor. Ask me anything about your spending, income, or financial trends." }
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
        aria-label="Open AI Advisor"
        style={{
          position: "fixed", bottom: 88, right: 16,
          width: 48, height: 48,
          borderRadius: "var(--ax-radius-2)",
          background: "var(--ax-midnight)",
          border: "1px solid var(--ax-border-gold)",
          color: "var(--ax-gold)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "var(--ax-gold-glow-soft)",
          cursor: isDragging ? "grabbing" : "grab",
          zIndex: 49, touchAction: "none",
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
          opacity: isOpen ? 0 : 1,
          pointerEvents: isOpen ? "none" : "auto",
          transition: "opacity 200ms var(--ax-ease)",
        }}>
        <MessageSquare size={20} />
      </button>

      {/* Chat window */}
      <div style={{
        position: "fixed", bottom: 88, right: 12, left: 12,
        maxWidth: 400, marginLeft: "auto",
        maxHeight: 520, height: "70dvh",
        background: "var(--ax-midnight)",
        border: "1px solid var(--ax-border-gold-soft)",
        borderRadius: 12,
        boxShadow: "var(--ax-gold-glow)",
        display: "flex", flexDirection: "column",
        zIndex: 49, overflow: "hidden",
        opacity: isOpen ? 1 : 0,
        transform: isOpen ? "translateY(0) scale(1)" : "translateY(16px) scale(0.97)",
        pointerEvents: isOpen ? "auto" : "none",
        transition: "opacity 280ms var(--ax-ease), transform 280ms var(--ax-ease)",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 16px", borderBottom: "1px solid var(--ax-border)",
          background: "var(--ax-card)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "var(--ax-radius-2)",
              background: "rgba(201,165,90,0.1)", border: "1px solid var(--ax-border-gold-soft)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--ax-gold)",
            }}>
              <Bot size={16} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ax-fg)" }}>AI Advisor</div>
              {txList.length > 0 && (
                <div style={{ fontSize: 10, color: "var(--ax-gold)", letterSpacing: "0.12em" }}>
                  {txList.length} transactions loaded
                </div>
              )}
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} style={{
            background: "transparent", border: "none",
            color: "var(--ax-fg-muted)", cursor: "pointer",
          }}>
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }} className="scroll-thin">
          {messages.map((msg, i) => {
            const isCurrentlyStreaming = isStreamingLastMessage && i === messages.length - 1;
            const isEmpty = msg.content === "";
            const isUser  = msg.role === "user";
            return (
              <div key={i} style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "82%",
                  padding: "10px 14px",
                  borderRadius: isUser ? "10px 10px 2px 10px" : "10px 10px 10px 2px",
                  background: isUser ? "var(--ax-gold)" : "var(--ax-card)",
                  border: isUser ? "none" : "1px solid var(--ax-border)",
                  color: isUser ? "var(--ax-midnight)" : "var(--ax-fg)",
                  fontSize: 13, lineHeight: 1.55,
                }}>
                  {isCurrentlyStreaming && isEmpty ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 0" }}>
                      {[0, 150, 300].map(delay => (
                        <div key={delay} style={{
                          width: 6, height: 6, borderRadius: "50%",
                          background: "var(--ax-fg-muted)",
                          animation: "ax-pulse-gold 1.2s infinite",
                          animationDelay: `${delay}ms`,
                        }} />
                      ))}
                    </div>
                  ) : (
                    <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                      {msg.content}
                      {isCurrentlyStreaming && !isEmpty && (
                        <span style={{
                          display: "inline-block", width: 2, height: "1em",
                          background: "currentColor", verticalAlign: "middle",
                          marginLeft: 2, animation: "ax-pulse-gold 0.8s infinite",
                        }} />
                      )}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} style={{
          padding: "12px 14px", borderTop: "1px solid var(--ax-border)",
          display: "flex", gap: 8, alignItems: "center",
        }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={txList.length ? "Ask about your finances…" : "Load data first…"}
            style={{
              flex: 1, background: "var(--ax-card)", border: "1px solid var(--ax-border)",
              borderRadius: "var(--ax-radius-2)", padding: "10px 14px",
              color: "var(--ax-fg)", fontFamily: "var(--ax-font-body)", fontSize: 13,
              outline: "none",
            }}
          />
          <button type="submit" disabled={!input.trim() || isLoading} style={{
            width: 36, height: 36, borderRadius: "var(--ax-radius-2)",
            background: input.trim() && !isLoading ? "var(--ax-gold)" : "transparent",
            border: `1px solid ${input.trim() && !isLoading ? "var(--ax-gold)" : "var(--ax-border-strong)"}`,
            color: input.trim() && !isLoading ? "var(--ax-midnight)" : "var(--ax-fg-faint)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: input.trim() && !isLoading ? "pointer" : "default",
            flexShrink: 0, transition: "all 180ms var(--ax-ease)",
          }}>
            <Send size={14} />
          </button>
        </form>
      </div>
    </>
  );
}
