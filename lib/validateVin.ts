/**
 * VIN validation. A North American VIN is exactly 17 characters of
 * `A–Z` and `0–9`, with the letters I, O, and Q excluded (they are barred
 * to avoid confusion with 1 and 0).
 *
 * We validate before ever calling vPIC so bad input fails fast and cheap.
 */

export interface VinValidation {
  valid: boolean;
  /** Human-readable reason when invalid; `null` when valid. */
  reason: string | null;
  /** The input trimmed and upper-cased — what should actually be decoded. */
  normalized: string;
}

const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;

export function validateVin(input: string): VinValidation {
  const normalized = input.trim().toUpperCase();

  if (normalized.length === 0) {
    return { valid: false, reason: "VIN is empty.", normalized };
  }
  if (normalized.length !== 17) {
    return {
      valid: false,
      reason: `VIN must be 17 characters (received ${normalized.length}).`,
      normalized,
    };
  }
  if (/[IOQ]/.test(normalized)) {
    return {
      valid: false,
      reason: "VIN cannot contain the letters I, O, or Q.",
      normalized,
    };
  }
  if (!VIN_PATTERN.test(normalized)) {
    return {
      valid: false,
      reason: "VIN may only contain letters (A–Z, excluding I, O, Q) and digits.",
      normalized,
    };
  }

  return { valid: true, reason: null, normalized };
}
