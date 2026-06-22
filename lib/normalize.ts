/**
 * The normalization layer — the centerpiece of this project.
 *
 * vPIC hands back ~150 loosely-typed string fields per VIN, most of them
 * empty or `"Not Applicable"`. `normalize()` reshapes that mess into one
 * small, consistent, strongly-typed `Vehicle` "common model" — the same
 * pattern a telematics API uses to turn a noisy external source into a
 * single contract its consumers can rely on.
 *
 * This module is pure and dependency-free so it can be unit-tested in isolation.
 */

import type { RawVpicResult } from "./vpic";

/** The public contract. Every consumer codes against this, never against raw vPIC. */
export interface Vehicle {
  vin: string;
  make: string | null;
  model: string | null;
  year: number | null;
  vehicleType: string | null; // from VehicleType
  bodyClass: string | null; // from BodyClass, e.g. "Truck-Tractor"
  gvwrClass: string | null; // parsed from GVWR, e.g. "Class 8"
  gvwrRange: string | null; // the raw GVWR range text
  fuelTypePrimary: string | null;
  fuelTypeSecondary: string | null;
  driveType: string | null;
  engineCylinders: number | null;
  displacementL: number | null;
  manufacturer: string | null; // from Manufacturer (vPIC's flat-decode key)
  plantCountry: string | null;
  doors: number | null;
  errorCode: string | null; // vPIC ErrorCode — so consumers can judge data quality
  errorText: string | null; // vPIC ErrorText
}

/**
 * Collapse vPIC's many flavours of "no value" to `null`:
 * empty strings, whitespace-only, and the literal `"Not Applicable"`.
 *
 * Note we deliberately do NOT treat `"0"` as empty — vPIC uses ErrorCode
 * `"0"` to mean "decoded clean", which is meaningful, not missing.
 */
function cleanString(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  if (trimmed === "" || trimmed.toLowerCase() === "not applicable") return null;
  return trimmed;
}

/** Coerce a vPIC string to an integer-ish number, or `null` if absent/non-numeric. */
function toNumber(value: string | null | undefined): number | null {
  const cleaned = cleanString(value);
  if (cleaned === null) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** Coerce a vPIC string to a float (e.g. engine displacement), or `null`. */
function toFloat(value: string | null | undefined): number | null {
  const cleaned = cleanString(value);
  if (cleaned === null) return null;
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

/**
 * Split vPIC's GVWR string into its class label and full range text.
 * Input: "Class 8: 33,001 lb and above (14,969 kg and above)"
 *   gvwrClass -> "Class 8"
 *   gvwrRange -> the entire original string
 * When the value has no class prefix, `gvwrClass` is `null`.
 */
function parseGvwr(raw: string | null | undefined): {
  gvwrClass: string | null;
  gvwrRange: string | null;
} {
  const gvwrRange = cleanString(raw);
  if (gvwrRange === null) return { gvwrClass: null, gvwrRange: null };

  const colon = gvwrRange.indexOf(":");
  const gvwrClass = colon === -1 ? null : cleanString(gvwrRange.slice(0, colon));
  return { gvwrClass, gvwrRange };
}

/**
 * Map one raw vPIC row onto the `Vehicle` common model.
 * Pure: same input always yields the same output, no I/O.
 */
export function normalize(raw: RawVpicResult, vin: string): Vehicle {
  const { gvwrClass, gvwrRange } = parseGvwr(raw.GVWR);

  return {
    vin,
    make: cleanString(raw.Make),
    model: cleanString(raw.Model),
    year: toNumber(raw.ModelYear),
    vehicleType: cleanString(raw.VehicleType),
    bodyClass: cleanString(raw.BodyClass),
    gvwrClass,
    gvwrRange,
    fuelTypePrimary: cleanString(raw.FuelTypePrimary),
    fuelTypeSecondary: cleanString(raw.FuelTypeSecondary),
    driveType: cleanString(raw.DriveType),
    engineCylinders: toNumber(raw.EngineCylinders),
    displacementL: toFloat(raw.DisplacementL),
    // vPIC's flat DecodeVinValues uses "Manufacturer"; fall back to the
    // variable-style "ManufacturerName" just in case.
    manufacturer: cleanString(raw.Manufacturer ?? raw.ManufacturerName),
    plantCountry: cleanString(raw.PlantCountry),
    doors: toNumber(raw.Doors),
    // Always preserved so consumers can gauge data quality themselves.
    errorCode: cleanString(raw.ErrorCode),
    errorText: cleanString(raw.ErrorText),
  };
}

/** Count the populated (non-null) fields in a Vehicle — drives the "raw → clean" stat. */
export function countCleanFields(vehicle: Vehicle): number {
  return Object.values(vehicle).filter((value) => value !== null).length;
}
