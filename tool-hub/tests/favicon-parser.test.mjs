import assert from "node:assert/strict";
import test from "node:test";
import { findIconHref } from "../server/favicon.mjs";

test("reads a website-declared favicon URL", () => {
  const html = '<link rel="icon" type="image/png" href="/jingjian-favicon.png?v=3" />';

  assert.equal(
    findIconHref(html, "http://11.91.254.234:8080/"),
    "http://11.91.254.234:8080/jingjian-favicon.png?v=3",
  );
});
