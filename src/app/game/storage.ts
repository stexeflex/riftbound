// Signierter localStorage-Speicher.
// Kein echter Schutz gegen entschlossene Angreifer (der Code ist ja im Browser),
// aber ein einfaches Editieren der Werte in den DevTools macht den Save ungültig.

const SECRET = 'rb.7f3a.verankert.9x1k';

function checksum(str: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x1b873593;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = (Math.imul(h2, 31) + c) >>> 0;
  }
  return h1.toString(36) + '.' + h2.toString(36);
}

export function secureSave(key: string, data: unknown): void {
  try {
    const json = JSON.stringify(data);
    const payload = JSON.stringify({ d: data, s: checksum(json + SECRET) });
    localStorage.setItem(key, btoa(encodeURIComponent(payload)));
  } catch { /* localStorage nicht verfügbar */ }
}

export function secureLoad<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const payload = JSON.parse(decodeURIComponent(atob(raw)));
    if (typeof payload !== 'object' || payload === null) return null;
    const json = JSON.stringify(payload.d);
    if (checksum(json + SECRET) !== payload.s) return null; // manipuliert → verwerfen
    return payload.d as T;
  } catch {
    return null;
  }
}

export function secureRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch { /* ignorieren */ }
}

// Für die Migration alter, unsignierter Speicherstände
export function legacyLoad<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
