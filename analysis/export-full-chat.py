"""Export only the site's existing groups, using strict original NT text elements.

Private output stays outside the public repository. No heuristic text fallback.
"""
import argparse
from collections import Counter
from bot_filter import reason, load_senders, VERSION, BOT_NAME
import csv
import hashlib
import json
from pathlib import Path
import re
import sqlite3
import sys
from datetime import datetime, timezone, timedelta

ROOT = Path(__file__).resolve().parents[1]


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--source', type=Path, default=Path('E:/TIMMsg/decrypted-complete-20261028/1DE4DA14BCCFD5B390684D4D0CC4DFEA.sqlite'))
    p.add_argument('--decoder', type=Path, default=Path('E:/TIMMsg/message-viewer'))
    p.add_argument('--output', type=Path, default=Path('D:/Documents/SkyBlockTraining/analysis/full-chat'))
    a = p.parse_args()
    if a.output.resolve().is_relative_to(ROOT):
        p.error('Private messages must stay outside the public website repository')
    sys.path.insert(0, str(a.decoder))
    from viewer.nt_message import decode_nt_message
    groups = list(csv.DictReader((ROOT / 'groups.tsv').open(encoding='utf-8-sig'), delimiter='\t'))
    db = sqlite3.connect(a.source.resolve().as_uri() + '?mode=ro', uri=True)
    tables = {r[0] for r in db.execute("SELECT name FROM sqlite_master WHERE type='table'")}
    a.output.mkdir(parents=True, exist_ok=True)
    zone = timezone(timedelta(hours=8))
    bot_senders = load_senders()
    initial_senders = set(bot_senders)
    hours = Counter()
    removed = Counter()
    with (a.output / 'messages.csv').open('w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['groupIndex', 'month', 'sender', 'text'])
        for idx, g in enumerate(groups, 1):
            g.update(total=0, originalTotal=0, botExcluded=0, decoded=0, textMessages=0, unknown=0, first=None, last=None)
            table = 'msg_1_' + g['gid']
            if table not in tables:
                continue
            for ts, raw in db.execute(f'SELECT msgTime,extensionData FROM "{table}" WHERE chatType=1 AND chatUin=?', (int(g['gid']),)):
                g['originalTotal'] += 1
                m = decode_nt_message(raw)
                sender = hashlib.sha256((m.sender_uid or str(m.sender_qq)).encode()).hexdigest()[:20] if m and (m.sender_uid or m.sender_qq) else ''
                if m and sender and BOT_NAME.search(m.sender_name):
                    bot_senders.add(sender)
                why = reason(m.unmentioned_text if m else '', sender, bot_senders)
                if why:
                    g['botExcluded'] += 1
                    removed[why] += 1
                    continue
                g['total'] += 1
                if ts and ts > 0:
                    g['first'] = min(g['first'] or ts, ts)
                    g['last'] = max(g['last'] or ts, ts)
                    date = datetime.fromtimestamp(ts, zone)
                    hours[idx, date.strftime('%Y-%m'), date.weekday(), date.hour] += 1
                if m is None:
                    g['unknown'] += 1
                    continue
                g['decoded'] += 1
                text = m.unmentioned_text
                text = re.sub(r'https?://\S+|www\.\S+', ' ', text)
                text = re.sub(r'[\x00-\x1f\x7f]', ' ', text).strip()
                if not text or not ts or ts <= 0:
                    continue
                g['textMessages'] += 1
                # Stable anonymous sender key for distinct-participant statistics.
                sender = hashlib.sha256((m.sender_uid or str(m.sender_qq)).encode()).hexdigest()[:20] if m.sender_uid or m.sender_qq else ''
                writer.writerow([idx, datetime.fromtimestamp(ts, zone).strftime('%Y-%m'), sender, text])
            print(g['gid'], g['total'], g['textMessages'], flush=True)
    manifest = dict(groups=groups, timezone='Asia/Shanghai', source=a.source.name,
                    extraction='NT unmentioned_text; no quoted text, cards, OCR or heuristic fallback',
                    generatedAt=datetime.now(zone).isoformat(),
                    botFilter=dict(version=VERSION, removed=sum(removed.values()), reasons=dict(removed)))
    (a.output / 'coverage.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    (a.output/'retained-hours.json').write_text(json.dumps([[*k,n] for k,n in sorted(hours.items())]), encoding='utf-8')
    (a.output/'bot-senders.json').write_text(json.dumps(sorted(bot_senders)), encoding='utf-8')
    if bot_senders != initial_senders:
        print('New bot senders discovered; reapplying the complete sender set', flush=True)
        return main()
    print('BOT FILTER',dict(removed))
    print('TOTAL', sum(g['total'] for g in groups), 'TEXT', sum(g['textMessages'] for g in groups))


if __name__ == '__main__':
    main()
