"use client";

import { type DecodeResult, isDecodeSuccess } from "@/lib/decode";
import { displayValue, isCleanDecode } from "./fields";

/**
 * Compact summary of a batch decode. Rows are selectable so the user can drill
 * into any single vehicle's full common-model card below the table.
 */
export function BatchTable({
  results,
  selectedVin,
  onSelect,
}: {
  results: DecodeResult[];
  selectedVin: string | null;
  onSelect: (vin: string) => void;
}) {
  const okCount = results.filter(isDecodeSuccess).length;

  return (
    <section className="animate-fade-up overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b border-zinc-200 px-5 py-3.5 sm:px-6">
        <h2 className="text-sm font-medium text-zinc-900">Batch results</h2>
        <span className="font-mono text-xs text-zinc-500">
          {okCount}/{results.length} decoded · select a row for detail
        </span>
      </header>

      <div className="scroll-slim overflow-x-auto">
        <table className="w-full min-w-[44rem] border-collapse text-sm">
          <thead>
            <tr className="bg-zinc-50/60 text-left font-mono text-[11px] uppercase tracking-wider text-zinc-500">
              <Th>VIN</Th>
              <Th>Make</Th>
              <Th>Model</Th>
              <Th>Year</Th>
              <Th>Type</Th>
              <Th>GVWR</Th>
              <Th>Fuel</Th>
              <Th>Quality</Th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => {
              const selected = result.vin === selectedVin;

              if (!isDecodeSuccess(result)) {
                return (
                  <tr key={result.vin} className="border-t border-zinc-100">
                    <Td className="font-mono text-zinc-700">{result.vin}</Td>
                    <td colSpan={7} className="px-4 py-3 text-amber-700">
                      {result.error}
                    </td>
                  </tr>
                );
              }

              const v = result.vehicle;
              return (
                <tr
                  key={result.vin}
                  onClick={() => onSelect(result.vin)}
                  className={`cursor-pointer border-t border-zinc-100 transition-colors ${
                    selected ? "bg-emerald-50" : "hover:bg-zinc-50"
                  }`}
                >
                  <Td className="font-mono text-zinc-900">{v.vin}</Td>
                  <Td className="text-zinc-900">{displayValue(v.make)}</Td>
                  <Td className="text-zinc-600">{displayValue(v.model)}</Td>
                  <Td className="font-mono text-zinc-600">{displayValue(v.year)}</Td>
                  <Td className="text-zinc-500">{displayValue(v.vehicleType)}</Td>
                  <Td className="text-zinc-500">{displayValue(v.gvwrClass)}</Td>
                  <Td className="text-zinc-500">{displayValue(v.fuelTypePrimary)}</Td>
                  <Td>
                    <span
                      className={`inline-flex items-center gap-1.5 font-mono text-xs ${
                        isCleanDecode(v) ? "text-emerald-600" : "text-amber-700"
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${isCleanDecode(v) ? "bg-emerald-500" : "bg-amber-500"}`}
                      />
                      {displayValue(v.errorCode)}
                    </span>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-medium first:pl-5 sm:first:pl-6">{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 first:pl-5 sm:first:pl-6 ${className}`}>{children}</td>;
}
