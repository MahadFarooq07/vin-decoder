import { VinDecoder } from "./components/VinDecoder";
import { Mark } from "./components/icons";

const VEHICLE_CONTRACT = `interface Vehicle {
  vin: string;
  make: string | null;
  model: string | null;
  year: number | null;
  vehicleType: string | null;
  bodyClass: string | null;
  gvwrClass: string | null;      // parsed from GVWR, e.g. "Class 8"
  gvwrRange: string | null;      // the raw GVWR range text
  fuelTypePrimary: string | null;
  fuelTypeSecondary: string | null;
  driveType: string | null;
  engineCylinders: number | null;
  displacementL: number | null;
  manufacturer: string | null;
  plantCountry: string | null;
  doors: number | null;
  errorCode: string | null;      // vPIC data-quality signal
  errorText: string | null;
}`;

const RULES = [
  {
    title: "Empties become null",
    body: '"", "Not Applicable", and whitespace-only values all collapse to a single null. "0" is kept on purpose — vPIC uses ErrorCode "0" to mean a clean decode.',
  },
  {
    title: "Typed coercion",
    body: "ModelYear, Doors, and EngineCylinders are coerced to numbers and DisplacementL to a float. Anything absent or non-numeric returns null, never NaN.",
  },
  {
    title: "GVWR is parsed",
    body: 'The weight rating "Class 8: 33,001 lb and above" is split into gvwrClass ("Class 8") plus the full original range text — structure recovered from a string.',
  },
  {
    title: "Quality is preserved",
    body: "vPIC's ErrorCode and ErrorText are always carried through, so the consumer of the common model can judge data quality for itself.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-md border border-zinc-300 bg-zinc-50 text-zinc-900">
              <Mark className="size-4" />
            </span>
            <span className="text-sm font-semibold tracking-tight text-zinc-900">
              VIN Decoder
            </span>
          </div>
          <a
            href="https://vpic.nhtsa.dot.gov/api/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-zinc-500 transition-colors hover:text-zinc-900"
          >
            <span className="hidden sm:inline link-underline">Powered by NHTSA vPIC</span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-[10px] text-emerald-700">
              free · keyless
            </span>
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 pb-24 sm:px-8">
        {/* Hero */}
        <section className="animate-fade-up py-12 sm:py-16">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 font-mono text-[11px] text-zinc-600">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            raw vPIC response → typed common model
          </p>
          <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-zinc-900 sm:text-5xl">
            Decode a VIN. Watch the noise become a clean, typed model.
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-zinc-600 sm:text-lg">
            NHTSA&rsquo;s vPIC API returns ~150 loosely-typed fields per VIN — most empty or{" "}
            <span className="font-mono text-zinc-800">&quot;Not Applicable&quot;</span>. This demo
            reshapes that into one consistent{" "}
            <span className="font-medium text-zinc-900">Vehicle</span> contract, the same way a
            telematics API normalizes a messy external source into a common model.
          </p>
        </section>

        {/* Decoder */}
        <VinDecoder />

        {/* Normalization rules */}
        <section className="mt-20">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
            What the normalization layer does
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600">
            A single pure function,{" "}
            <span className="font-mono text-zinc-800">normalize(raw, vin)</span>, owns every rule
            below. It is the valuable, testable core — everything else is plumbing.
          </p>
          <div className="mt-6 grid grid-cols-1 border-t border-l border-zinc-200 sm:grid-cols-2">
            {RULES.map((rule, i) => (
              <div
                key={rule.title}
                className="border-r border-b border-zinc-200 bg-white p-5 transition-colors hover:bg-zinc-50"
              >
                <div className="mb-2 flex items-center gap-3">
                  <span className="font-mono text-xs text-emerald-600">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-sm font-semibold text-zinc-900">{rule.title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-zinc-600">{rule.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* The contract */}
        <section className="mt-16">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900">The common model</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600">
            Every consumer codes against this typed contract — never against raw vPIC.
          </p>
          <pre className="scroll-slim mt-6 overflow-auto rounded-lg border border-zinc-200 bg-zinc-50 p-5 font-mono text-xs leading-relaxed text-zinc-800">
            {VEHICLE_CONTRACT}
          </pre>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-3 px-5 py-6 text-xs text-zinc-500 sm:flex-row sm:items-center sm:px-8">
          <p>Data: U.S. NHTSA vPIC — free, keyless, no rate limit. This is a portfolio demo.</p>
          <p>
            Created by{" "}
            <a
              href="https://www.linkedin.com/in/mahadfarooq100/"
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline font-medium text-zinc-700 transition-colors hover:text-zinc-900"
            >
              Mahad Farooq
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
