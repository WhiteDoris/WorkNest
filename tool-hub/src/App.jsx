import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiArrowUpRight, FiBarChart2, FiBookmark, FiBriefcase, FiCalendar, FiCheck, FiCheckCircle, FiChevronDown, FiCode, FiCopy, FiCpu, FiDatabase, FiEdit3, FiFileText,
  FiDownload, FiFolder, FiGlobe, FiGrid, FiHome, FiImage, FiLayers, FiList, FiMessageCircle, FiMonitor, FiMoreHorizontal,
  FiMoreVertical, FiPackage, FiPlus, FiRefreshCw, FiSearch, FiSettings, FiStar, FiTrash2, FiUpload, FiUsers, FiX,
  FiTerminal, FiZap,
} from "react-icons/fi";
import {
  SiApifox, SiBaidu, SiDocker, SiFigma, SiGithub, SiGooglechrome, SiJuejin,
  SiNotion, SiObsidian, SiPostman, SiWechat, SiYoutube,
} from "react-icons/si";
import { getFaviconUrls } from "./lib/favicon.js";
import { getDraftCategoryId } from "./lib/category-default.js";
import { splitPinnedTools } from "./lib/tool-groups.js";
import { getTagColorStyle } from "./lib/tag-colors.js";

const FALLBACK = {
  categories: [
    { id: "cat-common", name: "常用", sortOrder: 0 }, { id: "cat-dev", name: "开发", sortOrder: 1 },
    { id: "cat-design", name: "设计", sortOrder: 2 }, { id: "cat-office", name: "办公", sortOrder: 3 },
    { id: "cat-local", name: "本地", sortOrder: 4 }, { id: "cat-network", name: "网络", sortOrder: 5 },
    { id: "cat-other", name: "其他", sortOrder: 6 },
  ],
  tools: [
    { id: "chrome", name: "Chrome", description: "快速、安全的网页浏览器", icon: "chrome", entryType: "http", primaryUrl: "https://www.google.com/chrome/", localPath: "/Applications/Google Chrome.app", categoryId: "cat-common", tags: ["浏览器"], isPinned: true, status: "active", sortOrder: 0 },
    { id: "vscode", name: "VS Code", description: "强大的代码编辑器", icon: "vscode", entryType: "http", primaryUrl: "https://code.visualstudio.com/", localPath: "/Applications/Visual Studio Code.app", categoryId: "cat-dev", tags: ["编辑器"], isPinned: true, status: "active", sortOrder: 1 },
    { id: "postman", name: "Postman", description: "API 开发与测试工作台", icon: "postman", entryType: "http", primaryUrl: "https://www.postman.com/", localPath: "/Applications/Postman.app", categoryId: "cat-dev", tags: ["API"], isPinned: true, status: "active", sortOrder: 2 },
    { id: "notion", name: "Notion", description: "连接你的想法与工作", icon: "notion", entryType: "http", primaryUrl: "https://www.notion.so", categoryId: "cat-office", tags: ["知识库"], isPinned: false, status: "active", sortOrder: 3 },
    { id: "docker", name: "Docker", description: "构建、运行和管理容器", icon: "docker", entryType: "http", primaryUrl: "https://www.docker.com/products/docker-desktop/", localPath: "/Applications/Docker.app", categoryId: "cat-dev", tags: ["容器"], isPinned: false, status: "active", sortOrder: 4 },
    { id: "github", name: "GitHub", description: "面向开发者的代码托管平台", icon: "github", entryType: "http", primaryUrl: "https://github.com", categoryId: "cat-dev", tags: ["代码"], isPinned: false, status: "active", sortOrder: 5 },
    { id: "figma", name: "Figma", description: "在线协作的界面设计工作台", icon: "figma", entryType: "http", primaryUrl: "https://www.figma.com", categoryId: "cat-design", tags: ["UI"], isPinned: false, status: "active", sortOrder: 6 },
    { id: "youtube", name: "YouTube", description: "发现和观看精彩视频", icon: "youtube", entryType: "http", primaryUrl: "https://youtube.com", categoryId: "cat-network", tags: ["视频"], isPinned: false, status: "active", sortOrder: 7 },
    { id: "downloads", name: "本地下载目录", description: "常用文件下载位置", icon: "folder", entryType: "path", localPath: "/Users/you/Downloads", categoryId: "cat-local", tags: ["文件"], isPinned: false, status: "active", sortOrder: 11 },
    { id: "typora", name: "Typora", description: "优雅的 Markdown 编辑器", icon: "document", entryType: "http", primaryUrl: "https://typora.io/", localPath: "/Applications/Typora.app", categoryId: "cat-local", tags: ["Markdown"], isPinned: false, status: "active", sortOrder: 12 },
    { id: "obsidian", name: "Obsidian", description: "构建你的知识库", icon: "obsidian", entryType: "http", primaryUrl: "https://obsidian.md/", localPath: "/Applications/Obsidian.app", categoryId: "cat-office", tags: ["笔记"], isPinned: false, status: "active", sortOrder: 13 },
    { id: "paint", name: "画图", description: "简单实用的图像编辑工作台", icon: "image", entryType: "path", localPath: "/Applications/Preview.app", categoryId: "cat-design", tags: ["图片"], isPinned: false, status: "active", sortOrder: 14 },
    { id: "chatgpt", name: "ChatGPT", description: "强大的 AI 助手", icon: "openai", entryType: "http", primaryUrl: "https://chatgpt.com", categoryId: "cat-common", tags: ["AI"], isPinned: false, status: "active", sortOrder: 16 },
    { id: "juejin", name: "掘金", description: "高质量的技术内容社区", icon: "juejin", entryType: "http", primaryUrl: "https://juejin.cn", categoryId: "cat-network", tags: ["社区"], isPinned: false, status: "active", sortOrder: 17 },
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
    return documents.filter((document) => {
      const searchable = [document.title, document.description, document.url, ...(document.tags || [])].join(" ").toLowerCase();
      const matchesTag = documentTag === "all" || (document.tags || []).includes(documentTag);
      const matchesCategory = activeFilter === "all" || (activeFilter === "favorites" && document.isPinned) || document.categoryId === activeFilter;
      return matchesTag && matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
    }).sort((a, b) => documentSort === "name" ? a.title.localeCompare(b.title, "zh-CN") : documentSort === "recent" ? (b.updatedAt || "").localeCompare(a.updatedAt || "") : a.sortOrder - b.sortOrder);
  }, [activeFilter, documentQuery, documentSort, documentTag, documents]);
  const filteredSkills = useMemo(() => {
    const normalizedQuery = skillQuery.trim().toLowerCase();
    return skills.filter((skill) => {
      const searchable = [skill.name, skill.description, skill.primaryUrl, skill.localPath, ...(skill.tags || [])].join(" ").toLowerCase();
      const matchesTag = skillTag === "all" || (skill.tags || []).includes(skillTag);
      const matchesCategory = activeFilter === "all" || (activeFilter === "favorites" && skill.isPinned) || skill.categoryId === activeFilter;
      return matchesTag && matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
    }).sort((a, b) => skillSort === "name" ? a.name.localeCompare(b.name, "zh-CN") : skillSort === "recent" ? (b.updatedAt || "").localeCompare(a.updatedAt || "") : a.sortOrder - b.sortOrder);
  }, [activeFilter, skillQuery, skillSort, skillTag, skills]);
  const filteredTools = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const activeCategoryName = categoryMap[activeFilter]?.name || activeFilter;
    return tools.filter((tool) => {
      const matchesFilter = activeFilter === "all" || (activeFilter === "favorites" && tool.isPinned) || tool.categoryId === activeFilter || categoryMap[tool.categoryId]?.name === activeCategoryName;
      const searchable = [tool.name, tool.description, ...(tool.tags || []), tool.primaryUrl, tool.localPath].join(" ").toLowerCase();
      return matchesFilter && (!normalizedQuery || searchable.includes(normalizedQuery));
    }).sort((a, b) => sort === "name" ? a.name.localeCompare(b.name, "zh-CN") : sort === "recent" ? (b.updatedAt || "").localeCompare(a.updatedAt || "") : a.sortOrder - b.sortOrder);
  }, [activeFilter, categoryMap, query, sort, tools]);
  const { pinnedTools, regularTools } = useMemo(() => splitPinnedTools(filteredTools, activeFilter === "all" && !query.trim()), [activeFilter, filteredTools, query]);
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
    const payload = { name: form.name.trim(), description: form.description.trim(), icon: form.icon, entryType: form.entryType, primaryUrl: form.primaryUrl.trim(), localPath: form.localPath.trim(), categoryId: form.categoryId || null, tags: typeof form.tags === "string" ? parseTagInput(form.tags) : form.tags, isPinned: Boolean(form.isPinned), status: form.status, backupUrls: form.backupUrls.split("\n").map((url) => url.trim()).filter(Boolean) };
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
    const payload = { name: form.name.trim(), description: form.description.trim(), icon: form.icon, entryType: form.entryType, primaryUrl: form.primaryUrl.trim(), localPath: form.localPath.trim(), categoryId: form.categoryId || null, tags: typeof form.tags === "string" ? parseTagInput(form.tags) : form.tags, isPinned: Boolean(form.isPinned), status: form.status };
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
    <aside className="icon-rail" aria-label="工作区导航">
      <button className="brand-mark" type="button" onClick={() => { setWorkspace("tools"); setActiveFilter("all"); }} aria-label="WorkNest"><img className="brand-logo" src="/worknest-mark.svg" alt="" /></button>
      <div className="rail-items"><RailButton label="全部页面" icon={FiGrid} active={workspace === "tools" && activeFilter === "all"} onClick={() => { setWorkspace("tools"); setActiveFilter("all"); }} /><RailButton label="常用页面" icon={FiStar} active={workspace === "tools" && activeFilter === "favorites"} onClick={() => { setWorkspace("tools"); setActiveFilter("favorites"); }} />{categories.filter((category) => category.name !== "常用").map((category) => { const CategoryIcon = categoryIconMap[category.icon] || categoryIcons[category.name] || FiMoreHorizontal; return <RailButton key={category.id} label={`${category.name}页面`} icon={CategoryIcon} active={workspace === "tools" && activeFilter === category.id} onClick={() => { setWorkspace("tools"); setActiveFilter(category.id); }} />; })}</div>
      <div className="rail-documents"><RailButton label="文档库" icon={FiFileText} active={workspace === "documents"} onClick={() => { setWorkspace("documents"); setActiveFilter("all"); }} /><RailButton label="Skill 库" icon={FiZap} active={workspace === "skills"} onClick={() => { setWorkspace("skills"); setActiveFilter("all"); }} /></div>
      <div className="rail-bottom"><RailButton label="新建分组" icon={FiPlus} onClick={createCategory} /><RailButton label="管理分组" icon={FiEdit3} onClick={() => setCategoryManager(true)} /><RailButton label="设置" icon={FiSettings} onClick={() => showToast("设置面板将在后续版本开放")} /></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="brand-lockup"><strong>WorkNest</strong><span>PERSONAL WORKSPACE OS</span></div><div className="search-box"><FiSearch size={22} /><input value={workspace === "tools" ? query : workspace === "documents" ? documentQuery : skillQuery} onChange={(event) => workspace === "tools" ? setQuery(event.target.value) : workspace === "documents" ? setDocumentQuery(event.target.value) : setSkillQuery(event.target.value)} placeholder={workspace === "tools" ? "搜索页面名称、地址或标签..." : workspace === "documents" ? "搜索文档标题、链接或标签..." : "搜索 Skill 名称、简介或标签..."} aria-label={workspace === "tools" ? "搜索页面" : workspace === "documents" ? "搜索文档" : "搜索 Skill"} /><kbd>⌘ K</kbd></div><div className="profile-area"><button className="icon-button" type="button" aria-label="设置" onClick={() => showToast("设置面板将在后续版本开放")}><FiSettings size={20} /></button><div className="profile-avatar">A</div><div className="profile-copy"><strong>你好，Alex</strong><span>专注工作，专注创造</span></div><FiChevronDown size={16} /></div></header>
      {workspace === "tools" ? <>
        <div className="filter-row"><div className="category-chips" role="tablist" aria-label="页面分类"><button type="button" className={`category-chip ${activeFilter === "all" ? "active" : ""}`} onClick={() => setActiveFilter("all")}>全部</button>{categories.map((category) => <button key={category.id} type="button" className={`category-chip ${activeFilter === category.id ? "active" : ""}`} onClick={() => setActiveFilter(category.id)}>{category.name}</button>)}</div><div className="toolbar-actions"><label className="sort-select">排序<select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="排序方式"><option value="manual">默认</option><option value="recent">最近更新</option><option value="name">名称</option></select><FiChevronDown size={15} /></label><div className="view-switcher"><button className={view === "grid" ? "active" : ""} type="button" onClick={() => setView("grid")} aria-label="卡片视图"><FiGrid size={18} /></button><button className={view === "list" ? "active" : ""} type="button" onClick={() => setView("list")} aria-label="列表视图"><FiList size={18} /></button></div><div className="utility-menu"><button className="utility-button" type="button" onClick={() => setUtilityMenu((open) => !open)} aria-label="工作区操作"><FiMoreHorizontal size={19} /></button>{utilityMenu && <div className="utility-popover"><button type="button" onClick={exportLibrary}><FiDownload /> 导出 JSON</button><button type="button" onClick={() => importInput.current?.click()}><FiUpload /> 导入 JSON</button></div>}<input ref={importInput} type="file" accept="application/json,.json" hidden onChange={importLibrary} /></div><button className="new-tool-button" type="button" onClick={() => openEditor()}><FiPlus size={18} /> 新增页面</button></div></div>
        <section className="page-heading"><div><p className="eyebrow">WORKNEST / WORKSPACE PAGES</p><h1>{activeFilter === "all" ? "全部页面" : activeFilter === "favorites" ? "常用页面" : categoryMap[activeFilter]?.name || "全部页面"}</h1><p className="page-summary">{filteredTools.length} 个页面 · 按工作场景组织，打开即用</p></div><span className={`connection-state ${usingFallback ? "offline" : ""}`}><span />{usingFallback ? "本地演示数据" : "SQLite 已连接"}</span></section>
        {loading ? <div className="loading-state"><FiRefreshCw className="spin" /> 正在加载页面库...</div> : <>{pinnedTools.length > 0 && <section className={view === "list" ? "pinned-section list-view" : "pinned-section"}><div className="section-heading"><div><span className="section-icon"><FiStar size={16} /></span><h2>常用页面</h2><span className="section-note">高频使用 · 快速打开</span></div><button type="button" onClick={() => setActiveFilter("favorites")}>查看全部 <FiArrowUpRight size={15} /></button></div><div className="pinned-grid">{pinnedTools.map((tool) => <ToolCard key={tool.id} tool={tool} featured onOpen={openTool} onEdit={openEditor} onDelete={deleteTool} onTogglePinned={togglePinned} menuId={menuId} setMenuId={setMenuId} categoryMap={categoryMap} />)}</div></section>}<section className={`tools-section ${view === "list" ? "list-view" : ""}`}><div className="section-heading"><div><span className="section-icon light"><FiGrid size={16} /></span><h2>全部页面</h2><span className="section-note">按工作场景组织 · 快速触达</span></div></div><div className="tool-grid">{regularTools.map((tool) => <ToolCard key={tool.id} tool={tool} onOpen={openTool} onEdit={openEditor} onDelete={deleteTool} onTogglePinned={togglePinned} menuId={menuId} setMenuId={setMenuId} categoryMap={categoryMap} />)}</div>{regularTools.length === 0 && <div className="empty-state"><FiSearch size={24} /><strong>没有找到匹配页面</strong><span>换个关键词或清除筛选试试</span></div>}</section></>}
      </> : workspace === "documents" ? <DocumentsWorkspace documents={filteredDocuments} documentTags={documentTags} documentTag={documentTag} setDocumentTag={setDocumentTag} documentSort={documentSort} setDocumentSort={setDocumentSort} view={view} setView={setView} loading={loading} usingFallback={usingFallback} categories={categories} categoryMap={categoryMap} activeFilter={activeFilter} setActiveFilter={setActiveFilter} onNew={() => openDocumentEditor()} onOpen={openDocument} onEdit={openDocumentEditor} onDelete={deleteDocument} onTogglePinned={toggleDocumentPinned} menuId={documentMenuId} setMenuId={setDocumentMenuId} /> : <SkillsWorkspace skills={filteredSkills} skillTags={skillTags} skillTag={skillTag} setSkillTag={setSkillTag} skillSort={skillSort} setSkillSort={setSkillSort} view={view} setView={setView} loading={loading} usingFallback={usingFallback} categories={categories} categoryMap={categoryMap} activeFilter={activeFilter} setActiveFilter={setActiveFilter} onNew={() => openSkillEditor()} onOpen={openSkill} onEdit={openSkillEditor} onDelete={deleteSkill} onTogglePinned={toggleSkillPinned} menuId={skillMenuId} setMenuId={setSkillMenuId} />}
    </main>
    {editor && <ToolEditor editor={editor} categories={categories} onChange={setEditor} onClose={() => setEditor(null)} onSubmit={saveTool} />}{documentEditor && <DocumentEditor editor={documentEditor} categories={categories} onChange={setDocumentEditor} onClose={() => setDocumentEditor(null)} onSubmit={saveDocument} />}{skillEditor && <SkillEditor editor={skillEditor} categories={categories} onChange={setSkillEditor} onClose={() => setSkillEditor(null)} onSubmit={saveSkill} />}{categoryEditor && <CategoryEditor editor={categoryEditor} categories={categories} onChange={setCategoryEditor} onClose={() => setCategoryEditor(null)} onSubmit={saveCategory} />}{categoryManager && <CategoryManager categories={categories} onEdit={editCategory} onDelete={deleteCategory} onClose={() => setCategoryManager(false)} />}{toast && <div className={`toast ${toast.tone}`}><FiCheck size={16} />{toast.message}</div>}
  </div>;
}

