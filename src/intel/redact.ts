// Protección de secretos: nada que parezca una clave termina en reportes, propuestas ni registros.

const PATTERNS: RegExp[] = [
  /sk-ant-[a-z0-9_-]{8,}/gi,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/g,
  /\bgithub_pat_[A-Za-z0-9_]{20,}\b/g,
  /\bAIza[0-9A-Za-z_-]{30,}\b/g, // claves de Google/YouTube
  /\b(x-api-key|authorization)\s*[:=]\s*\S+/gi,
  /\bBearer\s+[A-Za-z0-9._-]{16,}/g,
];

export function redact(text: string, extraSecrets: (string | undefined)[] = []): string {
  let out = text;
  for (const s of extraSecrets) if (s && s.length >= 8) out = out.split(s).join('[SECRETO-OCULTO]');
  for (const re of PATTERNS) out = out.replace(re, '[SECRETO-OCULTO]');
  return out;
}

export function secretValuesFromEnv(env: Record<string, string | undefined>): string[] {
  return ['ANTHROPIC_API_KEY', 'YOUTUBE_API_KEY', 'GITHUB_TOKEN', 'GH_TOKEN'].map((k) => env[k]).filter((v): v is string => !!v);
}
