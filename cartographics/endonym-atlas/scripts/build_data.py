"""Build the static atlas. Run with Python, beautifulsoup4; uses curl for HTTP.
Sources are public Wikipedia, Wiktionary, Wikimedia Commons and mledoze/countries.
No API keys or runtime network calls are required by the resulting app.
"""
import csv, json, re, subprocess, unicodedata, hashlib, time
from pathlib import Path
from urllib.parse import quote, unquote
from concurrent.futures import ThreadPoolExecutor, as_completed
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
CACHE = Path('/tmp/endonym-atlas-cache')
CACHE.mkdir(exist_ok=True)
LIST_URL = 'https://en.wikipedia.org/wiki/List_of_countries_and_dependencies_and_their_capitals_in_native_languages'

def fetch(url):
    p = CACHE / hashlib.sha256(url.encode()).hexdigest()
    if p.exists() and p.stat().st_size > 100: return p.read_text(errors='replace')
    for attempt in range(3):
        r = subprocess.run(['curl','-f','-L','-s','--max-time','35','--retry','1',url], capture_output=True)
        if not r.returncode: break
        time.sleep(.6)
    if r.returncode: return ''
    s = r.stdout.decode('utf-8',errors='replace')
    p.write_text(s)
    return s

def clean(t): return re.sub(r'\s+', ' ', t).strip()
def ascii(t): return ''.join(c for c in unicodedata.normalize('NFKD',t.lower()) if not unicodedata.combining(c))

wiki = BeautifulSoup((ROOT/'research/wikipedia-country-names.html').read_text(),'html.parser')
rows={}
for tr in wiki.select('table.wikitable tr'):
    cells=tr.find_all('td',recursive=False)
    if len(cells)!=5:continue
    for el in tr.select('sup'): el.decompose()
    a=cells[0].find('a',href=re.compile(r'/wiki/'))
    if not a:continue
    url=a['href']; url=('https://en.wikipedia.org'+url) if url.startswith('/') else url
    rows[clean(cells[0].get_text(' ',strip=True))]={'url':url,'names':cells[2].get_text(' · ',strip=True),'languages':cells[4].get_text(' ',strip=True)}

