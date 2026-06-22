"use client";

import { useMemo, useState } from "react";

import { type DecodeResult, type DecodeSuccess, isDecodeSuccess } from "@/lib/decode";
import { BatchTable } from "./BatchTable";
import { EXAMPLE_VINS } from "./fields";
import { RawCleanDiff } from "./RawCleanDiff";
import { Spinner } from "./icons";
import { StatBar } from "./StatBar";
import { VehicleCard } from "./VehicleCard";

/** Split free-form input into VINs on commas, semicolons, or any whitespace. */
function parseVins(input: string): string[] {
  const seen = new Set<string>();
  return input
    .split(/[\s,;]+/)
    .map((v) => v.trim().toUpperCase())
    .filter((v) => v.length > 0)
    .filter((v) => (seen.has(v) ? false : (seen.add(v), true)));
}

export function VinDecoder() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<DecodeResult[] | null>(null);
  const [selectedVin, setSelectedVin] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsed = useMemo(() => parseVins(input), [input]);

  async function runDecode(vins: string[]) {
    if (vins.length === 0) {
      setError("Enter at least one VIN to decode.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);
    setSelectedVin(null);

    try {
      if (vins.length === 1) {
        const res = await fetch(`/api/decode?vin=${encodeURIComponent(vins[0])}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Failed to decode VIN.");
          return;
        }
        setResults([data as DecodeSuccess]);
      } else {
        const res = await fetch("/api/decode/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vins }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Failed to decode batch.");
          return;
        }
        const batch = data.results as DecodeResult[];
        setResults(batch);
        const firstOk = batch.find(isDecodeSuccess);
        setSelectedVin(firstOk?.vin ?? batch[0]?.vin ?? null);
      }
    } catch {
      setError("Could not reach the decoder. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function decodeExample(vin: string) {
    setInput(vin);
    void runDecode([vin]);
  }

  const single = results?.length === 1 ? results[0] : null;
  const selected = results?.find((r) => r.vin === selectedVin) ?? null;
  const detail: DecodeSuccess | null =
    single && isDecodeSuccess(single)
      ? single
      : selected && isDecodeSuccess(selected)
        ? selected
        : null;
  const isBatch = (results?.length ?? 0) > 1;

  return (
    <div className="flex flex-col gap-6">
      {/* Input panel */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void runDecode(parsed);
        }}
        className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-5"
      >
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="vin-input" className="text-sm font-medium text-zinc-900">
            VIN input
          </label>
          <span className="font-mono text-[11px] text-zinc-500">
            {parsed.length > 0
              ? `${parsed.length} VIN${parsed.length > 1 ? "s" : ""} · ${parsed.length > 1 ? "POST /batch" : "GET /decode"}`
              : "GET /api/decode"}
          </span>
        </div>

        <textarea
          id="vin-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              void runDecode(parsed);
            }
          }}
          rows={2}
          spellCheck={false}
          autoComplete="off"
          placeholder="Enter a VIN — or paste several, comma / space / newline separated"
          className="scroll-slim w-full resize-y rounded-md border border-zinc-300 bg-white px-4 py-3 font-mono text-sm uppercase tracking-wide text-zinc-900 placeholder:normal-case placeholder:tracking-normal placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-zinc-500">Try:</span>
            {EXAMPLE_VINS.map((ex) => (
              <button
                key={ex.vin}
                type="button"
                onClick={() => decodeExample(ex.vin)}
                disabled={loading}
                title={`${ex.hint} · ${ex.vin}`}
                className="rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs text-zinc-700 transition-colors hover:border-zinc-900 hover:bg-zinc-900 hover:text-white disabled:opacity-50"
              >
                {ex.label}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || parsed.length === 0}
            className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400"
          >
            {loading && <Spinner className="size-4 animate-spin" />}
            {loading ? "Decoding…" : "Decode"}
          </button>
        </div>

        <p className="mt-2 font-mono text-[11px] text-zinc-500">
          17 chars · A–Z (no I/O/Q) and 0–9 · ⌘/Ctrl + Enter to decode
        </p>
      </form>

      {/* Error banner */}
      {error && (
        <div
          role="alert"
          className="animate-fade-up rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="h-28 animate-pulse rounded-lg border border-zinc-200 bg-zinc-50" />
      )}

      {/* Results */}
      {!loading && results && (
        <div className="flex flex-col gap-6">
          {isBatch && (
            <BatchTable results={results} selectedVin={selectedVin} onSelect={setSelectedVin} />
          )}

          {detail && (
            <>
              <StatBar
                rawFieldCount={detail.rawFieldCount}
                cleanFieldCount={detail.cleanFieldCount}
              />
              <VehicleCard vehicle={detail.vehicle} />
              <RawCleanDiff
                raw={detail.raw}
                vehicle={detail.vehicle}
                rawFieldCount={detail.rawFieldCount}
                cleanFieldCount={detail.cleanFieldCount}
              />
            </>
          )}

          {isBatch && !detail && <p className="text-sm text-zinc-500">No vehicle selected.</p>}
        </div>
      )}
    </div>
  );
}
