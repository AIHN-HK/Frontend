import { useSyncExternalStore } from 'react';
export const appearanceKey = 'aihn.appearance.v1';
export const choices = {
  preset: ['blue', 'teal', 'warm', 'dark', 'ocean'],
  accent: ['teal', 'blue', 'indigo', 'violet', 'rose'],
  background: ['gradient', 'flat'],
  sidebar: ['light', 'tinted', 'contrast'],
} as const;
export type Appearance = {
  version: 1;
  preset: (typeof choices.preset)[number];
  accent: (typeof choices.accent)[number];
  background: (typeof choices.background)[number];
  sidebar: (typeof choices.sidebar)[number];
};
export const defaultAppearance: Appearance = {
  version: 1,
  preset: 'blue',
  accent: 'teal',
  background: 'gradient',
  sidebar: 'light',
};
export function parseAppearance(raw: string | null): Appearance {
  try {
    const data: unknown = JSON.parse(raw ?? 'null');
    if (!data || typeof data !== 'object' || !('version' in data) || data.version !== 1)
      return defaultAppearance;
    const record = data as Record<string, unknown>;
    if (
      Object.entries(choices).some(([key, allowed]) => !(allowed as readonly unknown[]).includes(record[key]))
    )
      return defaultAppearance;
    return {
      version: 1,
      preset: record.preset,
      accent: record.accent,
      background: record.background,
      sidebar: record.sidebar,
    } as Appearance;
  } catch {
    return defaultAppearance;
  }
}
function read() {
  try {
    return parseAppearance(localStorage.getItem(appearanceKey));
  } catch {
    return defaultAppearance;
  }
}
let snapshot = { value: read(), persisted: true };
const listeners = new Set<() => void>();
function notify() {
  for (const listener of listeners) listener();
}
export function setAppearance(value: Appearance) {
  const valid = parseAppearance(JSON.stringify(value));
  let persisted = true;
  try {
    localStorage.setItem(appearanceKey, JSON.stringify(valid));
  } catch {
    persisted = false;
  }
  snapshot = { value: valid, persisted };
  notify();
}
if (typeof window !== 'undefined')
  window.addEventListener('storage', (event) => {
    if (event.key === appearanceKey || event.key === null) {
      snapshot = { value: read(), persisted: true };
      notify();
    }
  });
export function useAppearance() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    () => snapshot,
  );
}
export function appearanceClass(value: Appearance) {
  return `student-theme theme-${value.preset} accent-${value.accent} background-${value.background} sidebar-${value.sidebar}`;
}
