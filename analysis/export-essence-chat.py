"""Prepare essence for the shared MATLAB vocabulary; keep separate denominators."""
import csv, json, re
from datetime import datetime, timezone, timedelta
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
OUT = Path('D:/Documents/SkyBlockTraining/analysis/full-chat')
groups = list(csv.DictReader((ROOT/'groups.tsv').open(encoding='utf-8-sig'), delimiter='\t'))
indices = {g['gid']: i for i,g in enumerate(groups,1)}
rows = list(csv.DictReader((ROOT/'msgs.tsv').open(encoding='utf-8-sig'),delimiter='\t'))
coverage = [dict(total=0,textMessages=0,first=None,last=None) for _ in groups]
with (OUT/'essence.csv').open('w',encoding='utf-8',newline='') as f:
 w=csv.writer(f); w.writerow(['groupIndex','month','sender','text'])
 for r in rows:
  i=indices[r['gid']];g=coverage[i-1];ts=int(r['senderTime']);g['total']+=1
  g['first']=min(g['first'] or ts,ts);g['last']=max(g['last'] or ts,ts)
  text=r.get('analysisText') or r['text']
  text=re.sub(r'https?://\S+|www\.\S+',' ',text)
  text=re.sub(r'[\x00-\x1f\x7f]',' ',text).strip()
  if not text: continue
  g['textMessages']+=1
  w.writerow([i,datetime.fromtimestamp(ts,timezone(timedelta(hours=8))).strftime('%Y-%m'),'',text])
(OUT/'essence-coverage.json').write_text(json.dumps(dict(groups=coverage,total=len(rows),extraction='Essence text + image OCR; existing analysisText; URLs removed',timezone='Asia/Shanghai'),ensure_ascii=False),encoding='utf-8')
print('Essence',len(rows),'analyzable',sum(g['textMessages'] for g in coverage))
