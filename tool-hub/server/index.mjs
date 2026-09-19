import express from "express";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "data");
fs.mkdirSync(dataDir, { recursive: true });
const db = new Database(path.join(dataDir, "tool-hub.sqlite"));
db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS tools (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    icon TEXT NOT NULL DEFAULT 'folder',
    entry_type TEXT NOT NULL CHECK(entry_type IN ('http', 'path')),
    local_path TEXT NOT NULL DEFAULT '',
    category_id TEXT,
    tags TEXT NOT NULL DEFAULT '[]',
    is_pinned INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL
  );
  CREATE TABLE IF NOT EXISTS endpoints (
    id TEXT PRIMARY KEY,
    tool_id TEXT NOT NULL,
    label TEXT NOT NULL DEFAULT '',
    url TEXT NOT NULL,
    is_primary INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY(tool_id) REFERENCES tools(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    category_id TEXT,
    tags TEXT NOT NULL DEFAULT '[]',
    is_pinned INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL
  );
`);

const now = () => new Date().toISOString();
const makeId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const parseTags = (value) => Array.isArray(value) ? value : JSON.parse(value || "[]");
const serializeTags = (value) => JSON.stringify(Array.isArray(value) ? value : String(value || "").split(",").map((tag) => tag.trim()).filter(Boolean));
const normalizeUrl = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(raw) ? raw : `http://${raw}`;
  const parsed = new URL(candidate);
  if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("只支持 HTTP 或 HTTPS 地址");
  return parsed.toString().replace(/\/$/, "") || candidate;
};

const seed = db.transaction(() => {
  if (db.prepare("SELECT COUNT(*) AS count FROM categories").get().count > 0) return;
  const categories = ["常用", "开发", "设计", "办公", "本地", "网络", "其他"];
  const insertCategory = db.prepare("INSERT INTO categories (id, name, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?)");
  categories.forEach((name, index) => insertCategory.run(`cat-${index}`, name, index, now(), now()));
  const tools = [
    ["chrome", "Chrome", "快速、安全的网页浏览器", "chrome", "path", "/Applications/Google Chrome.app", "cat-0", ["浏览器"], 1],
    ["vscode", "VS Code", "强大的代码编辑器", "vscode", "path", "/Applications/Visual Studio Code.app", "cat-1", ["编辑器"], 1],
    ["postman", "Postman", "API 开发与测试工具", "postman", "path", "/Applications/Postman.app", "cat-1", ["API"], 1],
    ["notion", "Notion", "连接你的想法与工作", "notion", "http", "https://www.notion.so", "cat-3", ["知识库"], 0],
    ["docker", "Docker", "构建、运行和管理容器", "docker", "path", "/Applications/Docker.app", "cat-1", ["容器"], 0],
    ["github", "GitHub", "面向开发者的代码托管平台", "github", "http", "https://github.com", "cat-1", ["代码"], 0],
    ["figma", "Figma", "在线协作的界面设计工具", "figma", "http", "https://www.figma.com", "cat-2", ["UI"], 0],
    ["youtube", "YouTube", "发现和观看精彩视频", "youtube", "http", "https://youtube.com", "cat-5", ["视频"], 0],
    ["wechat", "微信", "高效的沟通与协作工具", "wechat", "path", "/Applications/WeChat.app", "cat-0", ["沟通"], 0],
    ["feishu", "飞书", "先进的企业协作与办公平台", "feishu", "http", "https://www.feishu.cn", "cat-3", ["协作"], 0],
    ["baidu", "百度网盘", "安全高效的云存储服务", "baidu", "http", "https://pan.baidu.com", "cat-5", ["云存储"], 0],
    ["downloads", "本地下载目录", "常用文件下载位置", "folder", "path", "/Users/you/Downloads", "cat-4", ["文件"], 0],
    ["typora", "Typora", "优雅的 Markdown 编辑器", "document", "path", "/Applications/Typora.app", "cat-4", ["Markdown"], 0],
    ["obsidian", "Obsidian", "构建你的知识库", "obsidian", "path", "/Applications/Obsidian.app", "cat-3", ["笔记"], 0],
    ["paint", "画图", "简单实用的图像编辑工具", "image", "path", "/Applications/Preview.app", "cat-2", ["图片"], 0],
    ["resume", "简历模板", "本地简历模板文件夹", "document", "path", "/Users/you/Documents/Resume", "cat-4", ["模板"], 0],
    ["chatgpt", "ChatGPT", "强大的 AI 助手", "openai", "http", "https://chatgpt.com", "cat-0", ["AI"], 0],
    ["juejin", "掘金", "高质量的技术内容社区", "juejin", "http", "https://juejin.cn", "cat-5", ["社区"], 0],
  ];
  const insertTool = db.prepare("INSERT INTO tools (id, name, description, icon, entry_type, local_path, category_id, tags, is_pinned, status, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)");
  const insertEndpoint = db.prepare("INSERT INTO endpoints (id, tool_id, label, url, is_primary, sort_order) VALUES (?, ?, ?, ?, ?, ?)");
  tools.forEach(([id, name, description, icon, entryType, location, categoryId, tags, isPinned], index) => {
    insertTool.run(id, name, description, icon, entryType, entryType === "path" ? location : "", categoryId, JSON.stringify(tags), isPinned, index, now(), now());
    if (entryType === "http") insertEndpoint.run(`${id}-primary`, id, "主入口", location, 1, 0);
  });
});
seed();

