// Datos de ATLAS INTELLIGENCE generados por el pipeline (validados con Zod en pruebas y en el workflow).
import rawFindings from '../../intel/findings.json';
import rawRuns from '../../intel/runs/index.json';
import rawPatches from '../../intel/patches.json';
import rawSources from '../../intel/sources.json';
import rawSubmissions from '../../intel/submissions.json';
import type { Finding, IntelSource, Patch, RunReport, Submission } from '../intel/schema';

export const findings = rawFindings as unknown as Finding[];
export const runs = (rawRuns as unknown as RunReport[]).slice().sort((a, b) => b.finishedAt.localeCompare(a.finishedAt));
export const patches = (rawPatches as unknown as Patch[]).slice().sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
export const intelSources = rawSources as unknown as IntelSource[];
export const submissions = rawSubmissions as unknown as Submission[];
export const lastRun: RunReport | undefined = runs[0];
