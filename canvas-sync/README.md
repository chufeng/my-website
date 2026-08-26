# Infinite Canvas 跨电脑同步

Infinite Canvas 的画布和图片默认保存在浏览器 IndexedDB，不会因为 GitHub 仓库更新而自动同步。仓库只保存经过检查的画布导出文件；API Key、Connect token、WebDAV 密码和原始 IndexedDB 不应提交。

## 在当前电脑导出

1. 打开 `https://canvas.best/canvas`，在目标画布上点击“导出”。
2. 把导出的 JSON 放到 `canvas-sync/exports/`。
3. 用仓库脚本清理敏感字段：

   ```bash
   node scripts/sanitize-canvas-export.mjs \
     canvas-sync/exports/画布.json \
     canvas-sync/exports/画布.safe.json
   ```

4. 检查脚本报告，确认没有 API Key、token、密码或私人配置后，再提交 `*.safe.json`。

如果导出时出现 `Failed to fetch`，先确保本机 Canvas Agent 正在运行，并在网页右侧显示“已连接”；不要改为读取或复制浏览器 IndexedDB 文件。

## 在其他电脑导入

1. 拉取仓库：

   ```bash
   git clone https://github.com/chufeng/NewJDWeb.git
   cd NewJDWeb
   ```

2. 打开 `https://canvas.best/canvas`，点击“导入画布”，选择仓库中的 `canvas-sync/exports/*.safe.json`。
3. 在该电脑单独启动本地 Agent：

   ```bash
   npx -y @basketikun/canvas-agent
   ```

4. 在网页中连接新的 `Local URL`。API Key 需要在这台电脑单独配置；不要把 API Key 写入导出文件或 GitHub。

## 自动同步选项

如果不想每次手动导出/导入，可以在画布“配置 → WebDAV”配置自己的 WebDAV。WebDAV 会同步画布、资产、生成记录和媒体文件，但不会同步 AI API Key。GitHub 适合版本管理安全导出文件，不适合存放原始 IndexedDB。
