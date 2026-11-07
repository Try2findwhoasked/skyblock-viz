# 双源圈子分析与词典维护

新版入口是 `index.html`，统一完整群聊和精华的词频、词云、话题与月份对照；
旧精华档案保留为 `essence-analysis.html`。两源独立计数，不能相加解释为去重消息量。

## 词典

`community-lexicon.mjs` 是新版唯一词典源：464 个词条、24 类话题。
词条保留中文、英文、缩写、正则和分类；英文使用 ASCII 字符边界，
中文子串匹配，别名优先匹配更长形式。`context` 支持整条消息上下文约束，
例如 T1–T5 只有同时提到 Kuudra 才归为 Kuudra 层级。
一个话题是对应词条命中的并集，每条消息对每个话题最多贡献一次命中。
圈子日常、其他游戏、电脑 AI 也收录在独立分类中，可在网页筛选。

参考了本地聊天的英文词候选和用法样本；`hyp` 按 Hypixel 收录，
不直接当成 Hyperion；`sh/st/bs/hs` 等含义不稳的简称不强行映射。
移除了孤立的“赚、亏、炒、宏、机器、合作、安全、复制”等高误匹配别名。
原来的精华档案继续使用其历史词表，新主页的双源分析使用新版词典。

参考页面：[Galatea](https://hypixelskyblock.minecraft.wiki/w/Galatea)、
[Kuudra](https://hypixelskyblock.minecraft.wiki/w/Kuudra)。
规则匹配仍会受多义词影响；覆盖扩大不能保证召回率或准确率，未做人类标注集评测。

## 本地重建

在网站仓库目录执行：

```powershell
python -m pip install numpy scipy pyahocorasick
node analysis/export-full-lexicon.mjs
node analysis/test-community-lexicon.mjs
python analysis/test-bot-filter.py
python analysis/prepare-bot-filter.py
python analysis/export-full-chat.py
python analysis/filter-essence-bots.py
python analysis/export-essence-chat.py
python analysis/prepare-features.py
& 'D:\MatLab\bin\matlab.exe' -batch "addpath('analysis'); analyze_full_chat;"
python analysis/rebuild-filtered-legacy.py
python analysis/build-corpus-details.py
python scripts/check_site.py
```

原始数据库和已有 NT 解码器的默认路径见 `export-full-chat.py --help`。
私有中间文件写入 `D:/Documents/SkyBlockTraining/analysis/full-chat/`；
不提交消息明细、发送者标识或原始备份。导出器只读访问原始数据库，
不使用可能混入昵称的旧搜索索引。重建会覆盖私有目录对应 CSV 和覆盖清单。
MATLAB 可通过 `analyze_full_chat('中间文件目录')` 指定目录。

数据库使用已解码的当前消息正文，不含昵称、@ 提及、引用、卡片和 OCR；
精华使用 `msgs.tsv` 的 `analysisText`（正文＋OCR，OCR 可能误识别）。
两源均去除链接、控制字符；普通重复消息保留，机器人相关消息已过滤。
月份为北京时间；默认网页仅比较所选群整体有两源文本的月份交集，
不进行逐群配对，也不默认认为两源是独立随机样本。

MATLAB 一次匹配两源，按群、月、来源分别聚合，
原子写入 `full-chat-data.json`（schemaVersion=2）。空群月份不写入 cells；
`cells` 是数据库、`essenceCells` 是精华，二者共用月份和词典索引。
`counts` 是非重叠别名匹配出现次数，`docs` 是涉及消息数，
`topics` 是多标签话题数，`unmatched` 是未命中任何词条的消息数。
新版不导出参与者标识或分组独立人数，避免跨月、跨群错误相加。

## 页面与部署

- `index.html`、`observatory.css`、`observatory.js`：新版 UI，无远程字体或 JS 依赖。
- `essence-analysis.html`：原精华内容和图片档案。
- `full-chat.html`：保留此前单源入口，可返回新版主页。
- `analysis/full-chat-lexicon.json`：网站可下载的词典及参考来源。

词云支持并排/单源、分类和别名搜索、云形、密度、重排及带筛选说明的 PNG 导出。
两张云分别归一化字号；跨来源比较应看词频表的消息占比，而不是跨图字号。
占比差用百分点（pp）展示，不宣称统计显著性。
部署检查验证名单一致、两源分别守恒、词典一致、统计上限、脚本语法、
本地依赖与发布体积，并包含新版页面和词典文件。
`sync-ocr-site.py` 更新历史精华档案，不覆盖新主页；同步后需重新运行上述分析。

## 历史精华分析

在 Snowluma 根目录运行这些脚本；输入为 output/essence.json、output/images/manifest.json 和 output/ImgTag/data.jsonl。网页仓库仅保存脚本，不上传完整模型打标结果。

```powershell
node tools/export-essence-matlab.mjs
node tools/sb-viz.mjs
node vzs.mjs
node tools/build-viz.mjs
node gen-site-html.mjs
node checkviz.mjs
.venv-tagger/Scripts/python.exe tools/sync-ocr-site.py
```

sync-ocr-site.py 中 SITE 为本机网站仓库路径，其他机器请修改。同步保留源图片，按 URL 复用部署图片，新增静态图选择较小的原图或 WebP；GIF 保留。网站中 msgs.tsv 的 text 为原文，ocr 为图片文本，analysisText 为合并文本。主题与词频只使用正文和 OCR，不使用 WD14 通用标签。

## 独立档案与匿名样例

`corpus.html?source=chat` 是数据库分析档案，`?source=essence` 是精华分析档案；
二者共用 `corpus.js` 与 `corpus.css`，通过主页导航和数字卡片互相进入。
包括话题结构、文本覆盖、月度趋势、7×24 时间热图、24×24 话题共现、
词频与词云、圈层差异、群明细、匿名消息样例及筛选。
月份、群筛选影响全页；话题及第二话题用于词条展示和样例的交集筛选。

`build-corpus-details.py` 使用 Aho–Corasick 找出可能出现的字面别名，再使用
与 MATLAB 相同的完整正则、边界及上下文确认命中；范围正则始终参与匹配。
独立校验两源全部 464 个词条的出现次数和涉及消息数后才导出。
共现对角线等于对应群月份的话题消息数，时间热图按原始消息时间统计；
精华热图反映发送时间，不反映收藏时间。

匿名样例采用固定种子的分群月份与话题有界抽样，不导出发送者字段；
链接、邮箱、IP、长标识及五位以上数字自动替换，凭据样式消息、
签到身份载荷和命令不入样例。网页搜索仅在这些公开样例中执行。
发布范围已由用户明确选为“汇总分析＋匿名消息样例”，完整数据库保留在本地。

总览交互已修正：重置恢复全部选项和双源模式，单源词云不再被共同月份约束，
分类图例可再次点击取消筛选，初始加载期间禁用尚未绑定的控件，
数字卡片和话题样例链接可进入相应档案。

旧精华图文档案由 `pack-essence.py` 将内嵌数据移到 `essence-data.json.gz`，
HTML 约 50 KB，初始图表数据压缩后约 15 KB；原群消息和话题样例分别存入
`essence-groups/` 与 `essence-topics/`，按选择异步读取，加载失败可重试。
显示加载状态，初始统计就绪前暂时禁用控件；
不支持 DecompressionStream 的浏览器回退到原 `viz-data.json`。
部署检查会解压并核对内容与原 JSON 一致，OCR 同步脚本自动执行打包。

拆分数据在部署检查中逐群、逐话题与原始 viz-data.json 比较，确保图文档案内容没有丢失。

## 去机器人语料

当前发布版本过滤机器人指令、自动回复/签到模板、明确机器人相关文本，
并排除高置信自动回复发送者及带有明确机器人标识的账号。规则集中在 `bot_filter.py`。
正常游戏内命令（如 `/warp`、`/party`）及装备、地牢、组队讨论不因该规则自动排除。
原始数据库保持不变；过滤前的下载文件与分析输入保存在本地私有
`D:/Documents/SkyBlockTraining/analysis/full-chat/before-bot-filter/`。

重建流程：`prepare-bot-filter.py` → `export-full-chat.py` →
`filter-essence-bots.py` → `export-essence-chat.py` → `prepare-features.py` →
MATLAB `analyze_full_chat` → `rebuild-filtered-legacy.py` → `build-corpus-details.py` →
`pack-essence.py` → `scripts/check_site.py`。
首次准备依赖 `numpy`、`scipy`、`pyahocorasick`。
`prepare-features.py` 缓存稀疏消息/词条匹配；MATLAB 完成消息、词频、话题统计聚合，
并检查缓存时间与词典版本。档案构建独立重数所有词条验证结果。
公开覆盖清单包含各源过滤条数及原因计数，不包含机器人账号标识。
统计、热图、样例、精华下载和旧图文档案均使用过滤后数据。
