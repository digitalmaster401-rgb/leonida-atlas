import { media, MAP_MEDIA_ID } from '../data';
import { Gallery } from '../components/Gallery';
import { Seo } from '../components/Seo';
import { Icon } from '../components/Icon';

const GROUPS: { title: string; prefix: string[] }[] = [
  { title: 'Vice City', prefix: ['vc-'] },
  { title: 'Leonida Keys', prefix: ['keys-'] },
  { title: 'Grassrivers', prefix: ['gr-'] },
  { title: 'Port Gellhorn', prefix: ['pg-'] },
  { title: 'Ambrosia', prefix: ['amb-'] },
  { title: 'Mount Kalaga', prefix: ['mk-'] },
  { title: 'Personajes', prefix: ['p-', 'jl-'] },
  { title: 'Ultimate Edition y Vintage Vice City Pack', prefix: ['ue-', 'vv-'] },
];

export function GalleryPage() {
  return (
    <div className="page">
      <Seo title="Galería" description="Imágenes oficiales de GTA VI publicadas por Rockstar Games, con procedencia." />
      <header className="page-head">
        <h1>
          <Icon name="image" size={28} /> Galería
        </h1>
        <p className="lead">
          Capturas oficiales de Rockstar Games (sección de descargas y Launch Gallery). Toca una imagen para ampliarla, hacer zoom y ver su procedencia. © Rockstar Games.
        </p>
      </header>
      {GROUPS.map((g) => {
        const items = media.filter((m) => m.id !== MAP_MEDIA_ID && g.prefix.some((p) => m.id.startsWith(p)));
        return (
          <section key={g.title} className="section" aria-label={g.title}>
            <h2 className="section-title">{g.title}</h2>
            <Gallery items={items} label={`Galería: ${g.title}`} />
          </section>
        );
      })}
    </div>
  );
}
