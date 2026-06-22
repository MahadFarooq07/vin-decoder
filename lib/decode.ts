/**
 * Shared decode types + orchestration used by both API routes and the UI.
 * Keeping the response shapes here means server and client never drift.
 */

import type { RawVpicResult } from "./vpic";
import { type Vehicle, normalize, countCleanFields } from "./normalize";

/** A successfully decoded VIN: the clean model, the raw row, and the field counts. */
export interface DecodeSuccess {
  vin: string;
  vehicle: Vehicle;
  /** The untouched vPIC row, so the UI can show raw-vs-clean side by side. */
  raw: RawVpicResult;
  /** Number of keys vPIC returned (the "noisy" count). */
  rawFieldCount: number;
  /** Number of populated fields in the common model (the "clean" count). */
  cleanFieldCount: number;
}

/** A VIN that could not be decoded (invalid input or vPIC gap). */
export interface DecodeFailure {
  vin: string;
  error: string;
}

export type DecodeResult = DecodeSuccess | DecodeFailure;

/** Narrowing helper so the UI can branch on success vs failure. */
export function isDecodeSuccess(result: DecodeResult): result is DecodeSuccess {
  return "vehicle" in result;
}

/** Build a `DecodeSuccess` from one raw vPIC row. Single source of truth for counts. */
export function buildDecodeSuccess(raw: RawVpicResult, vin: string): DecodeSuccess {
  const vehicle = normalize(raw, vin);
  return {
    vin,
    vehicle,
    raw,
    rawFieldCount: Object.keys(raw).length,
    cleanFieldCount: countCleanFields(vehicle),
  };
}
