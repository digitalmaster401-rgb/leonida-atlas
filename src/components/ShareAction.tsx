import { useToast } from '../hooks/toast';
import { absoluteUrl, shareLink } from '../lib/share';
import { Icon } from './Icon';

export function ShareAction({ title, text, path, className = 'btn' }: { title: string; text: string; path: string; className?: string }) {
  const toast = useToast();
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        const res = await shareLink({ title, text, url: absoluteUrl(path) });
        if (res === 'copied') toast.show('Enlace copiado. Pégalo en WhatsApp, Discord o donde quieras.');
        else if (res === 'failed') toast.show('No se pudo compartir. Copia la dirección desde la barra del navegador.');
      }}
    >
      <Icon name="share" size={18} /> Compartir
    </button>
  );
}
