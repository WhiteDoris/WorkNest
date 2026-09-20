const namedTagHues = {
  开发: 210,
  测试: 146,
  设计: 326,
  产品: 28,
  文档: 262,
  常用: 48,
  需求: 286,
  API: 4,
  UI: 328,
};

function hashTag(tag) {
  return [...String(tag || "")].reduce((hash, character) => (hash * 31 + character.codePointAt(0)) % 360, 0);
}

export function getTagColorStyle(tag) {
  const normalizedTag = String(tag || "").trim();
  const hue = namedTagHues[normalizedTag] ?? hashTag(normalizedTag);
  return { "--tag-hue": String(hue) };
}
