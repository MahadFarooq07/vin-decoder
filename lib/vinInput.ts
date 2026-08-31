/** Maximum VINs accepted by the public batch endpoint. */
export const MAX_BATCH_SIZE = 25;

/**
 * Convert comma-, semicolon-, or whitespace-separated input into a stable,
 * upper-cased list. Duplicate VINs are removed while preserving input order.
 */
export function parseVinInput(input: string): string[] {
  const seen = new Set<string>();

  return input
    .split(/[\s,;]+/)
    .map((vin) => vin.trim().toUpperCase())
    .filter((vin) => vin.length > 0)
    .filter((vin) => {
      if (seen.has(vin)) return false;
      seen.add(vin);
      return true;
    });
}
