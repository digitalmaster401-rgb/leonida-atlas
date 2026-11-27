"""LEONIDA ATLAS: staging import only; never writes to production content."""
import argparse, json, math, re, hashlib
from pathlib import Path
from datetime import datetime, timezone
from urllib.request import urlopen, Request
URL = 'https://api.gtadb.org/landmarks?gta=6'
LICENSE = 'https://creativecommons.org/licenses/by/4.0/'
ATTRIBUTION = 'GTA VI Landmarks Data (CC BY 4.0) — https://map.gtadb.org; GTADB.ORG and contributors'

def normalize(payload, fetched_at):
    if not isinstance(payload, dict) or payload.get('status') != 'OK' or not isinstance(payload.get('results'), list):
        raise ValueError('Respuesta incompatible con el contrato documentado de GTADB')
    accepted, rejected, seen = [], [], {}
    for idx, row in enumerate(payload['results']):
        if not isinstance(row, dict):
            rejected.append({'index': idx, 'reason': 'not_object'}); continue
        source_id, xy, types = row.get('id'), row.get('ig_coordinates'), row.get('types')
        if not isinstance(source_id, str) or not re.fullmatch(r'[A-Za-z0-9_-]{1,80}', source_id):
            rejected.append({'index': idx, 'reason': 'invalid_id'}); continue
        if not isinstance(xy, list) or len(xy) != 2 or any(type(n) not in (int, float) or not math.isfinite(n) for n in xy):
            rejected.append({'index': idx, 'id': source_id, 'reason': 'invalid_game_coordinates'}); continue
        if not isinstance(types, list) or not all(isinstance(t, str) and t.strip() for t in types):
            rejected.append({'index': idx, 'id': source_id, 'reason': 'invalid_types'}); continue
        if source_id in seen:
            if seen[source_id] != (xy, types):
                raise ValueError(f'ID duplicado con datos contradictorios: {source_id}')
            rejected.append({'index': idx, 'id': source_id, 'reason': 'duplicate'}); continue
        seen[source_id] = (xy, types)
        accepted.append({'id': 'gtadb6:'+source_id, 'sourceId': source_id, 'sourceUrl': URL, 'sourceLicenseDeclared': LICENSE, 'attribution': ATTRIBUTION, 'fetchedAt': fetched_at, 'publishedAt': None, 'verifiedAt': None, 'gameVersion': None, 'platform': None, 'originalTypes': types, 'originalName': None, 'spanishName': None, 'coordinates': {'system': 'gtadb6-provider-xy-unvalidated', 'x': xy[0], 'y': xy[1]}, 'mapPosition': None, 'precision': 'unverified', 'status': 'pending_review', 'publishable': False, 'rightsReview': 'pending', 'photos': [], 'notes': 'Provider coordinates not calibrated to Atlas poster; source evidence and rights require individual review.'})
    return {'schemaVersion': 1, 'source': URL, 'fetchedAt': fetched_at, 'status': 'staging_only', 'counts': {'received': len(payload['results']), 'accepted': len(accepted), 'rejected': len(rejected)}, 'candidates': accepted, 'rejected': rejected}

def main():
    p=argparse.ArgumentParser(description=__doc__); g=p.add_mutually_exclusive_group(required=True);g.add_argument('--input',type=Path);g.add_argument('--fetch',action='store_true');p.add_argument('--out',type=Path,required=True);a=p.parse_args()
    if a.out.suffix != '.json' or 'staging' not in a.out.name: p.error('El archivo de salida debe ser JSON e incluir staging en su nombre.')
    if a.out.exists(): p.error('No se sobrescriben archivos existentes.')
    if a.fetch:
        req=Request(URL,headers={'User-Agent':'LeonidaAtlas-research/0.1','Accept':'application/json'})
        with urlopen(req,timeout=25) as r:
            if r.geturl()!=URL: raise ValueError('Redirección inesperada')
            raw=r.read(20_000_001)
    else: raw=a.input.read_bytes()
    if len(raw)>20_000_000: raise ValueError('Límite de tamaño excedido')
    result=normalize(json.loads(raw),datetime.now(timezone.utc).isoformat());result['inputSha256']=hashlib.sha256(raw).hexdigest();result['inputMode']='live_request' if a.fetch else 'local_file_unverified_origin'
    a.out.parent.mkdir(parents=True,exist_ok=True)
    with a.out.open('x',encoding='utf-8') as f: json.dump(result,f,ensure_ascii=False,indent=2,allow_nan=False)
    print(json.dumps(result['counts']))

if __name__=='__main__': main()
