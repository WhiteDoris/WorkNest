import assert from "node:assert/strict";
import test from "node:test";
import { splitPinnedTools } from "../src/lib/tool-groups.js";

test("keeps every pinned page in the sorted common-pages group", () => {
  const tools = [
    { id: "newest", isPinned: true },
    { id: "other", isPinned: false },
    { id: "third", isPinned: true },
    { id: "fourth", isPinned: true },
    { id: "fifth", isPinned: true },
  ];

  assert.deepEqual(splitPinnedTools(tools, true), {
    pinnedTools: [tools[0], tools[2], tools[3], tools[4]],
    regularTools: [tools[1]],
  });
});

test("leaves the favorites view as a single sorted list", () => {
  const favorites = [{ id: "postman", isPinned: true }, { id: "chrome", isPinned: true }];

  assert.deepEqual(splitPinnedTools(favorites, false), {
    pinnedTools: [],
    regularTools: favorites,
  });
});