const seedDocuments = db.transaction(() => {
  if (db.prepare("SELECT COUNT(*) AS count FROM documents").get().count > 0) return;
  const documents = [
    ["doc-product", "WorkNest 产品说明", "https://docs.example.com/worknest", "工具库的产品目标、信息架构和后续规划", "cat-3", ["产品", "规划"], 1],
    ["doc-frontend", "前端开发规范", "https://developer.mozilla.org/zh-CN/", "常用 Web API、组件实现和工程规范参考", "cat-1", ["规范", "Web"], 0],
    ["doc-design", "设计系统参考", "https://www.figma.com/community", "收集界面灵感、组件和交互设计参考", "cat-2", ["UI", "灵感"], 0],
    ["doc-meeting", "项目会议纪要", "https://docs.example.com/meeting-notes", "记录项目讨论、决策和待办事项", "cat-3", ["会议"], 0],
    ["doc-api", "常用接口文档", "http://192.168.1.10:8080/docs", "内网服务的 API 文档与调试入口", "cat-1", ["接口", "内网"], 0],
  ];
  const insert = db.prepare("INSERT INTO documents (id, title, url, description, category_id, tags, is_pinned, status, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)");
  documents.forEach(([id, title, url, description, categoryId, tags, isPinned], index) => insert.run(id, title, url, description, categoryId, JSON.stringify(tags), isPinned, index, now(), now()));
});
seedDocuments();

