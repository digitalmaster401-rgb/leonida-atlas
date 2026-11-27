import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import puntos from '../../research/calibracion/puntos-control-v1.json';
import versionada from '../../research/calibracion/transformacion-v1.json';
import fullsweep from '../../research/calibracion/transformacion-gtadb-fullsweep-v1.json';
import { apply, decide, errors, fit, insidePoster, leaveOneOut, type Model, type Pair } from '../lib/calibration';
import { posterOf } from '../components/MapView';
import { Seo } from '../components/Seo';
import { Icon } from '../components/Icon';

const PX: [number, number] = [5775, 7900];
const TIERS = [
  { precision: 'barrio', maxPx: 150 },
  { precision: 'zona', maxPx: 400 },
] as const;

type Role = 'entrenamiento' | 'validacion' | 'excluido';
interface Row {
  id: string;
  src: [number, number];
  dst: [number, number];
  disp: number;
  n: number;
}

const rows: Row[] = puntos.pares
  .filter((p) => p.gtadb)
  .map((p) => ({ id: p.nombre, src: [p.gtadb!.x, p.gtadb!.y], dst: [p.x, p.y], disp: p.gtadb!.dispersionMedia, n: p.gtadb!.n }));
const initialRoles = Object.fromEntries(rows.map((r) => [r.id, versionada.puntos.validacion.includes(r.id) ? 'validacion' : 'entrenamiento'])) as Record<string, Role>;
const fmt = (v: number) => v.toFixed(1);

