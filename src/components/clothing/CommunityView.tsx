"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Send, Plus, Loader2, X, ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

type Post = {
  id: string;
  authorName: string;
  authorAvatar: string | null;
  image: string;
  caption: string;
  likes: number;
  createdAt: string;
  comments: { id: string; authorName: string; body: string; createdAt: string }[];
  product: { name: string; slug: string; images: string[] } | null;
};

export function CommunityView() {
  const { data: session } = useSession();
  const { openProduct, setView } = useStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState({ image: "", caption: "" });
  const [submitting, setSubmitting] = useState(false);
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const fetchPosts = () => {
    fetch("/api/style-posts")
      .then((r) => { if (!r.ok) throw new Error("API failed"); return r.json(); })
      .then((data) => setPosts(data.posts || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPosts(); }, []);

  const submitPost = async () => {
    if (!newPost.image.trim() || !newPost.caption.trim()) {
      toast.error("Please add an image URL and caption");
      return;
    }
    if (!session?.user) {
      toast.error("Please sign in to post");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/style-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Posted to the community!");
      setNewPost({ image: "", caption: "" });
      setPostDialogOpen(false);
      fetchPosts();
    } catch {
      toast.error("Failed to post");
    } finally {
      setSubmitting(false);
    }
  };

  const likePost = async (id: string) => {
    if (likedPosts.has(id)) return;
    setLikedPosts((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/style-posts/${id}/like`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setPosts((prev) => prev.map((p) => p.id === id ? { ...p, likes: data.likes } : p));
      }
    } catch {}
  };

  const submitComment = async (postId: string) => {
    const text = commentTexts[postId]?.trim();
    if (!text || !session?.user) return;
    try {
      const res = await fetch(`/api/style-posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Comment posted!");
      setCommentTexts({ ...commentTexts, [postId]: "" });
      fetchPosts();
    } catch {
      toast.error("Failed to comment");
    }
  };

  const toggleComments = (id: string) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-10 py-10 lg:py-14">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex items-center justify-between flex-wrap gap-4"
      >
        <div>
          <p className="text-[11px] tracking-luxe uppercase text-accent mb-3">
            #MAISONCommunity
          </p>
          <h1 className="font-serif text-4xl lg:text-5xl">Style Feed</h1>
          <p className="text-muted-foreground mt-2 max-w-md">
            Real people, real style. Share your looks, discover inspiration, and shop the community.
          </p>
        </div>
        <Dialog open={postDialogOpen} onOpenChange={setPostDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-sm">
              <Plus className="h-4 w-4 mr-2" />
              Share Your Look
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Share Your Look</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-xs mb-1.5 block">Photo URL</label>
                <Input
                  value={newPost.image}
                  onChange={(e) => setNewPost({ ...newPost, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="rounded-sm"
                />
                {newPost.image && (
                  <img src={newPost.image} alt="Preview" className="w-full aspect-square object-cover rounded-sm mt-2" />
                )}
              </div>
              <div>
                <label className="text-xs mb-1.5 block">Caption</label>
                <Textarea
                  value={newPost.caption}
                  onChange={(e) => setNewPost({ ...newPost, caption: e.target.value })}
                  placeholder="Loving this coat for the Florence winter..."
                  className="rounded-sm min-h-[80px]"
                />
              </div>
              <Button onClick={submitPost} disabled={submitting} className="w-full rounded-sm">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post to Community"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Posts grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-sm">
          <Heart className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-serif text-xl">No posts yet</p>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            Be the first to share your style with the community.
          </p>
          <Button
            onClick={() => {
              if (!session?.user) {
                toast.error("Please sign in to post");
                return;
              }
              setPostDialogOpen(true);
            }}
            className="rounded-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Share Your Look
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="border border-border rounded-sm overflow-hidden bg-card"
            >
              {/* Author */}
              <div className="flex items-center gap-3 p-3">
                {post.authorAvatar ? (
                  <img src={post.authorAvatar} alt={post.authorName} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center">
                    <span className="text-xs font-medium text-accent">{post.authorName[0]}</span>
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">{post.authorName}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>

              {/* Image */}
              <div className="relative aspect-square overflow-hidden">
                <img src={post.image} alt={post.caption} className="w-full h-full object-cover" />
                {post.product && (
                  <button
                    onClick={() => openProduct(post.product!.slug)}
                    className="absolute bottom-2 right-2 bg-background/90 backdrop-blur px-3 py-1.5 rounded-sm text-xs font-medium hover:bg-background transition-colors flex items-center gap-1.5"
                  >
                    <img src={post.product.images[0]} alt="" className="w-6 h-6 rounded object-cover" />
                    {post.product.name}
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Actions */}
              <div className="p-3">
                <div className="flex items-center gap-4 mb-2">
                  <button
                    onClick={() => likePost(post.id)}
                    className={cn("flex items-center gap-1.5 text-sm transition-colors", likedPosts.has(post.id) && "text-accent")}
                  >
                    <Heart className={cn("h-4 w-4", likedPosts.has(post.id) && "fill-current")} />
                    {post.likes}
                  </button>
                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {post.comments.length}
                  </button>
                </div>

                {/* Caption */}
                <p className="text-sm">
                  <span className="font-medium">{post.authorName}</span>{" "}
                  {post.caption}
                </p>

                {/* Comments */}
                {expandedComments.has(post.id) && post.comments.length > 0 && (
                  <div className="mt-3 space-y-2 border-t border-border pt-3">
                    {post.comments.map((c) => (
                      <div key={c.id} className="text-sm">
                        <span className="font-medium">{c.authorName}</span> {c.body}
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment input */}
                {session?.user && (
                  <div className="flex gap-2 mt-3">
                    <Input
                      value={commentTexts[post.id] || ""}
                      onChange={(e) => setCommentTexts({ ...commentTexts, [post.id]: e.target.value })}
                      onKeyDown={(e) => { if (e.key === "Enter") submitComment(post.id); }}
                      placeholder="Add a comment..."
                      className="rounded-sm h-8 text-xs"
                    />
                    <Button size="sm" onClick={() => submitComment(post.id)} disabled={!commentTexts[post.id]?.trim()} className="rounded-sm h-8 w-8 p-0 shrink-0">
                      <Send className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
