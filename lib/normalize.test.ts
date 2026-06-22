/**
 * Unit tests for the normalization layer.
 * Run with `npm test` (Node's built-in runner + experimental TS type-stripping —
 * no extra test dependencies).
 */

import test from "node:test";
import assert from "node:assert/strict";

import { normalize, countCleanFields } from "./normalize.ts";
import type { RawVpicResult } from "./vpic.ts";

// A representative "messy" vPIC row: empties, "Not Applicable", padded numbers.
const messy: RawVpicResult = {
  Make: "  FREIGHTLINER ",
  Model: "Cascadia",
  ModelYear: "2012",
  VehicleType: "TRUCK",
  BodyClass: "Truck-Tractor",
  GVWR: "Class 8: 33,001 lb and above (14,969 kg and above)",
  FuelTypePrimary: "Diesel",
  FuelTypeSecondary: "", // empty -> null
  DriveType: "Not Applicable", // sentinel -> null
  EngineCylinders: "6",
  DisplacementL: "14.8",
  Manufacturer: "DAIMLER TRUCK NORTH AMERICA LLC",
  PlantCountry: "UNITED STATES (USA)",
  Doors: "   ", // whitespace-only -> null
  ErrorCode: "0", // success — must be preserved, not dropped
  ErrorText: "0 - VIN decoded clean. Check Digit (9th position) is correct",
};

test("junk values become null", () => {
  const v = normalize(messy, "1FUJGLDR5CLBP8834");
  assert.equal(v.fuelTypeSecondary, null); // ""
  assert.equal(v.driveType, null); // "Not Applicable"
  assert.equal(v.doors, null); // whitespace-only -> non-numeric -> null
});

test("strings are trimmed", () => {
  const v = normalize(messy, "1FUJGLDR5CLBP8834");
  assert.equal(v.make, "FREIGHTLINER");
});

test("numbers are coerced, non-numeric is null", () => {
  const v = normalize(messy, "1FUJGLDR5CLBP8834");
  assert.equal(v.year, 2012);
  assert.equal(typeof v.year, "number");
  assert.equal(v.engineCylinders, 6);
  assert.equal(v.displacementL, 14.8);
  assert.equal(v.doors, null);
});

test("GVWR splits into class and full range", () => {
  const v = normalize(messy, "1FUJGLDR5CLBP8834");
  assert.equal(v.gvwrClass, "Class 8");
  assert.equal(v.gvwrRange, "Class 8: 33,001 lb and above (14,969 kg and above)");
});

test('ErrorCode "0" is preserved (not treated as empty)', () => {
  const v = normalize(messy, "1FUJGLDR5CLBP8834");
  assert.equal(v.errorCode, "0");
});

test("vin is always carried through verbatim", () => {
  const v = normalize({}, "1HGCM82633A004352");
  assert.equal(v.vin, "1HGCM82633A004352");
  assert.equal(v.make, null);
});

test("countCleanFields counts only populated fields", () => {
  const v = normalize(messy, "1FUJGLDR5CLBP8834");
  // Everything populated except fuelTypeSecondary, driveType, doors.
  assert.equal(countCleanFields(v), 15);
});
