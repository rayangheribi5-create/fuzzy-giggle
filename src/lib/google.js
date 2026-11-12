/* Connexion Google — facultative.
 *
 * Le bouton officiel Google n'apparaît que si un identifiant OAuth est configuré
 * côté serveur (variable d'environnement GOOGLE_CLIENT_ID, exposée par /api/config).
 * Aucune donnée de l'application n'est envoyée : le profil Google sert uniquement
 * à afficher le prénom et la photo sur cet appareil (LocalStorage).
 */

const SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

let configPromise = null;
let scriptPromise = null;

export async function getGoogleClientId() {
  if (!configPromise) {
    configPromise = fetch('/api/config', { headers: { Accept: 'application/json' } })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        const id = data && typeof data.googleClientId === 'string' ? data.googleClientId.trim() : '';
        return id || null;
      })
      .catch(() => null);
  }
  return configPromise;
}

export function loadGoogleScript() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new Error('environnement sans navigateur'));
  }
  if (window.google?.accounts?.id) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    const script = existing || document.createElement('script');
    const timer = window.setTimeout(() => reject(new Error('délai dépassé')), 12000);

    script.addEventListener(
      'load',
      () => {
        window.clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
    script.addEventListener(
      'error',
      () => {
        window.clearTimeout(timer);
        reject(new Error('script Google indisponible'));
      },
      { once: true },
    );

    if (!existing) {
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  });

  scriptPromise.catch(() => {
    scriptPromise = null;
  });

  return scriptPromise;
}

export function decodeJwtPayload(token) {
  try {
    const part = String(token || '').split('.')[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    let percent = '';
    for (let i = 0; i < binary.length; i += 1) {
      percent += `%${binary.charCodeAt(i).toString(16).padStart(2, '0')}`;
    }
    return JSON.parse(decodeURIComponent(percent));
  } catch {
    return null;
  }
}

export function readGoogleProfile(credential) {
  const payload = decodeJwtPayload(credential);
  if (!payload || !payload.sub) return null;
  return {
    sub: String(payload.sub),
    name: typeof payload.name === 'string' ? payload.name : '',
    givenName: typeof payload.given_name === 'string' ? payload.given_name : '',
    email: typeof payload.email === 'string' ? payload.email : '',
    picture: typeof payload.picture === 'string' ? payload.picture : '',
    emailVerified: Boolean(payload.email_verified),
  };
}
