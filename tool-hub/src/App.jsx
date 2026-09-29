import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiArrowUpRight, FiBarChart2, FiBookmark, FiBriefcase, FiCalendar, FiCheck, FiCheckCircle, FiChevronDown, FiCode, FiCopy, FiCpu, FiDatabase, FiEdit3, FiFileText,
  FiDownload, FiFolder, FiGlobe, FiGrid, FiHome, FiImage, FiLayers, FiList, FiMessageCircle, FiMonitor, FiMoreHorizontal,
  FiMoreVertical, FiPackage, FiPlus, FiRefreshCw, FiSearch, FiSettings, FiStar, FiTrash2, FiUpload, FiUsers, FiX, FiClock, FiArchive,
  FiTerminal, FiZap,
} from "react-icons/fi";
import {
  SiApifox, SiBaidu, SiDocker, SiFigma, SiGithub, SiGooglechrome, SiJuejin,
  SiNotion, SiObsidian, SiPostman, SiWechat, SiYoutube,
} from "react-icons/si";
import { getFaviconUrls } from "./lib/favicon.js";
import { getDraftCategoryId } from "./lib/category-default.js";
import { getExclusiveEntryValues } from "./lib/entry-mode.js";
import { getTagColorStyle } from "./lib/tag-colors.js";

const FALLBACK = {
  categories: [
    { id: "cat-common", name: "常用", sortOrder: 0 }, { id: "cat-dev", name: "开发", sortOrder: 1 },
    { id: "cat-design", name: "设计", sortOrder: 2 }, { id: "cat-office", name: "办公", sortOrder: 3 },
    { id: "cat-local", name: "本地", sortOrder: 4 }, { id: "cat-network", name: "网络", sortOrder: 5 },
    { id: "cat-other", name: "其他", sortOrder: 6 },
  ],
  tools: [
    { id: "chrome", name: "Prompt Canvas", description: "把一句想法变成可交互的网页原型", icon: "chrome", entryType: "http", primaryUrl: "https://www.google.com/chrome/", localPath: "/Applications/Google Chrome.app", categoryId: "cat-common", tags: ["vibe coding", "原型"], isPinned: true, status: "active", sortOrder: 0 },
    { id: "vscode", name: "Daily Brief", description: "面向个人节奏的 AI 工作日报", icon: "vscode", entryType: "http", primaryUrl: "https://code.visualstudio.com/", localPath: "/Applications/Visual Studio Code.app", categoryId: "cat-dev", tags: ["React", "效率"], isPinned: true, status: "active", sortOrder: 1 },
    { id: "postman", name: "Research Relay", description: "把零散网页资料整理成研究脉络", icon: "postman", entryType: "http", primaryUrl: "https://www.postman.com/", localPath: "/Applications/Postman.app", categoryId: "cat-dev", tags: ["AI", "研究"], isPinned: true, status: "active", sortOrder: 2 },
    { id: "notion", name: "Idea Garden", description: "正在生长的灵感与产品碎片", icon: "notion", entryType: "http", primaryUrl: "https://www.notion.so", categoryId: "cat-office", tags: ["灵感", "知识库"], isPinned: false, status: "active", sortOrder: 3 },
    { id: "docker", name: "Launch Checklist", description: "从本地构建到发布前的轻量清单", icon: "docker", entryType: "http", primaryUrl: "https://www.docker.com/products/docker-desktop/", localPath: "/Applications/Docker.app", categoryId: "cat-dev", tags: ["发布", "流程"], isPinned: false, status: "active", sortOrder: 4 },
    { id: "github", name: "Build Log", description: "记录每次 vibe-coding 的迭代与决定", icon: "github", entryType: "http", primaryUrl: "https://github.com", categoryId: "cat-dev", tags: ["代码", "复盘"], isPinned: false, status: "active", sortOrder: 5 },
    { id: "figma", name: "Moodboard Studio", description: "收集界面氛围、组件和交互参考", icon: "figma", entryType: "http", primaryUrl: "https://www.figma.com", categoryId: "cat-design", tags: ["UI", "灵感"], isPinned: false, status: "active", sortOrder: 6 },
    { id: "youtube", name: "Signal Board", description: "把灵感、视频与参考集中成可检索信号", icon: "youtube", entryType: "http", primaryUrl: "https://youtube.com", categoryId: "cat-network", tags: ["研究", "媒体"], isPinned: false, status: "active", sortOrder: 7 },
    { id: "downloads", name: "Asset Drop", description: "本地素材与下载文件的工作台", icon: "folder", entryType: "path", localPath: "/Users/you/Downloads", categoryId: "cat-local", tags: ["本地", "素材"], isPinned: false, status: "active", sortOrder: 11 },
    { id: "typora", name: "Field Notes", description: "把构建过程沉淀成可复用笔记", icon: "document", entryType: "http", primaryUrl: "https://typora.io/", localPath: "/Applications/Typora.app", categoryId: "cat-local", tags: ["文档", "复盘"], isPinned: false, status: "active", sortOrder: 12 },
    { id: "obsidian", name: "Knowledge Garden", description: "连接实验、文档与长期知识", icon: "obsidian", entryType: "http", primaryUrl: "https://obsidian.md/", localPath: "/Applications/Obsidian.app", categoryId: "cat-office", tags: ["知识", "链接"], isPinned: false, status: "active", sortOrder: 13 },
    { id: "paint", name: "Thumbnail Forge", description: "快速做出项目封面与视觉草图", icon: "image", entryType: "path", localPath: "/Applications/Preview.app", categoryId: "cat-design", tags: ["视觉", "原型"], isPinned: false, status: "active", sortOrder: 14 },
    { id: "chatgpt", name: "Prompt Bench", description: "比较不同提示与模型输出", icon: "openai", entryType: "http", primaryUrl: "https://chatgpt.com", categoryId: "cat-common", tags: ["AI", "实验"], isPinned: false, status: "active", sortOrder: 16 },
    { id: "juejin", name: "Signal Scan", description: "收集社区反馈与技术线索", icon: "juejin", entryType: "http", primaryUrl: "https://juejin.cn", categoryId: "cat-network", tags: ["社区", "研究"], isPinned: false, status: "active", sortOrder: 17 },
  ],
  documents: [
    { id: "doc-product", title: "WorkNest 产品说明", url: "https://docs.example.com/worknest", description: "页面库的产品目标、信息架构和后续规划", categoryId: "cat-office", tags: ["产品", "规划"], isPinned: true, status: "active", sortOrder: 0 },
    { id: "doc-frontend", title: "前端开发规范", url: "https://developer.mozilla.org/zh-CN/", description: "常用 Web API、组件实现和工程规范参考", categoryId: "cat-dev", tags: ["规范", "Web"], isPinned: false, status: "active", sortOrder: 1 },
    { id: "doc-design", title: "设计系统参考", url: "https://www.figma.com/community", description: "收集界面灵感、组件和交互设计参考", categoryId: "cat-design", tags: ["UI", "灵感"], isPinned: false, status: "active", sortOrder: 2 },
    { id: "doc-meeting", title: "项目会议纪要", url: "https://docs.example.com/meeting-notes", description: "记录项目讨论、决策和待办事项", categoryId: "cat-office", tags: ["会议"], isPinned: false, status: "active", sortOrder: 3 },
    { id: "doc-api", title: "常用接口文档", url: "http://192.168.1.10:8080/docs", description: "内网服务的 API 文档与调试入口", categoryId: "cat-dev", tags: ["接口", "内网"], isPinned: false, status: "active", sortOrder: 4 },
  ],
  skills: [
    { id: "skill-brief", name: "需求拆解 Skill", description: "把一句话需求整理成可执行的结构化方案", icon: "spark", entryType: "http", primaryUrl: "http://localhost:8000/skills/brief-to-ard", localPath: "", categoryId: "cat-office", tags: ["需求", "写作"], isPinned: true, status: "active", sortOrder: 0 },
    { id: "skill-code-review", name: "代码审查 Skill", description: "辅助检查代码质量、风险和可维护性", icon: "code", entryType: "path", primaryUrl: "", localPath: "/Users/you/.codex/skills/code-review", categoryId: "cat-dev", tags: ["开发", "质量"], isPinned: false, status: "active", sortOrder: 1 },
    { id: "skill-design-review", name: "设计评审 Skill", description: "从界面一致性和交互体验角度给出改进建议", icon: "design", entryType: "http", primaryUrl: "https://example.com/skills/design-review", localPath: "", categoryId: "cat-design", tags: ["UI", "评审"], isPinned: false, status: "active", sortOrder: 2 },
  ],
};