renames={'BHS':'The Bahamas','CHN':"China (People\'s Republic of)",'COG':'Republic of the Congo','COD':'Democratic Republic of the Congo','CZE':'Czech Republic','SWZ':'Eswatini (formerly Swaziland)','GMB':'The Gambia','FSM':'Federated States of Micronesia','MMR':'Myanmar (or Burma)','TWN':'Taiwan (Republic of China)','TLS':'East Timor','TUR':'Turkey'}
aliases={'CIV':'Côte d’Ivoire','CPV':'Cabo Verde','COG':'Republic of the Congo','COD':'Democratic Republic of the Congo','FSM':'Micronesia','UNK':'Kosovo'}
notes={
 'JPN':'Nihon and Nippon are both used. Switch readings in the selector; each has its own recording when available.',
 'CHN':'The short name is shown in simplified characters with Mandarin Pinyin. Traditional 中國 and names in other Chinese languages are also used. Tone marks belong to the Romanization; the English guide does not reproduce tones.',
 'TWN':'Taiwan is included as a separately administered place. 臺灣 and 台灣 are both used. The official state name is 中華民國 (Zhōnghuá Mínguó). Inclusion does not resolve competing sovereignty claims.',
 'UNK':'Kosovo has limited international recognition. Both Albanian and Serbian names are included. Inclusion does not imply a position on sovereignty.',
 'PSE':'Palestine is a UN non-member observer state. Map polygons are generalized and do not depict control, access, or every territorial claim.',
 'VAT':'Vatican City is shown as a geographic state; the Holy See holds UN observer status. Italian and Latin names are included. The Latin guide uses a Classical-style reading; ecclesiastical usage differs.',
 'NZL':'Aotearoa is a widely used Māori name for New Zealand; it has not replaced New Zealand as the English name. Both are selectable.',
 'IND':'India and Bharat are the constitutional English and Hindi short names. Selected regional-language forms are included here; the source table contains further forms. This is not a complete inventory of India’s languages.',
 'ZAF':'Eleven spoken-language names are selectable. South African Sign Language is also official, but cannot be represented by an audio pronunciation or a written endonym in this interface.',
 'BOL':'Selected Spanish, Quechua, Aymara and Guaraní names are included. Bolivia recognizes many additional Indigenous languages; this is not an exhaustive linguistic inventory.',
 'EGY':'Miṣr is the standard Arabic form; Maṣr is an Egyptian Arabic form. The spelling مصر is shared.',
 'SAU':'The common short form السعودية is used on the map. The full state name is المملكة العربية السعودية (Al-Mamlaka al-ʿArabiyya as-Suʿūdiyya).',
 'LAO':'The short name ລາວ is shown. ປະເທດລາວ (Pathet Lao) means the country of Laos.',
 'KOR':'Hanguk (한국) is a common short name used in South Korea; the formal name is 대한민국 (Daehan Minguk).',
 'PRK':'Chosŏn (조선) is the short name used in North Korea. This Romanization follows McCune–Reischauer; South Korea uses different naming and Romanization conventions.',
 'MEX':'The Nahuatl form is included as a historical and Indigenous-language endonym, not as the sole or national official name.',
 'GBR':'Selected names from English and regional languages are provided; their legal status and local usage differ.',
 'USA':'English, Spanish and Hawaiian examples illustrate local usage. They do not exhaust Indigenous or immigrant-language names.',
 'MNG':'The Cyrillic name is shown; traditional Mongolian script is also used. The source table includes that script.',
 'NER':'Hausa and French forms are included as locally used names; this does not assert equal current official-language status.',
 'MLI':'Mali is shown in the Latin orthography used for Bambara. The source also includes N’Ko and Fula forms.',
 'COG':'The longer French name distinguishes this country from the Democratic Republic of the Congo. Other local-language forms are listed in the source.',
 'COD':'The longer French name distinguishes this country from the Republic of the Congo. Other local-language forms are listed in the source.',
 'VUT':'Bislama, English and French share the written country name, with different pronunciations.',
}
allids=json.loads((ROOT/'research/country-identifiers.json').read_text())
ids=[x for x in allids if x['unMember'] or x['cca3'] in ['VAT','PSE','TWN','UNK']]
names=list(csv.DictReader((ROOT/'data/names.tsv').open(),delimiter='\t'))
data=[]
for c in sorted(ids,key=lambda x:aliases.get(x['cca3'],x['name']['common'])):
    key=c['cca3']; row=rows.get(renames.get(key,c['name']['common']))
    if not row:raise ValueError('Missing Wikipedia row: '+key)
    variants=[{k:v for k,v in n.items() if k!='id'} for n in names if n['id']==key]
    assert variants,key
    for i,n in enumerate(variants):
        n['key']=key+'-'+str(i)
        n['guideType']='Editorial English approximation; not IPA'
    status='UN observer / Holy See' if key=='VAT' else 'UN observer state' if key=='PSE' else 'Separately administered / disputed status' if key in ['TWN','UNK'] else 'UN member'
    data.append({'id':key,'numeric':c['ccn3'],'english':aliases.get(key,c['name']['common']),'region':c['region'],'subregion':c['subregion'],'latlng':c['latlng'],'area':c['area'],'status':status,'names':variants,'source':row['url'],'sourceTable':LIST_URL,'sourceNames':row['names'],'sourceLanguages':row['languages'],'note':notes.get(key,'')})