function getCategories() {
  return db.prepare("SELECT id, name, sort_order AS sortOrder, created_at AS createdAt, updated_at AS updatedAt FROM categories ORDER BY sort_order, name").all();
}
function getTool(id) {
  const row = db.prepare("SELECT id, name, description, icon, entry_type AS entryType, local_path AS localPath, category_id AS categoryId, tags, is_pinned AS isPinned, status, sort_order AS sortOrder, created_at AS createdAt, updated_at AS updatedAt FROM tools WHERE id = ?").get(id);
  if (!row) return null;
  const endpoints = db.prepare("SELECT id, label, url, is_primary AS isPrimary, sort_order AS sortOrder FROM endpoints WHERE tool_id = ? ORDER BY sort_order").all(id).map((endpoint) => ({ ...endpoint, isPrimary: Boolean(endpoint.isPrimary) }));
  return { ...row, tags: parseTags(row.tags), isPinned: Boolean(row.isPinned), endpoints, primaryUrl: endpoints.find((endpoint) => endpoint.isPrimary)?.url || "" };
}
function getTools() {
  return db.prepare("SELECT id FROM tools ORDER BY sort_order, name").all().map(({ id }) => getTool(id));
}
function getDocument(id) {
  const row = db.prepare("SELECT id, title, url, description, category_id AS categoryId, tags, is_pinned AS isPinned, status, sort_order AS sortOrder, created_at AS createdAt, updated_at AS updatedAt FROM documents WHERE id = ?").get(id);
  return row ? { ...row, tags: parseTags(row.tags), isPinned: Boolean(row.isPinned) } : null;
}
function getDocuments() {
  return db.prepare("SELECT id FROM documents ORDER BY sort_order, title").all().map(({ id }) => getDocument(id));
}
function validateDocumentPayload(payload, existing = {}) {
  const title = String(payload.title ?? existing.title ?? "").trim();
  if (!title) throw new Error("文档标题不能为空");
  const url = normalizeUrl(payload.url ?? existing.url);
  if (!url) throw new Error("文档地址不能为空");
  return {
    title,
    url,
    description: String(payload.description ?? existing.description ?? "").trim(),
    categoryId: payload.categoryId ?? existing.categoryId ?? null,
    tags: payload.tags ?? existing.tags ?? [],
    isPinned: Boolean(payload.isPinned ?? existing.isPinned),
    status: payload.status === "disabled" ? "disabled" : "active",
  };
}
function validatePayload(payload, existing = {}) {
  const name = String(payload.name ?? existing.name ?? "").trim();
  const entryType = payload.entryType ?? existing.entryType ?? "http";
  if (!name) throw new Error("工具名称不能为空");
  if (!["http", "path"].includes(entryType)) throw new Error("工具类型无效");
  const primaryUrl = entryType === "http" ? normalizeUrl(payload.primaryUrl ?? existing.primaryUrl) : "";
  const localPath = entryType === "path" ? String(payload.localPath ?? existing.localPath ?? "").trim() : "";
  if (entryType === "http" && !primaryUrl) throw new Error("HTTP 地址不能为空");
  if (entryType === "path" && !localPath) throw new Error("本地路径不能为空");
  const backupUrls = (payload.backupUrls || []).map(normalizeUrl).filter(Boolean);
  return { name, description: String(payload.description ?? existing.description ?? "").trim(), icon: String(payload.icon ?? existing.icon ?? "folder"), entryType, primaryUrl, localPath, categoryId: payload.categoryId ?? existing.categoryId ?? null, tags: payload.tags ?? existing.tags ?? [], isPinned: Boolean(payload.isPinned ?? existing.isPinned), status: payload.status === "disabled" ? "disabled" : "active", backupUrls };
}