const categoryIcons = { all: FiGrid, favorites: FiStar, 常用: FiStar, 开发: FiCode, 设计: FiImage, 办公: FiFileText, 本地: FiFolder, 网络: FiGlobe, 其他: FiMoreHorizontal };
const categoryIconMap = { grid: FiGrid, star: FiStar, code: FiCode, design: FiImage, document: FiFileText, folder: FiFolder, globe: FiGlobe, zap: FiZap, more: FiMoreHorizontal, briefcase: FiBriefcase, users: FiUsers, database: FiDatabase, calendar: FiCalendar, analytics: FiBarChart2, project: FiPackage, bookmark: FiBookmark, page: FiMonitor, resources: FiLayers, home: FiHome };
const categoryIconOptions = [{ key: "briefcase", label: "工作", icon: FiBriefcase }, { key: "users", label: "团队", icon: FiUsers }, { key: "database", label: "数据", icon: FiDatabase }, { key: "calendar", label: "日程", icon: FiCalendar }, { key: "analytics", label: "分析", icon: FiBarChart2 }, { key: "project", label: "项目", icon: FiPackage }, { key: "bookmark", label: "收藏", icon: FiBookmark }, { key: "page", label: "页面", icon: FiMonitor }, { key: "resources", label: "资源", icon: FiLayers }, { key: "home", label: "入口", icon: FiHome }, { key: "folder", label: "文件夹", icon: FiFolder }, { key: "more", label: "其他", icon: FiMoreHorizontal }];
const skillIcons = { spark: FiZap, testing: FiCheckCircle, development: FiTerminal, code: FiCode, design: FiImage, writing: FiFileText, skill: FiCpu, folder: FiFolder };
const skillIconColors = { spark: "#7c3aed", testing: "#18a673", development: "#1683d8", code: "#4f63d8", design: "#e4588a", writing: "#5a67d8", skill: "#6d5dfc", folder: "#efa900" };
const skillIconLabels = { spark: "灵感 / 分析", testing: "测试", development: "开发", code: "代码", design: "设计", writing: "写作", skill: "通用 Skill", folder: "文件夹" };
const toolIcons = { chrome: SiGooglechrome, vscode: FiCode, postman: SiPostman, apifox: SiApifox, notion: SiNotion, docker: SiDocker, github: SiGithub, figma: SiFigma, youtube: SiYoutube, wechat: SiWechat, feishu: FiMessageCircle, baidu: SiBaidu, obsidian: SiObsidian, openai: FiMessageCircle, juejin: SiJuejin, folder: FiFolder, document: FiFileText, image: FiImage };
const iconColors = { chrome: "#e94235", vscode: "#1683d8", postman: "#ff6c37", apifox: "#f34b78", notion: "#121212", docker: "#1599e8", github: "#171717", figma: "#f24e1e", youtube: "#ff0000", wechat: "#07c160", feishu: "#16b9a5", baidu: "#2777f0", obsidian: "#7c4dff", openai: "#168c73", juejin: "#1677ff", folder: "#efa900", document: "#5a9bea", image: "#ff9f1c" };
const iconLabels = { chrome: "Chrome", vscode: "VS Code", postman: "Postman", apifox: "Apifox", notion: "Notion", docker: "Docker", github: "GitHub", figma: "Figma", youtube: "YouTube", wechat: "微信", feishu: "飞书", baidu: "百度网盘", obsidian: "Obsidian", openai: "AI 助手", juejin: "掘金", folder: "文件夹", document: "文档", image: "图片" };

function Icon({ name, size = 22, className = "" }) {
  const Component = toolIcons[name] || FiGrid;
  return <Component className={className} size={size} aria-hidden="true" style={{ color: iconColors[name] }} />;
}

function apiRequest(path, options) {
  return fetch(path, { headers: { "Content-Type": "application/json" }, ...options }).then(async (response) => {
    if (!response.ok) throw new Error((await response.json().catch(() => null))?.error || "请求失败");
    if (response.status === 204) return null;
    return response.json();
  });
}

const parseTagInput = (value) => String(value || "").split(/[,，、]/).map((tag) => tag.trim()).filter(Boolean);

function makeDraft(categories, activeFilter) {
  return { id: null, name: "", description: "", icon: "folder", entryType: "http", primaryUrl: "", backupUrls: "", localPath: "", categoryId: getDraftCategoryId(categories, activeFilter), tags: "", isPinned: false, status: "active" };
}

function makeDocumentDraft(categories, activeFilter) {
  return { id: null, title: "", url: "", description: "", categoryId: getDraftCategoryId(categories, activeFilter), tags: "", isPinned: false, status: "active" };
}

function makeSkillDraft(categories, activeFilter) {
  return { id: null, name: "", description: "", icon: "spark", entryType: "http", primaryUrl: "", localPath: "", categoryId: getDraftCategoryId(categories, activeFilter), tags: "", isPinned: false, status: "active" };
}

function AutoFavicon({ urls, fallback }) {
  const urlsKey = urls.join("|");
  const [urlIndex, setUrlIndex] = useState(0);
  const [status, setStatus] = useState(urls.length ? "loading" : "failed");
  useEffect(() => { setUrlIndex(0); setStatus(urls.length ? "loading" : "failed"); }, [urlsKey]);
  const url = urls[urlIndex];
  if (!url || status === "failed") return fallback;
  const handleError = () => {
    if (urlIndex < urls.length - 1) setUrlIndex((current) => current + 1);
    else setStatus("failed");
  };
  return <><span className={`remote-icon-fallback ${status === "loaded" ? "is-hidden" : ""}`}>{fallback}</span><img className={`remote-tool-icon ${status === "loaded" ? "is-loaded" : ""}`} src={url} alt="" loading="lazy" referrerPolicy="no-referrer" onLoad={() => setStatus("loaded")} onError={handleError} /></>;
}

function ToolIcon({ tool }) {
  const faviconUrls = getFaviconUrls(tool.entryType, tool.primaryUrl);
  return <div className="tool-icon" style={{ background: `${iconColors[tool.icon] || "#6d5dfc"}12` }}><AutoFavicon urls={faviconUrls} fallback={<Icon name={tool.icon} size={30} />} /></div>;
}

function SkillIcon({ skill }) {
  const Component = skillIcons[skill.icon] || FiZap;
  const faviconUrls = getFaviconUrls(skill.entryType, skill.primaryUrl);
  return <div className="tool-icon skill-icon" style={{ background: `${skillIconColors[skill.icon] || "#6d5dfc"}16` }}><AutoFavicon urls={faviconUrls} fallback={<Component size={30} aria-hidden="true" style={{ color: skillIconColors[skill.icon] || "#6d5dfc" }} />} /></div>;
}

function TagBadge({ tag }) {
  return <span className="tag-badge colored-tag" style={getTagColorStyle(tag)}>{tag}</span>;
}

