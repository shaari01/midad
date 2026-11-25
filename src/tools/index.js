// Tool registry. Each phase adds its tools here.
import { SelectTool, PanTool } from './select.js';
import { TextTool, KashidaTool } from './text.js';

export const TOOLS = {
  select: SelectTool,
  pan: PanTool,
  text: TextTool,
  kashida: KashidaTool,
};

// Toolbar entries in display order. `mobile` = shown in the phone bottom bar.
export const TOOLBAR = [
  { id: 'select', icon: 'select', label: 'تحديد', mobile: true, key: 'v' },
  { id: 'text', icon: 'text', label: 'كتابة', mobile: true, key: 't' },
  { id: 'kashida', icon: 'kashida', label: 'تطويل', mobile: true, key: 'k' },
  { id: 'pan', icon: 'pan', label: 'تحريك اللوحة', mobile: false, key: 'h' },
];

export function registerTool(tool, entry, after = null) {
  TOOLS[tool.id] = tool;
  if (!entry) return;
  const i = after ? TOOLBAR.findIndex((t) => t.id === after) : -1;
  if (i >= 0) TOOLBAR.splice(i + 1, 0, entry); else TOOLBAR.push(entry);
}
