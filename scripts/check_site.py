"""Validate the complete static dependency set; optionally stage a Pages artifact."""

import argparse
import gzip
import json
import re
import shutil
import subprocess
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
PUBLISH = ['index.html', 'images', 'report.md', 'msgs.tsv', 'groups.tsv',
           'viz-data.json', 'essence.json', '.nojekyll',
           'full-chat.html', 'full-chat.js', 'full-chat-data.json',
           'essence-analysis.html', 'observatory.css', 'observatory.js',
           'analysis/full-chat-lexicon.json', 'word-cloud.js',
           'corpus.html', 'corpus.js', 'corpus.css', 'corpus-details.json',
           'essence-data.json.gz', 'essence-groups', 'essence-topics']


class Dependencies(HTMLParser):
    def __init__(self):
        super().__init__()
        self.paths = set()

    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key in ('href', 'src') and value:
                url = urlsplit(value)
                if not url.scheme and not url.netloc and url.path:
                    self.paths.add(unquote(url.path))


def image_paths(value):
    if isinstance(value, dict):
        if value.get('local'):
            yield 'images/' + value['local']
        for item in value.values():
            yield from image_paths(item)
    elif isinstance(value, list):
        for item in value:
            yield from image_paths(item)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, help='New directory for publishable files')
    args = parser.parse_args()
    html = (ROOT / 'essence-analysis.html').read_text(encoding='utf-8')
    document = Dependencies()
    document.feed(html)
    embedded = re.search(r'^window\.__SB_DATA = (.+)$', html, re.M)
    if embedded:
        data = json.loads(embedded[1].rstrip('\r;'))
    elif 'PACKED_ESSENCE_BOOTSTRAP' in html:
        data = json.loads(gzip.decompress((ROOT / 'essence-data.json.gz').read_bytes()))
        original = json.loads((ROOT / 'viz-data.json').read_text(encoding='utf-8'))
        expected = dict(original, groupSamples={}, imageMap={}, groupSampleFiles={}, samples={}, samplesOther=[], sampleFiles={}, sampleCounts={})
        for tid, rows in dict(original.get('samples', {}), other=original.get('samplesOther', [])).items():
            name = 'essence-topics/' + tid + '.json.gz'
            expected['sampleFiles'][tid] = name
            expected['sampleCounts'][tid] = len(rows)
            if json.loads(gzip.decompress((ROOT / name).read_bytes())) != rows:
                raise ValueError('Lazy essence topic data differs from original')
        for gid, rows in original.get('groupSamples', {}).items():
            name = 'essence-groups/' + gid + '.json.gz'
            expected['groupSampleFiles'][gid] = name
            if json.loads(gzip.decompress((ROOT / name).read_bytes())) != rows:
                raise ValueError('Lazy essence group data differs from original')
        if data != expected:
            raise ValueError('Packed essence overview differs from original')
        data = original
    else:
        raise ValueError('Legacy page data loader is missing')
    if data != json.loads((ROOT / 'viz-data.json').read_text(encoding='utf-8')):
        raise ValueError('Downloadable visualization data differs from page data')
    if not data.get('groups') or not data.get('topics'):
        raise ValueError('Required visualization data is empty')
    images = set(image_paths(data))
    for name in sorted(document.paths | images):
        path = (ROOT / name).resolve()
        if not path.is_relative_to(ROOT) or not path.is_file():
            raise ValueError(f'Missing or invalid local dependency: {name}')
    if "var IMG_BASE = './images/'" not in html:
        raise ValueError('Image base must be relative to this website')
    scripts = re.findall(r'<script\b[^>]*>(.*?)</script\s*>', html, re.S | re.I)
    if not scripts:
        raise ValueError('Page JavaScript is missing')
    for script in scripts:
        subprocess.run(['node', '--check'], input=script.encode('utf-8'), check=True)
    full = json.loads((ROOT / 'full-chat-data.json').read_text(encoding='utf-8'))
    expected_groups = [line.split('\t')[0] for line in
                       (ROOT / 'groups.tsv').read_text(encoding='utf-8-sig').splitlines()[1:] if line]
    if [g['gid'] for g in full['coverage']['groups']] != expected_groups:
        raise ValueError('Full-chat group scope differs from groups.tsv')
    groups = full['coverage']['groups']
    if full['schemaVersion'] != 2:
        raise ValueError('Unified analysis requires schema 2')
    if sum(c['messages'] for c in full['essenceCells']) != sum(g['textMessages'] for g in full['essenceCoverage']['groups']):
        raise ValueError('Essence message counts do not reconcile')
    lex = json.loads((ROOT / 'analysis/full-chat-lexicon.json').read_text(encoding='utf-8'))
    if full['dictionaryVersion'] != lex['version'] or full['terms'] != lex['terms']:
        raise ValueError('Exported data and dictionary differ')
    if sum(c['messages'] for c in full['cells']) != sum(g['textMessages'] for g in groups):
        raise ValueError('Full-chat message counts do not reconcile')
    seen_cells = set()
    for source, c in [(1,c) for c in full['cells']] + [(2,c) for c in full['essenceCells']]:
        key = (c['group'], c['month'])
        if (source, *key) in seen_cells or not 1 <= key[0] <= len(groups) or not 1 <= key[1] <= len(full['months']):
            raise ValueError('Invalid or duplicate group/month cell')
        seen_cells.add((source, *key))
        if len(c['docs']) != len(full['terms']) or len(c['topics']) != len(full['topics']):
            raise ValueError('Invalid full-chat aggregate dimensions')
        if any(not 0 <= v <= c['messages'] for v in c['docs'] + c['topics'] + [c['unmatched']]):
            raise ValueError('Invalid message frequency')
        if any(a < b for a, b in zip(c['counts'], c['docs'])):
            raise ValueError('Occurrence count below message frequency')
    subprocess.run(['node', '--check', str(ROOT / 'full-chat.js')], check=True)
    for script_name in ['observatory.js', 'word-cloud.js', 'corpus.js']:
        subprocess.run(['node', '--check', str(ROOT / script_name)], check=True)
    details = json.loads((ROOT / 'corpus-details.json').read_text(encoding='utf-8'))
    if details['dictionaryVersion'] != full['dictionaryVersion']:
        raise ValueError('Archive details use a different dictionary')
    for source, cells, coverage in [('chat', full['cells'], full['coverage']),
                                    ('essence', full['essenceCells'], full['essenceCoverage'])]:
        expected = {(c['group'], c['month']): c for c in cells}
        if sum(h[4] for h in details['sources'][source]['hours']) != sum(g['total'] for g in coverage['groups']):
            raise ValueError('Archive hourly record counts do not reconcile')
        for cell in details['sources'][source]['cells']:
            diagonal = [0]*len(full['topics'])
            for i, j, count in cell['pairs']:
                baseline = expected[cell['group'], cell['month']]['topics']
                if not 0 <= i <= j < len(baseline) or not 0 <= count <= min(baseline[i], baseline[j]):
                    raise ValueError('Invalid topic co-occurrence count')
                if i == j:
                    diagonal[i] = count
            if diagonal != expected[cell['group'], cell['month']]['topics']:
                raise ValueError('Co-occurrence diagonals differ from MATLAB topics')
    forbidden = re.compile(r'(?i)https?://|[\w.+-]+@[\w.-]+\.[a-z]{2,}|(?<!\d)\d{5,}(?!\d)|\bu_[\w-]{10,}')
    for sample in details['samples']:
        if set(sample) != {'id', 'source', 'group', 'month', 'text', 'topics', 'terms'} or forbidden.search(sample['text']):
            raise ValueError('Anonymous sample contains an unexpected field or unredacted identifier')
    full_document = Dependencies()
    full_document.feed((ROOT / 'index.html').read_text(encoding='utf-8'))
    full_document.feed((ROOT / 'corpus.html').read_text(encoding='utf-8'))
    full_document.feed((ROOT / 'full-chat.html').read_text(encoding='utf-8'))
    for name in full_document.paths:
        path = (ROOT / name).resolve()
        if not path.is_relative_to(ROOT) or not path.is_file():
            raise ValueError(f'Missing full-chat dependency: {name}')
    files = []
    for name in PUBLISH:
        entry = ROOT / name
        if not entry.exists():
            raise ValueError(f'Missing publish entry: {name}')
        files.extend(entry.rglob('*') if entry.is_dir() else [entry])
    size = sum(file.stat().st_size for file in files if file.is_file())
    if size >= 1_000_000_000:
        raise ValueError(f'Website exceeds Pages size limit: {size} bytes')
    if args.output:
        output = args.output.resolve()
        if output.exists():
            raise ValueError('Publish directory must be new')
        output.mkdir(parents=True)
        for name in PUBLISH:
            source = ROOT / name
            target = output / name
            if source.is_dir():
                shutil.copytree(source, target)
            else:
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(source, target)
    print(f'Validated {len(images):,} local image paths, {len(document.paths)} links, '
          f'{len(scripts)} script(s); website {size / 1048576:.1f} MiB.')


if __name__ == '__main__':
    main()
