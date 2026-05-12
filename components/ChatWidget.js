"use client";

import { useState } from "react";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your Finacle AI Advisor. How can I help you optimize your finances today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e) => {
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    
    // Check if moved enough to be considered a drag
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      setIsDragging(true);
      setPos(p => ({ x: p.x + e.movementX, y: p.y + e.movementY }));
    }
  };

  const handlePointerUp = (e) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (!isDragging) {
      setIsOpen(true);
    }
    // Small delay to prevent click event if we were dragging
    setTimeout(() => setIsDragging(false), 50);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Based on your recent transactions, your spending in 'Food' is 15% higher than last month. Consider cooking more meals at home to stay within your $600 target." 
      }]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }}
        className={`fixed bottom-20 sm:bottom-6 right-4 sm:right-6 p-4 rounded-2xl border border-indigo-500/50 bg-gradient-to-br from-indigo-600 to-indigo-900 text-white shadow-[0_4px_24px_rgba(99,102,241,0.5)] hover:scale-105 hover:shadow-[0_4px_32px_rgba(99,102,241,0.7)] transition-[transform,opacity,scale] z-50 overflow-hidden group touch-none ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'} ${isDragging ? 'cursor-grabbing transition-none' : 'cursor-grab'}`}
        aria-label="Open AI Advisor Chat"
      >
        <div className="shimmer-overlay shimmer-overlay-indigo pointer-events-none"></div>
        <MessageSquare size={24} className="relative z-10 pointer-events-none" />
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-20 sm:bottom-6 right-4 left-4 sm:left-auto sm:right-6 sm:w-80 md:w-96 max-h-[600px] h-[75dvh] border border-indigo-500/50 bg-gradient-to-br from-slate-900/95 to-slate-950/95 backdrop-blur-xl shadow-[0_4px_40px_rgba(0,0,0,0.5)] rounded-2xl flex flex-col z-50 transition-all duration-300 transform sm:origin-bottom-right overflow-hidden ${isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 sm:translate-y-0 sm:scale-50 opacity-0 pointer-events-none'}`}
      >
        <div className="shimmer-overlay shimmer-overlay-indigo opacity-20 pointer-events-none"></div>
        
        {/* Header */}
        <div className="relative z-10 flex items-center justify-between p-4 border-b border-slate-800 bg-white/5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Bot size={20} />
            </div>
            <h3 className="font-semibold text-white">AI Advisor</h3>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-slate-800 rounded-md transition-colors text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-2 max-w-[85%] sm:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-lg' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-3 text-sm ${msg.role === 'user' ? 'bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-2xl rounded-tr-sm shadow-lg' : 'bg-slate-800/80 text-slate-200 rounded-2xl rounded-tl-sm border border-slate-700'}`}>
                  <p className="leading-relaxed">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-2 max-w-[80%]">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-[var(--color-accent-positive)]/20 text-[var(--color-accent-positive)]">
                  <Bot size={16} />
                </div>
                <div className="p-3 rounded-2xl bg-[var(--color-card-border)]/50 text-[var(--color-foreground)] rounded-tl-sm flex items-center gap-1">
                  <div className="w-2 h-2 bg-[var(--color-foreground)]/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-[var(--color-foreground)]/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-[var(--color-foreground)]/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 border-t border-[var(--color-card-border)] bg-[var(--color-background)]/50 rounded-b-2xl">
          <div className="flex items-center gap-2 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your finances..."
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
