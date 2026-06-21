"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Star, ThumbsUp, Loader2, MessageSquare, CheckCircle2 } from "lucide-react";
import { useProductReviews, useUserData } from "@/lib/use-user-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ProductReviews({ slug }: { slug: string }) {
  const { reviews, loading, addReview } = useProductReviews(slug);
  const { isAuthenticated } = useUserData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    rating: 5,
    title: "",
    body: "",
  });
  const [hoverRating, setHoverRating] = useState(0);

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: reviews.length
      ? (reviews.filter((r) => r.rating === star).length / reviews.length) * 100
      : 0,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.body.trim()) {
      toast.error("Please write your review");
      return;
    }
    setSubmitting(true);
    try {
      await addReview({
        rating: form.rating,
        title: form.title || undefined,
        body: form.body,
      });
      setForm({ rating: 5, title: "", body: "" });
      setDialogOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
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
    <div className="space-y-8">
      {/* Header */}
      <div className="grid lg:grid-cols-[1fr_2fr] gap-8 lg:gap-12">
        {/* Rating summary */}
        <div className="text-center lg:text-left">
          <div className="flex items-baseline gap-3 justify-center lg:justify-start">
            <span className="font-serif text-5xl">{avgRating.toFixed(1)}</span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < Math.round(avgRating)
                      ? "fill-accent text-accent"
                      : "text-muted-foreground/30"
                  )}
                />
              ))}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Based on {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </p>

          <div className="mt-6 space-y-1.5">
            {ratingDistribution.map((r) => (
              <div key={r.star} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-muted-foreground">{r.star}</span>
                <Star className="h-3 w-3 fill-accent text-accent" />
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent"
                    style={{ width: `${r.pct}%` }}
                  />
                </div>
                <span className="w-6 text-right text-muted-foreground">
                  {r.count}
                </span>
              </div>
            ))}
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="mt-6 rounded-none w-full lg:w-auto"
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.error("Please sign in to write a review");
                    return;
                  }
                }}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Write a Review
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Share Your Experience</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className="text-xs mb-2 block">Your Rating</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button
                        key={i}
                        type="button"
                        onMouseEnter={() => setHoverRating(i)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setForm({ ...form, rating: i })}
                        className="p-1"
                        aria-label={`${i} stars`}
                      >
                        <Star
                          className={cn(
                            "h-7 w-7 transition-colors",
                            i <= (hoverRating || form.rating)
                              ? "fill-accent text-accent"
                              : "text-muted-foreground/40"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">Title (optional)</Label>
                  <Input
                    placeholder="Sum up your experience"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="rounded-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">Your Review</Label>
                  <Textarea
                    placeholder="What did you love? What could be better? How does it fit? How's the quality?"
                    value={form.body}
                    onChange={(e) => setForm({ ...form, body: e.target.value })}
                    className="rounded-sm min-h-[120px]"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-sm"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Submit Review"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Review list */}
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-sm">
              <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="font-medium">No reviews yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Be the first to share your experience.
              </p>
            </div>
          ) : (
            reviews.map((review, idx) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="border-b border-border pb-6 last:border-0"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{review.authorName}</p>
                      {review.verified && (
                        <span className="inline-flex items-center gap-1 text-[10px] tracking-wide-luxe uppercase text-accent">
                          <CheckCircle2 className="h-3 w-3" />
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-3 w-3",
                            i < review.rating
                              ? "fill-accent text-accent"
                              : "text-muted-foreground/30"
                          )}
                        />
                      ))}
                      <span className="text-xs text-muted-foreground ml-2">
                        {new Date(review.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                {review.title && (
                  <p className="font-serif text-lg mt-2">{review.title}</p>
                )}
                <p className="text-muted-foreground leading-relaxed mt-1">
                  {review.body}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <button className="text-xs text-muted-foreground hover:text-accent inline-flex items-center gap-1 transition-colors">
                    <ThumbsUp className="h-3 w-3" />
                    Helpful
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