function RailButton({ label, icon: Component, active, onClick }) { return <button className={`rail-button ${active ? "active" : ""}`} type="button" data-tooltip={label} aria-label={label} onClick={onClick}><Component size={21} /></button>; }

function ToolCard({ tool, featured = false, onOpen, onEdit, onDelete, onTogglePinned, menuId, setMenuId, categoryMap }) {
  const category = categoryMap[tool.categoryId]?.name; const hasHttp = Boolean(tool.primaryUrl); const address = tool.primaryUrl || tool.localPath; const hasLocalPath = Boolean(tool.localPath);
  return <article className={`tool-card ${featured ? "featured" : ""} ${tool.status !== "active" ? "disabled" : ""}`}><div className="card-topline"><ToolIcon tool={tool} /><div className="card-actions"><button type="button" className={`star-button ${tool.isPinned ? "selected" : ""}`} aria-label={tool.isPinned ? "取消收藏" : "加入常用页面"} onClick={() => onTogglePinned(tool)}><FiStar size={18} /></button><div className="menu-wrap"><button type="button" className="more-button" aria-label="更多操作" onClick={() => setMenuId(menuId === tool.id ? null : tool.id)}><FiMoreVertical size={18} /></button>{menuId === tool.id && <div className="card-menu"><button type="button" onClick={() => onOpen(tool)}>{hasHttp ? <FiArrowUpRight /> : <FiCopy />} {hasHttp ? "打开" : "复制路径"}</button><button type="button" onClick={() => onEdit(tool)}><FiEdit3 /> 编辑信息</button><button type="button" onClick={() => onDelete(tool)} className="danger"><FiTrash2 /> 删除</button></div>}</div></div></div><div className="card-content"><h3>{tool.name}</h3><p>{tool.description}</p><div className="card-meta"><span className={`entry-badge ${hasHttp ? "http" : "path"}`}>{hasHttp ? "HTTP" : "本地路径"}</span>{hasHttp && hasLocalPath && <span className="local-badge">有本地路径</span>}{category && <span className="category-badge">{category}</span>}{(tool.tags || []).slice(0, 3).map((tag) => <TagBadge tag={tag} key={tag} />)}</div></div><div className="card-bottom"><div className="address-stack"><span className="address-preview" title={hasLocalPath && hasHttp ? `${tool.primaryUrl}\n本地路径：${tool.localPath}` : address}>{address}</span>{hasHttp && hasLocalPath && <span className="local-address-preview" title={tool.localPath}>本地：{tool.localPath}</span>}</div><button className="open-button" type="button" onClick={() => onOpen(tool)}>{hasHttp ? "打开" : "复制路径"}{hasHttp ? <FiArrowUpRight size={15} /> : <FiCopy size={15} />}</button></div></article>;
}

