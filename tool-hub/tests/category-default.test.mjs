import assert from "node:assert/strict";
import test from "node:test";
import { getDraftCategoryId } from "../src/lib/category-default.js";

const categories = [
  { id: "cat-common", name: "常用" },
  { id: "cat-dev", name: "开发" },
];

test("uses the currently selected category for a new entry", () => {
  assert.equal(getDraftCategoryId(categories, "cat-dev"), "cat-dev");
});

test("leaves a new entry uncategorized outside a category view", () => {
  assert.equal(getDraftCategoryId(categories, "all"), "");
  assert.equal(getDraftCategoryId(categories, "favorites"), "");
});
