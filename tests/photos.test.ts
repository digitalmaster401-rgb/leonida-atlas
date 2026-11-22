// @vitest-environment node
import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { addPhoto, clearPhotos, deletePhoto, exportPhotos, importPhotos, listPhotos, updateCaption } from '../src/lib/photos';

const img = (type = 'image/png') => new Blob([new Uint8Array([137, 80, 78, 71, 1, 2, 3])], { type });

describe('fotos personales (IndexedDB)', () => {
  beforeEach(async () => clearPhotos());

  it('guarda, lista por ficha, edita y borra', async () => {
    const a = await addPhoto(img(), 'col-orca', 'Mesa de Jason');
    await addPhoto(img('image/jpeg'), null);
    expect((await listPhotos()).length).toBe(2);
    expect((await listPhotos('col-orca')).map((p) => p.caption)).toEqual(['Mesa de Jason']);
    await updateCaption(a.id, 'Nueva');
    expect((await listPhotos('col-orca'))[0].caption).toBe('Nueva');
    await deletePhoto(a.id);
    expect((await listPhotos('col-orca')).length).toBe(0);
  });

  it('rechaza formatos que no son imagen', async () => {
    await expect(addPhoto(new Blob(['<svg/>'], { type: 'image/svg+xml' }), null)).rejects.toThrow(/Formato no admitido/);
  });

  it('exporta como data URL e importa sin duplicar', async () => {
    await addPhoto(img(), 'col-orca', 'x');
    const exp = await exportPhotos();
    expect(exp[0].dataUrl).toMatch(/^data:image\/png;base64,/);
    expect(await importPhotos(exp)).toBe(0);
    await clearPhotos();
    expect(await importPhotos(exp)).toBe(1);
    expect((await listPhotos())[0].blob.size).toBe(7);
  });
});