function ToolEditor({ editor, categories, onChange, onClose, onSubmit }) {
  const update = (key, value) => onChange((current) => ({ ...current, [key]: value }));
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="editor-modal" role="dialog" aria-modal="true" aria-labelledby="editor-title"><div className="modal-header"><div><p className="eyebrow">PAGE CONFIGURATION</p><h2 id="editor-title">{editor.id ? "编辑页面" : "新增页面"}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="关闭"><FiX size={20} /></button></div><form onSubmit={onSubmit}><div className="form-grid"><label>页面名称<input autoFocus value={editor.name} onChange={(event) => update("name", event.target.value)} placeholder="例如：Postman" /></label><label className="wide">图标<div className="icon-picker" role="radiogroup" aria-label="选择页面图标">{Object.keys(toolIcons).map((key) => <button key={key} type="button" className={`icon-option ${editor.icon === key ? "selected" : ""}`} role="radio" aria-checked={editor.icon === key} aria-label={iconLabels[key] || key} onClick={() => update("icon", key)}><span className="icon-option-preview" style={{ background: `${iconColors[key] || "#6741f4"}12` }}><Icon name={key} size={22} /></span><span>{iconLabels[key] || key}</span></button>)}</div></label><label className="wide">简介<input value={editor.description} onChange={(event) => update("description", event.target.value)} placeholder="一句话说明这个页面用于什么工作" /></label><label>类型<select value={editor.entryType} onChange={(event) => update("entryType", event.target.value)}><option value="http">HTTP 地址</option><option value="path">本地路径</option></select></label><label>所属分组<select value={editor.categoryId || ""} onChange={(event) => update("categoryId", event.target.value)}><option value="">未分类</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>{editor.entryType === "http" ? <><label className="wide">主地址<input value={editor.primaryUrl} onChange={(event) => update("primaryUrl", event.target.value)} placeholder="192.168.1.10:8080 或 https://example.com" /></label><label className="wide">本地路径 <span className="field-hint">可选，打开时优先使用 HTTP</span><input value={editor.localPath} onChange={(event) => update("localPath", event.target.value)} placeholder="/Applications/Example.app" /></label><label className="wide">备用地址 <span className="field-hint">每行一个</span><textarea value={editor.backupUrls} onChange={(event) => update("backupUrls", event.target.value)} rows="2" placeholder="https://backup.example.com" /></label></> : <label className="wide">本地路径<input value={editor.localPath} onChange={(event) => update("localPath", event.target.value)} placeholder="/Users/you/Downloads" /></label>}<label className="wide">标签 <span className="field-hint">用逗号、顿号分隔</span><input value={editor.tags} onChange={(event) => update("tags", event.target.value)} placeholder="开发, API 或 开发、API" /></label></div><div className="form-options"><label className="check-row"><input type="checkbox" checked={editor.isPinned} onChange={(event) => update("isPinned", event.target.checked)} />加入常用页面</label><label className="check-row"><input type="checkbox" checked={editor.status === "active"} onChange={(event) => update("status", event.target.checked ? "active" : "disabled")} />启用</label></div><div className="modal-footer"><button type="button" className="secondary-button" onClick={onClose}>取消</button><button type="submit" className="primary-button"><FiCheck size={17} />保存页面</button></div></form></section></div>;
}

