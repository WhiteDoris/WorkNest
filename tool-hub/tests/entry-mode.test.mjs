import assert from "node:assert/strict";
import test from "node:test";
import { getExclusiveEntryValues } from "../src/lib/entry-mode.js";

test("keeps only the HTTP address in HTTP mode", () => {
  assert.deepEqual(
    getExclusiveEntryValues("http", " https://worknest.example ", "/Applications/WorkNest.app"),
    { primaryUrl: "https://worknest.example", localPath: "" },
  );
});

test("keeps only the local path in local mode", () => {
  assert.deepEqual(
    getExclusiveEntryValues("path", "https://worknest.example", " /Applications/WorkNest.app "),
    { primaryUrl: "", localPath: "/Applications/WorkNest.app" },
  );
});
