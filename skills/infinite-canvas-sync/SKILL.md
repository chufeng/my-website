---
name: infinite-canvas-sync
description: Safely synchronize Infinite Canvas projects across computers using reviewed export JSON, GitHub, or WebDAV. Use when importing/exporting canvas projects, configuring a new computer, or committing canvas sync artifacts. Never upload IndexedDB, API keys, Connect tokens, cookies, or WebDAV passwords.
---

# Infinite Canvas Sync

This skill standardizes cross-computer canvas setup for this repository. The web app stores canvas data in browser IndexedDB; GitHub stores only reviewed, sanitized export JSON. AI credentials stay local to each computer.

## Configure a new computer

1. Clone or pull the repository.
2. Open `https://canvas.best/canvas` and choose “导入画布”. Import a file from `canvas-sync/exports/` whose name ends in `.safe.json`.
3. Start the local Agent:

   ```bash
   npx -y @basketikun/canvas-agent
   ```

4. In the canvas connection panel, connect the displayed `Local URL` (usually `http://127.0.0.1:17371`). Configure the AI provider and API Key locally on this computer; do not put credentials in the repository.
5. Verify node count, connections, prompts, and referenced media after import.

## Export and commit a new version

1. In the canvas menu choose “导出当前画布”. If export reports `Failed to fetch`, ensure the local Agent is running and connected; do not copy browser IndexedDB files.
2. Save the raw export only under `canvas-sync/raw/` (ignored by Git).
3. Sanitize it before review:

   ```bash
   node scripts/sanitize-canvas-export.mjs \
     canvas-sync/raw/project.json \
     canvas-sync/exports/project.safe.json
   ```

4. Manually review the safe file for personal images, private prompts, URLs, and other sensitive content. Commit only the reviewed `.safe.json` and documentation changes.
5. Push the commit to the configured GitHub remote. Do not use `git add -A`; exclude databases, uploads, QR codes, local settings, raw exports, and secrets.

## WebDAV alternative

For large media or frequent sync, configure WebDAV in “配置 → WebDAV”. WebDAV can sync canvas data, assets, generation records, and media files, but does not sync AI API Keys. GitHub is for versioned, reviewed exports—not raw IndexedDB.

## Safety rules

- Never read or upload IndexedDB files, browser profiles, cookies, API Keys, Connect tokens, authorization headers, passwords, or WebDAV credentials.
- Never claim a canvas is synced until a `.safe.json` exists in the repository and its commit is pushed.
- If an export fails, report the exact visible error and stop before committing an empty or fabricated export.

## Image generation lessons learned

- The known working route was the image workbench calling `/v1/images/generations` with model `gpt-image-2`. Use one image per request; do not use `gpt-image-2-super`, `gpt-image-2-4k`, or Grok variants unless the user explicitly asks.
- Confirmed again on 2026-08-27: the image workbench successfully generated one 2009 male turnaround sheet with the wedding photo uploaded as a reference, model `gpt-image-2`, quality `medium`, size `2:3`. The result was 1664×2496 after about 1m21s. Keep this as the reference-image workflow when the canvas Agent route fails.
- For canvas generation, run one node at a time and poll its status before starting another request. A successful workbench request does not prove that reference-image editing in the canvas will work.
- Current canvas tests: a fresh single-image `gpt-image-2` flow (`2:3`, `medium`, no reference image) also failed. The config node reported `生成失败`; its output image reported `Failed to fetch` and the canvas task remained `running`. Earlier retries (including reference-image flows) returned `Failed to fetch` or `页面刷新后生成已中断，请重新生成。` This shows the problem is not limited to the `image/edit` reference-image path. Do not repeat requests automatically because each attempt may incur a charge.
- When a canvas image task fails or remains stuck, report the config/output node IDs and the visible error, then ask the user to verify the provider route, model mapping, and Canvas Agent logs before another paid attempt.
