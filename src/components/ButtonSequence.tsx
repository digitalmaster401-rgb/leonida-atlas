import type { Direction } from '../data/schema-fase2';

export const DIR_LABEL: Record<Direction, string> = { up: 'Arriba', down: 'Abajo', left: 'Izquierda', right: 'Derecha' };
export const DIR_ARROW: Record<Direction, string> = { up: '↑', down: '↓', left: '←', right: '→' };
const ROT: Record<Direction, number> = { up: 0, right: 90, down: 180, left: 270 };

/** Texto accesible y copiable de una secuencia. */
export function sequenceText(seq: Direction[], hold: string, press: string): string {
  return `Mantén ${hold} + ${press}: ${seq.map((d) => DIR_ARROW[d]).join(' ')} (${seq.map((d) => DIR_LABEL[d]).join(', ')})`;
}

/** Secuencia visual de la cruceta. La lectura de pantalla recibe el texto completo, no los iconos. */
export function ButtonSequence({ seq, hold, press }: { seq: Direction[]; hold: string; press: string }) {
  return (
    <div className="btnseq" role="img" aria-label={sequenceText(seq, hold, press)}>
      <span className="btnseq-mod" aria-hidden="true">
        {hold} + {press}
      </span>
      <ol className="btnseq-list" aria-hidden="true">
        {seq.map((d, i) => (
          <li key={i} className="btnseq-key" title={DIR_LABEL[d]}>
            <svg width="28" height="28" viewBox="0 0 24 24" focusable="false">
              <g transform={`rotate(${ROT[d]} 12 12)`}>
                <path d="M12 4 5 12h4.5v8h5v-8H19z" fill="currentColor" />
              </g>
            </svg>
          </li>
        ))}
      </ol>
    </div>
  );
}