def country_research(c):
    html=fetch(c['source'])
    soup=BeautifulSoup(html,'html.parser')
    for e in soup.select('sup, .mw-editsection'):e.decompose()
    inf=soup.select_one('table.infobox')
    natives=[]
    if inf:
        for n in inf.select('.native-name, [class*="native-name"], .nickname, .fn.org'):
            t=clean(n.get_text(' ',strip=True))
            if t and t not in natives:natives.append(t)
    lead=[]
    for p in soup.select('.mw-parser-output p'):
        t=clean(p.get_text(' ',strip=True))
        if len(t)>100:lead.append(t[:1300])
        if len(lead)==2:break
    return {'id':c['id'],'url':c['source'],'retrieved':'2026-09-25','fetched':len(html)>10000,'nativeNameExtracts':natives[:10],'leadExtracts':lead}

section_alias={'Mandarin':['Chinese'],'Malay (Jawi)':['Malay'],'Norwegian Bokmål':['Norwegian Bokmål','Norwegian'],'Norwegian Nynorsk':['Norwegian Nynorsk','Norwegian'],'Māori':['Maori'],'Guaraní':['Guarani'],'Sinhalese':['Sinhalese'],'Montenegrin':['Serbo-Croatian'],'Montenegrin (Cyrillic)':['Serbo-Croatian'],'Bosnian':['Serbo-Croatian'],'Serbian':['Serbo-Croatian'],'Croatian':['Serbo-Croatian'],'Kurdish':['Central Kurdish','Kurdish'],'Sotho':['Southern Sotho','Sotho'],'Chichewa':['Chichewa'],'Seychellois Creole':['Seychellois Creole'],'Comorian':['Comorian'],'Tajik':['Tajik']}

def pronounce(n):
    term=n['native'].replace('’',"'").replace('ʻ',"ʻ")
    if n['native']=='中国':term='中國'  # Main pronunciation entry; same Mandarin name in traditional characters.
    # Two Japanese readings share one spelling; file-name matching below keeps them distinct.
    url='https://en.wiktionary.org/wiki/'+quote(term.replace(' ','_'))
    html=fetch(url)
    s=BeautifulSoup(html,'html.parser')
    wanted=section_alias.get(n['language'],[n['language']])
    sections=[]
    for h in s.select('h2'):
        if h.get_text(' ',strip=True) in wanted:
            node=h.parent if 'mw-heading' in h.parent.get('class',[]) else h
            bits=[]
            for sib in node.next_siblings:
                if getattr(sib,'name',None)=='h2' or (getattr(sib,'name',None)=='div' and 'mw-heading2' in sib.get('class',[])):break
                bits.append(str(sib))
            sections.append(BeautifulSoup(''.join(bits),'html.parser'))
    if not sections:return {'pronunciationSource':url,'lookup':'No matching language section retrieved'}
    sec=sections[0]
    ipas=list(dict.fromkeys(clean(x.get_text(' ',strip=True)) for x in sec.select('.IPA') if x.get_text(strip=True).startswith(('/', '['))))
    result={'pronunciationSource':url,'lookup':'Language section retrieved'}
    if ipas:result['ipa']=ipas[:3]
    audio=sec.select('audio')
    if n['language']=='Mandarin':
        audio=[a for a in audio if re.search(r'(^zh-|^cmn-|\(cmn\)|Mandarin|Zh-)',''+a.get('data-mwtitle',''),re.I)]
        result.pop('ipa',None)  # Chinese entries contain several topolects; avoid mixing their IPA.
    if n['native']=='日本':
        audio=[a for a in audio if ascii(n['romanized']) in ascii(a.get('data-mwtitle',''))]
        # The Japanese entry contains readings with separate IPA: do not guess their alignment.
        result.pop('ipa',None)
    if not audio:return result
    a=audio[0]; title=a.get('data-mwtitle','')
    if not title:return result
    src=a.find('source',type='audio/mpeg') or a.find('source')
    if not src:return result
    media=src.get('src','').split('?')[0]
    if media.startswith('//'):media='https:'+media
    metaurl='https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url%7Cextmetadata&titles='+quote('File:'+title)
    try:
        j=json.loads(fetch(metaurl));page=next(iter(j['query']['pages'].values())); m=page['imageinfo'][0]['extmetadata']
        plain=lambda k:clean(BeautifulSoup(m.get(k,{}).get('value',''),'html.parser').get_text(' ',strip=True))
        license=plain('LicenseShortName');artist=plain('Artist');licurl=plain('LicenseUrl')
        speaker_note='Source identifies a non-native speaker.' if re.search(r'non.native speaker',plain('ImageDescription'),re.I) else ''
        if title.lower()=='zh-zhongguo.ogg':
            artist='Peter Isotalo'
            speaker_note='Source identifies a non-native Mandarin speaker.'
    except Exception:
        return {**result,'audioOmitted':'Could not retrieve author/license metadata'}
    if not license or not artist:return {**result,'audioOmitted':'Incomplete author/license metadata'}
    ext='.mp3' if 'mp3' in src.get('type','') or media.endswith('.mp3') else Path(unquote(media)).suffix
    filename=hashlib.sha256(title.encode()).hexdigest()[:16]+ext
    target=ROOT/'assets/audio'/filename
    if not target.exists():
        r=subprocess.run(['curl','-f','-L','-s','--max-time','35',media,'-o',str(target)],capture_output=True)
        if r.returncode or target.stat().st_size<100:
            target.unlink(missing_ok=True);return result
    result['audio']={'file':'assets/audio/'+filename,'title':title,'author':artist,'license':license,'licenseUrl':licurl,'source':'https://commons.wikimedia.org/wiki/File:'+quote(title.replace(' ','_')),'originalUrl':media,'duration':a.get('data-durationhint'),'language':n['language']}
    if speaker_note:result['audio']['speakerNote']=speaker_note
    return result

