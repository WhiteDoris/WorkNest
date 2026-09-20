import assert from "node:assert/strict";
import test from "node:test";
import { getTagColorStyle } from "../src/lib/tag-colors.js";

test("assigns the same color to the same tag everywhere", () => {
  assert.deepEqual(getTagColorStyle("开发"), getTagColorStyle("开发"));
});

test("assigns distinct hues to different common tags", () => {
  const hues = ["开发", "测试", "设计", "产品", "文档"].map((tag) => getTagColorStyle(tag)["--tag-hue"]);

  assert.equal(new Set(hues).size, hues.length);
});
