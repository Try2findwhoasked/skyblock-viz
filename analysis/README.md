# OCR 分析重建

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