function App() {
  const [data, setData] = useState({ categories: [], tools: [], documents: [] });
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [workspace, setWorkspace] = useState("tools");
  const [activeFilter, setActiveFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [documentQuery, setDocumentQuery] = useState("");
  const [skillQuery, setSkillQuery] = useState("");
  const [documentTag, setDocumentTag] = useState("all");
  const [skillTag, setSkillTag] = useState("all");
  const [documentSort, setDocumentSort] = useState("manual");
  const [skillSort, setSkillSort] = useState("manual");
  const [sort, setSort] = useState("manual");
  const [view, setView] = useState("grid");
  const [editor, setEditor] = useState(null);
  const [documentEditor, setDocumentEditor] = useState(null);
  const [skillEditor, setSkillEditor] = useState(null);
  const [categoryEditor, setCategoryEditor] = useState(null);
  const [categoryManager, setCategoryManager] = useState(false);
  const [menuId, setMenuId] = useState(null);
  const [documentMenuId, setDocumentMenuId] = useState(null);
  const [skillMenuId, setSkillMenuId] = useState(null);
  const [utilityMenu, setUtilityMenu] = useState(false);
  const [toast, setToast] = useState(null);
  const importInput = useRef(null);

  const loadData = async () => {
    try { setData(await apiRequest("/api/bootstrap")); setUsingFallback(false); }
    catch { setData(FALLBACK); setUsingFallback(true); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadData(); }, []);
  useEffect(() => { if (!toast) return undefined; const timer = window.setTimeout(() => setToast(null), 2400); return () => window.clearTimeout(timer); }, [toast]);

  const categories = useMemo(() => [...data.categories].sort((a, b) => a.sortOrder - b.sortOrder), [data.categories]);
  const tools = useMemo(() => [...data.tools].sort((a, b) => a.sortOrder - b.sortOrder), [data.tools]);
  const documents = useMemo(() => [...(data.documents || [])].sort((a, b) => a.sortOrder - b.sortOrder), [data.documents]);
  const skills = useMemo(() => [...(data.skills || [])].sort((a, b) => a.sortOrder - b.sortOrder), [data.skills]);
  const categoryMap = useMemo(() => Object.fromEntries(categories.map((category) => [category.id, category])), [categories]);
  const documentTags = useMemo(() => [...new Set(documents.flatMap((document) => document.tags || []))].sort((a, b) => a.localeCompare(b, "zh-CN")), [documents]);
  const skillTags = useMemo(() => [...new Set(skills.flatMap((skill) => skill.tags || []))].sort((a, b) => a.localeCompare(b, "zh-CN")), [skills]);
  const filteredDocuments = useMemo(() => {
    const normalizedQuery = documentQuery.trim().toLowerCase();
    const collection = documents.filter((document) => {
      const searchable = [document.title, document.description, document.url, ...(document.tags || [])].join(" ").toLowerCase();
      const matchesTag = documentTag === "all" || (document.tags || []).includes(documentTag);
      const matchesCollection = activeFilter === "all" || (activeFilter === "favorites" && document.isPinned) || (activeFilter === "drafts" && document.status !== "active") || activeFilter === "recent";
      return matchesTag && matchesCollection && (!normalizedQuery || searchable.includes(normalizedQuery));
    }).sort((a, b) => documentSort === "name" ? a.title.localeCompare(b.title, "zh-CN") : documentSort === "recent" ? (b.updatedAt || "").localeCompare(a.updatedAt || "") : a.sortOrder - b.sortOrder);
    return activeFilter === "recent" ? collection.slice(0, 8) : collection;
  }, [activeFilter, documentQuery, documentSort, documentTag, documents]);
  const filteredSkills = useMemo(() => {
    const normalizedQuery = skillQuery.trim().toLowerCase();
    const collection = skills.filter((skill) => {
      const searchable = [skill.name, skill.description, skill.primaryUrl, skill.localPath, ...(skill.tags || [])].join(" ").toLowerCase();
      const matchesTag = skillTag === "all" || (skill.tags || []).includes(skillTag);
      const matchesCollection = activeFilter === "all" || (activeFilter === "favorites" && skill.isPinned) || (activeFilter === "drafts" && skill.status !== "active") || activeFilter === "recent";
      return matchesTag && matchesCollection && (!normalizedQuery || searchable.includes(normalizedQuery));
    }).sort((a, b) => skillSort === "name" ? a.name.localeCompare(b.name, "zh-CN") : skillSort === "recent" ? (b.updatedAt || "").localeCompare(a.updatedAt || "") : a.sortOrder - b.sortOrder);
    return activeFilter === "recent" ? collection.slice(0, 8) : collection;
  }, [activeFilter, skillQuery, skillSort, skillTag, skills]);
  const filteredTools = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const collection = tools.filter((tool) => {
      const matchesFilter = activeFilter === "all" || (activeFilter === "favorites" && tool.isPinned) || (activeFilter === "drafts" && tool.status !== "active") || activeFilter === "recent";
      const searchable = [tool.name, tool.description, ...(tool.tags || []), tool.primaryUrl, tool.localPath].join(" ").toLowerCase();
      return matchesFilter && (!normalizedQuery || searchable.includes(normalizedQuery));
    }).sort((a, b) => sort === "name" ? a.name.localeCompare(b.name, "zh-CN") : sort === "recent" ? (b.updatedAt || "").localeCompare(a.updatedAt || "") : a.sortOrder - b.sortOrder);
    return activeFilter === "recent" ? collection.slice(0, 8) : collection;
  }, [activeFilter, categoryMap, query, sort, tools]);
  const showToast = (message, tone = "default") => setToast({ message, tone });

  const copyValue = async (value, message = "已复制") => {
    if (!value) return showToast("没有可复制的内容", "error");
    try { await navigator.clipboard.writeText(value); showToast(message, "success"); }
    catch { showToast("浏览器不允许复制，请手动选择内容", "error"); }
  };
  const openTool = async (tool) => {
    const url = tool.primaryUrl || tool.endpoints?.find((endpoint) => endpoint.isPrimary)?.url;
    if (url) window.open(url, "_blank", "noopener,noreferrer");
    else if (tool.localPath) await copyValue(tool.localPath, "路径已复制");
    else showToast("请先配置 HTTP 地址或本地路径", "error");
  };
  const openEditor = (tool = null) => {
    setEditor(tool ? { ...tool, backupUrls: (tool.endpoints || []).filter((endpoint) => !endpoint.isPrimary).map((endpoint) => endpoint.url).join("\n"), tags: (tool.tags || []).join(", ") } : makeDraft(categories, activeFilter));
    setMenuId(null);
  };
  const saveTool = async (event) => {
    event.preventDefault(); const form = editor;
    if (!form.name.trim()) return showToast("请填写页面名称", "error");
    if (form.entryType === "http" && !form.primaryUrl.trim()) return showToast("请填写 HTTP 地址", "error");
    if (form.entryType === "path" && !form.localPath.trim()) return showToast("请填写本地路径", "error");
    const entryValues = getExclusiveEntryValues(form.entryType, form.primaryUrl, form.localPath);
    const payload = { name: form.name.trim(), description: form.description.trim(), icon: form.icon, entryType: form.entryType, ...entryValues, categoryId: form.categoryId || null, tags: typeof form.tags === "string" ? parseTagInput(form.tags) : form.tags, isPinned: Boolean(form.isPinned), status: form.status, backupUrls: form.entryType === "http" ? form.backupUrls.split("\n").map((url) => url.trim()).filter(Boolean) : [] };
    try {
      if (usingFallback) { const nextTool = { ...payload, id: form.id || `local-${Date.now()}`, sortOrder: form.sortOrder ?? data.tools.length }; setData((current) => ({ ...current, tools: form.id ? current.tools.map((item) => item.id === form.id ? { ...item, ...nextTool } : item) : [...current.tools, nextTool] })); }
      else { await apiRequest(form.id ? `/api/tools/${form.id}` : "/api/tools", { method: form.id ? "PATCH" : "POST", body: JSON.stringify(payload) }); await loadData(); }
      setEditor(null); showToast(form.id ? "页面已更新" : "页面已添加", "success");
    } catch (error) { showToast(error.message, "error"); }
  };
  const deleteTool = async (tool) => {
    if (!window.confirm(`确认删除“${tool.name}”吗？`)) return;
    try { if (usingFallback) setData((current) => ({ ...current, tools: current.tools.filter((item) => item.id !== tool.id) })); else { await apiRequest(`/api/tools/${tool.id}`, { method: "DELETE" }); await loadData(); } setMenuId(null); showToast("页面已删除", "success"); }
    catch (error) { showToast(error.message, "error"); }
  };
  const createCategory = () => setCategoryEditor({ id: null, name: "", icon: "briefcase" });
  const editCategory = (category) => { setCategoryManager(false); setCategoryEditor({ id: category.id, name: category.name, icon: category.icon || "folder" }); };
  const saveCategory = async (event) => {
    event.preventDefault(); const name = categoryEditor.name.trim(); const icon = categoryEditor.icon || "folder";
    if (!name) return showToast("请填写分组名称", "error");
    try {
      if (usingFallback) setData((current) => ({ ...current, categories: categoryEditor.id ? current.categories.map((item) => item.id === categoryEditor.id ? { ...item, name, icon } : item) : [...current.categories, { id: `local-cat-${Date.now()}`, name, icon, sortOrder: current.categories.length }] }));
      else { await apiRequest(categoryEditor.id ? `/api/categories/${categoryEditor.id}` : "/api/categories", { method: categoryEditor.id ? "PATCH" : "POST", body: JSON.stringify({ name, icon }) }); await loadData(); }
      setCategoryEditor(null); showToast(categoryEditor.id ? "分组已更新" : "分组已创建", "success");
    }
    catch (error) { showToast(error.message, "error"); }
  };
  const deleteCategory = async (category) => {
    if (/^cat-\d+$/.test(category.id)) return showToast("系统分组不可删除", "error");
    if (!window.confirm(`确认删除分组“${category.name}”吗？分组内的内容会保留，但会变为未分类。`)) return;
    try {
      if (usingFallback) setData((current) => ({ ...current, categories: current.categories.filter((item) => item.id !== category.id), tools: current.tools.map((item) => item.categoryId === category.id ? { ...item, categoryId: null } : item), documents: (current.documents || []).map((item) => item.categoryId === category.id ? { ...item, categoryId: null } : item), skills: (current.skills || []).map((item) => item.categoryId === category.id ? { ...item, categoryId: null } : item) }));
      else { await apiRequest(`/api/categories/${category.id}`, { method: "DELETE" }); await loadData(); }
      setCategoryManager(false); setCategoryEditor(null); setActiveFilter("all"); showToast("分组已删除", "success");
    } catch (error) { showToast(error.message, "error"); }
  };
  const exportLibrary = async () => {
    try {
      const payload = usingFallback ? { schemaVersion: 1, exportedAt: new Date().toISOString(), ...data } : await apiRequest("/api/export");
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `worknest-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(link.href);
      setUtilityMenu(false); showToast("工作区已导出", "success");
    } catch (error) { showToast(error.message, "error"); }
  };
  const importLibrary = async (event) => {
    const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
    try {
      const payload = JSON.parse(await file.text());
      if (!Array.isArray(payload.categories) || !Array.isArray(payload.tools)) throw new Error("JSON 文件格式不正确");
      if (usingFallback) setData({ categories: payload.categories, tools: payload.tools, documents: payload.documents || [], skills: payload.skills || [] });
      else { await apiRequest("/api/import", { method: "POST", body: JSON.stringify(payload) }); await loadData(); }
      setUtilityMenu(false); showToast("工作区已导入", "success");
    } catch (error) { showToast(error.message, "error"); }
  };
  const togglePinned = async (tool) => {
    const nextPinned = !tool.isPinned;
    try { if (usingFallback) setData((current) => ({ ...current, tools: current.tools.map((item) => item.id === tool.id ? { ...item, isPinned: nextPinned } : item) })); else { await apiRequest(`/api/tools/${tool.id}`, { method: "PATCH", body: JSON.stringify({ isPinned: nextPinned }) }); await loadData(); } showToast(nextPinned ? "已加入常用页面" : "已取消收藏", "success"); }
    catch (error) { showToast(error.message, "error"); }
  };
  const openDocument = (document) => {
    if (!document.url) return showToast("请先配置文档地址", "error");
    window.open(document.url, "_blank", "noopener,noreferrer");
  };
  const openDocumentEditor = (document = null) => {
    setDocumentEditor(document ? { ...document, tags: (document.tags || []).join(", ") } : makeDocumentDraft(categories, activeFilter));
    setDocumentMenuId(null);
  };
  const saveDocument = async (event) => {
    event.preventDefault(); const form = documentEditor;
    if (!form.title.trim()) return showToast("请填写文档标题", "error");
    if (!form.url.trim()) return showToast("请填写文档地址", "error");
    const payload = { title: form.title.trim(), url: form.url.trim(), description: form.description.trim(), categoryId: form.categoryId || null, tags: typeof form.tags === "string" ? parseTagInput(form.tags) : form.tags, isPinned: Boolean(form.isPinned), status: form.status };
    try {
      if (usingFallback) { const nextDocument = { ...payload, id: form.id || `local-doc-${Date.now()}`, sortOrder: form.sortOrder ?? data.documents.length }; setData((current) => ({ ...current, documents: form.id ? current.documents.map((item) => item.id === form.id ? { ...item, ...nextDocument } : item) : [...current.documents, nextDocument] })); }
      else { await apiRequest(form.id ? `/api/documents/${form.id}` : "/api/documents", { method: form.id ? "PATCH" : "POST", body: JSON.stringify(payload) }); await loadData(); }
      setDocumentEditor(null); showToast(form.id ? "文档已更新" : "文档已添加", "success");
    } catch (error) { showToast(error.message, "error"); }
  };
  const deleteDocument = async (document) => {
    if (!window.confirm(`确认删除“${document.title}”吗？`)) return;
    try { if (usingFallback) setData((current) => ({ ...current, documents: current.documents.filter((item) => item.id !== document.id) })); else { await apiRequest(`/api/documents/${document.id}`, { method: "DELETE" }); await loadData(); } setDocumentMenuId(null); showToast("文档已删除", "success"); }
    catch (error) { showToast(error.message, "error"); }
  };
  const toggleDocumentPinned = async (document) => {
    const nextPinned = !document.isPinned;
    try { if (usingFallback) setData((current) => ({ ...current, documents: current.documents.map((item) => item.id === document.id ? { ...item, isPinned: nextPinned } : item) })); else { await apiRequest(`/api/documents/${document.id}`, { method: "PATCH", body: JSON.stringify({ isPinned: nextPinned }) }); await loadData(); } showToast(nextPinned ? "已收藏文档" : "已取消收藏", "success"); }
    catch (error) { showToast(error.message, "error"); }
  };
  const openSkill = async (skill) => {
    if (skill.primaryUrl) window.open(skill.primaryUrl, "_blank", "noopener,noreferrer");
    else if (skill.localPath) await copyValue(skill.localPath, "Skill 路径已复制");
    else showToast("请先配置 Skill 的 HTTP 地址或本地路径", "error");
  };
  const openSkillEditor = (skill = null) => {
    setSkillEditor(skill ? { ...skill, tags: (skill.tags || []).join(", ") } : makeSkillDraft(categories, activeFilter));
    setSkillMenuId(null);
  };
  const saveSkill = async (event) => {
    event.preventDefault(); const form = skillEditor;
    if (!form.name.trim()) return showToast("请填写 Skill 名称", "error");
    if (form.entryType === "http" && !form.primaryUrl.trim()) return showToast("请填写 Skill HTTP 地址", "error");
    if (form.entryType === "path" && !form.localPath.trim()) return showToast("请填写 Skill 本地路径", "error");
    const entryValues = getExclusiveEntryValues(form.entryType, form.primaryUrl, form.localPath);
    const payload = { name: form.name.trim(), description: form.description.trim(), icon: form.icon, entryType: form.entryType, ...entryValues, categoryId: form.categoryId || null, tags: typeof form.tags === "string" ? parseTagInput(form.tags) : form.tags, isPinned: Boolean(form.isPinned), status: form.status };
    try {
      if (usingFallback) { const nextSkill = { ...payload, id: form.id || `local-skill-${Date.now()}`, sortOrder: form.sortOrder ?? data.skills.length }; setData((current) => ({ ...current, skills: form.id ? current.skills.map((item) => item.id === form.id ? { ...item, ...nextSkill } : item) : [...(current.skills || []), nextSkill] })); }
      else { await apiRequest(form.id ? `/api/skills/${form.id}` : "/api/skills", { method: form.id ? "PATCH" : "POST", body: JSON.stringify(payload) }); await loadData(); }
      setSkillEditor(null); showToast(form.id ? "Skill 已更新" : "Skill 已添加", "success");
    } catch (error) { showToast(error.message, "error"); }
  };
  const deleteSkill = async (skill) => {
    if (!window.confirm(`确认删除“${skill.name}”吗？`)) return;
    try { if (usingFallback) setData((current) => ({ ...current, skills: (current.skills || []).filter((item) => item.id !== skill.id) })); else { await apiRequest(`/api/skills/${skill.id}`, { method: "DELETE" }); await loadData(); } setSkillMenuId(null); showToast("Skill 已删除", "success"); }
    catch (error) { showToast(error.message, "error"); }
  };
  const toggleSkillPinned = async (skill) => {
    const nextPinned = !skill.isPinned;
    try { if (usingFallback) setData((current) => ({ ...current, skills: (current.skills || []).map((item) => item.id === skill.id ? { ...item, isPinned: nextPinned } : item) })); else { await apiRequest(`/api/skills/${skill.id}`, { method: "PATCH", body: JSON.stringify({ isPinned: nextPinned }) }); await loadData(); } showToast(nextPinned ? "已收藏 Skill" : "已取消收藏", "success"); }
    catch (error) { showToast(error.message, "error"); }
  };

  return <div className="app-shell">
    <aside className="studio-rail" aria-label="工作区导航">
      <button className="lab-brand" type="button" onClick={() => { setWorkspace("tools"); setActiveFilter("all"); }} aria-label="WorkNest Lab"><span className="brand-symbol"><img src="/worknest-mark.svg" alt="" /></span><span className="brand-name">WorkNest <b>Lab</b></span><span className="brand-kicker">PERSONAL BUILD SPACE</span></button>
      <div className="rail-section-label">BUILD SPACE</div>
      <nav className="rail-items"><RailButton label="实验索引" icon={FiGrid} active={workspace === "tools" && activeFilter === "all"} onClick={() => { setWorkspace("tools"); setActiveFilter("all"); }} /><RailButton label="最近加入" icon={FiClock} active={workspace === "tools" && activeFilter === "recent"} onClick={() => { setWorkspace("tools"); setActiveFilter("recent"); }} /><RailButton label="收藏夹" icon={FiStar} active={workspace === "tools" && activeFilter === "favorites"} onClick={() => { setWorkspace("tools"); setActiveFilter("favorites"); }} /><RailButton label="待整理" icon={FiArchive} active={workspace === "tools" && activeFilter === "drafts"} onClick={() => { setWorkspace("tools"); setActiveFilter("drafts"); }} /></nav>
      <div className="rail-section-label">KNOWLEDGE</div>
      <nav className="rail-documents"><RailButton label="参考资料" icon={FiFileText} active={workspace === "documents"} onClick={() => { setWorkspace("documents"); setActiveFilter("all"); }} /><RailButton label="Skill Vault" icon={FiZap} active={workspace === "skills"} onClick={() => { setWorkspace("skills"); setActiveFilter("all"); }} /></nav>
      <div className="rail-bottom"><div className="rail-status"><span /> LOCAL VAULT</div><RailButton label="设置" icon={FiSettings} onClick={() => showToast("设置面板将在后续版本开放")} /></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="breadcrumb"><span className="breadcrumb-mark" /> <span>WORKNEST LAB</span><strong>/ {workspace === "tools" ? "EXPERIMENTS" : workspace === "skills" ? "SKILL VAULT" : "REFERENCE"}</strong></div><div className="topbar-actions"><div className="search-box"><FiSearch size={18} /><input value={workspace === "tools" ? query : workspace === "documents" ? documentQuery : skillQuery} onChange={(event) => workspace === "tools" ? setQuery(event.target.value) : workspace === "documents" ? setDocumentQuery(event.target.value) : setSkillQuery(event.target.value)} placeholder={workspace === "tools" ? "搜索实验、入口或标签" : workspace === "documents" ? "搜索资料、链接或标签" : "搜索 Skill、简介或标签"} aria-label={workspace === "tools" ? "搜索实验" : workspace === "documents" ? "搜索资料" : "搜索 Skill"} /><kbd>⌘ K</kbd></div><button className="icon-button" type="button" aria-label="设置" onClick={() => showToast("设置面板将在后续版本开放")}><FiSettings size={18} /></button><div className="profile-avatar">A</div><FiChevronDown size={14} /></div></header>
      {workspace === "tools" ? <>
        <section className="lab-hero"><div className="hero-copy"><div className="hero-overline"><span>01</span> EXPERIMENT INDEX</div><h1>Make room for <em>good ideas.</em></h1><p>WorkNest Lab 把 vibe-coding 的过程、作品和可复用能力，整理成一个会持续生长的个人工作台。</p><div className="hero-actions"><button className="new-tool-button" type="button" onClick={() => openEditor()}><FiPlus size={17} /> 新建实验</button><button className="hero-text-button" type="button" onClick={() => setWorkspace("skills")}>浏览 Skill Vault <FiArrowUpRight size={15} /></button></div></div><div className="hero-note"><span>WELCOME / 01</span><strong>欢迎回到<br />WorkNest Lab。</strong><small>从一个小想法开始，继续把它做出来。</small></div></section>
        <div className="filter-row"><CollectionTabs activeFilter={activeFilter} onChange={setActiveFilter} /><div className="toolbar-actions"><label className="sort-select">排序<select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="排序方式"><option value="manual">默认</option><option value="recent">最近更新</option><option value="name">名称</option></select><FiChevronDown size={15} /></label><div className="view-switcher"><button className={view === "grid" ? "active" : ""} type="button" onClick={() => setView("grid")} aria-label="卡片视图"><FiGrid size={18} /></button><button className={view === "list" ? "active" : ""} type="button" onClick={() => setView("list")} aria-label="列表视图"><FiList size={18} /></button></div><div className="utility-menu"><button className="utility-button" type="button" onClick={() => setUtilityMenu((open) => !open)} aria-label="工作区操作"><FiMoreHorizontal size={19} /></button>{utilityMenu && <div className="utility-popover"><button type="button" onClick={exportLibrary}><FiDownload /> 导出 JSON</button><button type="button" onClick={() => importInput.current?.click()}><FiUpload /> 导入 JSON</button></div>}<input ref={importInput} type="file" accept="application/json,.json" hidden onChange={importLibrary} /></div><button className="new-tool-button" type="button" onClick={() => openEditor()}><FiPlus size={18} /> 新建实验</button></div></div>
        <section className="page-heading"><div><p className="eyebrow">{activeFilter === "all" ? "ALL EXPERIMENTS" : activeFilter === "recent" ? "RECENTLY ADDED" : activeFilter === "favorites" ? "PINNED EXPERIMENTS" : "NEEDS ATTENTION"}</p><h2>{activeFilter === "all" ? "实验档案" : activeFilter === "recent" ? "最近加入" : activeFilter === "favorites" ? "收藏实验" : "待整理"}</h2><p className="page-summary">{filteredTools.length} 个项目 · 记录想法如何变成可运行的东西</p></div><span className={`connection-state ${usingFallback ? "offline" : ""}`}><span />{usingFallback ? "本地演示数据" : "LOCAL VAULT"}</span></section>
        {!loading && <section className="lab-snapshot" aria-label="实验库概览"><div><span>PROJECTS</span><strong>{tools.length}</strong><small>已归档实验</small></div><div><span>SKILLS</span><strong>{skills.length}</strong><small>可复用能力</small></div><div><span>PINNED</span><strong>{tools.filter((tool) => tool.isPinned).length}</strong><small>当前常用</small></div><p>从一个模糊念头到可运行的东西。<br /><em>Keep the momentum.</em></p></section>}
        {loading ? <div className="loading-state"><FiRefreshCw className="spin" /> 正在加载实验库...</div> : <ProjectBoard projects={filteredTools} view={view} onOpen={openTool} onEdit={openEditor} onDelete={deleteTool} onTogglePinned={togglePinned} />}
      </> : workspace === "documents" ? <DocumentsWorkspace documents={filteredDocuments} documentTags={documentTags} documentTag={documentTag} setDocumentTag={setDocumentTag} documentSort={documentSort} setDocumentSort={setDocumentSort} view={view} setView={setView} loading={loading} usingFallback={usingFallback} categories={categories} categoryMap={categoryMap} activeFilter={activeFilter} setActiveFilter={setActiveFilter} onNew={() => openDocumentEditor()} onOpen={openDocument} onEdit={openDocumentEditor} onDelete={deleteDocument} onTogglePinned={toggleDocumentPinned} menuId={documentMenuId} setMenuId={setDocumentMenuId} /> : <SkillsWorkspace skills={filteredSkills} skillTags={skillTags} skillTag={skillTag} setSkillTag={setSkillTag} skillSort={skillSort} setSkillSort={setSkillSort} view={view} setView={setView} loading={loading} usingFallback={usingFallback} categories={categories} categoryMap={categoryMap} activeFilter={activeFilter} setActiveFilter={setActiveFilter} onNew={() => openSkillEditor()} onOpen={openSkill} onEdit={openSkillEditor} onDelete={deleteSkill} onTogglePinned={toggleSkillPinned} menuId={skillMenuId} setMenuId={setSkillMenuId} />}
    </main>
    {editor && <ToolEditor editor={editor} categories={categories} onChange={setEditor} onClose={() => setEditor(null)} onSubmit={saveTool} />}{documentEditor && <DocumentEditor editor={documentEditor} categories={categories} onChange={setDocumentEditor} onClose={() => setDocumentEditor(null)} onSubmit={saveDocument} />}{skillEditor && <SkillEditor editor={skillEditor} categories={categories} onChange={setSkillEditor} onClose={() => setSkillEditor(null)} onSubmit={saveSkill} />}{categoryEditor && <CategoryEditor editor={categoryEditor} categories={categories} onChange={setCategoryEditor} onClose={() => setCategoryEditor(null)} onSubmit={saveCategory} />}{categoryManager && <CategoryManager categories={categories} onEdit={editCategory} onDelete={deleteCategory} onClose={() => setCategoryManager(false)} />}{toast && <div className={`toast ${toast.tone}`}><FiCheck size={16} />{toast.message}</div>}
  </div>;
}

function CollectionTabs({ activeFilter, onChange }) {
  const tabs = [["all", "全部", FiGrid], ["recent", "最近加入", FiClock], ["favorites", "收藏", FiStar], ["drafts", "待整理", FiArchive]];
  return <div className="collection-tabs" role="tablist" aria-label="内容视图">{tabs.map(([value, label, Component]) => <button key={value} type="button" className={activeFilter === value ? "active" : ""} onClick={() => onChange(value)}><Component size={14} />{label}</button>)}</div>;
}

function projectProgress(tool) {
  if (tool.status !== "active") return 24;
  if (tool.isPinned) return 72;
  return 38 + (((tool.sortOrder || 0) * 17) % 58);
}

function projectStage(tool) {
  const progress = projectProgress(tool);
  return progress >= 82 ? "READY" : progress >= 58 ? "NOW" : "NEXT";
}

function projectStatus(tool) {
  if (tool.status !== "active") return "PAUSED";
  const progress = projectProgress(tool);
  return progress >= 82 ? "READY" : progress >= 58 ? "IN BUILD" : "EXPLORING";
}

function projectStack(tool) {
  const mode = tool.entryType === "http" ? "HTTP" : "LOCAL";
  const tag = (tool.tags || [])[0] || "VIBE CODING";
  return `${mode} · ${tag}`;
}

function ProjectBoard({ projects, view, onOpen, onEdit, onDelete, onTogglePinned }) {
  const [focusedId, setFocusedId] = useState(projects[0]?.id || null);
  useEffect(() => {
    if (!projects.some((project) => project.id === focusedId)) setFocusedId(projects[0]?.id || null);
  }, [focusedId, projects]);
  const focused = projects.find((project) => project.id === focusedId) || projects[0];
  if (!focused) return <div className="empty-state"><FiSearch size={24} /><strong>没有找到匹配实验</strong><span>换个关键词或清除筛选试试</span></div>;
  const focusedProgress = projectProgress(focused);
  return <section className={`project-board ${view === "list" ? "list-mode" : ""}`} aria-label="Vibe-coding 项目工作台">
    <div className="project-board-heading"><div><p className="eyebrow">LAB PROJECTS / TIMELINE</p><h2>Projects in motion</h2><p>左侧看项目如何推进，右侧直接查看当前作品。</p></div><span>{projects.length.toString().padStart(2, "0")} PROJECTS</span></div>
      <div className="project-board-grid">
      <div className="project-timeline" role="list" aria-label="项目时间线">{projects.map((project, index) => { const progress = projectProgress(project); return <div className={`project-timeline-row ${focused.id === project.id ? "active" : ""}`} key={project.id} role="listitem" tabIndex="0" onClick={() => setFocusedId(project.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setFocusedId(project.id); } }}><span className="project-timeline-marker">{String(index + 1).padStart(2, "0")}</span><span className="project-timeline-copy"><span className="project-timeline-meta"><span>{projectStage(project)}</span><strong>{projectStatus(project)}</strong></span><b>{project.name}</b><small>{project.description}</small></span><span className="project-timeline-progress"><i style={{ width: `${progress}%` }} /><em>{progress}%</em></span><span className="project-pin-wrap"><button className={`project-pin ${project.isPinned ? "selected" : ""}`} type="button" aria-label={project.isPinned ? "取消收藏" : "收藏项目"} onClick={(event) => { event.stopPropagation(); onTogglePinned(project); }}><FiStar size={16} /></button></span></div>; })}</div>
      <aside className="project-showcase" aria-label="当前项目预览"><div className="showcase-cover"><span>LAB / {String((focused.sortOrder || 0) + 1).padStart(2, "0")}</span><div className="showcase-orbit orbit-one" /><div className="showcase-orbit orbit-two" /><ToolIcon tool={focused} /></div><div className="showcase-body"><div className="showcase-label"><span>SELECTED PROJECT</span><strong>{projectStatus(focused)}</strong></div><h3>{focused.name}</h3><p>{focused.description || "暂无简介"}</p><div className="showcase-stats"><div><span>PROGRESS</span><strong>{focusedProgress}%</strong></div><div><span>STACK</span><strong>{projectStack(focused)}</strong></div><div><span>UPDATED</span><strong>{focused.updatedAt ? new Date(focused.updatedAt).toLocaleDateString("zh-CN", { month: "short", day: "numeric" }) : "本周"}</strong></div></div><div className="showcase-tags">{(focused.tags || []).slice(0, 3).map((tag) => <TagBadge tag={tag} key={tag} />)}</div><div className="showcase-actions"><button className="primary-button" type="button" onClick={() => onOpen(focused)}>{focused.entryType === "http" ? "打开项目" : "复制路径"} <FiArrowUpRight size={15} /></button><button className="secondary-button" type="button" onClick={() => onEdit(focused)}>编辑</button><button className="icon-button danger-button" type="button" aria-label="删除项目" onClick={() => onDelete(focused)}><FiTrash2 size={16} /></button></div></div></aside>
    </div>
  </section>;
}

function skillProgress(skill) {
  if (skill.status !== "active") return 24;
  if (skill.isPinned) return 84;
  return 52 + (((skill.sortOrder || 0) * 19) % 42);
}

function skillState(skill) {
  if (skill.status !== "active") return "PAUSED";
  return skill.isPinned ? "IN USE" : "READY";
}

function SkillBoard({ skills, view, onOpen, onEdit, onDelete, onTogglePinned }) {
  const [focusedId, setFocusedId] = useState(skills[0]?.id || null);
  useEffect(() => {
    if (!skills.some((skill) => skill.id === focusedId)) setFocusedId(skills[0]?.id || null);
  }, [focusedId, skills]);
  const focused = skills.find((skill) => skill.id === focusedId) || skills[0];
  if (!focused) return <div className="empty-state"><FiZap size={24} /><strong>还没有 Skill</strong><span>添加你编写的 HTTP 或本地 Skill，建立自己的能力库</span></div>;
  const focusedAddress = focused.primaryUrl || focused.localPath;
  return <section className={`project-board skill-board ${view === "list" ? "list-mode" : ""}`} aria-label="Skill Vault 工作台">
    <div className="project-board-heading"><div><p className="eyebrow">SKILL SYSTEM / MODULES</p><h2>Capabilities in motion</h2><p>左侧管理可复用能力，右侧查看当前 Skill。</p></div><span>{skills.length.toString().padStart(2, "0")} MODULES</span></div>
      <div className="project-board-grid">
      <div className="project-timeline" role="list" aria-label="Skill 模块列表">{skills.map((skill, index) => { const progress = skillProgress(skill); return <div className={`project-timeline-row ${focused.id === skill.id ? "active" : ""}`} key={skill.id} role="listitem" tabIndex="0" onClick={() => setFocusedId(skill.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setFocusedId(skill.id); } }}><span className="project-timeline-marker">S{String(index + 1).padStart(2, "0")}</span><span className="project-timeline-copy"><span className="project-timeline-meta"><span>{skill.entryType === "http" ? "HTTP MODULE" : "LOCAL MODULE"}</span><strong>{skillState(skill)}</strong></span><b>{skill.name}</b><small>{skill.description || "暂无简介"}</small></span><span className="project-timeline-progress"><i style={{ width: `${progress}%` }} /><em>{progress}%</em></span><span className="project-pin-wrap"><button className={`project-pin ${skill.isPinned ? "selected" : ""}`} type="button" aria-label={skill.isPinned ? "取消收藏 Skill" : "收藏 Skill"} onClick={(event) => { event.stopPropagation(); onTogglePinned(skill); }}><FiStar size={16} /></button></span></div>; })}</div>
      <aside className="project-showcase skill-showcase" aria-label="当前 Skill 预览"><div className="showcase-cover"><span>SKILL / {String((focused.sortOrder || 0) + 1).padStart(2, "0")}</span><div className="showcase-orbit orbit-one" /><div className="showcase-orbit orbit-two" /><SkillIcon skill={focused} /></div><div className="showcase-body"><div className="showcase-label"><span>SELECTED MODULE</span><strong>{skillState(focused)}</strong></div><h3>{focused.name}</h3><p>{focused.description || "暂无简介"}</p><div className="showcase-stats"><div><span>TYPE</span><strong>{focused.entryType === "http" ? "HTTP" : "LOCAL"}</strong></div><div><span>TAGS</span><strong>{(focused.tags || []).length} TAGS</strong></div><div><span>UPDATED</span><strong>{focused.updatedAt ? new Date(focused.updatedAt).toLocaleDateString("zh-CN", { month: "short", day: "numeric" }) : "本周"}</strong></div></div><div className="showcase-tags">{(focused.tags || []).slice(0, 3).map((tag) => <TagBadge tag={tag} key={tag} />)}</div><div className="showcase-actions"><button className="primary-button" type="button" onClick={() => onOpen(focused)}>{focused.entryType === "http" ? "使用 Skill" : "复制路径"} <FiArrowUpRight size={15} /></button><button className="secondary-button" type="button" onClick={() => onEdit(focused)}>编辑</button><button className="icon-button danger-button" type="button" aria-label="删除 Skill" onClick={() => onDelete(focused)}><FiTrash2 size={16} /></button></div><span className="showcase-address" title={focusedAddress}>{focusedAddress}</span></div></aside>
    </div>
  </section>;
}

function RailButton({ label, icon: Component, active, onClick }) { return <button className={`rail-button ${active ? "active" : ""}`} type="button" data-tooltip={label} aria-label={label} onClick={onClick}><Component size={17} /><span>{label}</span>{active && <i />}</button>; }

function ToolCard({ tool, featured = false, onOpen, onEdit, onDelete, onTogglePinned, menuId, setMenuId, categoryMap }) {
  const hasHttp = tool.entryType === "http" && Boolean(tool.primaryUrl); const localPath = tool.entryType === "path" ? tool.localPath : ""; const address = hasHttp ? tool.primaryUrl : localPath;
  return <article className={`tool-card project-card ${featured ? "featured" : ""} ${tool.status !== "active" ? "disabled" : ""}`}><div className="project-card-kicker"><span>LAB PROJECT / {String((tool.sortOrder ?? 0) + 1).padStart(2, "0")}</span><span className="project-state">{tool.status === "active" ? "ACTIVE" : "PAUSED"}</span></div><div className="card-topline"><ToolIcon tool={tool} /><div className="card-actions"><button type="button" className={`star-button ${tool.isPinned ? "selected" : ""}`} aria-label={tool.isPinned ? "取消收藏" : "加入常用实验"} onClick={() => onTogglePinned(tool)}><FiStar size={18} /></button><div className="menu-wrap"><button type="button" className="more-button" aria-label="更多操作" onClick={() => setMenuId(menuId === tool.id ? null : tool.id)}><FiMoreVertical size={18} /></button>{menuId === tool.id && <div className="card-menu"><button type="button" onClick={() => onOpen(tool)}>{hasHttp ? <FiArrowUpRight /> : <FiCopy />} {hasHttp ? "打开实验" : "复制路径"}</button><button type="button" onClick={() => onEdit(tool)}><FiEdit3 /> 编辑信息</button><button type="button" onClick={() => onDelete(tool)} className="danger"><FiTrash2 /> 删除</button></div>}</div></div></div><div className="card-content"><h3>{tool.name}</h3><p>{tool.description}</p><div className="card-meta"><span className={`entry-badge ${hasHttp ? "http" : "path"}`}>{hasHttp ? "HTTP" : "本地路径"}</span>{(tool.tags || []).slice(0, 3).map((tag) => <TagBadge tag={tag} key={tag} />)}</div></div><div className="card-bottom"><div className="address-stack"><span className="address-preview" title={address}>{address}</span></div><button className="open-button" type="button" onClick={() => onOpen(tool)}>{hasHttp ? "打开实验" : "复制路径"}{hasHttp ? <FiArrowUpRight size={15} /> : <FiCopy size={15} />}</button></div></article>;
}

function ToolEditor({ editor, categories, onChange, onClose, onSubmit }) {
  const update = (key, value) => onChange((current) => ({ ...current, [key]: value }));
  const updateEntryType = (entryType) => onChange((current) => ({ ...current, entryType, ...(entryType === "http" ? { localPath: "" } : { primaryUrl: "", backupUrls: "" }) }));
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="editor-modal" role="dialog" aria-modal="true" aria-labelledby="editor-title"><div className="modal-header"><div><p className="eyebrow">PAGE CONFIGURATION</p><h2 id="editor-title">{editor.id ? "编辑页面" : "新增页面"}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="关闭"><FiX size={20} /></button></div><form onSubmit={onSubmit}><div className="form-grid"><label>页面名称<input autoFocus value={editor.name} onChange={(event) => update("name", event.target.value)} placeholder="例如：Postman" /></label><label className="wide">图标<div className="icon-picker" role="radiogroup" aria-label="选择页面图标">{Object.keys(toolIcons).map((key) => <button key={key} type="button" className={`icon-option ${editor.icon === key ? "selected" : ""}`} role="radio" aria-checked={editor.icon === key} aria-label={iconLabels[key] || key} onClick={() => update("icon", key)}><span className="icon-option-preview" style={{ background: `${iconColors[key] || "#6741f4"}12` }}><Icon name={key} size={22} /></span><span>{iconLabels[key] || key}</span></button>)}</div></label><label className="wide">简介<input value={editor.description} onChange={(event) => update("description", event.target.value)} placeholder="一句话说明这个页面用于什么工作" /></label><label>类型<select value={editor.entryType} onChange={(event) => updateEntryType(event.target.value)}><option value="http">HTTP 地址</option><option value="path">本地路径</option></select></label><label>所属分组<select value={editor.categoryId || ""} onChange={(event) => update("categoryId", event.target.value)}><option value="">未分类</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>{editor.entryType === "http" ? <><label className="wide">主地址<input value={editor.primaryUrl} onChange={(event) => update("primaryUrl", event.target.value)} placeholder="192.168.1.10:8080 或 https://example.com" /></label><label className="wide">备用地址 <span className="field-hint">每行一个</span><textarea value={editor.backupUrls} onChange={(event) => update("backupUrls", event.target.value)} rows="2" placeholder="https://backup.example.com" /></label></> : <label className="wide">本地路径<input value={editor.localPath} onChange={(event) => update("localPath", event.target.value)} placeholder="/Users/you/Downloads" /></label>}<label className="wide">标签 <span className="field-hint">用逗号、顿号分隔</span><input value={editor.tags} onChange={(event) => update("tags", event.target.value)} placeholder="开发, API 或 开发、API" /></label></div><div className="form-options"><label className="check-row"><input type="checkbox" checked={editor.isPinned} onChange={(event) => update("isPinned", event.target.checked)} />加入常用页面</label><label className="check-row"><input type="checkbox" checked={editor.status === "active"} onChange={(event) => update("status", event.target.checked ? "active" : "disabled")} />启用</label></div><div className="modal-footer"><button type="button" className="secondary-button" onClick={onClose}>取消</button><button type="submit" className="primary-button"><FiCheck size={17} />保存页面</button></div></form></section></div>;
}

function CategoryEditor({ editor, onChange, onClose, onSubmit }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="editor-modal category-modal" role="dialog" aria-modal="true" aria-labelledby="category-editor-title"><div className="modal-header"><div><p className="eyebrow">GROUP CONFIGURATION</p><h2 id="category-editor-title">{editor.id ? "编辑分组" : "新建分组"}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="关闭"><FiX size={20} /></button></div><form onSubmit={onSubmit}><label className="category-name-field">分组名称<input autoFocus value={editor.name} onChange={(event) => onChange((current) => ({ ...current, name: event.target.value }))} placeholder="例如：研究资料" /></label><label className="category-icon-field">显示图标<div className="category-icon-picker" role="radiogroup" aria-label="选择分组图标">{categoryIconOptions.map(({ key, label, icon: Component }) => <button key={key} type="button" className={`category-icon-option ${editor.icon === key ? "selected" : ""}`} role="radio" aria-checked={editor.icon === key} aria-label={label} onClick={() => onChange((current) => ({ ...current, icon: key }))}><Component size={19} /><span>{label}</span></button>)}</div></label><div className="modal-footer"><button type="button" className="secondary-button" onClick={onClose}>取消</button><button type="submit" className="primary-button"><FiCheck size={17} />{editor.id ? "保存分组" : "创建分组"}</button></div></form></section></div>;
}

function CategoryManager({ categories, onEdit, onDelete, onClose }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="editor-modal category-manager-modal" role="dialog" aria-modal="true" aria-labelledby="category-manager-title"><div className="modal-header"><div><p className="eyebrow">GROUP MANAGEMENT</p><h2 id="category-manager-title">管理分组</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="关闭"><FiX size={20} /></button></div><p className="category-manager-note">系统分组不可删除，自建分组可以编辑图标或删除。</p><div className="category-manager-list">{categories.map((category) => { const Component = categoryIconMap[category.icon] || categoryIcons[category.name] || FiMoreHorizontal; const builtIn = /^cat-\d+$/.test(category.id); return <div className="category-manager-row" key={category.id}><span className="category-manager-icon"><Component size={18} /></span><strong>{category.name}</strong><span className="category-manager-type">{builtIn ? "系统" : "自建"}</span><div className="category-manager-actions"><button type="button" className="icon-button" aria-label={`编辑${category.name}`} onClick={() => onEdit(category)}><FiEdit3 size={16} /></button><button type="button" className="icon-button danger-button" aria-label={`删除${category.name}`} disabled={builtIn} onClick={() => onDelete(category)}><FiTrash2 size={16} /></button></div></div>; })}</div><div className="modal-footer"><button type="button" className="secondary-button" onClick={onClose}>完成</button></div></section></div>;
}

function SkillsWorkspace({ skills, skillTags, skillTag, setSkillTag, skillSort, setSkillSort, view, setView, loading, usingFallback, categories, categoryMap, activeFilter, setActiveFilter, onNew, onOpen, onEdit, onDelete, onTogglePinned, menuId, setMenuId }) {
  return <>
    <div className="filter-row"><CollectionTabs activeFilter={activeFilter} onChange={setActiveFilter} /><div className="toolbar-actions"><label className="sort-select">标签<select value={skillTag} onChange={(event) => setSkillTag(event.target.value)} aria-label="Skill 标签"><option value="all">全部</option>{skillTags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}</select><FiChevronDown size={15} /></label><label className="sort-select">排序<select value={skillSort} onChange={(event) => setSkillSort(event.target.value)} aria-label="Skill 排序方式"><option value="manual">默认</option><option value="recent">最近更新</option><option value="name">名称</option></select><FiChevronDown size={15} /></label><div className="view-switcher"><button className={view === "grid" ? "active" : ""} type="button" onClick={() => setView("grid")} aria-label="卡片视图"><FiGrid size={18} /></button><button className={view === "list" ? "active" : ""} type="button" onClick={() => setView("list")} aria-label="列表视图"><FiList size={18} /></button></div><button className="new-tool-button" type="button" onClick={onNew}><FiPlus size={18} /> 新增 Skill</button></div></div>
    <section className="page-heading"><div><p className="eyebrow">WORKNEST LAB / CAPABILITY VAULT</p><h1>{activeFilter === "all" ? "Skill Vault" : activeFilter === "recent" ? "最近加入的 Skill" : activeFilter === "favorites" ? "收藏 Skill" : "待整理 Skill"}</h1><p className="page-summary">{skills.length} 个可复用能力 · 把你写过的技能变成下一次创作的起点</p></div><span className={`connection-state ${usingFallback ? "offline" : ""}`}><span />{usingFallback ? "本地演示数据" : "LOCAL VAULT"}</span></section>
    {!loading && <section className="lab-snapshot skill-snapshot" aria-label="Skill 库概览"><div><span>SKILLS</span><strong>{skills.length}</strong><small>可复用能力</small></div><div><span>ACTIVE</span><strong>{skills.filter((skill) => skill.status === "active").length}</strong><small>已启用模块</small></div><div><span>IN USE</span><strong>{skills.filter((skill) => skill.isPinned).length}</strong><small>当前常用</small></div><p>把写过的能力，变成下一次创作的快捷入口。<br /><em>Make the next build easier.</em></p></section>}
    {loading ? <div className="loading-state"><FiRefreshCw className="spin" /> 正在加载 Skill 库...</div> : <SkillBoard skills={skills} view={view} onOpen={onOpen} onEdit={onEdit} onDelete={onDelete} onTogglePinned={onTogglePinned} />}
  </>;
}

function SkillCard({ skill, categoryMap, onOpen, onEdit, onDelete, onTogglePinned, menuId, setMenuId }) {
  const hasHttp = Boolean(skill.primaryUrl); const address = skill.primaryUrl || skill.localPath;
  return <article className={`tool-card skill-card capability-card ${skill.status !== "active" ? "disabled" : ""}`}><div className="project-card-kicker"><span>SKILL MODULE / {String((skill.sortOrder ?? 0) + 1).padStart(2, "0")}</span><span className="project-state">{skill.status === "active" ? "READY" : "PAUSED"}</span></div><div className="card-topline"><SkillIcon skill={skill} /><div className="card-actions"><button type="button" className={`star-button ${skill.isPinned ? "selected" : ""}`} aria-label={skill.isPinned ? "取消收藏" : "收藏 Skill"} onClick={() => onTogglePinned(skill)}><FiStar size={18} /></button><div className="menu-wrap"><button type="button" className="more-button" aria-label="更多操作" onClick={() => setMenuId(menuId === skill.id ? null : skill.id)}><FiMoreVertical size={18} /></button>{menuId === skill.id && <div className="card-menu"><button type="button" onClick={() => onOpen(skill)}>{hasHttp ? <FiArrowUpRight /> : <FiCopy />} {hasHttp ? "打开" : "复制路径"}</button><button type="button" onClick={() => onEdit(skill)}><FiEdit3 /> 编辑 Skill</button><button type="button" onClick={() => onDelete(skill)} className="danger"><FiTrash2 /> 删除</button></div>}</div></div></div><div className="card-content"><h3>{skill.name}</h3><p>{skill.description || "暂无简介"}</p><div className="card-meta"><span className={`entry-badge ${hasHttp ? "http" : "path"}`}>{hasHttp ? "HTTP" : "本地路径"}</span>{(skill.tags || []).slice(0, 2).map((tag) => <TagBadge tag={tag} key={tag} />)}</div></div><div className="card-bottom"><span className="address-preview" title={address}>{address}</span><button className="open-button" type="button" onClick={() => onOpen(skill)}>{hasHttp ? "打开" : "复制路径"}{hasHttp ? <FiArrowUpRight size={15} /> : <FiCopy size={15} />}</button></div></article>;
}

function SkillEditor({ editor, categories, onChange, onClose, onSubmit }) {
  const update = (key, value) => onChange((current) => ({ ...current, [key]: value }));
  const updateEntryType = (entryType) => onChange((current) => ({ ...current, entryType, ...(entryType === "http" ? { localPath: "" } : { primaryUrl: "" }) }));
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="editor-modal" role="dialog" aria-modal="true" aria-labelledby="skill-editor-title"><div className="modal-header"><div><p className="eyebrow">SKILL CONFIGURATION</p><h2 id="skill-editor-title">{editor.id ? "编辑 Skill" : "新增 Skill"}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="关闭"><FiX size={20} /></button></div><form onSubmit={onSubmit}><div className="form-grid"><label>Skill 名称<input autoFocus value={editor.name} onChange={(event) => update("name", event.target.value)} placeholder="例如：接口调试助手" /></label><label className="wide">图标<div className="icon-picker" role="radiogroup" aria-label="选择 Skill 图标">{Object.keys(skillIcons).map((key) => { const Component = skillIcons[key]; return <button key={key} type="button" className={`icon-option ${editor.icon === key ? "selected" : ""}`} role="radio" aria-checked={editor.icon === key} aria-label={skillIconLabels[key]} onClick={() => update("icon", key)}><span className="icon-option-preview" style={{ background: `${skillIconColors[key]}16` }}><Component size={22} style={{ color: skillIconColors[key] }} /></span><span>{skillIconLabels[key]}</span></button>; })}</div></label><label className="wide">简介<input value={editor.description} onChange={(event) => update("description", event.target.value)} placeholder="一句话说明这个 Skill 解决什么问题" /></label><label>存放方式<select value={editor.entryType} onChange={(event) => updateEntryType(event.target.value)}><option value="http">HTTP 地址</option><option value="path">本地路径</option></select></label><label>所属分组<select value={editor.categoryId || ""} onChange={(event) => update("categoryId", event.target.value)}><option value="">未分类</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>{editor.entryType === "http" ? <label className="wide">Skill 地址<input value={editor.primaryUrl} onChange={(event) => update("primaryUrl", event.target.value)} placeholder="http://localhost:8000/skills/my-skill 或 https://..." /></label> : <label className="wide">本地路径<input value={editor.localPath} onChange={(event) => update("localPath", event.target.value)} placeholder="/Users/you/.codex/skills/my-skill" /></label>}<label className="wide">标签 <span className="field-hint">用逗号分隔</span><input value={editor.tags} onChange={(event) => update("tags", event.target.value)} placeholder="开发, 自动化, 需求" /></label></div><div className="form-options"><label className="check-row"><input type="checkbox" checked={editor.isPinned} onChange={(event) => update("isPinned", event.target.checked)} />加入常用 Skill</label><label className="check-row"><input type="checkbox" checked={editor.status === "active"} onChange={(event) => update("status", event.target.checked ? "active" : "disabled")} />启用</label></div><div className="modal-footer"><button type="button" className="secondary-button" onClick={onClose}>取消</button><button type="submit" className="primary-button"><FiCheck size={17} />保存 Skill</button></div></form></section></div>;
}

function DocumentsWorkspace({ documents, documentTags, documentTag, setDocumentTag, documentSort, setDocumentSort, view, setView, loading, usingFallback, categories, categoryMap, activeFilter, setActiveFilter, onNew, onOpen, onEdit, onDelete, onTogglePinned, menuId, setMenuId }) {
  return <>
    <div className="document-controls"><CollectionTabs activeFilter={activeFilter} onChange={setActiveFilter} /><div className="toolbar-actions"><label className="sort-select">排序<select value={documentSort} onChange={(event) => setDocumentSort(event.target.value)} aria-label="文档排序方式"><option value="manual">默认</option><option value="recent">最近更新</option><option value="name">名称</option></select><FiChevronDown size={15} /></label><div className="view-switcher"><button className={view === "grid" ? "active" : ""} type="button" onClick={() => setView("grid")} aria-label="卡片视图"><FiGrid size={18} /></button><button className={view === "list" ? "active" : ""} type="button" onClick={() => setView("list")} aria-label="列表视图"><FiList size={18} /></button></div><button className="new-tool-button" type="button" onClick={onNew}><FiPlus size={18} /> 新增资料</button></div></div>
    <section className="page-heading documents-heading"><div><p className="eyebrow">WORKNEST LAB / REFERENCE SHELF</p><h1>{activeFilter === "all" ? "参考资料" : activeFilter === "recent" ? "最近加入的资料" : activeFilter === "favorites" ? "收藏资料" : "待整理资料"}</h1><p className="page-summary">{documents.length} 条上下文 · 为每个想法保留来源与启发</p></div><span className={`connection-state ${usingFallback ? "offline" : ""}`}><span />{usingFallback ? "本地演示数据" : "同步中"}</span></section>
    <section className="document-filter-bar"><div className="document-filter-title"><span className="section-icon light"><FiFileText size={16} /></span><strong>标签</strong></div><div className="document-tag-list"><button type="button" className={`tag-filter ${documentTag === "all" ? "active" : ""}`} onClick={() => setDocumentTag("all")}>全部</button>{documentTags.map((tag) => <button type="button" className={`tag-filter colored-tag ${documentTag === tag ? "active" : ""}`} style={getTagColorStyle(tag)} key={tag} onClick={() => setDocumentTag(tag)}>{tag}</button>)}</div></section>
    {loading ? <div className="loading-state"><FiRefreshCw className="spin" /> 正在加载文档库...</div> : <section className={`documents-section ${view === "list" ? "list-view" : ""}`}><div className="document-grid">{documents.map((document) => <DocumentCard key={document.id} document={document} categoryMap={categoryMap} featured={document.isPinned} onOpen={onOpen} onEdit={onEdit} onDelete={onDelete} onTogglePinned={onTogglePinned} menuId={menuId} setMenuId={setMenuId} />)}</div>{documents.length === 0 && <div className="empty-state"><FiFileText size={24} /><strong>没有找到匹配文档</strong><span>换个关键词、标签或集合试试</span></div>}</section>}
  </>;
}

function DocumentCard({ document, categoryMap, onOpen, onEdit, onDelete, onTogglePinned, menuId, setMenuId }) {
  return <article className={`document-card ${document.status !== "active" ? "disabled" : ""}`}><div className="document-card-header"><div className="document-icon"><FiFileText size={24} /></div><div className="card-actions"><button type="button" className={`star-button ${document.isPinned ? "selected" : ""}`} aria-label={document.isPinned ? "取消收藏" : "收藏文档"} onClick={() => onTogglePinned(document)}><FiStar size={18} /></button><div className="menu-wrap"><button type="button" className="more-button" aria-label="更多操作" onClick={() => setMenuId(menuId === document.id ? null : document.id)}><FiMoreVertical size={18} /></button>{menuId === document.id && <div className="card-menu"><button type="button" onClick={() => onOpen(document)}><FiArrowUpRight /> 打开文档</button><button type="button" onClick={() => onEdit(document)}><FiEdit3 /> 编辑信息</button><button type="button" onClick={() => onDelete(document)} className="danger"><FiTrash2 /> 删除</button></div>}</div></div></div><div className="document-card-content"><h3>{document.title}</h3><p>{document.description || "暂无描述"}</p><a className="document-url" href={document.url} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>{document.url}</a></div><div className="document-card-footer"><div className="document-badges">{(document.tags || []).slice(0, 3).map((tag) => <TagBadge tag={tag} key={tag} />)}</div><button className="open-button" type="button" onClick={() => onOpen(document)}>打开 <FiArrowUpRight size={15} /></button></div></article>;
}

function DocumentEditor({ editor, categories, onChange, onClose, onSubmit }) {
  const update = (key, value) => onChange((current) => ({ ...current, [key]: value }));
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="editor-modal" role="dialog" aria-modal="true" aria-labelledby="document-editor-title"><div className="modal-header"><div><p className="eyebrow">DOCUMENT CONFIGURATION</p><h2 id="document-editor-title">{editor.id ? "编辑文档" : "新增文档"}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="关闭"><FiX size={20} /></button></div><form onSubmit={onSubmit}><div className="form-grid"><label className="wide">文档标题<input autoFocus value={editor.title} onChange={(event) => update("title", event.target.value)} placeholder="例如：项目接口文档" /></label><label className="wide">文档地址<input value={editor.url} onChange={(event) => update("url", event.target.value)} placeholder="https://example.com/docs 或 192.168.1.10:8080/docs" /></label><label className="wide">简介<input value={editor.description} onChange={(event) => update("description", event.target.value)} placeholder="一句话说明文档内容和使用场景" /></label><label>所属分组<select value={editor.categoryId || ""} onChange={(event) => update("categoryId", event.target.value)}><option value="">未分类</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label className="wide">标签 <span className="field-hint">用逗号分隔</span><input value={editor.tags} onChange={(event) => update("tags", event.target.value)} placeholder="API, 内网, 参考" /></label></div><div className="form-options"><label className="check-row"><input type="checkbox" checked={editor.isPinned} onChange={(event) => update("isPinned", event.target.checked)} />加入收藏文档</label><label className="check-row"><input type="checkbox" checked={editor.status === "active"} onChange={(event) => update("status", event.target.checked ? "active" : "disabled")} />启用</label></div><div className="modal-footer"><button type="button" className="secondary-button" onClick={onClose}>取消</button><button type="submit" className="primary-button"><FiCheck size={17} />保存文档</button></div></form></section></div>;
}

export { App };
