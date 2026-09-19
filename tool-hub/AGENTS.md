# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Durable design decisions

- The selected direction is a light-mode personal utility workspace: warm white and pale lavender surfaces, violet primary actions, subtle grid/blueprint texture, and modular Bento-style tool cards.
- The left grouping navigation is an icon-only rail. Category names appear through hover tooltips; counts and full labels stay out of the rail.
- HTTP tools open their stored address in a new browser tab. Local-path tools copy their path because browser pages cannot reliably launch native applications.
- The primary user-facing concept is a work page library for already-built web pages. Use 页面/工作台/工作场景 in visible copy; keep internal tool model and API names for compatibility. 文档库 remains a separate workspace for reference links.
- The initial implementation is single-user and local-first, with an Express API backed by SQLite. The frontend keeps a demo-data fallback so the visual prototype remains usable when the API is unavailable.
- The workspace now includes a separate 文档库 section for HTTP document links. Documents support category assignment, free-form tags, search, sort, favorites, CRUD editing, and opening the stored URL in a new tab.
- The workspace also includes a separate Skill 库 for user-authored capabilities. Skills support HTTP addresses or local paths, category/tag filtering, favorites, CRUD editing, and opening or copying the configured entry.
- Groups have persisted icon choices. Built-in groups are protected; user-created groups can be edited or removed from the 分组管理 modal, and assigned content remains available as 未分类 after removal.
