"use client";

import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrency, autoDetectCurrency } from "@/lib/use-currency";

export function CurrencySelector({ compact = false }: { compact?: boolean }) {
  const { currency, setCurrency, currencies } = useCurrency();

  // Auto-detect on mount (only once)
  useEffect(() => {
    autoDetectCurrency();
  }, []);

  return (
    <Select value={currency.code} onValueChange={(code) => {
      const next = currencies.find((c) => c.code === code);
      if (next) setCurrency(next);
    }}>
      <SelectTrigger className={compact ? "h-8 w-[80px] text-xs rounded-sm border-border" : "h-9 w-[110px] text-sm rounded-sm border-border"}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {currencies.map((c) => (
          <SelectItem key={c.code} value={c.code}>
            <span className="font-mono mr-1">{c.symbol}</span>
            {c.code}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
