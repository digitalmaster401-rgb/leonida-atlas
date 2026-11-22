import { useState } from 'react';
import { REPORT_URL } from '../data/meta';
import { useToast } from '../hooks/toast';
import { absoluteUrl, shareLink } from '../lib/share';
import { Icon } from './Icon';

/** Reporte de errores sin backend: abre un issue prellenado o comparte el texto. No se almacena nada. */
export function ReportError({ subject, path }: { subject: string; path: string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const toast = useToast();
  const body = `Ficha: ${subject}\nURL: ${typeof window !== 'undefined' ? absoluteUrl(path) : path}\n\nQué está mal y cómo lo comprobaste (plataforma, capítulo, parche, fuente):\n${text}`;
  const issueUrl = `${REPORT_URL}?title=${encodeURIComponent('Error en: ' + subject)}&body=${encodeURIComponent(body)}`;
  return (
    <div className="report">
      <button type="button" className="btn btn-ghost" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Icon name="flag" size={18} /> Reportar un error
      </button>
      {open && (
        <div className="report-box">
          <label htmlFor="report-text">Describe el error y cómo lo comprobaste</label>
          <textarea id="report-text" rows={4} value={text} onChange={(e) => setText(e.target.value)} maxLength={2000} placeholder="Ej.: en PS5, Capítulo 2, el precio que vi fue…" />
          <div className="btn-row">
            <a className="btn btn-cta" href={issueUrl} target="_blank" rel="noopener noreferrer">
              Enviar como issue en GitHub <Icon name="external" size={14} />
            </a>
            <button
              type="button"
              className="btn"
              onClick={async () => {
                const r = await shareLink({ title: `Error en LEONIDA ATLAS: ${subject}`, text: body, url: absoluteUrl(path) });
                if (r === 'copied') toast.show('Enlace copiado; pega también tu descripción al enviarlo.');
              }}
            >
              Compartir reporte
            </button>
          </div>
          <p className="muted small">LEONIDA ATLAS no guarda reportes: se envían por GitHub (requiere cuenta) o por la app que elijas al compartir.</p>
        </div>
      )}
    </div>
  );
}
