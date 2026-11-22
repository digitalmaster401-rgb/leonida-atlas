import { Link } from 'react-router';
import { Seo } from '../components/Seo';
import { EmptyState } from '../components/EmptyState';

export function NotFound() {
  return (
    <div className="page">
      <Seo title="Página no encontrada" description="Esta dirección no existe en LEONIDA ATLAS." />
      <EmptyState icon="alert" title="No encontramos esta página">
        <p>Puede que la ficha haya cambiado de nombre o se haya archivado tras la auditoría.</p>
        <p>
          <Link to="/" className="btn btn-cta">
            Volver al inicio
          </Link>{' '}
          <Link to="/buscar" className="btn">
            Buscar
          </Link>
        </p>
      </EmptyState>
    </div>
  );
}
