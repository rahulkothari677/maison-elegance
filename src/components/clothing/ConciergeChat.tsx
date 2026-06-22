"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { products } from "@/lib/data";

type Message = {
  id: string;
  role: "user" | "agent";
  text: string;
  time: string;
};

const initialMessages: Message[] = [
  {
    id: "m1",
    role: "agent",
    text: "Bonjour! I'm Camille, your personal stylist at MAISON ÉLÉGANCE. Ask me anything — sizing, styling, materials, or what to wear for a specific occasion. I'm here to help you find the perfect piece.",
    time: "Just now",
  },
];

const suggestedQuestions = [
  "What should I wear to a winter wedding?",
  "Tell me about the Camille coat",
  "How does the sizing run for the Aurora dress?",
  "What's your warmest piece for Florence winters?",
];

export function ConciergeChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      text,
      time: "Just now",
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);

    try {
      const res = await fetch("/api/ai/stylist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversationHistory: messages.slice(1).map((m) => ({ role: m.role, text: m.text })),
          products: products.map((p) => ({
            name: p.name,
            price: p.price,
            shortDescription: p.shortDescription,
            colors: p.colors,
            sizes: p.sizes,
            category: p.category,
          })),
        }),
      });

      const data = await res.json();
      const agentMsg: Message = {
        id: `a-${Date.now()}`,
        role: "agent",
        text: data.reply,
        time: "Just now",
      };
      setMessages((m) => [...m, agentMsg]);
    } catch {
      const agentMsg: Message = {
        id: `a-${Date.now()}`,
        role: "agent",
        text: "I apologize, I'm having trouble connecting right now. Please try again in a moment, or browse our collection while I reconnect.",
        time: "Just now",
      };
      setMessages((m) => [...m, agentMsg]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        onClick={() => setOpen((o) => !o)}
        aria-label="Open concierge chat"
        className="fixed bottom-6 right-6 z-40 h-14 px-5 rounded-full bg-primary text-primary-foreground shadow-xl hover:shadow-2xl transition-shadow flex items-center gap-2 group"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              className="flex items-center gap-2"
            >
              <X className="h-5 w-5" />
              <span className="text-sm font-medium">Close</span>
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium hidden sm:inline">
                Ask Camille AI
              </span>
              <span className="text-sm font-medium sm:hidden">AI</span>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-6 z-40 w-[calc(100vw-3rem)] sm:w-[400px] h-[560px] bg-background border border-border rounded-sm shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground p-5 flex items-center gap-3">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&q=80"
                  alt="Camille"
                  className="w-10 h-10 rounded-full object-cover border-2 border-accent"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-primary" />
              </div>
              <div className="flex-1">
                <p className="font-serif text-base">Camille Dubois</p>
                <p className="text-[11px] text-primary-foreground/70 flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5 text-accent" />
                  AI Stylist · Powered by Z.ai
                </p>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-secondary/20"
            >
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex",
                    m.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] px-4 py-2.5 rounded-sm text-sm whitespace-pre-wrap",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background border border-border"
                    )}
                  >
                    {m.text}
                  </div>
                </motion.div>
              ))}

              {typing && (
                <div className="flex justify-start">
                  <div className="bg-background border border-border px-4 py-3 rounded-sm">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                          className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Suggested questions */}
              {messages.length === 1 && (
                <div className="space-y-1.5 pt-2">
                  <p className="text-[11px] text-muted-foreground px-1">
                    Try asking:
                  </p>
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      className="block w-full text-left text-xs px-3 py-2 bg-background border border-border rounded-sm hover:border-accent hover:text-accent transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="p-3 border-t border-border flex gap-2 bg-background"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Camille anything..."
                className="rounded-sm h-10"
              />
              <Button
                type="submit"
                size="icon"
                className="rounded-sm h-10 w-10 shrink-0"
                aria-label="Send"
                disabled={!input.trim() || typing}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
