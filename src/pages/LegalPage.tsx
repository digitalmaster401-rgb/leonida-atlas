import { Seo } from '../components/Seo';

export function LegalPage() {
  return (
    <div className="page prose">
      <Seo title="Aviso legal y créditos" description="Aviso legal, derechos de imágenes y privacidad de LEONIDA ATLAS." />
      <h1>Aviso legal y créditos</h1>
      <p>
        <strong>LEONIDA ATLAS es una guía independiente de fans. No tiene afiliación con Rockstar Games ni con Take-Two Interactive.</strong> Grand Theft Auto, GTA VI, Leonida, sus
        personajes, nombres, marcas y contenidos son de sus respectivos titulares.
      </p>
      <h2>Imágenes</h2>
      <p>
        Las capturas y el mapa provienen de las secciones oficiales de Rockstar Games (<a href="https://www.rockstargames.com/VI/media">/VI/media</a>,{' '}
        <a href="https://www.rockstargames.com/VI/launch-gallery">Launch Gallery</a> y <a href="https://www.rockstargames.com/VI/only-in-leonida">Only in Leonida</a>), que invitan a
        descargar y compartir su material. Se muestran sin recortes ni retoques, solo redimensionadas, sin fines comerciales y con atribución, conforme a la{' '}
        <a href="https://support.rockstargames.com/articles/7bNaeoMFTV0iUDGhStTXvz/policy-on-posting-copyrighted-rockstar-games-material">política de Rockstar sobre material con derechos</a>.
        LEONIDA ATLAS no reclama titularidad sobre ellas. Si Rockstar o Take-Two solicitan retirarlas, se retirarán.
      </p>
      <p>Las ilustraciones rotuladas «Ilustración editorial», el logotipo, los iconos y el diseño de la app son obra original de LEONIDA ATLAS.</p>
      <h2>Contenido</h2>
      <p>
        Los textos son redacción propia. Las descripciones oficiales se resumen o traducen y se citan. Los datos de guías de terceros se atribuyen a su fuente y se etiquetan como
        «reportados» o «contrastados».
      </p>
      <h2>Privacidad</h2>
      <p>
        No usamos cookies de rastreo, analítica ni publicidad. Tus favoritos, completados y notas se guardan solo en tu navegador (localStorage). No pedimos cuentas de Rockstar,
        PlayStation ni Xbox.
      </p>
      <h2>Tipografías</h2>
      <p>Barlow Condensed e Inter, bajo SIL Open Font License 1.1, alojadas en este mismo sitio.</p>
    </div>
  );
}
