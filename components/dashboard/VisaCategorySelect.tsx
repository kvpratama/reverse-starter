"use client";

import * as React from "react";
import visaData from "@/lib/visa-categories.json";
import { cn } from "@/lib/utils";

// Expecting structure: { visa_categories: Array<{ code: string; ... }> }
const VISA_CODES: string[] = Array.isArray((visaData as any)?.visa_categories)
  ? (visaData as any).visa_categories
      .map((v: any) => v?.code)
      .filter((code: unknown): code is string => typeof code === "string")
  : [];

export type VisaCategorySelectProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "children"
> & {
  includeEmptyOption?: boolean;
  placeholderOptionLabel?: string;
};

export default function VisaCategorySelect({
  className,
  includeEmptyOption = true,
  placeholderOptionLabel = "Select a visa category",
  ...props
}: VisaCategorySelectProps) {
  return (
    <select
      className={cn(
        // Keep styling consistent with Input component
        "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus:ring-1 focus:ring-orange-300 focus:border-orange-300",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    >
      {includeEmptyOption && (
        <option value="" disabled={props.required} hidden={props.required}>
          {placeholderOptionLabel}
        </option>
      )}
      {VISA_CODES.map((code) => (
        <option key={code} value={code}>
          {code}
        </option>
      ))}
    </select>
  );
}
