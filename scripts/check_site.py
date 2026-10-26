"""Validate the complete static dependency set; optionally stage a Pages artifact."""

import argparse
import json
import re
import shutil
import subprocess
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
PUBLISH = ['index.html', 'images', 'report.md', 'msgs.tsv', 'groups.tsv',
           'viz-data.json', 'essence.json', '.nojekyll']


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
    html = (ROOT / 'index.html').read_text(encoding='utf-8')
    document = Dependencies()
    document.feed(html)
    embedded = re.search(r'^window\.__SB_DATA = (.+)$', html, re.M)
    if not embedded:
        raise ValueError('Embedded page data is missing')
    data = json.loads(embedded[1].rstrip('\r;'))
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
                shutil.copy2(source, target)
    print(f'Validated {len(images):,} local image paths, {len(document.paths)} links, '
          f'{len(scripts)} script(s); website {size / 1048576:.1f} MiB.')


if __name__ == '__main__':
    main()
