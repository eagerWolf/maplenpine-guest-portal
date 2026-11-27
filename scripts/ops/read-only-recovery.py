#!/usr/bin/env python3
"""Forced SSH command for one dedicated backup key. No shell, writes or arbitrary paths."""
import datetime
import json
import os
from pathlib import Path
import re
import shutil
import sys

NAME = re.compile(r"maplenpine-private-(\d{8}T\d{6}Z)\.tar\.gz\Z")
ROOT = Path('/home/deploy/portal-backups/export')

def archive(root, name):
    if not NAME.fullmatch(name):
        raise ValueError('Invalid archive name')
    path = root / name
    if path.is_symlink() or path.resolve().parent != root.resolve() or not path.is_file():
        raise ValueError('Archive unavailable')
    return path

def metadata(root):
    result = []
    for path in sorted(root.iterdir()):
        match = NAME.fullmatch(path.name)
        if not match or path.is_symlink() or not path.is_file():
            continue
        checksum = root / (path.name + '.sha256')
        if checksum.is_symlink() or not checksum.is_file():
            continue
        digest = checksum.read_text().split()[0]
        if not re.fullmatch('[a-f0-9]{64}', digest):
            raise ValueError('Invalid stored checksum')
        created = datetime.datetime.strptime(match[1], '%Y%m%dT%H%M%SZ').replace(tzinfo=datetime.timezone.utc)
        result.append(dict(name=path.name, sha256=digest, size=path.stat().st_size, createdAt=created.isoformat()))
    return result

def requested_file(command, root):
    match = re.fullmatch(r'get (maplenpine-private-\d{8}T\d{6}Z\.tar\.gz)', command)
    if not match:
        raise ValueError('Only index and get <archive> are permitted')
    return archive(root, match[1])

def main():
    command = os.environ.get('SSH_ORIGINAL_COMMAND', '')
    if command == 'index':
        print(json.dumps(metadata(ROOT)))
    else:
        with requested_file(command, ROOT).open('rb') as source:
            shutil.copyfileobj(source, sys.stdout.buffer)

if __name__ == '__main__':
    try:
        main()
    except Exception:
        print('Backup request rejected or unavailable', file=sys.stderr)
        sys.exit(1)
