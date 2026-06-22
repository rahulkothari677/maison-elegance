"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, RotateCcw, Loader2, Plus, Trash2, X, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Section = "heroCarousel" | "lookbook" | "exploreMaison" | "followWorld" | "atelierCircle" | "newThisSeason" | "flashSale" | "announcement";

const SECTIONS: { id: Section; label: string; description: string }[] = [
  { id: "heroCarousel", label: "Hero Carousel", description: "The main rotating banner at the top of the homepage" },
  { id: "lookbook", label: "Lookbook", description: "Editorial image grid below the hero section" },
  { id: "exploreMaison", label: "Explore the Maison", description: "Three-card section linking to brand story pages" },
  { id: "followWorld", label: "Follow Our World", description: "Instagram-style image grid" },
  { id: "atelierCircle", label: "Atelier Circle", description: "Membership / loyalty program section" },
  { id: "newThisSeason", label: "New This Season", description: "Section header for new arrivals" },
  { id: "flashSale", label: "Flash Sale", description: "Promotional sale banner with countdown" },
  { id: "announcement", label: "Announcement Bar", description: "Top-of-page announcement strip" },
];

export function ContentManagerTab() {
  const [active, setActive] = useState<Section>("heroCarousel");
  const [sections, setSections] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/site-content")
      .then((r) => r.json())
      .then((data) => {
        // Extract just the .data from each entry
        const extracted: Record<string, any> = {};
        for (const [k, v] of Object.entries(data.sections || {})) {
          extracted[k] = (v as any).data;
        }
        setSections(extracted);
      })
      .catch(() => toast.error("Failed to load content"))
      .finally(() => setLoading(false));
  }, []);

  const updateSection = (section: string, data: any) => {
    setSections({ ...sections, [section]: data });
  };

  const saveSection = async (section: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: { [section]: sections[section] } }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success(`${SECTIONS.find((s) => s.id === section)?.label} saved`);
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const resetSection = async (section: string) => {
    if (!confirm(`Reset ${SECTIONS.find((s) => s.id === section)?.label} to defaults? This will discard your changes.`)) return;
    try {
      await fetch(`/api/admin/site-content?section=${section}`, { method: "DELETE" });
      // Refetch
      const res = await fetch("/api/admin/site-content");
      const data = await res.json();
      const extracted: Record<string, any> = {};
      for (const [k, v] of Object.entries(data.sections || {})) {
        extracted[k] = (v as any).data;
      }
      setSections(extracted);
      toast.success("Reset to defaults");
    } catch {
      toast.error("Reset failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  const currentSection = SECTIONS.find((s) => s.id === active)!;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="font-serif text-3xl mb-2">Content Manager</h2>
        <p className="text-sm text-muted-foreground">
          Edit images, titles, and text across every section of your homepage. Changes are saved to your database and appear instantly on all devices.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-6">
        {/* Section list */}
        <div className="space-y-1">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={cn(
                "w-full text-left px-4 py-3 rounded-sm border transition-all",
                active === s.id
                  ? "border-accent bg-accent/5 text-accent"
                  : "border-border hover:border-accent/40 hover:bg-muted/30"
              )}
            >
              <div className="font-medium text-sm">{s.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {s.description}
              </div>
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="border border-border rounded-sm p-6 bg-background">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-serif text-xl">{currentSection.label}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{currentSection.description}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => resetSection(active)}
                disabled={saving}
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Reset
              </Button>
              <Button
                size="sm"
                onClick={() => saveSection(active)}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                )}
                Save
              </Button>
            </div>
          </div>

          {active === "heroCarousel" && (
            <HeroCarouselEditor data={sections.heroCarousel} onChange={(d) => updateSection("heroCarousel", d)} />
          )}
          {active === "lookbook" && (
            <LookbookEditor data={sections.lookbook} onChange={(d) => updateSection("lookbook", d)} />
          )}
          {active === "exploreMaison" && (
            <ExploreMaisonEditor data={sections.exploreMaison} onChange={(d) => updateSection("exploreMaison", d)} />
          )}
          {active === "followWorld" && (
            <FollowWorldEditor data={sections.followWorld} onChange={(d) => updateSection("followWorld", d)} />
          )}
          {active === "atelierCircle" && (
            <AtelierCircleEditor data={sections.atelierCircle} onChange={(d) => updateSection("atelierCircle", d)} />
          )}
          {active === "newThisSeason" && (
            <SimpleHeaderEditor data={sections.newThisSeason} onChange={(d) => updateSection("newThisSeason", d)} />
          )}
          {active === "flashSale" && (
            <FlashSaleEditor data={sections.flashSale} onChange={(d) => updateSection("flashSale", d)} />
          )}
          {active === "announcement" && (
            <AnnouncementEditor data={sections.announcement} onChange={(d) => updateSection("announcement", d)} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Reusable single image uploader ─────────────────────────────────────────

function SingleImageInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", files[0]);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onChange(data.url);
      toast.success("Image uploaded");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <Label className="text-xs mb-1.5 block">{label}</Label>
      <div className="flex items-start gap-3">
        {value && (
          <div className="relative w-24 h-24 shrink-0">
            <img src={value} alt="" className="w-full h-full object-cover rounded-sm border" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        <div className="flex-1 space-y-2">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste image URL or upload below..."
            className="text-xs"
          />
          {/* Label-wrapped file input — most reliable cross-browser approach.
              Clicking the label naturally triggers the file picker. */}
          <label
            className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-sm text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 cursor-pointer ${uploading ? "opacity-50 pointer-events-none" : ""}`}
          >
            {uploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ImagePlus className="h-3.5 w-3.5" />
            )}
            {uploading ? "Uploading..." : "Upload"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              onChange={(e) => handleFile(e.target.files)}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

// ─── Hero Carousel Editor ────────────────────────────────────────────────────

function HeroCarouselEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  // Initialize with empty slides if no data yet
  const safeData = data || { slides: [] };
  const slides = safeData.slides || [];

  const updateSlide = (i: number, patch: any) => {
    const next = [...slides];
    next[i] = { ...next[i], ...patch };
    onChange({ ...safeData, slides: next });
  };

  const addSlide = () => {
    onChange({
      ...safeData,
      slides: [
        ...slides,
        {
          image: "",
          season: "New Slide",
          title: "",
          titleAccent: "",
          description: "",
          ctaLabel: "Shop Now",
          ctaLink: "shop",
        },
      ],
    });
  };

  const removeSlide = (i: number) => {
    onChange({ ...safeData, slides: slides.filter((_, idx) => idx !== i) });
  };

  return (
    <div className="space-y-6">
      {slides.map((slide: any, i: number) => (
        <div key={i} className="border border-border rounded-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Slide {i + 1}{i === 0 && " (First shown)"}</h4>
            <Button type="button" variant="ghost" size="sm" onClick={() => removeSlide(i)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <SingleImageInput
            label="Background Image (1920px+ wide recommended)"
            value={slide.image}
            onChange={(url) => updateSlide(i, { image: url })}
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">Season Label</Label>
              <Input
                value={slide.season}
                onChange={(e) => updateSlide(i, { season: e.target.value })}
                placeholder="Autumn / Winter 2026"
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">CTA Link</Label>
              <Input
                value={slide.ctaLink}
                onChange={(e) => updateSlide(i, { ctaLink: e.target.value })}
                placeholder="shop, women, lookbook, our-story, etc."
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">Title (line 1)</Label>
              <Input
                value={slide.title}
                onChange={(e) => updateSlide(i, { title: e.target.value })}
                placeholder="The Art of"
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Title Accent (line 2)</Label>
              <Input
                value={slide.titleAccent}
                onChange={(e) => updateSlide(i, { titleAccent: e.target.value })}
                placeholder="Quiet Luxury."
              />
            </div>
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Description</Label>
            <Input
              value={slide.description}
              onChange={(e) => updateSlide(i, { description: e.target.value })}
              placeholder="Handcrafted pieces from the world's finest ateliers."
            />
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">CTA Button Label</Label>
            <Input
              value={slide.ctaLabel}
              onChange={(e) => updateSlide(i, { ctaLabel: e.target.value })}
              placeholder="Explore Collection"
            />
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={addSlide} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Slide
      </Button>
    </div>
  );
}

// ─── Lookbook Editor ─────────────────────────────────────────────────────────

function LookbookEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const safeData = data || { title: "", subtitle: "", items: [] };
  const items = safeData.items || [];

  const updateItem = (i: number, patch: any) => {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    onChange({ ...safeData, items: next });
  };

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs mb-1.5 block">Section Title</Label>
          <Input
            value={safeData.title || ""}
            onChange={(e) => onChange({ ...safeData, title: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-xs mb-1.5 block">Subtitle</Label>
          <Input
            value={safeData.subtitle || ""}
            onChange={(e) => onChange({ ...safeData, subtitle: e.target.value })}
          />
        </div>
      </div>
      {items.map((item: any, i: number) => (
        <div key={i} className="border border-border rounded-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Item {i + 1}</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange({ ...safeData, items: items.filter((_, idx) => idx !== i) })}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <SingleImageInput
            label="Image"
            value={item.image}
            onChange={(url) => updateItem(i, { image: url })}
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">Title</Label>
              <Input
                value={item.title || ""}
                onChange={(e) => updateItem(i, { title: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Subtitle</Label>
              <Input
                value={item.subtitle || ""}
                onChange={(e) => updateItem(i, { subtitle: e.target.value })}
              />
            </div>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() => onChange({ ...safeData, items: [...items, { image: "", title: "", subtitle: "" }] })}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Lookbook Item
      </Button>
    </div>
  );
}

// ─── Explore the Maison Editor ───────────────────────────────────────────────

function ExploreMaisonEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const safeData = data || { title: "", subtitle: "", items: [] };
  const items = safeData.items || [];

  const updateItem = (i: number, patch: any) => {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    onChange({ ...safeData, items: next });
  };

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs mb-1.5 block">Section Title</Label>
          <Input
            value={safeData.title || ""}
            onChange={(e) => onChange({ ...safeData, title: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-xs mb-1.5 block">Subtitle</Label>
          <Input
            value={safeData.subtitle || ""}
            onChange={(e) => onChange({ ...safeData, subtitle: e.target.value })}
          />
        </div>
      </div>
      {items.map((item: any, i: number) => (
        <div key={i} className="border border-border rounded-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Card {i + 1}</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange({ ...safeData, items: items.filter((_, idx) => idx !== i) })}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <SingleImageInput
            label="Image"
            value={item.image}
            onChange={(url) => updateItem(i, { image: url })}
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">Title</Label>
              <Input
                value={item.title || ""}
                onChange={(e) => updateItem(i, { title: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Link (page slug)</Label>
              <Input
                value={item.ctaLink || ""}
                onChange={(e) => updateItem(i, { ctaLink: e.target.value })}
                placeholder="our-story, craftsmanship, sustainability"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Description</Label>
            <Input
              value={item.description || ""}
              onChange={(e) => updateItem(i, { description: e.target.value })}
            />
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          onChange({
            ...safeData,
            items: [...items, { image: "", title: "", description: "", ctaLink: "our-story" }],
          })
        }
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Card
      </Button>
    </div>
  );
}

// ─── Follow Our World Editor ─────────────────────────────────────────────────

function FollowWorldEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const safeData = data || { title: "", subtitle: "", items: [] };
  const items = safeData.items || [];

  const updateItem = (i: number, patch: any) => {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    onChange({ ...safeData, items: next });
  };

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs mb-1.5 block">Section Title</Label>
          <Input
            value={safeData.title || ""}
            onChange={(e) => onChange({ ...safeData, title: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-xs mb-1.5 block">Subtitle (handle)</Label>
          <Input
            value={safeData.subtitle || ""}
            onChange={(e) => onChange({ ...safeData, subtitle: e.target.value })}
            placeholder="@maisonelegance"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {items.map((item: any, i: number) => (
          <div key={i} className="border border-border rounded-sm p-3 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-xs">Image {i + 1}</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange({ ...safeData, items: items.filter((_, idx) => idx !== i) })}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <SingleImageInput
              label="Image"
              value={item.image}
              onChange={(url) => updateItem(i, { image: url })}
            />
            <div>
              <Label className="text-xs mb-1 block">Caption</Label>
              <Input
                value={item.caption || ""}
                onChange={(e) => updateItem(i, { caption: e.target.value })}
                className="text-xs"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Link</Label>
              <Input
                value={item.link || ""}
                onChange={(e) => updateItem(i, { link: e.target.value })}
                className="text-xs"
                placeholder="https://..."
              />
            </div>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={() => onChange({ ...safeData, items: [...items, { image: "", caption: "", link: "#" }] })}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Image
      </Button>
    </div>
  );
}

// ─── Atelier Circle Editor ───────────────────────────────────────────────────

function AtelierCircleEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const safeData = data || {
    title: "",
    subtitle: "",
    description: "",
    image: "",
    benefits: [],
    ctaLabel: "",
  };

  const updateBenefits = (benefits: string[]) => onChange({ ...safeData, benefits });

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs mb-1.5 block">Section Title</Label>
          <Input
            value={safeData.title || ""}
            onChange={(e) => onChange({ ...safeData, title: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-xs mb-1.5 block">Subtitle</Label>
          <Input
            value={safeData.subtitle || ""}
            onChange={(e) => onChange({ ...safeData, subtitle: e.target.value })}
          />
        </div>
      </div>
      <div>
        <Label className="text-xs mb-1.5 block">Description</Label>
        <Textarea
          value={safeData.description || ""}
          onChange={(e) => onChange({ ...safeData, description: e.target.value })}
          rows={3}
        />
      </div>
      <SingleImageInput
        label="Background Image"
        value={safeData.image || ""}
        onChange={(url) => onChange({ ...safeData, image: url })}
      />
      <div>
        <Label className="text-xs mb-1.5 block">CTA Button Label</Label>
        <Input
          value={safeData.ctaLabel || ""}
          onChange={(e) => onChange({ ...safeData, ctaLabel: e.target.value })}
        />
      </div>
      <div>
        <Label className="text-xs mb-1.5 block">Member Benefits (one per line)</Label>
        <Textarea
          value={(safeData.benefits || []).join("\n")}
          onChange={(e) =>
            updateBenefits(e.target.value.split("\n").filter((s) => s.trim()))
          }
          rows={6}
          placeholder="Early access to new collections 48 hours before launch&#10;Complimentary bespoke alterations&#10;..."
        />
      </div>
    </div>
  );
}

// ─── Simple Header Editor (for New This Season) ──────────────────────────────

function SimpleHeaderEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const safeData = data || { title: "", subtitle: "" };
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs mb-1.5 block">Section Title</Label>
        <Input
          value={safeData.title || ""}
          onChange={(e) => onChange({ ...safeData, title: e.target.value })}
        />
      </div>
      <div>
        <Label className="text-xs mb-1.5 block">Subtitle</Label>
        <Input
          value={safeData.subtitle || ""}
          onChange={(e) => onChange({ ...safeData, subtitle: e.target.value })}
        />
      </div>
      <p className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-sm">
        Note: The actual products shown in this section are automatically pulled from your catalog based on the "New" badge. To change which products appear, edit the product's badge in the Products tab.
      </p>
    </div>
  );
}

// ─── Flash Sale Editor ───────────────────────────────────────────────────────

function FlashSaleEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const safeData = data || {
    title: "",
    subtitle: "",
    image: "",
    endsAt: null,
    badge: "",
    enabled: true,
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-sm">
        <Switch
          checked={safeData.enabled !== false}
          onCheckedChange={(v) => onChange({ ...safeData, enabled: v })}
        />
        <Label className="text-sm cursor-pointer">Show flash sale on homepage</Label>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs mb-1.5 block">Title</Label>
          <Input
            value={safeData.title || ""}
            onChange={(e) => onChange({ ...safeData, title: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-xs mb-1.5 block">Subtitle</Label>
          <Input
            value={safeData.subtitle || ""}
            onChange={(e) => onChange({ ...safeData, subtitle: e.target.value })}
          />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs mb-1.5 block">Badge (e.g. "40% OFF")</Label>
          <Input
            value={safeData.badge || ""}
            onChange={(e) => onChange({ ...safeData, badge: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-xs mb-1.5 block">Sale Ends At (date + time)</Label>
          <Input
            type="datetime-local"
            value={safeData.endsAt ? new Date(safeData.endsAt).toISOString().slice(0, 16) : ""}
            onChange={(e) =>
              onChange({ ...safeData, endsAt: e.target.value ? new Date(e.target.value).toISOString() : null })
            }
          />
        </div>
      </div>
      <SingleImageInput
        label="Background Image"
        value={safeData.image || ""}
        onChange={(url) => onChange({ ...safeData, image: url })}
      />
    </div>
  );
}

// ─── Announcement Bar Editor ─────────────────────────────────────────────────

function AnnouncementEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const safeData = data || {
    text: "",
    link: "",
    enabled: true,
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-sm">
        <Switch
          checked={safeData.enabled !== false}
          onCheckedChange={(v) => onChange({ ...safeData, enabled: v })}
        />
        <Label className="text-sm cursor-pointer">Show announcement bar at top of page</Label>
      </div>
      <div>
        <Label className="text-xs mb-1.5 block">Announcement Text</Label>
        <Input
          value={safeData.text || ""}
          onChange={(e) => onChange({ ...safeData, text: e.target.value })}
          placeholder="Complimentary shipping & returns worldwide — Limited time"
        />
      </div>
      <div>
        <Label className="text-xs mb-1.5 block">Link (where it goes when clicked)</Label>
        <Input
          value={safeData.link || ""}
          onChange={(e) => onChange({ ...safeData, link: e.target.value })}
          placeholder="shop, women, our-story, etc."
        />
      </div>
    </div>
  );
}
