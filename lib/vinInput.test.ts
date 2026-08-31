import assert from "node:assert/strict";
import test from "node:test";

import { MAX_BATCH_SIZE, parseVinInput } from "./vinInput.ts";

test("parseVinInput accepts the separators supported by the UI", () => {
  assert.deepEqual(
    parseVinInput("first, second;third\nfourth\tfifth"),
    ["FIRST", "SECOND", "THIRD", "FOURTH", "FIFTH"],
  );
});

test("parseVinInput normalizes case and removes duplicates in input order", () => {
  assert.deepEqual(
    parseVinInput("1hgcm82633a004352 1FTFW1ET5DFC10312 1HGCM82633A004352"),
    ["1HGCM82633A004352", "1FTFW1ET5DFC10312"],
  );
});

test("parseVinInput ignores empty input", () => {
  assert.deepEqual(parseVinInput(" , ; \n "), []);
});

test("the documented batch limit stays explicit", () => {
  assert.equal(MAX_BATCH_SIZE, 25);
});
