"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ImageUploader({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        onChange([...images, data.url]);
      }
      toast.success(`${files.length} image${files.length > 1 ? "s" : ""} uploaded`);
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const addUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    if (!url.match(/^https?:\/\/.+/)) {
      toast.error("Enter a valid URL (https://...)");
      return;
    }
    onChange([...images, url]);
    setUrlInput("");
  };

  const removeImage = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-3">
      {/* Uploaded images */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {images.map((img, i) => (
            <div key={i} className="relative group">
              <img
                src={img}
                alt={`Product image ${i + 1}`}
                className="w-full aspect-square object-cover rounded-sm border border-border"
              />
              <button
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
              <span className="absolute bottom-1 left-1 text-[9px] bg-background/80 px-1.5 py-0.5 rounded">
                {i === 0 ? "Main" : `#${i + 1}`}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); }}
        onDrop={(e) => {
          e.preventDefault();
          handleFile(e.dataTransfer.files);
        }}
        className={cn(
          "border-2 border-dashed border-border rounded-sm p-6 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-all",
          uploading && "opacity-50 pointer-events-none"
        )}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading...
          </div>
        ) : (
          <>
            <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium">Click or drag images here</p>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG, WebP, GIF · Max 5MB each
            </p>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={(e) => handleFile(e.target.files)}
          className="hidden"
        />
      </div>

      {/* URL fallback */}
      <div className="flex gap-2">
        <Input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUrl(); } }}
          placeholder="Or paste an image URL..."
          className="rounded-sm text-xs"
        />
        <Button type="button" variant="outline" size="sm" onClick={addUrl} className="rounded-sm shrink-0">
          <Link2 className="h-3.5 w-3.5 mr-1" />
          Add URL
        </Button>
      </div>
    </div>
  );
}
