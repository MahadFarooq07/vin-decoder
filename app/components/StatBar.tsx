import { ArrowRight } from "./icons";

/**
 * The money shot: makes the normalization tangible by showing how many noisy
 * raw vPIC fields collapse into the clean, typed common model.
 */
export function StatBar({
  rawFieldCount,
  cleanFieldCount,
}: {
  rawFieldCount: number;
  cleanFieldCount: number;
}) {
  const reduction =
    rawFieldCount > 0
      ? Math.round(((rawFieldCount - cleanFieldCount) / rawFieldCount) * 100)
      : 0;

  return (
    <div className="animate-fade-up flex flex-col items-stretch gap-4 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:gap-6 sm:p-6">
      <Metric value={rawFieldCount} label="raw vPIC fields" tone="raw" />

      <div className="flex shrink-0 flex-col items-center gap-1 px-2 text-center">
        <ArrowRight className="size-6 rotate-90 text-zinc-500 sm:rotate-0" />
        <span className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
          normalize
        </span>
      </div>

      <Metric value={cleanFieldCount} label="clean typed fields" tone="clean" />

      <div className="hidden h-12 w-px bg-zinc-200 sm:block" />

      <div className="flex flex-col sm:pr-1">
        <span className="font-mono text-2xl font-semibold tracking-tight text-zinc-900">
          −{reduction}%
        </span>
        <span className="max-w-[15rem] text-xs leading-relaxed text-zinc-500">
          noise removed — one consistent contract instead of {rawFieldCount} loose strings.
        </span>
      </div>
    </div>
  );
}

function Metric({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: "raw" | "clean";
}) {
  return (
    <div className="flex flex-1 items-center gap-3 sm:flex-col sm:items-start sm:gap-1">
      <span
        className={`font-mono text-4xl font-semibold tabular-nums tracking-tight sm:text-5xl ${
          tone === "clean" ? "text-emerald-600" : "text-zinc-500"
        }`}
      >
        {value}
      </span>
      <span className="text-sm text-zinc-500">{label}</span>
    </div>
  );
}
