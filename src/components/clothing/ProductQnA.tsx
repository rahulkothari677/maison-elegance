"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Send, Loader2, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Question = {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
  answers: Answer[];
};

type Answer = {
  id: string;
  authorName: string;
  body: string;
  isVerified: boolean;
  helpful: number;
  createdAt: string;
};

export function ProductQnA({ slug }: { slug: string }) {
  const { data: session } = useSession();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expandedQ, setExpandedQ] = useState<string | null>(null);
  const [answerTexts, setAnswerTexts] = useState<Record<string, string>>({});

  const fetchQuestions = () => {
    fetch(`/api/products/${slug}/questions`)
      .then((r) => { if (!r.ok) throw new Error("API failed"); return r.json(); })
      .then((data) => setQuestions(data.questions || []))
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchQuestions(); }, [slug]);

  const askQuestion = async () => {
    if (!newQuestion.trim()) return;
    if (!session?.user) {
      toast.error("Please sign in to ask a question");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${slug}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: newQuestion }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Question posted!");
      setNewQuestion("");
      fetchQuestions();
    } catch {
      toast.error("Failed to post question");
    } finally {
      setSubmitting(false);
    }
  };

  const submitAnswer = async (questionId: string) => {
    const text = answerTexts[questionId]?.trim();
    if (!text) return;
    if (!session?.user) {
      toast.error("Please sign in to answer");
      return;
    }
    try {
      const res = await fetch(`/api/questions/${questionId}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Answer posted!");
      setAnswerTexts({ ...answerTexts, [questionId]: "" });
      fetchQuestions();
    } catch {
      toast.error("Failed to post answer");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Ask question form */}
      <div className="bg-secondary/30 p-5 rounded-sm">
        <h3 className="font-serif text-lg mb-3 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-accent" />
          Have a question?
        </h3>
        <div className="flex gap-2">
          <Input
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") askQuestion(); }}
            placeholder="e.g. Is this true to size? How warm is it?"
            className="rounded-sm"
          />
          <Button onClick={askQuestion} disabled={submitting || !newQuestion.trim()} className="rounded-sm shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {!session?.user && (
          <p className="text-xs text-muted-foreground mt-2">Sign in to ask or answer questions</p>
        )}
      </div>

      {/* Questions list */}
      {questions.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-border rounded-sm">
          <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="font-medium">No questions yet</p>
          <p className="text-sm text-muted-foreground mt-1">Be the first to ask about this piece.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="border border-border rounded-sm p-4"
            >
              {/* Question */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
                  <span className="text-xs font-medium text-accent">Q</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{q.body}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{q.authorName}</span>
                    <span className="text-xs text-muted-foreground/60">·</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(q.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    {q.answers.length > 0 && (
                      <button
                        onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)}
                        className="text-xs text-accent hover:underline ml-2"
                      >
                        {q.answers.length} {q.answers.length === 1 ? "answer" : "answers"}
                        {expandedQ === q.id ? <ChevronUp className="inline h-3 w-3 ml-0.5" /> : <ChevronDown className="inline h-3 w-3 ml-0.5" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Answers */}
              {expandedQ === q.id && q.answers.length > 0 && (
                <div className="ml-11 mt-3 space-y-3">
                  {q.answers.map((a) => (
                    <div key={a.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                        <span className="text-xs font-medium text-muted-foreground">A</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{a.body}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{a.authorName}</span>
                          {a.isVerified && (
                            <span className="inline-flex items-center gap-1 text-[10px] tracking-wide-luxe uppercase text-accent">
                              <CheckCircle2 className="h-3 w-3" /> Verified Buyer
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Answer form */}
              {session?.user && (
                <div className="ml-11 mt-3 flex gap-2">
                  <Input
                    value={answerTexts[q.id] || ""}
                    onChange={(e) => setAnswerTexts({ ...answerTexts, [q.id]: e.target.value })}
                    onKeyDown={(e) => { if (e.key === "Enter") submitAnswer(q.id); }}
                    placeholder="Answer this question..."
                    className="rounded-sm text-sm h-9"
                  />
                  <Button size="sm" onClick={() => submitAnswer(q.id)} disabled={!answerTexts[q.id]?.trim()} className="rounded-sm h-9 shrink-0">
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
