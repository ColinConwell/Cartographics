import csv,re,subprocess,json
from pathlib import Path
from urllib.parse import quote
root=Path(__file__).resolve().parents[1]; out=root/'assets/fonts';out.mkdir(exist_ok=True)
names=list(csv.DictReader((root/'data/names.tsv').open(),delimiter='\t'))
css=[];manifest=[]
for name,short,lo,hi,slug in [('Noto Serif Tibetan','tibetan',0xf00,0xfff,'notoseriftibetan'),('Noto Sans Thaana','thaana',0x780,0x7bf,'notosansthaana'),('Noto Sans Tifinagh','tifinagh',0x2d30,0x2d7f,'notosanstifinagh')]:
 chars=''.join(sorted({c for n in names for c in n['native'] if lo<=ord(c)<=hi}))
 url='https://fonts.googleapis.com/css2?family='+quote(name)+'&display=swap&text='+quote(chars)
 r=subprocess.run(['curl','-f','-L','-s',url],capture_output=True,text=True)
 m=re.search(r'url\(([^)]+)\).*?format\([\'"]([^\'"]+)',r.stdout)
 if not m:print('FAILED',name);continue
 media,fmt=m.groups();ext='woff2' if fmt=='woff2' else 'ttf'; file=out/(short+'.'+ext)
 r=subprocess.run(['curl','-f','-L','-s',media,'-o',str(file)])
 assert r.returncode==0 and file.stat().st_size>500
 lic='https://raw.githubusercontent.com/google/fonts/main/ofl/'+slug+'/OFL.txt'
 subprocess.run(['curl','-f','-L','-s',lic,'-o',str(out/(short+'-OFL.txt'))],check=True)
 css.append("@font-face{font-family:'Atlas "+short+"';font-style:normal;font-weight:100 900;font-display:swap;src:url('assets/fonts/"+file.name+"') format('"+fmt+"');unicode-range:U+"+hex(lo)[2:]+"-"+hex(hi)[2:]+";}")
 manifest.append({'family':name,'file':'assets/fonts/'+file.name,'license':'SIL Open Font License 1.1','source':url,'originalUrl':media,'licenseSource':lic,'subsetCharacters':chars})
css.append(":root{--serif:Georgia,'Times New Roman','Atlas tibetan','Atlas thaana','Atlas tifinagh',serif;--sans:-apple-system,BlinkMacSystemFont,'Segoe UI','Atlas tibetan','Atlas thaana','Atlas tifinagh',sans-serif;}")
p=root/'styles.css';base=p.read_text().split('/* Bundled Script Fonts */')[0];p.write_text(base+'\n/* Bundled Script Fonts */\n'+'\n'.join(css)+'\n')
(root/'research/font-credits.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print([(m['family'],m['file']) for m in manifest])
