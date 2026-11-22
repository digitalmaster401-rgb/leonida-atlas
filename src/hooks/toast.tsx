import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

interface Toast {
  id: number;
  text: string;
  action?: { label: string; onClick: () => void };
  persistent?: boolean;
}
interface ToastApi {
  show: (text: string, opts?: { action?: Toast['action']; persistent?: boolean }) => void;
  dismiss: (id: number) => void;
}
const Ctx = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef(0);
  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const show = useCallback<ToastApi['show']>(
    (text, opts) => {
      const id = ++seq.current;
      setToasts((t) => [...t.slice(-2), { id, text, ...opts }]);
      if (!opts?.persistent) setTimeout(() => dismiss(id), 3500);
    },
    [dismiss],
  );
  return (
    <Ctx.Provider value={{ show, dismiss }}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            <span>{t.text}</span>
            {t.action && (
              <button
                type="button"
                className="btn btn-sm btn-cta"
                onClick={() => {
                  t.action!.onClick();
                  dismiss(t.id);
                }}
              >
                {t.action.label}
              </button>
            )}
            <button type="button" className="toast-close" aria-label="Cerrar aviso" onClick={() => dismiss(t.id)}>
              ×
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast(): ToastApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useToast fuera de ToastProvider');
  return v;
}
