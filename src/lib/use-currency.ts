"use client";

import { useState, useEffect, useCallback } from "react";

export type Currency = {
  code: string;
  symbol: string;
  name: string;
  rate: number; // relative to USD
};

export const CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$", name: "US Dollar", rate: 1 },
  { code: "EUR", symbol: "€", name: "Euro", rate: 0.92 },
  { code: "GBP", symbol: "£", name: "British Pound", rate: 0.79 },
  { code: "INR", symbol: "₹", name: "Indian Rupee", rate: 83.5 },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", rate: 157 },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", rate: 3.67 },
];

const STORAGE_KEY = "maison-currency";

let currentCurrency: Currency = CURRENCIES[0];
const listeners = new Set<(c: Currency) => void>();

export function getCurrency(): Currency {
  if (typeof window !== "undefined" && !currentCurrency) {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const found = CURRENCIES.find((c) => c.code === stored);
      if (found) currentCurrency = found;
    }
  }
  return currentCurrency;
}

export function setCurrency(currency: Currency) {
  currentCurrency = currency;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, currency.code);
  }
  listeners.forEach((l) => l(currency));
}

export function useCurrency() {
  const [currency, setCurrencyState] = useState<Currency>(getCurrency());

  useEffect(() => {
    const listener = (c: Currency) => setCurrencyState(c);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const change = useCallback((c: Currency) => {
    setCurrency(c);
    setCurrencyState(c);
  }, []);

  // Convert USD price to current currency
  const convert = useCallback(
    (usdPrice: number): string => {
      const converted = usdPrice * currency.rate;
      // JPY has no decimals, others have 2
      if (currency.code === "JPY") {
        return `${currency.symbol}${Math.round(converted).toLocaleString()}`;
      }
      // INR shows no decimals for large numbers
      if (currency.code === "INR") {
        return `${currency.symbol}${Math.round(converted).toLocaleString("en-IN")}`;
      }
      return `${currency.symbol}${converted.toLocaleString(undefined, {
        minimumFractionDigits: converted < 100 ? 2 : 0,
        maximumFractionDigits: 2,
      })}`;
    },
    [currency]
  );

  return { currency, setCurrency: change, convert, currencies: CURRENCIES };
}

// Auto-detect user's currency from browser locale on first visit
export function autoDetectCurrency() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(STORAGE_KEY)) return; // user already chose

  const locale = navigator.language || "en-US";
  const localeMap: Record<string, string> = {
    "en-US": "USD",
    "en-GB": "GBP",
    "en-IN": "INR",
    "ja-JP": "JPY",
    "ja": "JPY",
    "en-AE": "AED",
    "ar-AE": "AED",
    "ar": "AED",
    "fr-FR": "EUR",
    "fr": "EUR",
    "de-DE": "EUR",
    "de": "EUR",
    "es-ES": "EUR",
    "es": "EUR",
    "it-IT": "EUR",
    "it": "EUR",
    "pt-PT": "EUR",
    "nl-NL": "EUR",
    "en-EU": "EUR",
  };

  const detectedCode = localeMap[locale] || "USD";
  const detected = CURRENCIES.find((c) => c.code === detectedCode);
  if (detected) {
    setCurrency(detected);
  }
}
