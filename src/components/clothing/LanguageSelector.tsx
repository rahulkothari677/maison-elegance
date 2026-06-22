"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/lib/use-language";

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, languages } = useLanguage();

  return (
    <Select value={lang} onValueChange={(v) => setLang(v as any)}>
      <SelectTrigger className={compact ? "h-8 w-[80px] text-xs rounded-sm border-border" : "h-9 w-[130px] text-sm rounded-sm border-border"}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {languages.map((l) => (
          <SelectItem key={l.code} value={l.code}>
            <span className="mr-1.5">{l.flag}</span>
            {l.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
