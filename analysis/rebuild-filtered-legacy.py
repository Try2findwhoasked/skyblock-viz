"""Recompute the original gallery's statistics and samples from filtered essence."""
import csv
import json
from pathlib import Path
import shutil
import subprocess
from bot_filter import PRIVATE

ROOT = Path(__file__).resolve().parents[1]
stage = PRIVATE/'legacy-filtered-build'
(stage/'output/matlab').mkdir(parents=True, exist_ok=True)
(stage/'output/images').mkdir(exist_ok=True)
shutil.copy2(ROOT/'essence.json', stage/'output/essence.json')
original = json.loads((PRIVATE/'before-bot-filter/viz-data.json').read_text(encoding='utf-8'))
(stage/'output/images/manifest.json').write_text(json.dumps(original['imageMap']), encoding='utf-8')
with (ROOT/'msgs.tsv').open(encoding='utf-8-sig', newline='') as f:
    rows = list(csv.DictReader(f, delimiter='\t'))
ocr = {r['mid']+'|'+r['senderTime']:r['ocr'] for r in rows}
(stage/'ocr.json').write_text(json.dumps(ocr, ensure_ascii=True), encoding='utf-8')
adapter = """const OCR_ROWS = JSON.parse(fs.readFileSync('ocr.json','utf8'));
function ocrOf(m) { return OCR_ROWS[String(m.mid)+'|'+String(m.senderTime)] || '' }
function analysisText(text, ocr) { return [text,ocr].filter(Boolean).join('\\n').normalize('NFKC') }
"""
for name, relative in [('stats.mjs','analysis/tools/sb-viz.mjs'), ('samples.mjs','analysis/vzs.mjs')]:
    code = (ROOT/relative).read_text(encoding='utf-8')
    code = '\n'.join(line for line in code.splitlines() if not line.startswith('import { ocrOf'))
    code = adapter+code
    for old,target in [('./sb-lexicon.mjs','analysis/tools/sb-lexicon.mjs'),('../sb-domain.mjs','analysis/sb-domain.mjs'),('./tools/sb-lexicon.mjs','analysis/tools/sb-lexicon.mjs')]:
        code = code.replace("'"+old+"'", "'"+(ROOT/target).as_uri()+"'")
    (stage/name).write_text(code, encoding='utf-8')
    subprocess.run(['node', name], cwd=stage, check=True)
data = json.loads((stage/'output/matlab/viz-data.json').read_text(encoding='utf-8'))
cache = json.loads((ROOT/'essence.json').read_text(encoding='utf-8'))
urls = {s['data']['url'] for g in cache.values() for m in g.get('msgs',[]) for s in m.get('content',[]) if s.get('type')=='image' and s.get('data',{}).get('url')}
data['imageMap'] = {u:p for u,p in data['imageMap'].items() if u in urls}
data['imageStats']['downloaded'] = len(data['imageMap'])
bot = json.loads((PRIVATE/'essence-bot-filter.json').read_text(encoding='utf-8'))
data['analysis']['botFilter'] = bot
data['analysis']['method'] += '；已过滤机器人相关消息'
(ROOT/'viz-data.json').write_text(json.dumps(data, ensure_ascii=True, separators=(',',':')), encoding='utf-8')
(ROOT/'images/manifest.json').write_text(json.dumps(data['imageMap'], ensure_ascii=True), encoding='utf-8')
report = '# SkyBlock 精华消息分析\n\n'
report += f"过滤机器人相关记录 {bot['removed']} 条；保留 {data['summary']['msgs']} 条消息，其中 {data['summary']['textMsgs']} 条有正文或 OCR。\n\n"
report += '|话题|涉及消息数|主分类消息数|\n|---|---:|---:|\n'
for t in data['topics']:
    report += f"|{t['name']}|{t['mention']}|{t['primary']}|\n"
(ROOT/'report.md').write_text(report, encoding='utf-8')
subprocess.run(['python',str(ROOT/'analysis/pack-essence.py')],check=True,cwd=ROOT)
