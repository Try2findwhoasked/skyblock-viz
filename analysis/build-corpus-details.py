"""Build archive aggregates and bounded anonymized samples. Requires pyahocorasick.
Every term frequency is independently checked against the MATLAB output.
"""
import csv
import json
from pathlib import Path
import random
import re
import sqlite3
from collections import Counter, defaultdict
from datetime import datetime, timezone, timedelta
import ahocorasick

ROOT = Path(__file__).resolve().parents[1]
PRIVATE = Path('D:/Documents/SkyBlockTraining/analysis/full-chat')
SOURCE = Path('E:/TIMMsg/decrypted-complete-20261028/1DE4DA14BCCFD5B390684D4D0CC4DFEA.sqlite')


def redact(text):
    if re.search(r'(?i)(?:password|passwd|access.?token|session.?id|refresh.?token|密码|验证码)\s*[:=：]\s*\S+', text):
        return ''
    if re.search(r'(?i)\b(?:uid|uuid)\s*[:：=]|签到成功|签到奖励', text):
        return ''
    text = re.sub(r'https?://\S+|www\.\S+', '[链接]', text)
    text = re.sub(r'[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}', '[邮箱]', text)
    text = re.sub(r'\b(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?\b', '[地址]', text)
    text = re.sub(r'\b(?:u_[\w-]{10,}|[A-Fa-f0-9]{20,}|[A-Za-z0-9_+/=-]{32,})\b', '[标识]', text)
    text = re.sub(r'(?<!\d)\d{5,}(?!\d)', '[号码]', text)
    text = re.sub(r'@[^\s@]{1,40}', '@[用户]', text)
    text = re.sub(r'[\x00-\x1f\x7f]', ' ', text).strip()
    if len(text) < 12 or len(text) > 450 or text.startswith('/'):
        return ''
    return text


