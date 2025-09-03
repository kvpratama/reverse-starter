"use client";

import { useOptimistic, useTransition } from "react";
import { setProfileActive } from "@/app/(dashboard)/jobseeker/profile/actions";
import { Label } from "@/components/ui/label";

export function ProfileActiveToggle({
  profileId,
  active,
}: {
  profileId: string;
  active: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [optimisticActive, setOptimisticActive] = useOptimistic(active);

  function onToggle() {
    const next = !optimisticActive;
    startTransition(() => {
      // Perform optimistic update within the transition
      setOptimisticActive(next);
      (async () => {
        try {
          await setProfileActive(profileId, next);
        } catch (e) {
          // revert on error
          setOptimisticActive(!next);
          console.error(e);
        }
      })();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onToggle}
        disabled={isPending}
        aria-pressed={optimisticActive}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          optimisticActive ? "bg-green-500" : "bg-gray-300"
        } ${isPending ? "opacity-70" : ""}`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
            optimisticActive ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
      <Label className="text-sm">
        {optimisticActive ? "Active" : "Inactive"}
      </Label>
    </div>
  );
}
