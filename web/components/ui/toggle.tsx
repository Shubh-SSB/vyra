"use client";

import { cn } from "@/lib/utils";

export default function Toggle({
  checked = false,
  onChange,
}: {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange?.(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-white/[0.08] transition-colors duration-200 ease-in-out focus:outline-none",
        checked ? "bg-[#eeece4]" : "bg-black/40"
      )}
      role="switch"
      aria-checked={checked}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full transition duration-200 ease-in-out mt-[2px] ml-[2px]",
          checked ? "translate-x-4 bg-black" : "translate-x-0 bg-white/40"
        )}
      />
    </button>
  );
}
