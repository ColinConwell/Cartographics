#!/usr/bin/env python3
"""Assemble an explicit public tree. No bundler, credentials, or network required."""
from pathlib import Path
import argparse
import hashlib
import json
import shutil

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'cartographics'
PUBLIC_FILES = ['index.html', 'styles.css', 'app.js', 'maps.json', 'LICENSES.md']
SKIP_DIRS = {'.git', '.agents', '.codex', 'node_modules', '__pycache__', 'scripts', 'design'}
ALLOWED_SUFFIXES = {'.html', '.css', '.js', '.json', '.md', '.txt', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.mp3', '.ogg', '.wav', '.ttf', '.woff', '.woff2', '.tsv'}


def public_file(path):
    relative = path.relative_to(SOURCE)
    if path.is_symlink() or any(p.startswith('.') or p in SKIP_DIRS for p in relative.parts):
        return False
    return (path.suffix.lower() in ALLOWED_SUFFIXES or path.name.endswith('-LICENSE') or path.name == 'LICENSE') and path.name != 'mcp.json'


def build(output):
    output = output.resolve()
    # Only a dedicated ignored output directory may be replaced.
    if output != ROOT / '_site':
        raise ValueError('Build output must be the repository’s _site directory.')
    if output.is_symlink():
        raise ValueError('Refusing a symlink output directory.')
    if output.exists():
        shutil.rmtree(output)
    output.mkdir()
    registry = json.loads((SOURCE / 'maps.json').read_text())
    if len({m['slug'] for m in registry}) != len(registry):
        raise ValueError('Duplicate map slug')
    for name in PUBLIC_FILES:
        shutil.copy2(SOURCE / name, output / name)
    roots = [SOURCE / 'assets']
    for item in registry:
        slug = item['slug']
        if not slug or not all(c.islower() or c.isdigit() or c == '-' for c in slug):
            raise ValueError('Invalid map slug: ' + slug)
        if not (SOURCE / slug / 'index.html').is_file():
            raise ValueError('Missing atlas: ' + slug)
        roots.append(SOURCE / slug)
    for source in roots:
        for path in sorted(source.rglob('*')):
            if path.is_file() and public_file(path):
                target = output / path.relative_to(SOURCE)
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(path, target)
    shutil.copy2(ROOT / 'LICENSE', output / 'LICENSE')
    (output / '.nojekyll').write_text('')
    files = {str(p.relative_to(output)): hashlib.sha256(p.read_bytes()).hexdigest()
             for p in sorted(output.rglob('*')) if p.is_file()}
    (output / 'build-manifest.json').write_text(json.dumps({'maps': registry, 'sha256': files}, indent=2) + '\n')
    print(f'Built {len(registry)} atlases and {len(files)} public files in {output}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=ROOT / '_site')
    build(parser.parse_args().output)