/** Herramienta interna: pares de control, comparación de modelos, errores independientes y desviaciones sobre el póster. */
export function CalibrationPage() {
  const [model, setModel] = useState<Model>(versionada.elegido as Model);
  const [roles, setRoles] = useState<Record<string, Role>>(initialRoles);
  const [probe, setProbe] = useState({ x: '', y: '' });
  const poster = posterOf('v2').files[0];

  const toPair = (r: Row): Pair => ({ id: r.id, src: r.src, dst: r.dst });
  const train = rows.filter((r) => roles[r.id] === 'entrenamiento').map(toPair);
  const test = rows.filter((r) => roles[r.id] === 'validacion').map(toPair);
  const used = [...train, ...test];
  const res = useMemo(() => {
    const t = fit(train, model);
    if (!t) return null;
    const tr = errors(t, train, PX);
    const te = errors(t, test, PX);
    const loo = used.length > 3 ? leaveOneOut(used, model, PX) : null;
    const worst = Math.max(te.n ? te.max : Infinity, loo?.max ?? Infinity);
    const tier = TIERS.find((x) => worst <= x.maxPx);
    return { t, tr, te, loo, worst, tier, decision: decide(train.length, te, TIERS[0].maxPx) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model, roles]);

  const probeOut = (() => {
    const x = Number(probe.x);
    const y = Number(probe.y);
    if (!res || probe.x === '' || probe.y === '' || !Number.isFinite(x) || !Number.isFinite(y)) return null;
    const p = apply(res.t, [x, y]);
    return { p, inside: insidePoster(p), tier: res.tier?.precision ?? null };
  })();

  const exportJson = () => {
    if (!res) return;
    const body = {
      version: versionada.version + 1,
      fecha: new Date().toISOString().slice(0, 10),
      origen: puntos.sistemaOrigen,
      destino: puntos.sistemaDestino,
      modelo: model,
      params: res.t.params,
      entrenamiento: train.map((p) => p.id),
      validacion: test.map((p) => p.id),
      errorPx: { validacionMax: res.te.max, dejandoUnoFueraMax: res.loo?.max ?? null, peor: res.worst },
      precisionMaximaPermitida: res.tier?.precision ?? null,
      atribucion: puntos.atribucion,
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(body, null, 1)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `transformacion-v${body.version}-${model}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="page calib">
      <Seo title="Calibración cartográfica" description="Herramienta interna de calibración GTADB → póster oficial." />
      <header className="page-head">
        <p className="eyebrow">
          <Icon name="sliders" size={16} /> Herramienta interna · no publica nada
        </p>
        <h1>Calibración cartográfica</h1>
        <p className="lead">
          Pares documentados: rótulo del póster oficial (de las fichas) ↔ centroide de landmarks de GTADB del mismo barrio. Ningún par es un punto exacto. {rows.length} pares con equivalente;{' '}
          {puntos.pares.length - rows.length} rótulos sin equivalente en GTADB.
        </p>
      </header>

      <section className="panel calib-controls" aria-label="Modelo">
        <div className="chips" role="group" aria-label="Modelo de transformación">
          {(['similaridad', 'afin'] as Model[]).map((m) => (
            <button key={m} type="button" className={`chip${model === m ? ' is-on' : ''}`} aria-pressed={model === m} onClick={() => setModel(m)}>
              {m === 'afin' ? 'Afín (6 parámetros)' : 'Similaridad (4 parámetros)'}
            </button>
          ))}
        </div>
        {res ? (
          <dl className="calib-metrics" data-testid="calib-metrics">
            <div>
              <dt>Entrenamiento (n={res.tr.n})</dt>
              <dd>
                media {fmt(res.tr.mean)} · máx {fmt(res.tr.max)} px
              </dd>
            </div>
            <div>
              <dt>Validación reservada (n={res.te.n})</dt>
              <dd>{res.te.n ? `media ${fmt(res.te.mean)} · mediana ${fmt(res.te.median)} · máx ${fmt(res.te.max)} px` : 'sin puntos reservados'}</dd>
            </div>
            <div>
              <dt>Dejando uno fuera (n={res.loo?.n ?? 0})</dt>
              <dd>{res.loo ? `media ${fmt(res.loo.mean)} · p90 ${fmt(res.loo.p90)} · máx ${fmt(res.loo.max)} px` : '—'}</dd>
            </div>
            <div>
              <dt>Decisión</dt>
              <dd data-testid="calib-decision">
                {res.tier ? `Válida como mucho para precisión «${res.tier.precision}» (peor error ${fmt(res.worst)} px).` : `Insuficiente: peor error ${Number.isFinite(res.worst) ? fmt(res.worst) : '∞'} px. No se proyecta.`}
                {!res.decision.ok && train.length < 8 ? ` ${res.decision.reason}` : ''}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="alert" role="alert">
            Faltan puntos de entrenamiento para este modelo.
          </p>
        )}
        <div className="btn-row">
          <button type="button" className="btn btn-sm" onClick={exportJson} disabled={!res}>
            <Icon name="download" size={16} /> Exportar transformación (JSON)
          </button>
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => setRoles(initialRoles)}>
            <Icon name="reset" size={16} /> Volver a la versión guardada (v{versionada.version})
          </button>
        </div>
      </section>

      <div className="calib-grid">
        <figure className="calib-map" aria-label="Desviaciones sobre el póster">
          <img src={poster.src} width={poster.width} height={poster.height} alt="Póster oficial de Leonida (Rockstar Games)" />
          {res && (
            <svg viewBox="0 0 1 1" preserveAspectRatio="none" className="calib-svg" aria-hidden="true" focusable="false">
              {rows.map((r) => {
                const [px, py] = apply(res.t, r.src);
                const role = roles[r.id];
                return (
                  <g key={r.id} className={`calib-pt is-${role}`}>
                    <line x1={r.dst[0]} y1={r.dst[1]} x2={px} y2={py} vectorEffect="non-scaling-stroke" />
                    <circle cx={r.dst[0]} cy={r.dst[1]} r="0.006" />
                    <rect x={px - 0.004} y={py - 0.003} width="0.008" height="0.006" />
                  </g>
                );
              })}
            </svg>
          )}
          <figcaption className="small muted">Círculo: rótulo del póster · cuadro: posición calculada desde GTADB · línea: desviación. Verde = entrenamiento, cian = validación.</figcaption>
        </figure>

        <section className="panel calib-table" aria-labelledby="calib-pts-h">
          <h2 id="calib-pts-h">Puntos de control</h2>
          <div className="table-wrap" tabIndex={0} role="region" aria-label="Tabla de puntos de control">
            <table>
              <thead>
                <tr>
                  <th scope="col">Rótulo</th>
                  <th scope="col">Uso</th>
                  <th scope="col">Error (px)</th>
                  <th scope="col">GTADB (n · dispersión m)</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const err = res ? errors(res.t, [{ id: r.id, src: r.src, dst: r.dst }], PX).residuals[0].err : null;
                  return (
                    <tr key={r.id}>
                      <th scope="row">{r.id}</th>
                      <td>
                        <select aria-label={`Uso de ${r.id}`} value={roles[r.id]} onChange={(e) => setRoles((x) => ({ ...x, [r.id]: e.target.value as Role }))}>
                          <option value="entrenamiento">Entrenamiento</option>
                          <option value="validacion">Validación</option>
                          <option value="excluido">Excluido</option>
                        </select>
                      </td>
                      <td>{err === null ? '—' : fmt(err)}</td>
                      <td>
                        {r.n} · {fmt(r.disp)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="small muted">Sin equivalente en GTADB: {versionada.puntos.sinEquivalente.join(', ')}.</p>
        </section>
      </div>

      <section className="panel" aria-labelledby="calib-probe-h">
        <h2 id="calib-probe-h">Probar una coordenada de GTADB</h2>
        <div className="btn-row">
          <label className="field">
            <span>x (m)</span>
            <input inputMode="decimal" value={probe.x} onChange={(e) => setProbe((p) => ({ ...p, x: e.target.value }))} />
          </label>
          <label className="field">
            <span>y (m)</span>
            <input inputMode="decimal" value={probe.y} onChange={(e) => setProbe((p) => ({ ...p, y: e.target.value }))} />
          </label>
        </div>
        {probeOut && (
          <p data-testid="calib-probe">
            Póster: ({probeOut.p[0].toFixed(4)}, {probeOut.p[1].toFixed(4)}) ·{' '}
            {!probeOut.inside ? 'RECHAZADA: fuera del póster.' : probeOut.tier ? `Candidata como mucho con precisión «${probeOut.tier}», pendiente de revisión.` : 'RECHAZADA: calibración insuficiente.'}
          </p>
        )}
      </section>

      <section className="panel" aria-labelledby="calib-fs-h">
        <h2 id="calib-fs-h">GTADB ↔ FullSweep</h2>
        <p>
          {fullsweep.pares} correspondencias exactas por id; {fullsweep.incoherentes.n} incoherentes (&gt; {fullsweep.incoherentes.umbralPx} px) excluidas. Validación ({fullsweep.modelos[1].validacion.n}
          puntos): mediana {fullsweep.modelos[1].validacion.mediana} px · p90 {fullsweep.modelos[1].validacion.p90} px.
        </p>
        <p className="small muted">{fullsweep.conclusion}</p>
      </section>
      <p className="small muted">
        Datos: {puntos.atribucion}. Versión guardada: <code>research/calibracion/transformacion-v{versionada.version}.json</code> ({versionada.fecha}). <Link to="/editor">Volver a herramientas</Link>
      </p>
    </div>
  );
}
