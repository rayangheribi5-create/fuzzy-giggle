import { useState } from 'react';
import GoogleButton from './GoogleButton.jsx';
import { useApp } from '../store';

/* Petit écran de bienvenue, affiché une seule fois : le prénom de l'enfant.
   Tout est facultatif, et la connexion Google aussi. */
export default function Onboarding() {
  const { profile, auth, setChildName, setAuth, finishOnboarding, feedback } = useApp();
  const [name, setName] = useState(profile?.name || '');

  const start = (event) => {
    event.preventDefault();
    setChildName(name);
    finishOnboarding();
    feedback('soft');
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <div
        className="modal onboard"
        role="dialog"
        aria-modal="true"
        aria-label="Bienvenue dans AutiColor"
      >
        <div className="onboard-head">
          <span className="onboard-emoji" aria-hidden="true">
            🌈
          </span>
          <h2>Bienvenue dans AutiColor</h2>
          <p className="muted">
            Une seule petite question, puis c’est parti. Tu peux tout changer plus tard.
          </p>
        </div>

        <form className="stack" onSubmit={start}>
          <div className="field">
            <label className="field-label" htmlFor="onboard-name">
              Comment s’appelle l’enfant ?
            </label>
            <input
              id="onboard-name"
              className="input"
              value={name}
              maxLength={24}
              placeholder="Ex. : Léa"
              autoComplete="off"
              onChange={(event) => setName(event.target.value)}
            />
            <span className="tiny">
              Facultatif. Ce prénom reste sur cet appareil et s’affiche sur l’accueil.
            </span>
          </div>
          <button type="submit" className="btn btn-primary btn-lg btn-block">
            C’est parti ✨
          </button>
        </form>

        <div className="divider" />

        <p className="tiny" style={{ marginBottom: '0.5rem' }}>
          Un adulte peut aussi se connecter avec Google (facultatif, jamais obligatoire).
        </p>
        {auth ? (
          <p className="note-good">
            <span aria-hidden="true">✅</span>
            <span>Connecté avec Google : {auth.email || auth.name}</span>
          </p>
        ) : (
          <GoogleButton
            onProfile={(googleProfile) => {
              setAuth(googleProfile);
              if (!name && googleProfile.givenName) setName(googleProfile.givenName);
            }}
          />
        )}

        <button
          type="button"
          className="btn btn-ghost btn-block"
          style={{ marginTop: '0.8rem' }}
          onClick={() => {
            setChildName(name);
            finishOnboarding();
          }}
        >
          Plus tard
        </button>
      </div>
    </div>
  );
}
