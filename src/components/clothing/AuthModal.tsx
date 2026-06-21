"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Mode = "signin" | "signup";

export function AuthModal({
  open,
  onClose,
  initialMode = "signin",
}: {
  open: boolean;
  onClose: () => void;
  initialMode?: Mode;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        // Register
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Registration failed");
        }
        toast.success("Account created!", {
          description: "Welcome to MAISON ÉLÉGANCE. You've earned 100 bonus points.",
        });
      }

      // Sign in (works for both modes)
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Invalid email or password");
      }

      toast.success(
        mode === "signup" ? "Welcome to the Maison" : "Welcome back"
      );
      onClose();
      // Reload to refresh server session
      setTimeout(() => window.location.reload(), 500);
    } catch (e: any) {
      toast.error(e.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setForm({
      name: "Isabella Laurent",
      email: "isabella.laurent@example.com",
      password: "demo1234",
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="bg-background rounded-sm w-full max-w-md shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground p-6 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-primary-foreground/10 flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
              <p className="text-[10px] tracking-luxe uppercase text-accent mb-2">
                MAISON ÉLÉGANCE
              </p>
              <h2 className="font-serif text-2xl">
                {mode === "signin" ? "Welcome Back" : "Join the Maison"}
              </h2>
              <p className="text-sm text-primary-foreground/70 mt-1">
                {mode === "signin"
                  ? "Sign in to access your account, orders, and wishlist."
                  : "Create an account for exclusive access and 100 bonus points."}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {mode === "signup" && (
                <div>
                  <Label className="text-xs mb-1.5 block">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                      className="rounded-sm pl-10"
                    />
                  </div>
                </div>
              )}

              <div>
                <Label className="text-xs mb-1.5 block">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="rounded-sm pl-10"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs mb-1.5 block">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    required
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    placeholder="••••••••"
                    className="rounded-sm pl-10"
                    minLength={8}
                  />
                </div>
                {mode === "signup" && (
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    Min 8 characters
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-none text-sm tracking-wide-luxe uppercase"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {mode === "signin" ? "Sign In" : "Create Account"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              {/* Demo login */}
              <button
                type="button"
                onClick={fillDemo}
                className="w-full text-xs text-accent hover:underline text-center"
              >
                ✦ Use demo credentials
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-muted-foreground">
                  {mode === "signin"
                    ? "Don't have an account? "
                    : "Already have an account? "}
                  <button
                    type="button"
                    onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                    className="text-foreground font-medium hover:text-accent transition-colors"
                  >
                    {mode === "signin" ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
