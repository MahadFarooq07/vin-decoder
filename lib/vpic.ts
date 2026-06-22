/**
 * Thin, typed fetch wrapper around the NHTSA vPIC API.
 *
 * vPIC is free, keyless, and unauthenticated. We only touch the two
 * `DecodeVinValues` endpoints, which return one flat object per VIN.
 *
 * Docs: https://vpic.nhtsa.dot.gov/api/
 */

const BASE_URL = "https://vpic.nhtsa.dot.gov/api/vehicles";

/**
 * One raw vPIC result row. vPIC returns ~150 keys per VIN, almost all of
 * them strings (missing values come back as `""` or `"Not Applicable"`,
 * never absent), so a string-valued record models it faithfully.
 */
export type RawVpicResult = Record<string, string>;

interface VpicEnvelope {
  Count: number;
  Message: string;
  Results: RawVpicResult[];
}

/** Raised for any vPIC transport or protocol failure, so routes can map it to a 502. */
export class VpicError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VpicError";
  }
}

async function readEnvelope(res: Response): Promise<VpicEnvelope> {
  if (!res.ok) {
    throw new VpicError(`vPIC responded with HTTP ${res.status} ${res.statusText}.`);
  }
  try {
    return (await res.json()) as VpicEnvelope;
  } catch {
    throw new VpicError("vPIC returned a response that was not valid JSON.");
  }
}

/** Decode a single VIN via `GET /DecodeVinValues/{vin}`. */
export async function fetchVin(vin: string): Promise<RawVpicResult> {
  const url = `${BASE_URL}/DecodeVinValues/${encodeURIComponent(vin)}?format=json`;

  let res: Response;
  try {
    res = await fetch(url, { headers: { Accept: "application/json" } });
  } catch {
    throw new VpicError("Could not reach the NHTSA vPIC service.");
  }

  const envelope = await readEnvelope(res);
  const result = envelope.Results?.[0];
  if (!result) {
    throw new VpicError("vPIC returned no result for this VIN.");
  }
  return result;
}

/**
 * Decode many VINs in one round-trip via `POST /DecodeVinValuesBatch/`.
 * The body is form-encoded as `data=VIN1;VIN2;...&format=json`.
 * Results come back in request order, one row per VIN.
 */
export async function fetchVinBatch(vins: string[]): Promise<RawVpicResult[]> {
  const url = `${BASE_URL}/DecodeVinValuesBatch/`;
  const body = new URLSearchParams({ format: "json", data: vins.join(";") });

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
  } catch {
    throw new VpicError("Could not reach the NHTSA vPIC service.");
  }

  const envelope = await readEnvelope(res);
  return envelope.Results ?? [];
}
