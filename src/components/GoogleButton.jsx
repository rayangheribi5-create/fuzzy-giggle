import { useEffect, useRef, useState } from 'react';
import { getGoogleClientId, loadGoogleScript, readGoogleProfile } from '../lib/google';

/* Bouton officiel « Se connecter avec Google ».
   - Si aucune clé OAuth n'est configurée, on l'explique clairement (aucun faux bouton).
   - Aucune donnée de l'application n'est transmise : seul le profil (prénom, photo)
     est gardé localement pour personnaliser l'affichage. */
export default function GoogleButton({ onProfile }) {
  const holder = useRef(null);
  const callbackRef = useRef(onProfile);
  const [status, setStatus] = useState('loading'); // loading | ready | unconfigured | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    callbackRef.current = onProfile;
  }, [onProfile]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const clientId = await getGoogleClientId();
      if (cancelled) return;
      if (!clientId) {
        setStatus('unconfigured');
        return;
      }

      try {
        await loadGoogleScript();
        if (cancelled) return;
        const google = window.google;
        if (!google?.accounts?.id) throw new Error('script Google indisponible');

        google.accounts.id.initialize({
          client_id: clientId,
          ux_mode: 'popup',
          auto_select: false,
          cancel_on_tap_outside: true,
          callback: (response) => {
            const profile = readGoogleProfile(response?.credential);
            if (profile) {
              setMessage('');
              callbackRef.current?.(profile);
            } else {
              setMessage('Google a répondu sans profil lisible. Tu peux réessayer.');
            }
          },
        });

        if (holder.current) {
          holder.current.innerHTML = '';
          google.accounts.id.renderButton(holder.current, {
            theme: 'outline',
            size: 'large',
            shape: 'pill',
            text: 'signin_with',
            locale: 'fr',
            width: 280,
          });
        }
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === 'unconfigured') {
    return (
      <p className="tiny google-note">
        La connexion Google n’est pas encore activée sur cette installation. Un adulte peut
        l’activer en ajoutant la clé <code>GOOGLE_CLIENT_ID</code> dans les réglages de
        l’application. Tout le reste fonctionne sans compte 🙂
      </p>
    );
  }

  if (status === 'error') {
    return (
      <p className="tiny google-note">
        La connexion Google n’a pas pu se charger (internet coupé ou navigateur qui bloque). Tu
        peux continuer sans : l’application fonctionne entièrement sans compte.
      </p>
    );
  }

  return (
    <div className="google-slot">
      <div ref={holder} />
      {status === 'loading' ? <span className="tiny">Chargement de la connexion Google…</span> : null}
      {message ? <p className="tiny">{message}</p> : null}
    </div>
  );
}