const app = express();
app.use(express.json({ limit: "1mb" }));
app.get("/api/bootstrap", (_request, response) => response.json({ categories: getCategories(), tools: getTools(), documents: getDocuments() }));
app.get("/api/categories", (_request, response) => response.json(getCategories()));
app.post("/api/categories", (request, response) => {
  try {
    const name = String(request.body.name || "").trim(); if (!name) throw new Error("分组名称不能为空");
    const category = { id: makeId("cat"), name, sortOrder: getCategories().length, createdAt: now(), updatedAt: now() };
    db.prepare("INSERT INTO categories (id, name, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?)").run(category.id, category.name, category.sortOrder, category.createdAt, category.updatedAt);
    response.status(201).json(category);
  } catch (error) { response.status(400).json({ error: error.message }); }
});
app.patch("/api/categories/:id", (request, response) => {
  try { const name = String(request.body.name || "").trim(); if (!name) throw new Error("分组名称不能为空"); db.prepare("UPDATE categories SET name = ?, updated_at = ? WHERE id = ?").run(name, now(), request.params.id); response.json(getCategories().find((category) => category.id === request.params.id)); }
  catch (error) { response.status(400).json({ error: error.message }); }
});
app.delete("/api/categories/:id", (request, response) => { db.prepare("DELETE FROM categories WHERE id = ?").run(request.params.id); response.status(204).end(); });
app.get("/api/tools", (_request, response) => response.json(getTools()));
app.post("/api/tools", (request, response) => {
  try {
    const payload = validatePayload(request.body); const id = makeId("tool"); const createdAt = now(); const sortOrder = db.prepare("SELECT COALESCE(MAX(sort_order), -1) + 1 AS value FROM tools").get().value;
    db.transaction(() => {
      db.prepare("INSERT INTO tools (id, name, description, icon, entry_type, local_path, category_id, tags, is_pinned, status, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(id, payload.name, payload.description, payload.icon, payload.entryType, payload.localPath, payload.categoryId, serializeTags(payload.tags), Number(payload.isPinned), payload.status, sortOrder, createdAt, createdAt);
      if (payload.entryType === "http") { db.prepare("INSERT INTO endpoints (id, tool_id, label, url, is_primary, sort_order) VALUES (?, ?, ?, ?, 1, 0)").run(makeId("endpoint"), id, "主入口", payload.primaryUrl); payload.backupUrls.forEach((url, index) => db.prepare("INSERT INTO endpoints (id, tool_id, label, url, is_primary, sort_order) VALUES (?, ?, ?, ?, 0, ?)").run(makeId("endpoint"), id, `备用 ${index + 1}`, url, index + 1)); }
    })(); response.status(201).json(getTool(id));
  } catch (error) { response.status(400).json({ error: error.message }); }
});
app.patch("/api/tools/:id", (request, response) => {
  try {
    const current = getTool(request.params.id); if (!current) return response.status(404).json({ error: "工具不存在" }); const payload = validatePayload({ ...current, ...request.body }); const updatedAt = now();
    db.transaction(() => {
      db.prepare("UPDATE tools SET name = ?, description = ?, icon = ?, entry_type = ?, local_path = ?, category_id = ?, tags = ?, is_pinned = ?, status = ?, updated_at = ? WHERE id = ?").run(payload.name, payload.description, payload.icon, payload.entryType, payload.localPath, payload.categoryId, serializeTags(payload.tags), Number(payload.isPinned), payload.status, updatedAt, request.params.id);
      db.prepare("DELETE FROM endpoints WHERE tool_id = ?").run(request.params.id);
      if (payload.entryType === "http") { db.prepare("INSERT INTO endpoints (id, tool_id, label, url, is_primary, sort_order) VALUES (?, ?, ?, ?, 1, 0)").run(makeId("endpoint"), request.params.id, "主入口", payload.primaryUrl); payload.backupUrls.forEach((url, index) => db.prepare("INSERT INTO endpoints (id, tool_id, label, url, is_primary, sort_order) VALUES (?, ?, ?, ?, 0, ?)").run(makeId("endpoint"), request.params.id, `备用 ${index + 1}`, url, index + 1)); }
    })(); response.json(getTool(request.params.id));
  } catch (error) { response.status(400).json({ error: error.message }); }
});
app.delete("/api/tools/:id", (request, response) => { db.prepare("DELETE FROM tools WHERE id = ?").run(request.params.id); response.status(204).end(); });
app.get("/api/documents", (_request, response) => response.json(getDocuments()));
app.post("/api/documents", (request, response) => {
  try {
    const payload = validateDocumentPayload(request.body); const id = makeId("doc"); const createdAt = now(); const sortOrder = db.prepare("SELECT COALESCE(MAX(sort_order), -1) + 1 AS value FROM documents").get().value;
    db.prepare("INSERT INTO documents (id, title, url, description, category_id, tags, is_pinned, status, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(id, payload.title, payload.url, payload.description, payload.categoryId, serializeTags(payload.tags), Number(payload.isPinned), payload.status, sortOrder, createdAt, createdAt);
    response.status(201).json(getDocument(id));
  } catch (error) { response.status(400).json({ error: error.message }); }
});
app.patch("/api/documents/:id", (request, response) => {
  try {
    const current = getDocument(request.params.id); if (!current) return response.status(404).json({ error: "文档不存在" }); const payload = validateDocumentPayload({ ...current, ...request.body }, current);
    db.prepare("UPDATE documents SET title = ?, url = ?, description = ?, category_id = ?, tags = ?, is_pinned = ?, status = ?, updated_at = ? WHERE id = ?").run(payload.title, payload.url, payload.description, payload.categoryId, serializeTags(payload.tags), Number(payload.isPinned), payload.status, now(), request.params.id);
    response.json(getDocument(request.params.id));
  } catch (error) { response.status(400).json({ error: error.message }); }
});
app.delete("/api/documents/:id", (request, response) => { db.prepare("DELETE FROM documents WHERE id = ?").run(request.params.id); response.status(204).end(); });
app.get("/api/export", (_request, response) => response.json({ schemaVersion: 1, exportedAt: now(), categories: getCategories(), tools: getTools(), documents: getDocuments() }));
app.post("/api/import", (request, response) => {
  try {
    const imported = request.body;
    if (!Array.isArray(imported.categories) || !Array.isArray(imported.tools)) throw new Error("JSON 文件格式不正确");
    db.transaction(() => {
      const upsertCategory = db.prepare("INSERT INTO categories (id, name, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET name = excluded.name, sort_order = excluded.sort_order, updated_at = excluded.updated_at");
      imported.categories.forEach((category, index) => {
        const id = String(category.id || makeId("cat")); const timestamp = now();
        upsertCategory.run(id, String(category.name || "未命名分组").trim(), Number.isFinite(category.sortOrder) ? category.sortOrder : index, category.createdAt || timestamp, timestamp);
      });
      const upsertTool = db.prepare("INSERT INTO tools (id, name, description, icon, entry_type, local_path, category_id, tags, is_pinned, status, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET name = excluded.name, description = excluded.description, icon = excluded.icon, entry_type = excluded.entry_type, local_path = excluded.local_path, category_id = excluded.category_id, tags = excluded.tags, is_pinned = excluded.is_pinned, status = excluded.status, sort_order = excluded.sort_order, updated_at = excluded.updated_at");
      const clearEndpoints = db.prepare("DELETE FROM endpoints WHERE tool_id = ?");
      const insertEndpoint = db.prepare("INSERT INTO endpoints (id, tool_id, label, url, is_primary, sort_order) VALUES (?, ?, ?, ?, ?, ?)");
      imported.tools.forEach((tool, index) => {
        const id = String(tool.id || makeId("tool"));
        const endpoints = tool.endpoints || [];
        const primaryUrl = tool.primaryUrl || endpoints.find((endpoint) => endpoint.isPrimary)?.url || endpoints[0]?.url || "";
        const backupUrls = endpoints.filter((endpoint) => !endpoint.isPrimary && endpoint.url).map((endpoint) => endpoint.url);
        const payload = validatePayload({ ...tool, primaryUrl, backupUrls }); const timestamp = now();
        upsertTool.run(id, payload.name, payload.description, payload.icon, payload.entryType, payload.localPath, payload.categoryId, serializeTags(payload.tags), Number(payload.isPinned), payload.status, Number.isFinite(tool.sortOrder) ? tool.sortOrder : index, tool.createdAt || timestamp, timestamp);
        clearEndpoints.run(id);
        if (payload.entryType === "http") {
          insertEndpoint.run(makeId("endpoint"), id, "主入口", payload.primaryUrl, 1, 0);
          payload.backupUrls.forEach((url, endpointIndex) => insertEndpoint.run(makeId("endpoint"), id, `备用 ${endpointIndex + 1}`, url, 0, endpointIndex + 1));
        }
      });
      const upsertDocument = db.prepare("INSERT INTO documents (id, title, url, description, category_id, tags, is_pinned, status, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET title = excluded.title, url = excluded.url, description = excluded.description, category_id = excluded.category_id, tags = excluded.tags, is_pinned = excluded.is_pinned, status = excluded.status, sort_order = excluded.sort_order, updated_at = excluded.updated_at");
      (imported.documents || []).forEach((document, index) => {
        const id = String(document.id || makeId("doc")); const payload = validateDocumentPayload(document); const timestamp = now();
        upsertDocument.run(id, payload.title, payload.url, payload.description, payload.categoryId, serializeTags(payload.tags), Number(payload.isPinned), payload.status, Number.isFinite(document.sortOrder) ? document.sortOrder : index, document.createdAt || timestamp, timestamp);
      });
    })();
    response.json({ categories: getCategories(), tools: getTools(), documents: getDocuments() });
  } catch (error) { response.status(400).json({ error: error.message }); }
});

const port = Number(process.env.PORT || 3001);
app.listen(port, "127.0.0.1", () => console.log(`WorkNest API listening on http://127.0.0.1:${port}`));
