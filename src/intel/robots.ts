// robots.txt mínimo: respeta Disallow para nuestro agente y para «*». Ante error de red, no rastrea.
export const USER_AGENT = 'LeonidaAtlasBot/1.0 (+guia de fans; solo lee feeds RSS publicos)';
const AGENT_TOKEN = 'leonidaatlasbot';

export function robotsAllows(robotsTxt: string, path: string): boolean {
  const groups: { agents: string[]; rules: { allow: boolean; path: string }[] }[] = [];
  let cur: (typeof groups)[number] | null = null;
  let lastWasAgent = false;
  for (const raw of robotsTxt.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, '').trim();
    const m = line.match(/^([a-z-]+)\s*:\s*(.*)$/i);
    if (!m) continue;
    const key = m[1].toLowerCase();
    const val = m[2].trim();
    if (key === 'user-agent') {
      if (!cur || !lastWasAgent) {
        cur = { agents: [], rules: [] };
        groups.push(cur);
      }
      cur.agents.push(val.toLowerCase());
      lastWasAgent = true;
    } else if ((key === 'allow' || key === 'disallow') && cur) {
      if (val) cur.rules.push({ allow: key === 'allow', path: val });
      lastWasAgent = false;
    } else lastWasAgent = false;
  }
  const mine = groups.filter((g) => g.agents.some((a) => a !== '*' && AGENT_TOKEN.includes(a)));
  const chosen = mine.length ? mine : groups.filter((g) => g.agents.includes('*'));
  let best: { allow: boolean; len: number } | null = null;
  for (const g of chosen)
    for (const r of g.rules) {
      const prefix = r.path.replace(/\*.*$/, '').replace(/\$$/, '');
      if (path.startsWith(prefix) && (!best || prefix.length > best.len || (prefix.length === best.len && r.allow))) best = { allow: r.allow, len: prefix.length };
    }
  return best ? best.allow : true;
}
