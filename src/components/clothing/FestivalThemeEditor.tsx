"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Save, RotateCcw, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { FestivalThemeSettings, SpinWheelSegment } from "@/lib/festival-themes";
import { clonePresetSettings, FESTIVAL_PRESETS } from "@/lib/festival-themes";

type EditorProps = {
  themeName: string;
  initialSettings: FestivalThemeSettings;
  onSave: (settings: FestivalThemeSettings) => Promise<void>;
  onActivate?: () => Promise<void>;
  isActive?: boolean;
};

const COLOR_FIELDS: { key: string; label: string }[] = [
  { key: "background", label: "Background" },
  { key: "foreground", label: "Foreground (text)" },
  { key: "primary", label: "Primary (buttons)" },
  { key: "primaryForeground", label: "Primary Text" },
  { key: "accent", label: "Accent (gold/highlights)" },
  { key: "accentForeground", label: "Accent Text" },
  { key: "secondary", label: "Secondary" },
  { key: "muted", label: "Muted" },
  { key: "border", label: "Border" },
  { key: "destructive", label: "Destructive (red)" },
];

const PARTICLE_PRESETS: Record<string, { label: string; emoji: string }> = {
  "black-friday": { label: "Red Sparks", emoji: "⚡" },
  "diwali": { label: "Golden Sparkles", emoji: "✨" },
  "christmas": { label: "Snowflakes", emoji: "❄️" },
  "valentine": { label: "Hearts", emoji: "💕" },
  "end-of-season": { label: "Autumn Leaves", emoji: "🍂" },
  "new-year": { label: "Fireworks", emoji: "🎆" },
  "custom": { label: "Sparks", emoji: "✨" },
};