def main():
    d = json.loads((ROOT/'full-chat-data.json').read_text(encoding='utf-8'))
    lex = json.loads((ROOT/'analysis/full-chat-lexicon.json').read_text(encoding='utf-8'))
    assert d['terms'] == lex['terms'], 'Regenerate MATLAB data first'
    months = {m: i+1 for i, m in enumerate(d['months'])}
    topic_ids = {t['id']: i for i, t in enumerate(d['topics'])}
    patterns = [re.compile(t['pattern']) for t in d['terms']]
    contexts = [re.compile(t['context']) if t['context'] else None for t in d['terms']]
    aliases = defaultdict(set)
    raw = set()
    for i, t in enumerate(d['terms']):
        for a in t['aliases']:
            if a.startswith('r:'):
                raw.add(i)
            else:
                aliases[a.lower()].add(i)
    trie = ahocorasick.Automaton()
    for alias, ids in aliases.items():
        trie.add_word(alias, tuple(ids))
    trie.make_automaton()
    out = dict(schemaVersion=1, dictionaryVersion=d['dictionaryVersion'], samples=[], sources={})
    rng = random.Random(20261107)
    for source, filename, cells in [('chat', 'messages', d['cells']), ('essence', 'essence', d['essenceCells'])]:
        cooc = defaultdict(Counter)
        reservoirs = defaultdict(list)
        seen = Counter()
        topic_reservoirs = defaultdict(list)
        topic_seen = Counter()
        counts = [0]*len(patterns)
        docs = [0]*len(patterns)
        total = 0
        with (PRIVATE/(filename+'.csv')).open(encoding='utf-8', newline='') as f:
            for ordinal, row in enumerate(csv.DictReader(f), 1):
                total += 1
                text = row['text'].lower()
                candidates = set(raw)
                for _, ids in trie.iter(text):
                    candidates.update(ids)
                found = []
                for i in candidates:
                    if contexts[i] and not contexts[i].search(text):
                        continue
                    n = len(patterns[i].findall(text))
                    if n:
                        found.append(i)
                        counts[i] += n
                        docs[i] += 1
                topics = sorted({topic_ids[d['terms'][i]['category']] for i in found})
                key = (int(row['groupIndex']), months[row['month']])
                for pos, i in enumerate(topics):
                    for j in topics[pos:]:
                        cooc[key][i, j] += 1
                public = redact(row['text'])
                if public:
                    sample = dict(id=source+'-'+str(ordinal), source=source, group=key[0], month=key[1], text=public, topics=topics, terms=sorted(found))
                    seen[key] += 1
                    pool = reservoirs[key]
                    if len(pool) < 4:
                        pool.append(sample)
                    else:
                        j = rng.randrange(seen[key])
                        if j < 4:
                            pool[j] = sample
                    for topic in topics:
                        topic_seen[topic] += 1
                        pool = topic_reservoirs[topic]
                        if len(pool) < 12:
                            pool.append(sample)
                        else:
                            j = rng.randrange(topic_seen[topic])
                            if j < 12:
                                pool[j] = sample
                if ordinal % 200000 == 0:
                    print(source, ordinal, flush=True)
        expected_counts = [sum(c['counts'][i] for c in cells) for i in range(len(patterns))]
        expected_docs = [sum(c['docs'][i] for c in cells) for i in range(len(patterns))]
        assert counts == expected_counts, [(d['terms'][i]['name'], a, b) for i, (a, b) in enumerate(zip(counts, expected_counts)) if a != b]
        assert docs == expected_docs, 'Message frequencies differ from MATLAB'
        unique = {s['id']: s for pool in [*reservoirs.values(), *topic_reservoirs.values()] for s in pool}
        out['samples'].extend(unique.values())
        out['sources'][source] = dict(totalText=total, sampleCount=len(unique), cells=[dict(group=g, month=m, pairs=[[i, j, n] for (i, j), n in sorted(counter.items())]) for (g, m), counter in sorted(cooc.items())])
        print(source, 'all', len(patterns), 'terms verified; samples', len(unique), flush=True)
    db = sqlite3.connect(SOURCE.as_uri()+'?mode=ro', uri=True)
    tables = {r[0] for r in db.execute("SELECT name FROM sqlite_master WHERE type='table'")}
    hours = []
    for i, g in enumerate(d['coverage']['groups'], 1):
        table = 'msg_1_'+g['gid']
        if table not in tables:
            continue
        sql = f"""SELECT strftime('%Y-%m',msgTime,'unixepoch','+8 hours'),
            CAST(strftime('%w',msgTime,'unixepoch','+8 hours') AS INTEGER),
            CAST(strftime('%H',msgTime,'unixepoch','+8 hours') AS INTEGER),count(*)
            FROM "{table}" WHERE chatType=1 AND chatUin=? AND msgTime>0 GROUP BY 1,2,3"""
        for month, day, hour, n in db.execute(sql, (int(g['gid']),)):
            if month in months:
                hours.append([i, months[month], (day+6) % 7, hour, n])
    out['sources']['chat']['hours'] = hours
    group_ids = {g['gid']: i for i, g in enumerate(d['coverage']['groups'], 1)}
    hours = Counter()
    with (ROOT/'msgs.tsv').open(encoding='utf-8-sig', newline='') as f:
        for row in csv.DictReader(f, delimiter='\t'):
            date = datetime.fromtimestamp(int(row['senderTime']), timezone(timedelta(hours=8)))
            month = months.get(date.strftime('%Y-%m'))
            if month:
                hours[group_ids[row['gid']], month, date.weekday(), date.hour] += 1
    out['sources']['essence']['hours'] = [[*key, n] for key, n in sorted(hours.items())]
    out['sampleMethod'] = 'Deterministic reservoirs: four redacted texts per group/month plus topic examples; excludes credential-like payloads and commands. Not full-text search.'
    (ROOT/'corpus-details.json').write_text(json.dumps(out, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    print('Wrote corpus-details.json', len(out['samples']), 'anonymous samples', flush=True)


if __name__ == '__main__':
    main()
