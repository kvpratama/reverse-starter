"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Very common public API for country data
// https://restcountries.com/
const COUNTRY_ENDPOINT = "https://restcountries.com/v3.1/all?fields=cca2,name";

type Country = {
  code: string; // ISO 3166-1 alpha-2 (cca2)
  name: string; // common name
};

// Simple in-module cache to avoid repeated network calls during the session
let COUNTRY_CACHE: Country[] | null = null;

export type NationalitySelectProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "children"
> & {
  includeEmptyOption?: boolean;
  placeholderOptionLabel?: string;
};

export default function NationalitySelect({
  className,
  includeEmptyOption = true,
  placeholderOptionLabel = "Select nationality",
  ...props
}: NationalitySelectProps) {
  const [countries, setCountries] = React.useState<Country[] | null>(
    COUNTRY_CACHE,
  );
  const [loading, setLoading] = React.useState<boolean>(!COUNTRY_CACHE);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (COUNTRY_CACHE) return; // already loaded

    const controller = new AbortController();
    const { signal } = controller;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(COUNTRY_ENDPOINT, {
          signal,
          cache: "force-cache",
        });
        if (!res.ok) throw new Error(`Failed to load countries: ${res.status}`);
        const data: Array<{ cca2?: string; name?: { common?: string } }> =
          await res.json();
        const list: Country[] = data
          .map((c) => ({ code: c.cca2 || "", name: c.name?.common || "" }))
          .filter((c) => c.code && c.name)
          .sort((a, b) => a.name.localeCompare(b.name));
        COUNTRY_CACHE = list;
        setCountries(list);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        setError(err?.message || "Failed to load countries");
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, []);

  const disabled = props.disabled || loading;

  return (
    <select
      className={cn(
        // Match the styling used by inputs/selects in the project
        "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus:ring-1 focus:ring-orange-300 focus:border-orange-300",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className,
      )}
      aria-busy={loading || undefined}
      aria-invalid={!!error || undefined}
      {...props}
      disabled={disabled}
    >
      {includeEmptyOption && (
        <option value="" disabled={props.required} hidden={props.required}>
          {loading ? "Loading nationalities..." : placeholderOptionLabel}
        </option>
      )}
      {error && (
        <option value="" disabled>
          {error}
        </option>
      )}
      {!error &&
        countries?.map((c) => (
          <option key={c.code} value={c.name} data-code={c.code}>
            {c.name}
          </option>
        ))}
    </select>
  );
}
