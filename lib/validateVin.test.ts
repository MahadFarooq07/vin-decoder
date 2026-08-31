import assert from "node:assert/strict";
import test from "node:test";

import { validateVin } from "./validateVin.ts";

test("a valid VIN is trimmed and upper-cased", () => {
  assert.deepEqual(validateVin(" 1hgcm82633a004352 "), {
    valid: true,
    reason: null,
    normalized: "1HGCM82633A004352",
  });
});

test("an empty VIN reports a useful error", () => {
  assert.deepEqual(validateVin("   "), {
    valid: false,
    reason: "VIN is empty.",
    normalized: "",
  });
});

test("a VIN with the wrong length reports the received length", () => {
  const result = validateVin("ABC123");
  assert.equal(result.valid, false);
  assert.equal(result.reason, "VIN must be 17 characters (received 6).");
});

test("VINs reject the ambiguous letters I, O, and Q", () => {
  const result = validateVin("1HGCM82633A00435I");
  assert.equal(result.valid, false);
  assert.equal(result.reason, "VIN cannot contain the letters I, O, or Q.");
});

test("VINs reject punctuation and other unsupported characters", () => {
  const result = validateVin("1HGCM82633A00435-");
  assert.equal(result.valid, false);
  assert.match(result.reason ?? "", /may only contain/);
});
