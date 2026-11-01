"""Rebuild the standalone page using the unchanged branching key as its data source."""
from pathlib import Path
import hashlib, json, re
root = Path(__file__).resolve().parents[1]
source = (root / 'compositae.html').read_bytes()
text = source.decode('utf-8')
def payload(id):
    match = re.search(r'<script\b[^>]*\bid=[\"\']' + id + r'[\"\'][^>]*>(.*?)</script>', text, re.S)
    if not match:
        raise ValueError('Missing source data: ' + id)
    return json.loads(match.group(1))
tree = payload('keydata')
labels = json.loads((root / 'tools/compositae-feature-labels.json').read_text())
assert set(labels) == set(tree), 'Every source question needs a browsing label'
seen = set()
def validate(node, ancestors):
    if node.startswith('!'):
        return
    assert node in tree and node not in ancestors, 'Invalid source graph'
    seen.add(node)
    assert len(tree[node]['choices']) == 2
    for _, target in tree[node]['choices']:
        validate(target, ancestors | {node})
validate('S1', set())
assert seen == set(tree), 'Unreachable source question'
glossary = re.search(r'<dl\b[^>]*class=[\"\']terms[\"\'][^>]*>(.*?)</dl>', text, re.S).group(1)
provenance = {'file': 'compositae.html', 'sourceCommit': '229bf051543200338d087167e65719466bc06af0', 'sha256': hashlib.sha256(source).hexdigest(), 'adapted': '2026-11-01', 'method': 'Exact source choice pairs; retain separate root-to-result routes. Missing route entries remain unknown. No independent Davis verification.'}
template = (root / 'tools/compositae-multiaccess.template.html').read_text()
for marker, value in [('KEY', tree), ('LABELS', labels), ('GROUPS', payload('groupsdata')), ('PROVENANCE', provenance)]:
    template = template.replace('@@'+marker+'@@', json.dumps(value,ensure_ascii=False,separators=(',',':')).replace('</','<\\/'))
template = template.replace('@@GLOSSARY@@', glossary)
(root / 'compositae_multiaccess.html').write_text(template)
print('Built compositae_multiaccess.html from', len(tree), 'unchanged source questions')
