import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Icon } from './Icon';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({ immediate: true });
  useEffect(() => {
    if (!offlineReady) return;
    const t = setTimeout(() => setOfflineReady(false), 5000);
    return () => clearTimeout(t);
  }, [offlineReady, setOfflineReady]);
  if (!needRefresh && !offlineReady) return null;
  return (
    <div className="update-bar" role="status">
      {needRefresh ? (
        <>
          <span>Hay una versión nueva de LEONIDA ATLAS.</span>
          <button type="button" className="btn btn-sm btn-cta" onClick={() => updateServiceWorker(true)}>
            Actualizar
          </button>
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => setNeedRefresh(false)}>
            Después
          </button>
        </>
      ) : (
        <>
          <span>Lista para usarse sin conexión.</span>
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => setOfflineReady(false)}>
            Entendido
          </button>
        </>
      )}
    </div>
  );
}

export function InstallButton({ className = 'btn btn-sm' }: { className?: string }) {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  useEffect(() => {
    const on = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
    };
    const installed = () => setEvt(null);
    window.addEventListener('beforeinstallprompt', on);
    window.addEventListener('appinstalled', installed);
    return () => {
      window.removeEventListener('beforeinstallprompt', on);
      window.removeEventListener('appinstalled', installed);
    };
  }, []);
  if (!evt) return null;
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        await evt.prompt();
        await evt.userChoice;
        setEvt(null);
      }}
    >
      <Icon name="install" size={16} /> Instalar app
    </button>
  );
}

export function OfflineBanner() {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);
  if (online) return null;
  return (
    <div className="offline-bar" role="status" data-testid="offline-banner">
      <Icon name="wifi_off" size={16} /> Sin conexión: puedes consultar las fichas ya cargadas y tu progreso. Las imágenes no visitadas se muestran como ilustración.
    </div>
  );
}
