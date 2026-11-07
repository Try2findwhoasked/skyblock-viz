"""Keep private originals; infer bot senders from high-confidence reply templates."""
from collections import Counter
import csv
import json
from pathlib import Path
import shutil
from bot_filter import PRIVATE, REPLY

ROOT = Path(__file__).resolve().parents[1]
backup = PRIVATE/'before-bot-filter'
backup.mkdir(exist_ok=True)
for name in ['messages.csv', 'essence.csv', 'coverage.json', 'essence-coverage.json']:
    if not (backup/name).exists():
        shutil.copy2(PRIVATE/name, backup/name)
for name in ['msgs.tsv', 'essence.json', 'viz-data.json', 'groups.tsv', 'report.md']:
    if not (backup/name).exists():
        shutil.copy2(ROOT/name, backup/name)
total = Counter()
replies = Counter()
with (backup/'messages.csv').open(encoding='utf-8', newline='') as f:
    for row in csv.DictReader(f):
        if row['sender']:
            total[row['sender']] += 1
            if REPLY.search(row['text']):
                replies[row['sender']] += 1
known = set(json.loads((PRIVATE/'bot-senders.json').read_text(encoding='utf-8'))) if (PRIVATE/'bot-senders.json').exists() else set()
senders = sorted(known | {s for s,n in replies.items() if n >= 20 and n/total[s] >= .8})
(PRIVATE/'bot-senders.json').write_text(json.dumps(senders), encoding='utf-8')
print('Inferred bot senders:', len(senders), 'their text messages:', sum(total[s] for s in senders))
