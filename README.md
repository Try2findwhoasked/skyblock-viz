# SKB Observatory · 中文 SkyBlock 圈子观察站

去除机器人相关内容后的群聊与精华双源分析网站。统一词典、分别统计，支持词云、话题占比、
双源词频和月份对照。页面是纯静态文件，无需在线运行 MATLAB、数据库或 Node。

- `index.html`、`observatory.css`、`observatory.js`：新版统一入口与 UI。
- `full-chat-data.json`：MATLAB 生成的两源汇总，不含原始聊天明细。
- `corpus.html?source=chat` / `corpus.html?source=essence`：数据库与精华的完整分析档案，共用页面与词典。
- `corpus-details.json`：全量话题共现、时间热图、匿名抽样消息；不包含完整数据库聊天或发送者标识。
- `word-cloud.js`：总览和档案共用的词云绘制。
- `analysis/full-chat-lexicon.json`：可下载词典，464 个词条、24 类话题。
- `essence-analysis.html`、`viz-data.json`：历史精华分析与图片档案。
- `full-chat.html`、`full-chat.js`：保留原单源分析入口。
- `images/`、`report.md`、`msgs.tsv`、`groups.tsv`、`essence.json`：原精华内容资源和下载。

数据库和精华可能重叠，不能把它们相加当成去重总量。数据库使用结构化正文，
精华使用正文＋OCR；默认只比较共同月份。词条匹配是规则统计，未命中不等于闲聊。
重建、统计口径与词典维护见 [analysis/README.md](analysis/README.md)。

## GitHub Pages

仓库及网站公开可访问（Public）。网站：https://try2findwhoasked.github.io/skyblock-viz/

发布源为 GitHub Actions。推送 `main` 或手动运行工作流会自动验证并部署；面向 `main` 的 PR 只运行验证。

CI 检查内嵌数据与下载数据一致、全部本地图片和下载链接存在、JavaScript 语法正确、站点小于 1 GB。部署产物只包含静态网站文件，不含 Git 历史、文档、检查脚本和工作流本身。使用 GitHub 自动提供的短期令牌，无需配置密钥。

本地检查：`python scripts/check_site.py`（需要 Python 3.10+ 和 Node.js）。站点运行本身不需要这两个工具。

本地预览：在本目录运行 `python -m http.server 8080`，访问 `http://localhost:8080/`。

## OCR 词匹配更新

主题、领域词频与样例分类已统一使用正文＋图片 OCR。样例可展开 OCR 文字；msgs.tsv 追加 ocr、analysisText。未使用 WD14 通用图片标签。重建脚本及运行说明见 analysis/README.md。当前统计见 report.md；历史 MATLAB 图表未重新计算。

页面采用紧凑布局；机器人指令、模板回复、签到及机器人相关文本从统计、样例和精华下载中统一排除。
