"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function SkillsInput({
  id,
  name,
  placeholder,
  defaultValue,
  disabled,
}: {
  id: string;
  name: string;
  placeholder: string;
  defaultValue: string;
  disabled: boolean;
}) {
  const [skills, setSkills] = useState<string[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (defaultValue) {
      setSkills(defaultValue.split(","));
    }
  }, [defaultValue]);

  const addFromInput = () => {
    const tokens = input
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);
    if (tokens.length === 0) return;
    setSkills((prev) => {
      const set = new Set(prev.map((s) => s.toLowerCase()));
      const merged = [...prev];
      for (const t of tokens) {
        if (!set.has(t.toLowerCase())) {
          merged.push(t);
          set.add(t.toLowerCase());
        }
      }
      return merged;
    });
    setInput("");
  };

  const removeSkill = (idx: number) => {
    if (disabled) return;
    setSkills((prev) => prev.filter((_, i) => i !== idx));
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addFromInput();
    } else if (
      e.key === "Backspace" &&
      input.length === 0 &&
      skills.length > 0
    ) {
      // Quick backspace to remove last chip
      setSkills((prev) => prev.slice(0, -1));
    }
  };

  return (
    <div>
      {/* Hidden input carries the comma-separated string for form submission */}
      <input type="hidden" name={name} id={id} value={skills.join(", ")} />

      <div
        className={`w-full min-h-[42px] border border-gray-300 rounded-md px-2 py-2 bg-white focus-within:ring-1 focus-within:ring-orange-300 focus-within:border-orange-300 ${
          disabled ? "bg-gray-50 opacity-75" : ""
        }`}
      >
        <div className="flex flex-wrap gap-2 items-center">
          {skills.map((skill, i) => (
            <span
              key={`${skill}-${i}`}
              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm ${
                disabled
                  ? "bg-orange-100 text-orange-600"
                  : "bg-orange-100 text-orange-800"
              }`}
            >
              {skill}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeSkill(i)}
                  className="ml-1 inline-flex p-0.5 rounded-full hover:bg-orange-200"
                  aria-label={`Remove ${skill}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </span>
          ))}

          {!disabled && (
            <input
              className="flex-1 min-w-[120px] outline-none border-none bg-transparent text-sm placeholder:text-gray-400"
              placeholder={placeholder || "Type a skill and press Enter"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              onBlur={addFromInput}
              disabled={disabled}
            />
          )}
        </div>
      </div>
      {skills.length === 0 && (
        <p className="mt-1 text-xs text-gray-500">
          Example: Research, Presentation, Teamwork. Press Enter to add
        </p>
      )}
    </div>
  );
}
