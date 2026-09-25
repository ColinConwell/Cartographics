"""Retry incomplete public pronunciation lookups without refetching country research."""
import json, argparse
from concurrent.futures import ThreadPoolExecutor,as_completed
import build_data as b
p=b.ROOT/'research/pronunciations.json'
records=json.loads(p.read_text())
parser=argparse.ArgumentParser();parser.add_argument('--metadata-only',action='store_true');args=parser.parse_args()
todo=[n for c in b.data for n in c['names'] if not records.get(n['key'],{}).get('audio') and (not args.metadata_only or records.get(n['key'],{}).get('audioOmitted')=='Could not retrieve author/license metadata')]
with ThreadPoolExecutor(max_workers=2) as ex:
    futures={ex.submit(b.pronounce,n):n for n in todo}
    for i,f in enumerate(as_completed(futures)):
        n=futures[f];records[n['key']]=f.result()
        if i%25==0: print('Retry',i+1,'of',len(todo),'recordings',sum('audio' in v for v in records.values()),flush=True)
p.write_text(json.dumps(records,ensure_ascii=False,indent=2))
print('Finished',sum('audio' in v for v in records.values()),flush=True)
