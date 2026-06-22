"use client";

import { useState } from "react";

import type { Vehicle } from "@/lib/normalize";
import { FIELD_GROUPS, displayValue, isCleanDecode } from "./fields";

function vehicleTitle(v: Vehicle): string {
  const parts = [v.year, v.make, v.model].filter((p) => p !== null);
  return parts.length > 0 ? parts.join(" ") : "Unidentified vehicle";
}

/** Green when vPIC decoded clean (ErrorCode "0"), amber otherwise. */
function QualityBadge({ vehicle }: { vehicle: Vehicle }) {
  const clean = isCleanDecode(vehicle);
  const code = vehicle.errorCode ?? "—";
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
        clean
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-amber-200 bg-amber-50 text-amber-700"
      }`}
      title={vehicle.errorText ?? undefined}
    >
      <span
        className={`size-1.5 rounded-full ${clean ? "bg-emerald-500" : "bg-amber-500"}`}
        aria-hidden
      />
      {clean ? "Decoded clean" : `ErrorCode ${code}`}
    </span>
  );
}

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const [showEmpty, setShowEmpty] = useState(false);

  const emptyCount = Object.values(vehicle).filter((v) => v === null).length;

  return (
    <section className="animate-fade-up overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold tracking-tight text-zinc-900">
            {vehicleTitle(vehicle)}
          </h2>
          <p className="mt-0.5 font-mono text-xs text-zinc-500">{vehicle.vin}</p>
        </div>
        <QualityBadge vehicle={vehicle} />
      </header>

      {/* Toggle row */}
      <div className="flex items-center justify-between gap-3 border-b border-zinc-100 bg-zinc-50/60 px-5 py-2.5 sm:px-6">
        <span className="text-xs text-zinc-500">
          Common model · <span className="text-zinc-800">{18 - emptyCount}</span> of 18 fields
          populated
        </span>
        {emptyCount > 0 && (
          <button
            type="button"
            onClick={() => setShowEmpty((s) => !s)}
            className="rounded-md px-2 py-1 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            {showEmpty ? "Hide empty fields" : `Show ${emptyCount} empty fields`}
          </button>
        )}
      </div>

      {/* Grouped fields */}
      <div className="divide-y divide-zinc-100">
        {FIELD_GROUPS.map((group) => {
          const visible = group.fields.filter((f) => showEmpty || vehicle[f.key] !== null);
          if (visible.length === 0) return null;

          return (
            <div key={group.title} className="px-5 py-4 sm:px-6">
              <h3 className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                {group.title}
              </h3>
              <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                {visible.map((f) => {
                  const value = vehicle[f.key];
                  const isNull = value === null;
                  return (
                    <div
                      key={f.key}
                      className="flex items-baseline justify-between gap-4 border-b border-dashed border-zinc-200 pb-2"
                    >
                      <dt className="shrink-0 text-sm text-zinc-500">{f.label}</dt>
                      <dd
                        className={`text-right font-mono text-sm ${
                          isNull ? "text-zinc-300" : "text-zinc-900"
                        }`}
                      >
                        {displayValue(value)}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          );
        })}
      </div>
    </section>
  );
}