function CategoryEditor({ editor, onChange, onClose, onSubmit }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="editor-modal category-modal" role="dialog" aria-modal="true" aria-labelledby="category-editor-title"><div className="modal-header"><div><p className="eyebrow">GROUP CONFIGURATION</p><h2 id="category-editor-title">{editor.id ? "编辑分组" : "新建分组"}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="关闭"><FiX size={20} /></button></div><form onSubmit={onSubmit}><label className="category-name-field">分组名称<input autoFocus value={editor.name} onChange={(event) => onChange((current) => ({ ...current, name: event.target.value }))} placeholder="例如：研究资料" /></label><label className="category-icon-field">显示图标<div className="category-icon-picker" role="radiogroup" aria-label="选择分组图标">{categoryIconOptions.map(({ key, label, icon: Component }) => <button key={key} type="button" className={`category-icon-option ${editor.icon === key ? "selected" : ""}`} role="radio" aria-checked={editor.icon === key} aria-label={label} onClick={() => onChange((current) => ({ ...current, icon: key }))}><Component size={19} /><span>{label}</span></button>)}</div></label><div className="modal-footer"><button type="button" className="secondary-button" onClick={onClose}>取消</button><button type="submit" className="primary-button"><FiCheck size={17} />{editor.id ? "保存分组" : "创建分组"}</button></div></form></section></div>;
}

