// Paso 21A: casos reales de los PR automáticos #5–#8 (titulares tal cual los publicaron las fuentes).
import { describe, expect, it } from 'vitest';
import { ingest, enforceIndependenceAll } from '../../src/intel/engine';
import { heuristicExtract } from '../../src/intel/classify';
import { classifyCategory, debunkHeadline } from '../../src/intel/heuristics';
import { numbersConflict, topicSimilarity } from '../../src/intel/normalize';
import { statusFromSources } from '../../src/intel/status';
import { findingSchema } from '../../src/intel/schema';
import { evidence, finding, item, NOW, ref, source } from './fixtures';

const add = (findings: ReturnType<typeof finding>[], title: string, link: string, src = source(), publishedAt = '2026-11-23T10:00:00.000Z') =>
  ingest(findings, item({ title, link, summary: '', publishedAt }), src, heuristicExtract(title, '', link), 'r', NOW);

describe('deduplicación por tema', () => {
  it('fusiona la misma noticia contada por tres medios distintos', () => {
    let f = add([], 'A Cyberpunk 2 Director Joked His Game Was Cancelled After Seeing GTA 6', 'https://boom.example/a', source({ id: 'boom', independenceGroup: 'boom' })).findings;
    f = add(f, 'Cyberpunk 2 Is Canceled, Director Jokes, After GTA 6 Raises The Bar', 'https://spot.example/b', source({ id: 'spot', independenceGroup: 'spot' })).findings;
    f = add(f, 'Cyberpunk 2 creative director jokes that he’s cancelling the game after playing GTA 6', 'https://vgc.example/c', source({ id: 'vgc', independenceGroup: 'vgc' })).findings;
    expect(f).toHaveLength(1);
    expect(f[0].sources).toHaveLength(3);
    expect(f[0].status).toBe('contrastado');
  });

  it('fusiona una guía retitulada y la misma guía de otro medio', () => {
    let f = add([], 'How to Play GTA 6 in First Person With the Camera Glitch', 'https://boom.example/fp').findings;
    f = add(f, 'How to Play GTA 6 in First Person on PS5 With the Camera Glitch', 'https://boom.example/fp-ps5').findings;
    expect(f).toHaveLength(1);
  });

  it('NO fusiona temas distintos que comparten una palabra o difieren en un número', () => {
    let f = add([], 'GTA 6 Chapter 3 Mission List: Every Mission in Order & Point of No Return', 'https://vgc.example/c3').findings;
    f = add(f, 'GTA 6 Chapter 4 Mission List: Every Mission in Order & Point of No Return', 'https://vgc.example/c4').findings;
    f = add(f, 'How to Complete How Do I Look? in GTA 6', 'https://boom.example/look').findings;
    f = add(f, 'How to Complete New Look in GTA 6', 'https://boom.example/new-look').findings;
    f = add(f, 'Grand Theft Auto VI: Out Now', 'https://rs.example/out', source({ id: 'rs', tier: 'oficial', independenceGroup: 'rockstar' })).findings;
    f = add(f, 'How to Complete Checking Out in GTA 6', 'https://boom.example/checking-out').findings;
    expect(f).toHaveLength(6);
    expect(numbersConflict('Chapter 3 list', 'Chapter 4 list')).toBe(true);
    expect(topicSimilarity('How to Complete New Look in GTA 6', 'How to Complete How Do I Look? in GTA 6')).toBe(0);
  });

  it('no fusiona noticias del mismo medio por tema ni noticias separadas por más de 4 días', () => {
    let f = add([], 'Cyberpunk 2 Director Jokes His Game Is Cancelled After Seeing GTA 6', 'https://boom.example/1', source({ id: 'boom', independenceGroup: 'boom' }), '2026-11-23T10:00:00.000Z').findings;
    f = add(f, 'Cyberpunk 2 director jokes game cancelled after GTA 6 again', 'https://spot.example/2', source({ id: 'spot', independenceGroup: 'spot' }), '2026-12-01T10:00:00.000Z').findings;
    expect(f).toHaveLength(2);
  });
});

describe('clasificación', () => {
  it('«How to complete <misión>» es misión aunque el nombre suene a otra cosa', () => {
    for (const t of ['How to Complete Checking Out in GTA 6', 'How to Complete Afternoon Delight in GTA 6', 'How to Complete Daily Driver in GTA 6', 'How to Complete How Do I Look? in GTA 6'])
      expect(classifyCategory(t, ''), t).toBe('mision');
    // pero un robo o un glitch en el titular mandan
    expect(classifyCategory('GTA 6 Avery Pawn Robbery Walkthrough: Safe Code and Escape', '')).toBe('dinero');
  });
  it('un titular que desmiente no queda como glitch «reportado»', () => {
    const t = 'No, the Xbox Quick Resume Glitch Does Not Give You Infinite Money in GTA 6';
    expect(debunkHeadline(t)).toBe(true);
    const r = add([], t, 'https://boom.example/qr');
    expect(r.findings[0].flags).toContain('desmentido_en_titular');
    expect(r.findings[0].status).toBe('nuevo_sin_verificar');
    expect(debunkHeadline('GTA 6 money glitch gives $50,000')).toBe(false);
  });
});

