"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Zap, Power, Clock, Check, Pencil, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { FestivalThemeEditor } from "./FestivalThemeEditor";
import { FESTIVAL_PRESETS, type FestivalThemeSettings } from "@/lib/festival-themes";

type FestivalTheme = {
  name: string;
  label: string;
  description: string;
  settings: FestivalThemeSettings;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  inDb: boolean;
};

export function FestivalThemesTab() {
  const [themes, setThemes] = useState<FestivalTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [scheduling, setScheduling] = useState<string | null>(null);
  const [scheduleDates, setScheduleDates] = useState<Record<string, { start: string; end: string }>>({});

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      const res = await fetch("/api/admin/festival-themes");
      const data = await res.json();
      setThemes(data.themes || []);
      const dates: Record<string, { start: string; end: string }> = {};
      for (const t of data.themes || []) {
        if (t.startDate || t.endDate) {
          dates[t.name] = {
            start: t.startDate ? new Date(t.startDate).toISOString().slice(0, 16) : "",
            end: t.endDate ? new Date(t.endDate).toISOString().slice(0, 16) : "",
          };
        }
      }
      setScheduleDates(dates);
    } catch {
      toast.error("Failed to load festival themes");
    } finally {
      setLoading(false);
    }
  };

  const activate = async (name: string) => {
    try {
      const res = await fetch("/api/admin/festival-themes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, action: "activate" }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      toast.success(data.message);
      setThemes(themes.map((t) => ({ ...t, isActive: t.name === name })));
    } catch {
      toast.error("Failed to activate theme");
    }
  };

  const deactivate = async (name: string) => {
    try {
      const res = await fetch("/api/admin/festival-themes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, action: "deactivate" }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      toast.success(data.message);
      setThemes(themes.map((t) => ({ ...t, isActive: false })));
    } catch {
      toast.error("Failed to deactivate theme");
    }
  };

  const saveSettings = async (name: string, settings: FestivalThemeSettings): Promise<void> => {
    const res = await fetch("/api/admin/festival-themes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, action: "activate", settings }),
    });
    if (!res.ok) throw new Error("Save failed");
    const data = await res.json();
    toast.success(data.message);
    // Update local state
    setThemes(themes.map((t) =>
      t.name === name ? { ...t, settings, inDb: true } : t
    ));
  };

  const saveAndActivate = async (name: string, settings: FestivalThemeSettings): Promise<void> => {
    await saveSettings(name, settings);
    await activate(name);
  };

  const schedule = async (name: string) => {
    const dates = scheduleDates[name];
    if (!dates?.start || !dates?.end) {
      toast.error("Set both start and end dates");
      return;
    }
    setScheduling(name);
    try {
      const res = await fetch("/api/admin/festival-themes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          action: "schedule",
          startDate: dates.start,
          endDate: dates.end,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      toast.success(data.message);
    } catch {
      toast.error("Failed to schedule");
    } finally {
      setScheduling(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If editing a theme, show the full editor
  if (editing) {
    const theme = themes.find((t) => t.name === editing);
    if (!theme) {
      setEditing(null);
      return null;
    }
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>
              ← Back to themes
            </Button>
            <h2 className="font-serif text-2xl">{theme.label}</h2>
            {theme.isActive && (
              <span className="bg-accent text-accent-foreground text-[10px] tracking-wide-luxe uppercase px-2 py-1 rounded-sm font-medium flex items-center gap-1">
                <Check className="h-3 w-3" /> Active
              </span>
            )}
          </div>
        </div>
        <FestivalThemeEditor
          themeName={theme.name}
          initialSettings={theme.settings}
          isActive={theme.isActive}
          onSave={(s) => saveSettings(theme.name, s)}
          onActivate={() => saveAndActivate(theme.name, theme.settings)}
        />
      </div>
    );
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h2 className="font-serif text-3xl mb-2">Festival Themes</h2>
        <p className="text-sm text-muted-foreground">
          Activate a festival theme to instantly transform your entire store. Click "Customize" to edit every detail — banner text, colors, features, spin wheel prizes, and more.
        </p>
      </motion.div>

      <div className="mb-6 p-4 bg-accent/10 border border-accent/20 rounded-sm flex items-start gap-3">
        <Zap className="h-5 w-5 text-accent shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium mb-1">Full Control</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Click <strong>Customize</strong> to edit banner text, colors, features, spin wheel prizes, particle count, marquee messages</li>
            <li>• Click <strong>Activate</strong> to instantly apply a theme across your entire store</li>
            <li>• Use <strong>Schedule</strong> to auto-activate during a sale window</li>
            <li>• All changes appear instantly on all devices</li>
          </ul>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((theme) => {
          const previewColors = theme.settings.colors;
          return (
            <motion.div
              key={theme.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "border rounded-sm overflow-hidden transition-all",
                theme.isActive
                  ? "border-accent shadow-lg shadow-accent/20"
                  : "border-border hover:border-accent/40"
              )}
            >
              <div
                className="h-32 flex items-center justify-center relative"
                style={{
                  background: theme.settings.banner.backgroundCss,
                  color: theme.settings.banner.textColor,
                }}
              >
                <div className="text-center">
                  <p className="text-[10px] tracking-luxe uppercase opacity-70 mb-1">
                    {theme.settings.banner.discountBadge}
                  </p>
                  <p className="font-serif text-lg font-bold">{theme.settings.banner.title}</p>
                </div>
                {theme.isActive && (
                  <div className="absolute top-2 right-2 bg-accent text-accent-foreground text-[10px] tracking-wide-luxe uppercase px-2 py-1 rounded-sm font-medium flex items-center gap-1">
                    <Check className="h-3 w-3" /> Active
                  </div>
                )}
              </div>

              <div className="flex h-3">
                <div className="flex-1" style={{ background: previewColors.background }} />
                <div className="flex-1" style={{ background: previewColors.primary }} />
                <div className="flex-1" style={{ background: previewColors.accent }} />
                <div className="flex-1" style={{ background: previewColors.secondary }} />
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-serif text-lg flex items-center gap-1.5">
                    {theme.name === "custom" && <PartyPopper className="h-4 w-4 text-accent" />}
                    {theme.label}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{theme.description}</p>
                </div>

                <div className="flex gap-2">
                  {theme.isActive ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deactivate(theme.name)}
                      className="flex-1"
                    >
                      <Power className="h-3.5 w-3.5 mr-1.5" />
                      Deactivate
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => activate(theme.name)}
                      className="flex-1"
                    >
                      <Zap className="h-3.5 w-3.5 mr-1.5" />
                      Activate
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setEditing(theme.name)}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1.5" />
                    Customize
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const dates = scheduleDates[theme.name] || { start: "", end: "" };
                      setScheduleDates({
                        ...scheduleDates,
                        [theme.name]: { start: dates.start, end: dates.end },
                      });
                      setScheduling(scheduling === theme.name ? null : theme.name);
                    }}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {scheduling === theme.name && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-3 pt-3 border-t border-border"
                  >
                    <div>
                      <Label className="text-xs mb-1 block">Start Date & Time</Label>
                      <Input
                        type="datetime-local"
                        value={scheduleDates[theme.name]?.start || ""}
                        onChange={(e) => {
                          const cur = scheduleDates[theme.name] || { start: "", end: "" };
                          setScheduleDates({
                            ...scheduleDates,
                            [theme.name]: { ...cur, start: e.target.value },
                          });
                        }}
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">End Date & Time</Label>
                      <Input
                        type="datetime-local"
                        value={scheduleDates[theme.name]?.end || ""}
                        onChange={(e) => {
                          const cur = scheduleDates[theme.name] || { start: "", end: "" };
                          setScheduleDates({
                            ...scheduleDates,
                            [theme.name]: { ...cur, end: e.target.value },
                          });
                        }}
                        className="text-xs"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => schedule(theme.name)}
                      disabled={!scheduleDates[theme.name]?.start || !scheduleDates[theme.name]?.end}
                      className="w-full"
                    >
                      <Clock className="h-3.5 w-3.5 mr-1.5" />
                      Save Schedule
                    </Button>
                    {theme.startDate && theme.endDate && (
                      <p className="text-[10px] text-muted-foreground text-center">
                        Scheduled: {new Date(theme.startDate).toLocaleDateString()} → {new Date(theme.endDate).toLocaleDateString()}
                      </p>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
