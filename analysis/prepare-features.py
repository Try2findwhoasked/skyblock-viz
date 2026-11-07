"""Cache sparse message/term matches; MATLAB performs the statistical aggregation."""
from collections import defaultdict
import csv
import json
from pathlib import Path
import re
import ahocorasick
import numpy as np
from scipy import sparse
from scipy.io import savemat
from bot_filter import PRIVATE, reason, load_senders

ROOT = Path(__file__).resolve().parents[1]
lex = json.loads((ROOT/'analysis/full-chat-lexicon.json').read_text(encoding='utf-8'))
patterns = [re.compile(t['pattern']) for t in lex['terms']]
contexts = [re.compile(t['context']) if t['context'] else None for t in lex['terms']]
aliases = defaultdict(set)
raw = set()
for i,t in enumerate(lex['terms']):
    for a in t['aliases']:
        if a.startswith('r:'):raw.add(i)
        else:aliases[a.lower()].add(i)
trie = ahocorasick.Automaton()
for a,ids in aliases.items():trie.add_word(a,tuple(ids))
trie.make_automaton()
months = set()
for name in ['messages','essence']:
    with (PRIVATE/(name+'.csv')).open(encoding='utf-8',newline='') as f:
        months.update(r['month'] for r in csv.DictReader(f))
months = sorted(months)
month_ids = {m:i+1 for i,m in enumerate(months)}
rows,cols,values,groups,rowmonths,sources = [],[],[],[],[],[]
senders = load_senders()
for source,name in enumerate(['messages','essence'],1):
    with (PRIVATE/(name+'.csv')).open(encoding='utf-8',newline='') as f:
        for row in csv.DictReader(f):
            assert not reason(row['text'],row['sender'],senders if source==1 else ()), 'Bot content remains in input'
            index = len(groups)
            groups.append(int(row['groupIndex']))
            rowmonths.append(month_ids[row['month']])
            sources.append(source)
            text=row['text'].lower()
            candidates=set(raw)
            for _,ids in trie.iter(text):candidates.update(ids)
            for k in candidates:
                if contexts[k] and not contexts[k].search(text):continue
                n=len(patterns[k].findall(text))
                if n:rows.append(index);cols.append(k);values.append(n)
H=sparse.csc_matrix((np.array(values,dtype=np.float64),(rows,cols)),shape=(len(groups),len(patterns)))
savemat(PRIVATE/'features.mat',dict(H=H,group=np.array(groups,dtype=np.float64),month=np.array(rowmonths,dtype=np.float64),source=np.array(sources,dtype=np.float64),months=np.array(months,dtype=object),dictionaryVersion=lex['version']),do_compression=True)
print('Sparse matches prepared:',len(groups),'messages,',H.nnz,'message/term hits')
