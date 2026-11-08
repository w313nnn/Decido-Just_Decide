// Keep account data separate. Never assign old shared history to a new account.
let owner = 'guest';
const memory = new Map<string, string>();
export function setStorageOwner(uid?: string) { owner = uid || 'guest'; }
export function readStored<T>(name: string, fallback: T): T {
  const key = `decido:${owner}:${name}`;
  try {
    const raw = memory.get(key) ?? localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    try { return JSON.parse(memory.get(key) || 'null') ?? fallback; } catch { return fallback; }
  }
}
export function writeStored(name: string, value: unknown) {
  const key = `decido:${owner}:${name}`;
  const raw = JSON.stringify(value);
  memory.set(key, raw);
  try { localStorage.setItem(key, raw); memory.delete(key); } catch {
    window.dispatchEvent(new CustomEvent('decido-storage-warning'));
  }
}
