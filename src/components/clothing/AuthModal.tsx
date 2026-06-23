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

  // Demo credential shortcut removed for security
  // Admin access is now protected — users must know the admin email + password

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
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => {
                      const email = prompt("Enter your email to receive a password reset link:");
                      if (email) {
                        fetch("/api/auth/forgot-password", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ email }),
                        })
                          .then((r) => r.json())
                          .then((data) => {
                            toast.success(data.message || "Password reset link sent to your email");
                          })
                          .catch(() => toast.error("Failed to send reset link"));
                      }
                    }}
                    className="text-[11px] text-accent hover:underline mt-1.5 block text-right ml-auto"
                  >
                    Forgot password?
                  </button>
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

              {/* Social login */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-3 text-xs text-muted-foreground">
                    or continue with
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "google", label: "Google", icon: "🔍" },
                  { id: "facebook", label: "Facebook", icon: "📘" },
                  { id: "apple", label: "Apple", icon: "" },
                ].map((provider) => (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => {
                      signIn(provider.id, { callbackUrl: "/" });
                    }}
                    className="h-11 border border-border rounded-sm flex items-center justify-center gap-1.5 hover:bg-muted transition-colors text-sm"
                  >
                    {provider.id === "apple" ? (
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                      </svg>
                    ) : (
                      <span className="text-base">{provider.icon}</span>
                    )}
                    <span className="hidden sm:inline text-xs">{provider.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground text-center">
                Social login requires API keys (see README for setup)
              </p>

              {/* Demo login removed for security — admin access protected */}

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
