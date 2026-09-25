#!/usr/bin/env python3
"""Check local links, offline runtime dependencies, and publication boundaries."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import argparse
import json
import re

ROOT = Path(__file__).resolve().parents[1]


def validate(site):
    failures = []
    checked = 0

    def check_url(file, value, runtime=False):
        nonlocal checked
        url = urlsplit(value)
        if url.scheme or url.netloc:
            if runtime and url.scheme != 'data':
                failures.append(f'{file}: network runtime dependency {value}')
            return
        if not url.path:
            return
        if url.path.startswith('/'):
            failures.append(f'{file}: root-relative path breaks project Pages: {value}')
            return
        target = (file.parent / unquote(url.path)).resolve()
        checked += 1
        if not target.exists():
            failures.append(f'{file}: missing local target {value}')

    class Links(HTMLParser):
        def __init__(self, file):
            super().__init__()
            self.file = file

        def handle_starttag(self, tag, attrs):
            attrs = dict(attrs)
            if tag == 'script' and attrs.get('type') == 'module':
                failures.append(f'{self.file}: module script breaks file:// portability')
            if tag in {'script', 'img', 'audio', 'source', 'iframe'} and attrs.get('src'):
                check_url(self.file, attrs['src'], runtime=True)
            if tag in {'a', 'link'} and attrs.get('href'):
                check_url(self.file, attrs['href'], runtime=tag == 'link' and attrs.get('rel') in {'stylesheet', 'preload'})

    registry = json.loads((site / 'maps.json').read_text())
    assert len(registry) == 4, 'Expected four atlas entries'
    pages = [site / 'index.html'] + [site / item['slug'] / 'index.html' for item in registry]
    for file in pages:
        parser = Links(file)
        parser.feed(file.read_text())
    for file in site.rglob('*.css'):
        for value in re.findall(r'url\([\s\"\']*([^\)\"\']+)', file.read_text()):
            check_url(file, value.strip(), runtime=True)
    if site.name == '_site':
        for file in site.rglob('*'):
            if file.name.startswith('.env') or file.name in {'mcp.json', '.git', '.agents', '.codex', 'node_modules'}:
                failures.append(f'Private/development content in public output: {file}')
        assert (site / '.nojekyll').exists()
        assert (site / 'LICENSE').exists()
    if failures:
        raise SystemExit('\n'.join(failures))
    print(f'PASS: {len(pages)} entry pages; {checked} local references; offline scripts; relative Pages URLs')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--site', type=Path, default=ROOT / 'cartographics')
    validate(parser.parse_args().site.resolve())