function CategoryManager({ categories, onEdit, onDelete, onClose }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="editor-modal category-manager-modal" role="dialog" aria-modal="true" aria-labelledby="category-manager-title"><div className="modal-header"><div><p className="eyebrow">GROUP MANAGEMENT</p><h2 id="category-manager-title">管理分组</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="关闭"><FiX size={20} /></button></div><p className="category-manager-note">系统分组不可删除，自建分组可以编辑图标或删除。</p><div className="category-manager-list">{categories.map((category) => { const Component = categoryIconMap[category.icon] || categoryIcons[category.name] || FiMoreHorizontal; const builtIn = /^cat-\d+$/.test(category.id); return <div className="category-manager-row" key={category.id}><span className="category-manager-icon"><Component size={18} /></span><strong>{category.name}</strong><span className="category-manager-type">{builtIn ? "系统" : "自建"}</span><div className="category-manager-actions"><button type="button" className="icon-button" aria-label={`编辑${category.name}`} onClick={() => onEdit(category)}><FiEdit3 size={16} /></button><button type="button" className="icon-button danger-button" aria-label={`删除${category.name}`} disabled={builtIn} onClick={() => onDelete(category)}><FiTrash2 size={16} /></button></div></div>; })}</div><div className="modal-footer"><button type="button" className="secondary-button" onClick={onClose}>完成</button></div></section></div>;
}

