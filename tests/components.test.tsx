import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { ProgressProvider } from '../src/hooks/progress';
import { ToastProvider } from '../src/hooks/toast';
import { ItemCard } from '../src/components/ItemCard';
import { MoneyCalculator } from '../src/components/MoneyCalculator';
import { EvidenceBadge } from '../src/components/EvidenceBadge';
import { entries, entryById } from '../src/data';
import { STORAGE_KEY } from '../src/lib/storage';

const wrap = (ui: React.ReactNode) =>
  render(
    <MemoryRouter>
      <ToastProvider>
        <ProgressProvider>{ui}</ProgressProvider>
      </ToastProvider>
    </MemoryRouter>,
  );

describe('componentes', () => {
  beforeEach(() => localStorage.clear());

  it('la insignia de evidencia muestra el nivel y su significado', () => {
    render(<EvidenceBadge status="reportado" />);
    expect(screen.getByText('REPORTADO')).toBeInTheDocument();
    expect(screen.getByText(/Una sola fuente no oficial/)).toBeInTheDocument();
  });

  it('la tarjeta guarda favoritos de forma persistente', () => {
    const e = entryById.get('arm-duke-556')!;
    wrap(<ItemCard entry={e} />);
    const btn = screen.getByRole('button', { name: /Guardar Duke 556/ });
    fireEvent.click(btn);
    expect(screen.getByRole('button', { name: /Quitar Duke 556/ })).toHaveAttribute('aria-pressed', 'true');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).favorites).toContain('arm-duke-556');
  });

  it('vela las fichas con spoilers por encima de la preferencia', () => {
    const e = entries.find((x) => x.spoilerLevel === 2)!;
    wrap(<ItemCard entry={e} />);
    expect(screen.getByText(/Contiene spoilers de etapas avanzadas/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Mostrar de todos modos/ }));
    expect(screen.getByText(e.summary)).toBeInTheDocument();
  });

  it('la calculadora separa bruto, costos y neto, y marca estimaciones', () => {
    wrap(<MoneyCalculator methods={entries.filter((x) => x.category === 'dinero')} />);
    fireEvent.change(screen.getByLabelText(/Método/), { target: { value: 'din-moses' } });
    expect(screen.getByText(/Estimación/)).toBeInTheDocument();
    expect(screen.getByTestId('calc-net')).toHaveTextContent('$1,000');
    expect(screen.getByTestId('calc-hour')).toHaveTextContent('$15,000');
    fireEvent.change(screen.getByLabelText(/Costos por ejecución/), { target: { value: '200' } });
    expect(screen.getByTestId('calc-net')).toHaveTextContent('$800');
  });
});
