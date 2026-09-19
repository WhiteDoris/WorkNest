const getHtmlAttribute = (tag, attribute) => tag.match(new RegExp(`${attribute}\\s*=\\s*["']([^"']+)["']`, "i"))?.[1] || "";

export const findIconHref = (html, pageUrl) => {
  const links = html.match(/<link\b[^>]*>/gi) || [];
  const iconLink = links.find((tag) => /(?:^|\s)(?:icon|shortcut|apple-touch-icon)(?:\s|$)/i.test(getHtmlAttribute(tag, "rel")));
  const href = iconLink && getHtmlAttribute(iconLink, "href");
  if (!href) return "";
  try { return new URL(href, pageUrl).toString(); } catch { return ""; }
};