export function FestivalThemeEditor({ themeName, initialSettings, onSave, onActivate, isActive }: EditorProps) {
  const [settings, setSettings] = useState<FestivalThemeSettings>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"banner" | "colors" | "features" | "particles" | "wheel" | "marquee">("banner");

  const update = (path: string, value: any) => {
    setSettings((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = obj[keys[i]] || {};
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(settings);
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    const fresh = clonePresetSettings(themeName);
    if (fresh) {
      setSettings(fresh);
      toast.success("Reset to defaults");
    }
  };

  const tabs = [
    { id: "banner", label: "Banner" },
    { id: "colors", label: "Colors" },
    { id: "features", label: "Features" },
    { id: "particles", label: "Particles" },
    { id: "wheel", label: "Spin Wheel" },
    { id: "marquee", label: "Marquee" },
  ] as const;

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              "px-4 py-2 text-sm tracking-wide-luxe uppercase border-b-2 transition-colors whitespace-nowrap",
              activeTab === t.id
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* BANNER TAB */}
      {activeTab === "banner" && (
        <div className="space-y-4">
          <div>
            <Label className="text-xs mb-1.5 block">Sale Title</Label>
            <Input
              value={settings.banner.title}
              onChange={(e) => update("banner.title", e.target.value)}
              placeholder="BLACK FRIDAY"
            />
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Subtitle</Label>
            <Input
              value={settings.banner.subtitle}
              onChange={(e) => update("banner.subtitle", e.target.value)}
              placeholder="The biggest sale of the year — up to 60% off"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">Discount Badge</Label>
              <Input
                value={settings.banner.discountBadge}
                onChange={(e) => update("banner.discountBadge", e.target.value)}
                placeholder="UP TO 60% OFF"
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">CTA Button Text</Label>
              <Input
                value={settings.banner.ctaText}
                onChange={(e) => update("banner.ctaText", e.target.value)}
                placeholder="Shop the Sale"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">CTA Link (where button goes)</Label>
            <Input
              value={settings.banner.ctaLink}
              onChange={(e) => update("banner.ctaLink", e.target.value)}
              placeholder="shop, women, men, etc."
            />
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Banner Background (CSS)</Label>
            <Textarea
              value={settings.banner.backgroundCss}
              onChange={(e) => update("banner.backgroundCss", e.target.value)}
              rows={2}
              placeholder="linear-gradient(90deg, #000 0%, #FF1744 50%, #000 100%)"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Use any valid CSS background: gradients, solid colors, etc.
            </p>
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Text Color</Label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={settings.banner.textColor}
                onChange={(e) => update("banner.textColor", e.target.value)}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <Input
                value={settings.banner.textColor}
                onChange={(e) => update("banner.textColor", e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={settings.banner.pulseAnimation}
                onCheckedChange={(v) => update("banner.pulseAnimation", v)}
              />
              Pulse animation
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={settings.banner.showCountdown}
                onCheckedChange={(v) => update("banner.showCountdown", v)}
              />
              Show countdown
            </label>
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Corner Radius</Label>
            <Slider
              value={[parseFloat(settings.radius) * 16]}
              onValueChange={(v) => update("radius", `${v[0] / 16}rem`)}
              min={0}
              max={8}
              step={0.5}
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Sharp (0) = urgency, Rounded (8) = soft/romantic
            </p>
          </div>
        </div>
      )}

      {/* COLORS TAB */}
      {activeTab === "colors" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground mb-3">
            Colors use OKLCH format for wide-gamut support. You can paste any CSS color value.
          </p>
          {COLOR_FIELDS.map((field) => (
            <div key={field.key}>
              <Label className="text-xs mb-1 block">{field.label}</Label>
              <Input
                value={(settings.colors as any)[field.key]}
                onChange={(e) => update(`colors.${field.key}`, e.target.value)}
                className="text-xs font-mono"
              />
            </div>
          ))}
          {/* Quick color presets */}
          <div className="pt-3 border-t border-border">
            <Label className="text-xs mb-2 block">Quick Color Presets</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(FESTIVAL_PRESETS).map(([name, preset]) => (
                <button
                  key={name}
                  onClick={() => {
                    setSettings((prev) => ({
                      ...prev,
                      colors: { ...preset.settings.colors },
                    }));
                    toast.success(`Applied ${preset.label} colors`);
                  }}
                  className="flex items-center gap-1.5 px-2 py-1.5 border border-border rounded-sm text-xs hover:border-accent"
                >
                  <div className="flex">
                    <div className="w-4 h-4" style={{ background: preset.settings.colors.background }} />
                    <div className="w-4 h-4" style={{ background: preset.settings.colors.primary }} />
                    <div className="w-4 h-4" style={{ background: preset.settings.colors.accent }} />
                  </div>
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FEATURES TAB */}
      {activeTab === "features" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground mb-3">
            Toggle each festival effect on or off. Disabled effects won't show to customers.
          </p>
          {[
            { key: "confetti", label: "Confetti Burst", desc: "Colorful confetti when festival activates" },
            { key: "spinWheel", label: "Spin & Win Wheel", desc: "Popup wheel with coupon codes" },
            { key: "particles", label: "Particle Effects", desc: "Snow, sparks, hearts, etc. overlay" },
            { key: "sounds", label: "Festive Music", desc: "Speaker button for ambient music" },
            { key: "tilt", label: "3D Tilt on Products", desc: "Cards tilt in 3D on hover" },
            { key: "marquee", label: "Scrolling Marquee", desc: "Messages scrolling below banner" },
            { key: "saleStamps", label: "Sale Stamps", desc: "Floating X% OFF stamps on products" },
          ].map((f) => (
            <div
              key={f.key}
              className="flex items-center justify-between p-3 border border-border rounded-sm"
            >
              <div>
                <p className="text-sm font-medium">{f.label}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
              <Switch
                checked={(settings.features as any)?.[f.key] !== false}
                onCheckedChange={(v) => update(`features.${f.key}`, v)}
              />
            </div>
          ))}
        </div>
      )}

      {/* PARTICLES TAB */}
      {activeTab === "particles" && (
        <div className="space-y-4">
          <div>
            <Label className="text-xs mb-1.5 block">
              Particle Count: {settings.particleConfig?.count || 30}
            </Label>
            <Slider
              value={[settings.particleConfig?.count || 30]}
              onValueChange={(v) => update("particleConfig.count", v[0])}
              min={5}
              max={60}
              step={5}
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              More particles = more festive but may affect performance on older devices
            </p>
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">
              Animation Duration: {settings.particleConfig?.duration || 10}s per particle
            </Label>
            <Slider
              value={[settings.particleConfig?.duration || 10]}
              onValueChange={(v) => update("particleConfig.duration", v[0])}
              min={3}
              max={30}
              step={1}
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Shorter = faster movement, Longer = slower/gentler
            </p>
          </div>
          <div className="p-3 bg-muted/30 rounded-sm">
            <p className="text-xs font-medium mb-1">Particle Type (based on theme)</p>
            <p className="text-xs text-muted-foreground">
              {PARTICLE_PRESETS[themeName]?.emoji} {PARTICLE_PRESETS[themeName]?.label || "Sparks"}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Each theme has its own particle style. Change the theme to change particle type.
            </p>
          </div>
        </div>
      )}

      {/* SPIN WHEEL TAB */}
      {activeTab === "wheel" && (
        <div className="space-y-4">
          <div>
            <Label className="text-xs mb-1.5 block">Wheel Title</Label>
            <Input
              value={settings.spinWheelConfig?.title || ""}
              onChange={(e) => update("spinWheelConfig.title", e.target.value)}
              placeholder="Spin & Win!"
            />
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Wheel Subtitle</Label>
            <Input
              value={settings.spinWheelConfig?.subtitle || ""}
              onChange={(e) => update("spinWheelConfig.subtitle", e.target.value)}
              placeholder="One free spin — win an exclusive coupon code"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Switch
              checked={settings.spinWheelConfig?.spinOncePerDay !== false}
              onCheckedChange={(v) => update("spinWheelConfig.spinOncePerDay", v)}
            />
            Limit to 1 spin per day per user
          </label>

          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium">Wheel Segments (prizes)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const segments = [...(settings.spinWheelConfig?.segments || [])];
                  segments.push({
                    label: "NEW PRIZE",
                    code: "NEWCODE",
                    color: "#9333ea",
                    probability: 10,
                  });
                  update("spinWheelConfig.segments", segments);
                }}
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Segment
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Set the label, coupon code, color, and win probability for each segment.
              Higher probability = more likely to win that prize.
            </p>
            <div className="space-y-2">
              {(settings.spinWheelConfig?.segments || []).map((seg: SpinWheelSegment, i: number) => (
                <div key={i} className="flex items-center gap-2 p-2 border border-border rounded-sm">
                  <input
                    type="color"
                    value={seg.color}
                    onChange={(e) => {
                      const segments = [...(settings.spinWheelConfig?.segments || [])];
                      segments[i] = { ...seg, color: e.target.value };
                      update("spinWheelConfig.segments", segments);
                    }}
                    className="w-8 h-8 rounded cursor-pointer shrink-0"
                  />
                  <Input
                    value={seg.label}
                    onChange={(e) => {
                      const segments = [...(settings.spinWheelConfig?.segments || [])];
                      segments[i] = { ...seg, label: e.target.value };
                      update("spinWheelConfig.segments", segments);
                    }}
                    placeholder="10% OFF"
                    className="text-xs flex-1"
                  />
                  <Input
                    value={seg.code}
                    onChange={(e) => {
                      const segments = [...(settings.spinWheelConfig?.segments || [])];
                      segments[i] = { ...seg, code: e.target.value };
                      update("spinWheelConfig.segments", segments);
                    }}
                    placeholder="SAVE10"
                    className="text-xs flex-1 font-mono"
                  />
                  <Input
                    type="number"
                    value={seg.probability}
                    onChange={(e) => {
                      const segments = [...(settings.spinWheelConfig?.segments || [])];
                      segments[i] = { ...seg, probability: parseInt(e.target.value) || 0 };
                      update("spinWheelConfig.segments", segments);
                    }}
                    placeholder="10"
                    className="text-xs w-16"
                  />
                  <span className="text-[10px] text-muted-foreground">%</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const segments = (settings.spinWheelConfig?.segments || []).filter((_, idx) => idx !== i);
                      update("spinWheelConfig.segments", segments);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Total probability weight:{" "}
              {(settings.spinWheelConfig?.segments || []).reduce((sum: number, s: SpinWheelSegment) => sum + s.probability, 0)}
            </p>
          </div>
        </div>
      )}

      {/* MARQUEE TAB */}
      {activeTab === "marquee" && (
        <div className="space-y-4">
          <div>
            <Label className="text-xs mb-1.5 block">
              Scroll Speed: {settings.marqueeConfig?.speed || 20}s per loop
            </Label>
            <Slider
              value={[settings.marqueeConfig?.speed || 20]}
              onValueChange={(v) => update("marqueeConfig.speed", v[0])}
              min={10}
              max={60}
              step={5}
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Lower = faster scroll, Higher = slower
            </p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs">Marquee Messages (one per line)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const msgs = [...(settings.marqueeConfig?.messages || []), "NEW MESSAGE"];
                  update("marqueeConfig.messages", msgs);
                }}
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add
              </Button>
            </div>
            <Textarea
              value={(settings.marqueeConfig?.messages || []).join("\n")}
              onChange={(e) => {
                const msgs = e.target.value.split("\n").filter((s) => s.trim());
                update("marqueeConfig.messages", msgs);
              }}
              rows={8}
              placeholder={"🔥 BLACK FRIDAY MEGA SALE\nUP TO 60% OFF\nUSE CODE: BLACK60"}
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              These messages scroll continuously below the main banner
            </p>
          </div>
        </div>
      )}

      {/* Save / Activate bar */}
      <div className="sticky bottom-0 bg-background border-t border-border pt-3 pb-2 flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={reset} disabled={saving}>
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reset
        </Button>
        <div className="flex-1" />
        {onActivate && !isActive && (
          <Button type="button" variant="default" size="sm" onClick={onActivate} disabled={saving}>
            <Eye className="h-3.5 w-3.5 mr-1.5" /> Save & Activate
          </Button>
        )}
        <Button type="button" size="sm" onClick={handleSave} disabled={saving}>
          <Save className="h-3.5 w-3.5 mr-1.5" /> {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