function SkillsWorkspace({ skills, skillTags, skillTag, setSkillTag, skillSort, setSkillSort, view, setView, loading, usingFallback, categories, categoryMap, activeFilter, setActiveFilter, onNew, onOpen, onEdit, onDelete, onTogglePinned, menuId, setMenuId }) {
  return <>
    <div className="filter-row"><div className="category-chips" role="tablist" aria-label="Skill 分类"><button type="button" className={`category-chip ${activeFilter === "all" ? "active" : ""}`} onClick={() => setActiveFilter("all")}>全部</button>{categories.map((category) => <button key={category.id} type="button" className={`category-chip ${activeFilter === category.id ? "active" : ""}`} onClick={() => setActiveFilter(category.id)}>{category.name}</button>)}</div><div className="toolbar-actions"><label className="sort-select">标签<select value={skillTag} onChange={(event) => setSkillTag(event.target.value)} aria-label="Skill 标签"><option value="all">全部</option>{skillTags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}</select><FiChevronDown size={15} /></label><label className="sort-select">排序<select value={skillSort} onChange={(event) => setSkillSort(event.target.value)} aria-label="Skill 排序方式"><option value="manual">默认</option><option value="recent">最近更新</option><option value="name">名称</option></select><FiChevronDown size={15} /></label><div className="view-switcher"><button className={view === "grid" ? "active" : ""} type="button" onClick={() => setView("grid")} aria-label="卡片视图"><FiGrid size={18} /></button><button className={view === "list" ? "active" : ""} type="button" onClick={() => setView("list")} aria-label="列表视图"><FiList size={18} /></button></div><button className="new-tool-button" type="button" onClick={onNew}><FiPlus size={18} /> 新增 Skill</button></div></div>
    <section className="page-heading"><div><p className="eyebrow">WORKNEST / SKILL LIBRARY</p><h1>{activeFilter === "all" ? "Skill 库" : activeFilter === "favorites" ? "常用 Skill" : categoryMap[activeFilter]?.name || "Skill 库"}</h1><p className="page-summary">{skills.length} 个 Skill · 管理你编写的能力入口，随时调用</p></div><span className={`connection-state ${usingFallback ? "offline" : ""}`}><span />{usingFallback ? "本地演示数据" : "SQLite 已连接"}</span></section>
    {loading ? <div className="loading-state"><FiRefreshCw className="spin" /> 正在加载 Skill 库...</div> : <section className={`tools-section ${view === "list" ? "list-view" : ""}`}><div className="section-heading"><div><span className="section-icon"><FiZap size={16} /></span><h2>我的 Skills</h2><span className="section-note">HTTP 与本地 Skill 统一管理</span></div></div><div className="tool-grid skill-grid">{skills.map((skill) => <SkillCard key={skill.id} skill={skill} categoryMap={categoryMap} onOpen={onOpen} onEdit={onEdit} onDelete={onDelete} onTogglePinned={onTogglePinned} menuId={menuId} setMenuId={setMenuId} />)}</div>{skills.length === 0 && <div className="empty-state"><FiZap size={24} /><strong>还没有 Skill</strong><span>添加你编写的 HTTP 或本地 Skill，建立自己的能力库</span><button className="primary-button" type="button" onClick={onNew}><FiPlus size={16} /> 新增 Skill</button></div>}</section>}
  </>;
}

function SkillCard({ skill, categoryMap, onOpen, onEdit, onDelete, onTogglePinned, menuId, setMenuId }) {
  const category = categoryMap[skill.categoryId]?.name; const hasHttp = Boolean(skill.primaryUrl); const address = skill.primaryUrl || skill.localPath;
  return <article className={`tool-card skill-card ${skill.status !== "active" ? "disabled" : ""}`}><div className="card-topline"><SkillIcon skill={skill} /><div className="card-actions"><button type="button" className={`star-button ${skill.isPinned ? "selected" : ""}`} aria-label={skill.isPinned ? "取消收藏" : "收藏 Skill"} onClick={() => onTogglePinned(skill)}><FiStar size={18} /></button><div className="menu-wrap"><button type="button" className="more-button" aria-label="更多操作" onClick={() => setMenuId(menuId === skill.id ? null : skill.id)}><FiMoreVertical size={18} /></button>{menuId === skill.id && <div className="card-menu"><button type="button" onClick={() => onOpen(skill)}>{hasHttp ? <FiArrowUpRight /> : <FiCopy />} {hasHttp ? "打开" : "复制路径"}</button><button type="button" onClick={() => onEdit(skill)}><FiEdit3 /> 编辑 Skill</button><button type="button" onClick={() => onDelete(skill)} className="danger"><FiTrash2 /> 删除</button></div>}</div></div></div><div className="card-content"><h3>{skill.name}</h3><p>{skill.description || "暂无简介"}</p><div className="card-meta"><span className={`entry-badge ${hasHttp ? "http" : "path"}`}>{hasHttp ? "HTTP" : "本地路径"}</span>{category && <span className="category-badge">{category}</span>}{(skill.tags || []).slice(0, 2).map((tag) => <TagBadge tag={tag} key={tag} />)}</div></div><div className="card-bottom"><span className="address-preview" title={address}>{address}</span><button className="open-button" type="button" onClick={() => onOpen(skill)}>{hasHttp ? "打开" : "复制路径"}{hasHttp ? <FiArrowUpRight size={15} /> : <FiCopy size={15} />}</button></div></article>;
}

