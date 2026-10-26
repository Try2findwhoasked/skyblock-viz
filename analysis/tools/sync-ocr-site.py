"""Sync rebuilt OCR analysis, reusing deployed images by source URL."""
import json, re, shutil, hashlib
from pathlib import Path
from PIL import Image
SOURCE = Path(__file__).resolve().parents[1]
SITE = Path(r'D:\Documents\Coding\Web\sites\skyblock-viz')
def main():
    data = json.loads((SOURCE/'output/matlab/viz-data.json').read_text(encoding='utf-8'))
    previous = json.loads((SITE/'viz-data.json').read_text(encoding='utf-8'))
    oldmap = previous.get('imageMap', {})
    mapping = {}
    reused = added = 0
    for url, local in data['imageMap'].items():
        old = oldmap.get(url)
        if old and (SITE/'images'/old).is_file():
            mapping[local] = old
            reused += 1
            continue
        src = SOURCE/'output/images'/local
        name = hashlib.sha256(src.read_bytes()).hexdigest()[:24] + src.suffix
        dst = SITE/'images'/name
        if not dst.exists():
            if src.suffix.lower() not in ('.gif', '.webp'):
                with Image.open(src) as im:
                    candidate = dst.with_suffix('.webp')
                    im.convert('RGBA' if 'A' in im.getbands() else 'RGB').save(candidate, 'WEBP', quality=85, method=6)
                if candidate.stat().st_size < src.stat().st_size:
                    dst = candidate
                else:
                    candidate.unlink()
                    shutil.copy2(src, dst)
            else:
                shutil.copy2(src, dst)
        mapping[local] = dst.name
        added += 1
    def rewrite(value):
        if isinstance(value, dict):
            for key, item in value.items():
                if key == 'local' and item: value[key] = mapping[item]
                else: rewrite(item)
        elif isinstance(value, list):
            for item in value: rewrite(item)
    rewrite(data)
    data['imageMap'] = {url: mapping[local] for url, local in data['imageMap'].items()}
    serialized = json.dumps(data, ensure_ascii=True, separators=(',', ':'))
    html = (SOURCE/'output/matlab/index.html').read_text(encoding='utf-8')
    html, count = re.subn(r'^window\.__SB_DATA = .+$', lambda _: 'window.__SB_DATA = '+serialized, html, flags=re.M)
    assert count == 1
    (SITE/'index.html').write_text(html, encoding='utf-8')
    (SITE/'viz-data.json').write_text(serialized, encoding='utf-8')
    (SITE/'images/manifest.json').write_text(json.dumps(data['imageMap'], ensure_ascii=False), encoding='utf-8')
    for name in ['msgs.tsv', 'groups.tsv']:
        shutil.copy2(SOURCE/'output/matlab'/name, SITE/name)
    shutil.copy2(SOURCE/'output/essence.json', SITE/'essence.json')
    a = data['analysis']
    report = '# SkyBlock 精华消息 OCR 词匹配分析\n\n'
    report += f"共 {data['summary']['msgs']} 条消息；原文含文本 {a['originalTextMsgs']} 条；OCR 非空 {a['ocrMsgs']} 条；仅靠 OCR 补充文本 {a['ocrOnlyMsgs']} 条。\n\n"
    report += '主题、共现、领域词频均使用正文＋OCR；同条消息 DF 只计一次。OCR 自动识别可能有误，通用 WD14 图片标签不参与统计。样例保留原文并提供 OCR 展开。msgs.tsv 追加 ocr 和 analysisText 列，原文 text 列保留。\n\n'
    report += '|主题|提及消息|主分类|\n|---|---:|---:|\n'
    for t in data['topics']: report += f"|{t['name']}|{t['mention']}|{t['primary']}|\n"
    (SOURCE/'output/matlab/report-ocr.md').write_text(report, encoding='utf-8')
    (SITE/'report.md').write_text(report, encoding='utf-8')
    print(f'Reused {reused} image references; added {added}; OCR: {a}')
if __name__ == '__main__': main()

