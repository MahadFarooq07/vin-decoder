import { NextResponse, type NextRequest } from "next/server";

import { buildDecodeSuccess, type DecodeResult } from "@/lib/decode";
import { fetchVinBatch, VpicError } from "@/lib/vpic";
import { validateVin } from "@/lib/validateVin";

/** Keep batches sane — vPIC has no published limit, but we shouldn't proxy abuse. */
const MAX_BATCH = 25;

/**
 * POST /api/decode/batch  body: { vins: string[] }
 *
 * Validates every VIN, decodes the valid ones in a single vPIC round-trip,
 * and returns results in request order. Invalid VINs become inline error
 * entries rather than failing the whole batch.
 *
 *  200 -> { results: DecodeResult[] }
 *  400 -> { error } for a malformed body / empty / oversized batch
 *  502 -> { error } when vPIC is unreachable or misbehaves
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const vins = (body as { vins?: unknown })?.vins;
  if (!Array.isArray(vins) || vins.length === 0) {
    return NextResponse.json(
      { error: "Body must be { vins: string[] } with at least one VIN." },
      { status: 400 },
    );
  }
  if (vins.length > MAX_BATCH) {
    return NextResponse.json(
      { error: `Too many VINs — ${vins.length} provided, limit is ${MAX_BATCH}.` },
      { status: 400 },
    );
  }

  // Validate up front; keep each entry's slot so output order matches input order.
  const entries = vins.map((value) => {
    if (typeof value !== "string") {
      return { valid: false as const, reason: "VIN must be a string.", normalized: String(value) };
    }
    return validateVin(value);
  });

  const validNormalized = entries.filter((e) => e.valid).map((e) => e.normalized);

  let rawResults: Awaited<ReturnType<typeof fetchVinBatch>> = [];
  if (validNormalized.length > 0) {
    try {
      rawResults = await fetchVinBatch(validNormalized);
    } catch (error) {
      const message =
        error instanceof VpicError
          ? error.message
          : "An unexpected error occurred while decoding the batch.";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }

  // Zip vPIC rows (in request order) back onto the original slots.
  let cursor = 0;
  const results: DecodeResult[] = entries.map((entry) => {
    if (!entry.valid) {
      return { vin: entry.normalized, error: entry.reason ?? "Invalid VIN." };
    }
    const raw = rawResults[cursor++];
    if (!raw) {
      return { vin: entry.normalized, error: "vPIC returned no result for this VIN." };
    }
    return buildDecodeSuccess(raw, entry.normalized);
  });

  return NextResponse.json({ results });
}