function SkillEditor({ editor, categories, onChange, onClose, onSubmit }) {
  const update = (key, value) => onChange((current) => ({ ...current, [key]: value }));
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="editor-modal" role="dialog" aria-modal="true" aria-labelledby="skill-editor-title"><div className="modal-header"><div><p className="eyebrow">SKILL CONFIGURATION</p><h2 id="skill-editor-title">{editor.id ? "编辑 Skill" : "新增 Skill"}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="关闭"><FiX size={20} /></button></div><form onSubmit={onSubmit}><div className="form-grid"><label>Skill 名称<input autoFocus value={editor.name} onChange={(event) => update("name", event.target.value)} placeholder="例如：接口调试助手" /></label><label className="wide">图标<div className="icon-picker" role="radiogroup" aria-label="选择 Skill 图标">{Object.keys(skillIcons).map((key) => { const Component = skillIcons[key]; return <button key={key} type="button" className={`icon-option ${editor.icon === key ? "selected" : ""}`} role="radio" aria-checked={editor.icon === key} aria-label={skillIconLabels[key]} onClick={() => update("icon", key)}><span className="icon-option-preview" style={{ background: `${skillIconColors[key]}16` }}><Component size={22} style={{ color: skillIconColors[key] }} /></span><span>{skillIconLabels[key]}</span></button>; })}</div></label><label className="wide">简介<input value={editor.description} onChange={(event) => update("description", event.target.value)} placeholder="一句话说明这个 Skill 解决什么问题" /></label><label>存放方式<select value={editor.entryType} onChange={(event) => update("entryType", event.target.value)}><option value="http">HTTP 地址</option><option value="path">本地路径</option></select></label><label>所属分组<select value={editor.categoryId || ""} onChange={(event) => update("categoryId", event.target.value)}><option value="">未分类</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>{editor.entryType === "http" ? <label className="wide">Skill 地址<input value={editor.primaryUrl} onChange={(event) => update("primaryUrl", event.target.value)} placeholder="http://localhost:8000/skills/my-skill 或 https://..." /></label> : <label className="wide">本地路径<input value={editor.localPath} onChange={(event) => update("localPath", event.target.value)} placeholder="/Users/you/.codex/skills/my-skill" /></label>}<label className="wide">标签 <span className="field-hint">用逗号分隔</span><input value={editor.tags} onChange={(event) => update("tags", event.target.value)} placeholder="开发, 自动化, 需求" /></label></div><div className="form-options"><label className="check-row"><input type="checkbox" checked={editor.isPinned} onChange={(event) => update("isPinned", event.target.checked)} />加入常用 Skill</label><label className="check-row"><input type="checkbox" checked={editor.status === "active"} onChange={(event) => update("status", event.target.checked ? "active" : "disabled")} />启用</label></div><div className="modal-footer"><button type="button" className="secondary-button" onClick={onClose}>取消</button><button type="submit" className="primary-button"><FiCheck size={17} />保存 Skill</button></div></form></section></div>;
}

