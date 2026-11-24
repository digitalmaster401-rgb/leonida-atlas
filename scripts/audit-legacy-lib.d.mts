export const TERMS: string[];
export const WORD_TERMS: Set<string>;
export const PROHIBITED_FILES: RegExp;
export const HEADLINE_FILES: RegExp;
export function INTERNAL_OK(rel: string, term: string): boolean;
export interface HeadlineFinding {
  id: string;
  title: string;
  sources: { url: string; title?: string | null }[];
}
export function collectHeadlines(findings: HeadlineFinding[], intelSources: { url: string; homepage?: string }[]): Map<string, string>;
export interface AuditHit {
  file: string;
  term: string;
  context?: string;
  reason?: string;
}
export function scanText(rel: string, text: string, headlines: Map<string, string>): { hits: AuditHit[]; accepted: AuditHit[] };
