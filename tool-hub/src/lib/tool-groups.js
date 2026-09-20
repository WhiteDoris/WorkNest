export function splitPinnedTools(tools, showPinned) {
  const pinnedTools = showPinned ? tools.filter((tool) => tool.isPinned) : [];
  const pinnedIds = new Set(pinnedTools.map((tool) => tool.id));

  return {
    pinnedTools,
    regularTools: tools.filter((tool) => !pinnedIds.has(tool.id)),
  };
}
