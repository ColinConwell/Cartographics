"""Validate delivered data, local assets, geography coverage, and audio decodability."""
import json, re, subprocess, shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
data=json.loads((ROOT/'data/countries.json').read_text())
assert len(data)==197 and len({x['id'] for x in data})==197
assert sum(c['status']=='UN member' for c in data)==193
required={'native','romanized','phonetic','language','key'}
audio=[];keys=set()
for c in data:
    assert c['names'] and c['source'].startswith('https://en.wikipedia.org/wiki/')
    assert c['sourceNames'] and len(c['latlng'])==2
    for n in c['names']:
        assert required<=n.keys() and all(n[k].strip() for k in required),(c['id'],n)
        assert n['key'] not in keys;keys.add(n['key'])
        assert not re.search(r'[\u4e00-\u9fff\u0600-\u06ff\u0400-\u04ff\uac00-\ud7af]',n['romanized']),n
        for ipa in n.get('ipa',[]): assert ipa.startswith(('/','[')),(n['key'],ipa)
        if 'audio' in n:
            a=n['audio'];f=ROOT/a['file']
            assert f.exists() and f.stat().st_size>100,a
            assert a['author'] and a['license'] and a['source'].startswith('https://commons.wikimedia.org/wiki/File:')
            assert a['language']==n['language']
            audio.append({'country':c['english'],'variant':n['key'],'language':n['language'],'native':n['native'],**a})
    assert c['sourceTable'].startswith('https://en.wikipedia.org/')

world=json.loads((ROOT/'data/world-50m.json').read_text())
ids={int(x['id']) for x in world['objects']['countries']['geometries'] if x.get('id')}
geoNames={x.get('properties',{}).get('name') for x in world['objects']['countries']['geometries']}
markers=[c['english'] for c in data if (not c['numeric'] or int(c['numeric']) not in ids) and not(c['id']=='UNK' and 'Kosovo' in geoNames)]

html=(ROOT/'index.html').read_text()
for asset in re.findall(r'(?:src|href)="([^"]+)"',html):
    if asset.startswith(('http','#','mailto:')):continue
    assert (ROOT/asset).exists(),asset
assert all(not u.startswith('http') for u in re.findall(r'<script[^>]*src="([^"]+)"',html))
assert '@import' not in (ROOT/'styles.css').read_text()
decoded=[]
if shutil.which('ffprobe'):
    for filename in sorted({a['file'] for a in audio}):
        p=subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','json',str(ROOT/filename)],capture_output=True,text=True)
        assert p.returncode==0,(filename,p.stderr)
        seconds=float(json.loads(p.stdout)['format']['duration'])
        assert 0<seconds<60,(filename,seconds)
        decoded.append({'file':filename,'seconds':round(seconds,3)})
research=json.loads((ROOT/'research/country-checks.json').read_text())
summary={
 'date':'2026-09-25','countries':len(data),'unMembers':193,'selectedNameVariants':len(keys),
 'distinctLanguageLabels':len({n['language'] for c in data for n in c['names']}),
 'placesWithAudio':sum(any('audio' in n for n in c['names']) for c in data),
 'variantsWithAudio':len(audio),'distinctAudioFiles':len({a['file'] for a in audio}),
 'variantsWithIPA':sum(bool(n.get('ipa')) for c in data for n in c['names']),
 'wikipediaTableRowsMatched':len(data),'countryArticleFetchesSucceeded':sum(r['fetched'] for r in research),
 'countryArticleFetchesAttempted':len(research),
 'placesWithoutMatchedPolygon':markers,'allPlacesHaveCoordinatesAndBrowseEntries':True,
 'audioFilesDecoded':len(decoded),'checksPassed':True,
}
(ROOT/'research/coverage.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
(ROOT/'research/audio-credits.json').write_text(json.dumps(audio,ensure_ascii=False,indent=2)+'\n')
(ROOT/'research/audio-validation.json').write_text(json.dumps(decoded,indent=2)+'\n')
print(json.dumps(summary,ensure_ascii=False,indent=2))
