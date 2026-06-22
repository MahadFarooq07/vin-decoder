"use client";

import { useState } from "react";

import type { Vehicle } from "@/lib/normalize";
import type { RawVpicResult } from "@/lib/vpic";
import { ChevronDown } from "./icons";

/**
 * Side-by-side "before / after": the messy raw vPIC object next to the clean
 * common model, so the value of the normalization layer is visible at a glance.
 */
export function RawCleanDiff({
  raw,
  vehicle,
  rawFieldCount,
  cleanFieldCount,
}: {
  raw: RawVpicResult;
  vehicle: Vehicle;
  rawFieldCount: number;
  cleanFieldCount: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left transition-colors hover:bg-zinc-50 sm:px-6"
      >
        <span className="text-sm font-medium text-zinc-900">
          Raw vs. clean
          <span className="ml-2 text-zinc-500">see what normalization did</span>
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="grid grid-cols-1 gap-px border-t border-zinc-200 bg-zinc-200 md:grid-cols-2">
          <Pane title="Raw vPIC response" count={`${rawFieldCount} fields`} tone="raw" json={raw} />
          <Pane
            title="Clean common model"
            count={`${cleanFieldCount} populated`}
            tone="clean"
            json={vehicle}
          />
        </div>
      )}
    </div>
  );
}

function Pane({
  title,
  count,
  tone,
  json,
}: {
  title: string;
  count: string;
  tone: "raw" | "clean";
  json: unknown;
}) {
  return (
    <div className="bg-white">
      <div className="flex items-center justify-between gap-2 border-b border-zinc-100 bg-zinc-50/60 px-4 py-2.5">
        <span className="flex items-center gap-2 text-xs font-medium text-zinc-700">
          <span className={`size-1.5 rounded-full ${tone === "clean" ? "bg-emerald-500" : "bg-amber-500"}`} />
          {title}
        </span>
        <span className="font-mono text-[11px] text-zinc-500">{count}</span>
      </div>
      <pre className="scroll-slim max-h-96 overflow-auto px-4 py-3 font-mono text-xs leading-relaxed text-zinc-600">
        {JSON.stringify(json, null, 2)}
      </pre>
    </div>
  );
}