function DocumentsWorkspace({ documents, documentTags, documentTag, setDocumentTag, documentSort, setDocumentSort, view, setView, loading, usingFallback, categories, categoryMap, activeFilter, setActiveFilter, onNew, onOpen, onEdit, onDelete, onTogglePinned, menuId, setMenuId }) {
  return <>
    <div className="document-controls"><div className="category-chips" role="tablist" aria-label="文档分类"><button type="button" className={`category-chip ${activeFilter === "all" ? "active" : ""}`} onClick={() => setActiveFilter("all")}>全部</button>{categories.map((category) => <button key={category.id} type="button" className={`category-chip ${activeFilter === category.id ? "active" : ""}`} onClick={() => setActiveFilter(category.id)}>{category.name}</button>)}</div><div className="toolbar-actions"><label className="sort-select">排序<select value={documentSort} onChange={(event) => setDocumentSort(event.target.value)} aria-label="文档排序方式"><option value="manual">默认</option><option value="recent">最近更新</option><option value="name">名称</option></select><FiChevronDown size={15} /></label><div className="view-switcher"><button className={view === "grid" ? "active" : ""} type="button" onClick={() => setView("grid")} aria-label="卡片视图"><FiGrid size={18} /></button><button className={view === "list" ? "active" : ""} type="button" onClick={() => setView("list")} aria-label="列表视图"><FiList size={18} /></button></div><button className="new-tool-button" type="button" onClick={onNew}><FiPlus size={18} /> 新增文档</button></div></div>
    <section className="page-heading documents-heading"><div><p className="eyebrow">WORKNEST / KNOWLEDGE LINKS</p><h1>{activeFilter === "all" ? "文档库" : activeFilter === "favorites" ? "收藏文档" : categoryMap[activeFilter]?.name || "文档库"}</h1><p className="page-summary">{documents.length} 个文档 · 按分类和标签整理，打开即用</p></div><span className={`connection-state ${usingFallback ? "offline" : ""}`}><span />{usingFallback ? "本地演示数据" : "SQLite 已连接"}</span></section>
    <section className="document-filter-bar"><div className="document-filter-title"><span className="section-icon light"><FiFileText size={16} /></span><strong>标签</strong></div><div className="document-tag-list"><button type="button" className={`tag-filter ${documentTag === "all" ? "active" : ""}`} onClick={() => setDocumentTag("all")}>全部</button>{documentTags.map((tag) => <button type="button" className={`tag-filter colored-tag ${documentTag === tag ? "active" : ""}`} style={getTagColorStyle(tag)} key={tag} onClick={() => setDocumentTag(tag)}>{tag}</button>)}</div></section>
    {loading ? <div className="loading-state"><FiRefreshCw className="spin" /> 正在加载文档库...</div> : <section className={`documents-section ${view === "list" ? "list-view" : ""}`}><div className="document-grid">{documents.map((document) => <DocumentCard key={document.id} document={document} categoryMap={categoryMap} featured={document.isPinned} onOpen={onOpen} onEdit={onEdit} onDelete={onDelete} onTogglePinned={onTogglePinned} menuId={menuId} setMenuId={setMenuId} />)}</div>{documents.length === 0 && <div className="empty-state"><FiFileText size={24} /><strong>没有找到匹配文档</strong><span>换个关键词、标签或分类试试</span></div>}</section>}
  </>;
}

function DocumentCard({ document, categoryMap, onOpen, onEdit, onDelete, onTogglePinned, menuId, setMenuId }) {
  const category = categoryMap[document.categoryId]?.name;
  return <article className={`document-card ${document.status !== "active" ? "disabled" : ""}`}><div className="document-card-header"><div className="document-icon"><FiFileText size={24} /></div><div className="card-actions"><button type="button" className={`star-button ${document.isPinned ? "selected" : ""}`} aria-label={document.isPinned ? "取消收藏" : "收藏文档"} onClick={() => onTogglePinned(document)}><FiStar size={18} /></button><div className="menu-wrap"><button type="button" className="more-button" aria-label="更多操作" onClick={() => setMenuId(menuId === document.id ? null : document.id)}><FiMoreVertical size={18} /></button>{menuId === document.id && <div className="card-menu"><button type="button" onClick={() => onOpen(document)}><FiArrowUpRight /> 打开文档</button><button type="button" onClick={() => onEdit(document)}><FiEdit3 /> 编辑信息</button><button type="button" onClick={() => onDelete(document)} className="danger"><FiTrash2 /> 删除</button></div>}</div></div></div><div className="document-card-content"><h3>{document.title}</h3><p>{document.description || "暂无描述"}</p><a className="document-url" href={document.url} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>{document.url}</a></div><div className="document-card-footer"><div className="document-badges">{category && <span className="category-badge">{category}</span>}{(document.tags || []).slice(0, 3).map((tag) => <TagBadge tag={tag} key={tag} />)}</div><button className="open-button" type="button" onClick={() => onOpen(document)}>打开 <FiArrowUpRight size={15} /></button></div></article>;
}

function DocumentEditor({ editor, categories, onChange, onClose, onSubmit }) {
  const update = (key, value) => onChange((current) => ({ ...current, [key]: value }));
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="editor-modal" role="dialog" aria-modal="true" aria-labelledby="document-editor-title"><div className="modal-header"><div><p className="eyebrow">DOCUMENT CONFIGURATION</p><h2 id="document-editor-title">{editor.id ? "编辑文档" : "新增文档"}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="关闭"><FiX size={20} /></button></div><form onSubmit={onSubmit}><div className="form-grid"><label className="wide">文档标题<input autoFocus value={editor.title} onChange={(event) => update("title", event.target.value)} placeholder="例如：项目接口文档" /></label><label className="wide">文档地址<input value={editor.url} onChange={(event) => update("url", event.target.value)} placeholder="https://example.com/docs 或 192.168.1.10:8080/docs" /></label><label className="wide">简介<input value={editor.description} onChange={(event) => update("description", event.target.value)} placeholder="一句话说明文档内容和使用场景" /></label><label>所属分组<select value={editor.categoryId || ""} onChange={(event) => update("categoryId", event.target.value)}><option value="">未分类</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label className="wide">标签 <span className="field-hint">用逗号分隔</span><input value={editor.tags} onChange={(event) => update("tags", event.target.value)} placeholder="API, 内网, 参考" /></label></div><div className="form-options"><label className="check-row"><input type="checkbox" checked={editor.isPinned} onChange={(event) => update("isPinned", event.target.checked)} />加入收藏文档</label><label className="check-row"><input type="checkbox" checked={editor.status === "active"} onChange={(event) => update("status", event.target.checked ? "active" : "disabled")} />启用</label></div><div className="modal-footer"><button type="button" className="secondary-button" onClick={onClose}>取消</button><button type="submit" className="primary-button"><FiCheck size={17} />保存文档</button></div></form></section></div>;
}

export { App };
