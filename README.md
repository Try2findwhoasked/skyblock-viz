# SkyBlock 中文圈子 · 精华话题分析

从 SnowLuma 的 MATLAB 可视化导出整理的独立静态站点。无需 Node、MATLAB、数据库或构建步骤。

## 部署最小集

- `index.html`：入口，内嵌全部样式、脚本和分析数据。
- `images/`：页面实际引用的 4,803 个图片路径，内容去重后 4,803 张；静态图使用较小的 WebP 或原格式，保持分辨率，GIF 动画保留原文件。
- `report.md`、`msgs.tsv`、`groups.tsv`、`viz-data.json`、`essence.json`、`images/manifest.json`：保留页面底部的六个下载入口。它们不参与页面运行。manifest 是原始抓取映射，部署图片名已去重并更新在页面数据中。
- `.nojekyll`：GitHub Pages 直接发布静态文件。

已排除 MATLAB `.mat` 中间文件、未被页面引用的图像、重复 CSV、分析图目录、抓取程序、账号配置及日志。

原始引用图片共 1420.6 MiB；部署图片 671.4 MiB；站点约 686.7 MiB。静态图压缩有轻微有损，不改变原始文件。

## GitHub Pages

仓库及网站公开可访问（Public）。网站：https://try2findwhoasked.github.io/skyblock-viz/

发布源为 GitHub Actions。推送 `main` 或手动运行工作流会自动验证并部署；面向 `main` 的 PR 只运行验证。

CI 检查内嵌数据与下载数据一致、全部本地图片和下载链接存在、JavaScript 语法正确、站点小于 1 GB。部署产物只包含静态网站文件，不含 Git 历史、文档、检查脚本和工作流本身。使用 GitHub 自动提供的短期令牌，无需配置密钥。

本地检查：`python scripts/check_site.py`（需要 Python 3.10+ 和 Node.js）。站点运行本身不需要这两个工具。

本地预览：在本目录运行 `python -m http.server 8080`，访问 `http://localhost:8080/`。
