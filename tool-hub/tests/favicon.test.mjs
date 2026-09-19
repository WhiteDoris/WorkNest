import assert from "node:assert/strict";
import test from "node:test";
import { getFaviconUrls } from "../src/lib/favicon.js";

test("uses the server favicon parser before generic favicon paths", () => {
  assert.deepEqual(
    getFaviconUrls("http", "http://11.91.254.234:8080"),
    [
      "/api/favicon?url=http%3A%2F%2F11.91.254.234%3A8080",
      "http://11.91.254.234:8080/favicon.ico",
      "http://11.91.254.234:8080/favicon.svg",
      "http://11.91.254.234:8080/favicon.png",
    ],
  );
});

test("does not request a favicon for local-path entries", () => {
  assert.deepEqual(getFaviconUrls("path", "/Users/alex/skill"), []);
});