describe('estados', () => {
  it('«contrastado» exige dos fuentes independientes; una oficial sola es «anuncio oficial»', () => {
    const official = ref({ tier: 'oficial', independenceGroup: 'rockstar' });
    expect(statusFromSources([official], false)).toBe('anuncio_oficial');
    expect(statusFromSources([official, ref({ independenceGroup: 'boom' })], false)).toBe('contrastado');
    expect(statusFromSources([ref({ independenceGroup: 'a' }), ref({ independenceGroup: 'a', url: 'https://a.example/y' })], true)).toBe('reportado');
    expect(statusFromSources([ref({ independenceGroup: 'a', originId: 'o1' }), ref({ independenceGroup: 'b', originId: 'o1' })], true)).toBe('reportado');
  });
  it('corrige un «contrastado» guardado sin fuentes suficientes y lo deja en el historial', () => {
    const bad = finding({ status: 'contrastado', category: 'noticia', sources: [ref({ tier: 'oficial', independenceGroup: 'rockstar' })] });
    const r = enforceIndependenceAll([bad], 'r', NOW);
    expect(r.findings[0].status).toBe('anuncio_oficial');
    expect(r.findings[0].history.at(-1)!.reason).toMatch(/independencia/);
    expect(r.changes).toHaveLength(1);
    const ok = finding({ status: 'contrastado', sources: [ref(), ref({ independenceGroup: 'b', url: 'https://b.example/x' })] });
    expect(enforceIndependenceAll([ok], 'r', NOW).changes).toHaveLength(0);
  });
  it('«comprobado» y «parcheado» exigen evidencia humana completa', () => {
    expect(findingSchema.safeParse(finding({ status: 'comprobado_en_version' })).success).toBe(false);
    const auto = evidence({ type: 'prueba_en_juego', result: 'funciona', testedAt: NOW, gameVersion: '1.002.002', platform: 'ps5', recordedBy: 'atlas-intelligence' });
    expect(findingSchema.safeParse(finding({ status: 'comprobado_en_version', evidence: [auto] })).success).toBe(false);
    const human = { ...auto, recordedBy: 'editor' };
    expect(findingSchema.safeParse(finding({ status: 'comprobado_en_version', evidence: [human] })).success).toBe(true);
    expect(findingSchema.safeParse(finding({ status: 'parcheado' })).success).toBe(false);
  });
});

import { carryPending, pendingMarkdown } from '../../src/intel/engine';
const rc = (t: string) => {
  const ex = heuristicExtract(t, '', 'https://x.invalid/');
  return { category: ex.category, flags: ex.flags };
};

describe('propuesta acumulada (arrastre de propuestas abiertas)', () => {
  it('no repite lo que ya está en propuestas abiertas y consolida duplicados entre ellas', () => {
    const a = finding({ id: 'fnd-a', dedupKey: 'url:https://boom.example/cp', title: 'A Cyberpunk 2 Director Joked His Game Was Cancelled After Seeing GTA 6', category: 'noticia', status: 'nuevo_sin_verificar', sources: [ref({ url: 'https://boom.example/cp', canonicalUrl: 'https://boom.example/cp', contentHash: 'h-a', independenceGroup: 'boom', publishedAt: '2026-11-23T00:00:00.000Z' })], sourcePublishedAt: '2026-11-23T00:00:00.000Z' });
    const b = finding({ id: 'fnd-b', dedupKey: 'url:https://spot.example/cp', title: 'Cyberpunk 2 Is Canceled, Director Jokes, After GTA 6 Raises The Bar', category: 'noticia', status: 'nuevo_sin_verificar', sources: [ref({ url: 'https://spot.example/cp', canonicalUrl: 'https://spot.example/cp', contentHash: 'h-b', independenceGroup: 'spot', publishedAt: '2026-11-23T05:00:00.000Z' })], sourcePublishedAt: '2026-11-23T05:00:00.000Z' });
    const pr5 = [a];
    const pr6 = [a, b]; // la misma «a» repetida en dos PR + la misma historia de otro medio
    const r = carryPending([], [pr5, pr6], rc, 'r', NOW);
    expect(r.findings).toHaveLength(1);
    expect(r.findings[0].sources).toHaveLength(2);
    expect(r.findings[0].status).toBe('contrastado');
    expect(r.findings[0].history.some((h) => h.type === 'fuente_agregada')).toBe(true);
  });
  it('main manda: no pisa un hallazgo que ya existe y reclasifica los heurísticos con las reglas nuevas', () => {
    const inMain = finding({ id: 'fnd-m', title: 'Editado por una persona' });
    const pend = [finding({ id: 'fnd-m', title: 'versión vieja' }), finding({ id: 'fnd-n', dedupKey: 'url:https://boom.example/co', title: 'How to Complete Checking Out in GTA 6', category: 'arma', status: 'reportado', sources: [ref({ url: 'https://boom.example/co', canonicalUrl: 'https://boom.example/co', contentHash: 'h-co', independenceGroup: 'boom' })] })];
    const r = carryPending([inMain], [pend], rc, 'r', NOW);
    expect(r.findings.find((f) => f.id === 'fnd-m')!.title).toBe('Editado por una persona');
    const n = r.findings.find((f) => f.id === 'fnd-n')!;
    expect(n.category).toBe('mision');
    expect(n.history.some((h) => /Reclasificado/.test(h.reason))).toBe(true);
  });
  it('el cuerpo acumulado lista solo lo pendiente, una vez, agrupado por categoría', () => {
    const base = [finding({ id: 'fnd-m' })];
    const final = [...base, finding({ id: 'fnd-x', dedupKey: 'k-x', title: 'GTA 6 Mushroom Easter Egg', category: 'coleccionable' })];
    const md = pendingMarkdown(base, final, 'run-1', NOW);
    expect(md).toMatch(/1 nuevos, 0 actualizados/);
    expect(md).toMatch(/## coleccionable \(1\)/);
    expect(md.match(/Mushroom/g)).toHaveLength(1);
  });
});
