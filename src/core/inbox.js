// Shared inbox between Ali's five apps (same origin shaari01.github.io):
// IndexedDB 'shared-media-inbox' / store 'items' (keyPath 'id').
// Item: {id, name, type:'image'|'video'|'audio'|'anim', mime, blob, created, from, to?, svg?}
const DB = 'shared-media-inbox';
const STORE = 'items';

function open() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains(STORE)) r.result.createObjectStore(STORE, { keyPath: 'id' }); };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
const p = (r) => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });

export const APPS = { suwar: 'برنامج الصور', haraka: 'برنامج الصور المتحركة', mashhad: 'برنامج الفيديو', sada: 'برنامج الصوت', midad: 'برنامج الخط' };

export async function listInbox() {
  try {
    const db = await open();
    const items = await p(db.transaction(STORE).objectStore(STORE).getAll());
    db.close();
    return items.filter((i) => i.from !== 'midad' && (!i.to || i.to === 'midad') && (i.type === 'image' || i.svg || /^image\//.test(i.mime || '')))
      .sort((a, b) => (b.created || 0) - (a.created || 0));
  } catch { return []; }
}
export async function removeInbox(id) {
  const db = await open();
  await p(db.transaction(STORE, 'readwrite').objectStore(STORE).delete(id));
  db.close();
}
export async function putInbox(item) {
  const db = await open();
  await p(db.transaction(STORE, 'readwrite').objectStore(STORE).put(item));
  db.close();
  try { const bc = new BroadcastChannel(DB); bc.postMessage({ type: 'new-item', id: item.id }); bc.close(); } catch { /* old browsers */ }
}
/** Send a design: PNG blob for every app, plus the SVG text for vector-aware ones. */
export async function sendToApp(to, { name, png, svg, width, height }) {
  const id = 'midad_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  await putInbox({ id, name, type: 'image', mime: 'image/png', blob: png, svg, width, height, created: Date.now(), from: 'midad', to });
  return id;
}
