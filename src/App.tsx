import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { AppShell } from './components/AppShell';
import { Home } from './pages/Home';
import { CategoryPage } from './pages/CategoryPage';
import { MoneyPage } from './pages/MoneyPage';
import { DetailPage } from './pages/DetailPage';
import { MapPage } from './pages/MapPage';
import { SearchPage } from './pages/SearchPage';
import { MyGamePage } from './pages/MyGamePage';
import { SourcesPage } from './pages/SourcesPage';
import { GalleryPage } from './pages/GalleryPage';
import { LegalPage } from './pages/LegalPage';
import { NotFound } from './pages/NotFound';
import { CATEGORY_META } from './data/meta';
import type { Category } from './data/schema';

const EditorPage = lazy(() => import('./pages/EditorPage').then((m) => ({ default: m.EditorPage })));

const LISTS: Category[] = ['lugares', 'personajes', 'armas', 'vehiculos', 'negocios', 'rutas'];

export function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mapa" element={<MapPage />} />
        <Route path="/dinero" element={<MoneyPage />} />
        {LISTS.map((c) => (
          <Route key={c} path={CATEGORY_META[c].path} element={<CategoryPage category={c} />} />
        ))}
        {(Object.keys(CATEGORY_META) as Category[]).map((c) => (
          <Route key={c + '-d'} path={`${CATEGORY_META[c].path}/:slug`} element={<DetailPage category={c} />} />
        ))}
        <Route path="/buscar" element={<SearchPage />} />
        <Route path="/mi-partida" element={<MyGamePage />} />
        <Route path="/fuentes" element={<SourcesPage />} />
        <Route path="/galeria" element={<GalleryPage />} />
        <Route
          path="/editor"
          element={
            <Suspense fallback={<p className="page muted">Cargando herramientas…</p>}>
              <EditorPage />
            </Suspense>
          }
        />
        <Route path="/legal" element={<LegalPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  );
}