if __name__=='__main__':
    import argparse
    p=argparse.ArgumentParser();p.add_argument('--skip-research',action='store_true');p.add_argument('--skip-audio',action='store_true');args=p.parse_args()
    if not args.skip_research:
        research=[]
        with ThreadPoolExecutor(max_workers=2) as ex:
            for i,f in enumerate(as_completed([ex.submit(country_research,c) for c in data])):
                research.append(f.result())
                if i%30==0: print('Wikipedia',i+1,flush=True)
        (ROOT/'research/country-checks.json').write_text(json.dumps(research,ensure_ascii=False,indent=2))
    if not args.skip_audio:
        pronunciations={}
        with ThreadPoolExecutor(max_workers=2) as ex:
            futures={ex.submit(pronounce,n):n for c in data for n in c['names']}
            for i,f in enumerate(as_completed(futures)):
                n=futures[f]; r=f.result();n.update(r);pronunciations[n['key']]=r
                if i%25==0: print('Pronunciation',i+1,'recordings',sum('audio' in x for x in pronunciations.values()),flush=True)
        (ROOT/'research/pronunciations.json').write_text(json.dumps(pronunciations,ensure_ascii=False,indent=2))
    elif (ROOT/'research/pronunciations.json').exists():
        pr=json.loads((ROOT/'research/pronunciations.json').read_text())
        for c in data:
            for n in c['names']:n.update(pr.get(n['key'],{}))
    for c in data:
        for n in c['names']:
            if n['language']=='Mandarin':n.pop('ipa',None)
    (ROOT/'data/countries.json').write_text(json.dumps(data,ensure_ascii=False,indent=2))
    (ROOT/'data/countries.js').write_text('window.ATLAS_COUNTRIES = '+json.dumps(data,ensure_ascii=False)+';\n')
    world=json.loads((ROOT/'data/world-50m.json').read_text())
    (ROOT/'data/world.js').write_text('window.ATLAS_WORLD = '+json.dumps(world,separators=(',',':'))+';\n')
    print('DONE',len(data),'countries',sum(len(x['names']) for x in data),'names',sum('audio' in n for c in data for n in c['names']),'recordings',flush=True)
