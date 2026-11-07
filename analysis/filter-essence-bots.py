"""Filter published essence inputs while retaining private originals."""
from collections import Counter, defaultdict
import csv
import json
from pathlib import Path
from bot_filter import PRIVATE, VERSION, REPLY, reason, BOT_NAME

ROOT = Path(__file__).resolve().parents[1]
backup = PRIVATE/'before-bot-filter'
with (backup/'msgs.tsv').open(encoding='utf-8-sig', newline='') as f:
    reader = csv.DictReader(f, delimiter='\t')
    fields = reader.fieldnames
    rows = list(reader)
counts = Counter(r['sender'] for r in rows)
replies = Counter(r['sender'] for r in rows if REPLY.search(r.get('analysisText') or r['text']))
senders = {s for s,n in replies.items() if n>=3 and n/counts[s]>=.8}
senders.update(r['sender'] for r in rows if BOT_NAME.search(r['senderNick']))
retained = []
removed = Counter()
group_removed = Counter()
for row in rows:
    why = reason(row.get('analysisText') or row['text'], row['sender'], senders)
    if why:
        removed[why] += 1
        group_removed[row['gid']] += 1
    else:
        retained.append(row)
with (ROOT/'msgs.tsv').open('w', encoding='utf-8', newline='') as f:
    w = csv.DictWriter(f, fieldnames=fields, delimiter='\t', lineterminator='\n')
    w.writeheader()
    w.writerows(retained)
keep = {(r['gid'],r['mid']) for r in retained}
essence = json.loads((backup/'essence.json').read_text(encoding='utf-8'))
for gid,g in essence.items():
    g['msgs'] = [m for m in g.get('msgs',[]) if (gid,str(m.get('mid'))) in keep]
(ROOT/'essence.json').write_text(json.dumps(essence, ensure_ascii=True, separators=(',',':')), encoding='utf-8')
with (backup/'groups.tsv').open(encoding='utf-8-sig', newline='') as f:
    reader = csv.DictReader(f, delimiter='\t')
    group_fields = reader.fieldnames
    groups = list(reader)
by_group = defaultdict(list)
for row in retained:
    by_group[row['gid']].append(row)
for g in groups:
    rs = by_group[g['gid']]
    g['nMsgs'] = len(rs)
    for field,column in [('nText','nText'),('nImage','nImage')]:
        g[field] = sum(int(r[column])>0 for r in rs)
    g['nDistinctSender'] = len({r['sender'] for r in rs})
    g['nDistinctOperator'] = len({r['operator'] for r in rs})
    g['chars'] = sum(len(r.get('analysisText') or r['text']) for r in rs)
    stamps = [int(r['senderTime']) for r in rs]
    g['firstTS'] = min(stamps,default=0)
    g['lastTS'] = max(stamps,default=0)
    g['spanDays'] = round((g['lastTS']-g['firstTS'])/86400) if stamps else 0
with (ROOT/'groups.tsv').open('w', encoding='utf-8', newline='') as f:
    w = csv.DictWriter(f, fieldnames=group_fields, delimiter='\t', lineterminator='\n')
    w.writeheader()
    w.writerows(groups)
(PRIVATE/'essence-bot-filter.json').write_text(json.dumps(dict(version=VERSION,originalTotal=len(rows),removed=sum(removed.values()),reasons=dict(removed),groupRemoved=dict(group_removed))),encoding='utf-8')
print('Essence bot filter',dict(removed),'retained',len(retained),'/',len(rows))
