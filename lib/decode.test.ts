import assert from "node:assert/strict";
import test from "node:test";

import { buildDecodeSuccess, isDecodeSuccess, type DecodeResult } from "./decode.ts";

test("buildDecodeSuccess keeps raw data and derives both field counts", () => {
  const raw = {
    Make: "Honda",
    Model: "Accord",
    ModelYear: "2003",
    ErrorCode: "0",
  };

  const result = buildDecodeSuccess(raw, "1HGCM82633A004352");

  assert.equal(result.raw, raw);
  assert.equal(result.rawFieldCount, 4);
  assert.equal(result.cleanFieldCount, 5);
  assert.deepEqual(
    { vin: result.vehicle.vin, make: result.vehicle.make, year: result.vehicle.year },
    { vin: "1HGCM82633A004352", make: "Honda", year: 2003 },
  );
});

test("isDecodeSuccess distinguishes success and failure results", () => {
  const success: DecodeResult = buildDecodeSuccess({}, "1HGCM82633A004352");
  const failure: DecodeResult = { vin: "BAD", error: "Invalid VIN." };

  assert.equal(isDecodeSuccess(success), true);
  assert.equal(isDecodeSuccess(failure), false);
});
