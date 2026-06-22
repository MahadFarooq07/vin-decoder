import { NextResponse, type NextRequest } from "next/server";

import { buildDecodeSuccess } from "@/lib/decode";
import { fetchVin, VpicError } from "@/lib/vpic";
import { validateVin } from "@/lib/validateVin";

/**
 * GET /api/decode?vin=XXXXXXXXXXXXXXXXX
 *
 * Validates the VIN, decodes it via vPIC, and returns the clean common model
 * alongside the raw row and the raw/clean field counts.
 *
 *  200 -> DecodeSuccess
 *  400 -> { error } when the VIN is malformed
 *  502 -> { error } when vPIC is unreachable or misbehaves
 */
export async function GET(request: NextRequest) {
  const vinParam = request.nextUrl.searchParams.get("vin") ?? "";
  const { valid, reason, normalized } = validateVin(vinParam);

  if (!valid) {
    return NextResponse.json({ error: reason }, { status: 400 });
  }

  try {
    const raw = await fetchVin(normalized);
    return NextResponse.json(buildDecodeSuccess(raw, normalized));
  } catch (error) {
    const message =
      error instanceof VpicError
        ? error.message
        : "An unexpected error occurred while decoding the VIN.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
