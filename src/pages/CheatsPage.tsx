import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { cheatsData } from '../data/fase2';
import type { Cheat } from '../data/schema-fase2';
import { useProgress } from '../hooks/progress';
import { useToast } from '../hooks/toast';
import { ButtonSequence, sequenceText } from '../components/ButtonSequence';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { EmptyState } from '../components/EmptyState';
import { Icon } from '../components/Icon';
import { Seo } from '../components/Seo';
import { SourceLinks } from '../components/SourceLinks';
import { copyText } from '../lib/share';
import { setQueryParam } from '../lib/query';
import { formatDate } from '../lib/calc';

type Pad = 'ps5' | 'xbox';
const CAT_LABEL: Record<Cheat['category'], string> = { jugador: 'Jugador', combate: 'Combate', vehiculo: 'Vehículos', entorno: 'Entorno', filtro: 'Filtros de pantalla' };

export function CheatsPage() {
  const { progress } = useProgress();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const defaultPad: Pad = progress.profile.platform?.startsWith('xbox') ? 'xbox' : 'ps5';
  const pad: Pad = params.get('consola') === 'xbox' ? 'xbox' : params.get('consola') === 'ps5' ? 'ps5' : defaultPad;
  const cat = (params.get('tipo') ?? '') as Cheat['category'] | '';
  const onlyKnown = params.get('secuencia') === 'si';
  const [q, setQ] = useState('');
  const m = cheatsData.entry[pad];

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return cheatsData.cheats.filter(
      (c) => (!cat || c.category === cat) && (!onlyKnown || c.sequence) && (!t || `${c.name} ${c.effect} ${c.unlock}`.toLowerCase().includes(t)),
    );
  }, [cat, onlyKnown, q]);
  const known = cheatsData.cheats.filter((c) => c.sequence).length;

  return (
    <div className="page">
      <Seo title="Trucos y códigos" description="Trucos de GTA VI para PS5 y Xbox Series X|S con secuencia, efecto, requisito y consecuencias." />
      <header className="page-head">
        <h1>
          <Icon name="gamepad" size={28} /> Trucos y códigos
        </h1>
        <p className="lead">
          {cheatsData.cheats.length} trucos documentados; {known} con secuencia publicada. Los demás se activan desde el menú del juego cuando cumples su requisito: no inventamos
          secuencias.
        </p>
        <p className="muted small">
          Revisado: {formatDate(cheatsData.verifiedAt)} · {cheatsData.patch}
        </p>
      </header>

      <section className="panel alerts" aria-labelledby="cons-h" data-testid="cheat-rules">
        <h2 id="cons-h">
          <Icon name="alert" size={20} /> Antes de usar trucos: consecuencias
        </h2>
        <ul className="fact-list">
          {cheatsData.rules.map((r) => (
            <li key={r.label}>
              <strong>{r.label}:</strong> {r.value} <SourceLinks ids={r.sources} status={r.status} />
            </li>
          ))}
        </ul>
      </section>

      <section className="panel" aria-labelledby="entry-h">
        <h2 id="entry-h">Cómo introducirlos</h2>
        <div className="seg" role="group" aria-label="Consola">
          {(['ps5', 'xbox'] as const).map((p) => (
            <button key={p} type="button" className={`chip${pad === p ? ' is-on' : ''}`} aria-pressed={pad === p} onClick={() => setQueryParam(setParams, 'consola', p)}>
              {cheatsData.entry[p].label}
            </button>
          ))}
        </div>
        <ol className="steps">
          {m.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <p className="small muted">{m.note}</p>
        <SourceLinks ids={m.sources} status={m.status} label="Método:" />
      </section>

      <div className="filters" role="search">
        <div className="field">
          <label htmlFor="cheat-q">Buscar truco</label>
          <input id="cheat-q" type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Munición, tanque, filtro…" />
        </div>
        <div className="chips" role="group" aria-label="Tipo de truco">
          <button type="button" className={`chip${!cat ? ' is-on' : ''}`} aria-pressed={!cat} onClick={() => setQueryParam(setParams, 'tipo', null)}>
            Todos
          </button>
          {(Object.keys(CAT_LABEL) as Cheat['category'][]).map((c) => (
            <button key={c} type="button" className={`chip${cat === c ? ' is-on' : ''}`} aria-pressed={cat === c} onClick={() => setQueryParam(setParams, 'tipo', c)}>
              {CAT_LABEL[c]}
            </button>
          ))}
          <button type="button" className={`chip${onlyKnown ? ' is-on' : ''}`} aria-pressed={onlyKnown} onClick={() => setQueryParam(setParams, 'secuencia', onlyKnown ? null : 'si')}>
            Solo con secuencia
          </button>
        </div>
        <p className="result-count" aria-live="polite">
          {list.length} trucos
        </p>
      </div>

      {list.length ? (
        <ul className="cheat-list">
          {list.map((c) => (
            <li key={c.id} className="panel cheat" data-testid="cheat" data-id={c.id}>
              <div className="cheat-head">
                <h3>{c.name}</h3>
                <span className="chip chip-static">{CAT_LABEL[c.category]}</span>
              </div>
              <p>{c.effect}</p>
              {c.sequence ? (
                <div className="cheat-seq">
                  <ButtonSequence seq={c.sequence} hold={m.hold} press={m.press} />
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={async () => toast.show((await copyText(`${c.name} — ${sequenceText(c.sequence!, m.hold, m.press)}`)) ? 'Secuencia copiada.' : 'No se pudo copiar.')}
                  >
                    <Icon name="copy" size={16} /> Copiar
                  </button>
                  <SourceLinks ids={c.sequenceSources} status={c.sequenceStatus === 'desconocida' ? undefined : c.sequenceStatus} label="Secuencia:" />
                </div>
              ) : (
                <p className="cheat-unknown" data-testid="seq-unknown">
                  <Icon name="eye" size={16} /> Secuencia desconocida: ninguna fuente la ha publicado. Actívalo desde Progreso → Trucos al cumplir el requisito.
                </p>
              )}
              <p className="small">
                <strong>Requisito:</strong> {c.unlock} <SourceLinks ids={c.unlockSources} status={c.unlockStatus} />
              </p>
              {c.note && <p className="small muted">{c.note}</p>}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="Ningún truco coincide">Quita algún filtro.</EmptyState>
      )}
      <p className="small muted">
        Evidencia: <EvidenceBadge status="contrastado" compact /> = dos grupos editoriales independientes coinciden (VICE reutiliza datos de GTA BASE y cuenta como uno);{' '}
        <EvidenceBadge status="reportado" compact /> = una sola fuente. Solo modo historia; nada aquí funciona en línea.
      </p>
    </div>
  );
}
