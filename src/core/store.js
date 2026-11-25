// IndexedDB persistence: projects (autosaved), imported fonts, colour palettes.
import { createStore, get, set, del, values, keys } from 'idb-keyval';

const projects = createStore('midad-projects', 'projects');
const fonts = createStore('midad-fonts', 'fonts');
const misc = createStore('midad-misc', 'misc');

export const Store = {
  async saveProject(rec) { await set(rec.id, rec, projects); },
  async loadProject(id) { return get(id, projects); },
  async deleteProject(id) { await del(id, projects); },
  async listProjects() {
    const all = await values(projects);
    return all.map(({ id, name, updated, thumb }) => ({ id, name, updated, thumb })).sort((a, b) => b.updated - a.updated);
  },
  async saveFont(rec) { await set(rec.id, rec, fonts); },
  async deleteFont(id) { await del(id, fonts); },
  async listFonts() { return values(fonts); },
  async getMisc(k, def = null) { return (await get(k, misc)) ?? def; },
  async setMisc(k, v) { await set(k, v, misc); },
  async miscKeys() { return keys(misc); },
};

// Shared hand-off to the sibling «animation» program (same GitHub Pages origin).
const handoff = createStore('shaari-handoff', 'items');
export async function sendToAnimation(item) {
  const rec = { id: `midad-${Date.now()}`, from: 'midad', to: 'animation', created: Date.now(), ...item };
  await set(rec.id, rec, handoff);
  try { new BroadcastChannel('shaari-handoff').postMessage({ type: 'new', id: rec.id, from: 'midad' }); } catch { /* old browsers */ }
  return rec.id;
}
