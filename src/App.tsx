import { lazy, Suspense, type ReactNode } from 'react';
import { Route, Routes } from 'react-router';
import { AppShell } from './components/AppShell';
import { Home } from './pages/Home';
import { CategoryPage } from './pages/CategoryPage';
import { MoneyPage } from './pages/MoneyPage';
import { DetailPage } from './pages/DetailPage';
import { SearchPage } from './pages/SearchPage';
import { SourcesPage } from './pages/SourcesPage';
import { GalleryPage } from './pages/GalleryPage';
import { LegalPage } from './pages/LegalPage';
import { NotFound } from './pages/NotFound';
import { CATEGORY_META } from './data/meta';
import type { Category } from './data/schema';

const EditorPage = lazy(() => import('./pages/EditorPage').then((m) => ({ default: m.EditorPage })));

const MapPage = lazy(() => import('./pages/MapPage').then((m) => ({ default: m.MapPage })));
const MyGamePage = lazy(() => import('./pages/MyGamePage').then((m) => ({ default: m.MyGamePage })));
const NewsPage = lazy(() => import('./pages/NewsPage').then((m) => ({ default: m.NewsPage })));
const IntelPage = lazy(() => import('./pages/IntelPage').then((m) => ({ default: m.IntelPage })));
const CheatsPage = lazy(() => import('./pages/CheatsPage').then((m) => ({ default: m.CheatsPage })));
const CollectiblesPage = lazy(() => import('./pages/CollectiblesPage').then((m) => ({ default: m.CollectiblesPage })));
const ConsolePage = lazy(() => import('./pages/ConsolePage').then((m) => ({ default: m.ConsolePage })));
const VehicleComparePage = lazy(() => import('./pages/VehicleComparePage').then((m) => ({ default: m.VehicleComparePage })));
const RoutesPage = lazy(() => import('./pages/RoutesPage').then((m) => ({ default: m.RoutesPage })));
const LoadoutPage = lazy(() => import('./pages/LoadoutPage').then((m) => ({ default: m.LoadoutPage })));
const loading = <p className="page muted">Cargando…</p>;
const lazyEl = (el: ReactNode) => <Suspense fallback={loading}>{el}</Suspense>;

const LISTS: Category[] = ['lugares', 'personajes', 'armas', 'vehiculos', 'negocios', 'rutas'];

export function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explorar" element={<Home />} />
        <Route path="/mapa" element={lazyEl(<MapPage />)} />
        <Route path="/dinero" element={<MoneyPage />} />
        {LISTS.map((c) => (
          <Route key={c} path={CATEGORY_META[c].path} element={<CategoryPage category={c} />} />
        ))}
        {(Object.keys(CATEGORY_META) as Category[]).map((c) => (
          <Route key={c + '-d'} path={`${CATEGORY_META[c].path}/:slug`} element={<DetailPage category={c} />} />
        ))}
        <Route
          path="/intel"
          element={
            <Suspense fallback={loading}>
              <IntelPage />
            </Suspense>
          }
        />
        <Route
          path="/novedades"
          element={
            <Suspense fallback={loading}>
              <NewsPage />
            </Suspense>
          }
        />
        <Route path="/buscar" element={<SearchPage />} />
        <Route path="/coleccionables" element={lazyEl(<CollectiblesPage />)} />
        <Route path="/trucos" element={lazyEl(<CheatsPage />)} />
        <Route path="/consola" element={lazyEl(<ConsolePage />)} />
        <Route path="/equipamiento" element={lazyEl(<LoadoutPage />)} />
        <Route path="/mis-rutas" element={lazyEl(<RoutesPage />)} />
        <Route path="/comparar-vehiculos" element={lazyEl(<VehicleComparePage />)} />
        <Route path="/mi-espacio" element={lazyEl(<MyGamePage />)} />
        <Route path="/mi-partida" element={lazyEl(<MyGamePage />)} />
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
