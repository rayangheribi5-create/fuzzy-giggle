import { useEffect, useState } from 'react';
import { Card, PageHeader, Toggle, useConfirm } from '../components/UI';
import GoogleButton from '../components/GoogleButton.jsx';
import { ACCENTS } from '../lib/constants';
import { clamp } from '../lib/utils';
import { useApp } from '../store';

const TEXT_STEPS = [
  { value: 0.9, label: 'Petit' },
  { value: 1, label: 'Normal' },
  { value: 1.15, label: 'Grand' },
  { value: 1.3, label: 'Très grand' },
  { value: 1.45, label: 'Maxi' },
];

export default function Settings() {
  const {
    settings,
    updateSettings,
    resetAll,
    state,
    storageError,
    feedback,
    profile,
    auth,
    setChildName,
    setAuth,
    signOut,
  } = useApp();
  const { ask, dialog } = useConfirm();
  const [nameDraft, setNameDraft] = useState(profile?.name || '');

  useEffect(() => {
    setNameDraft(profile?.name || '');
  }, [profile?.name]);

  const saveName = (event) => {
    event.preventDefault();
    setChildName(nameDraft);
    feedback('soft');
  };

  const changeAccent = (key) => {
    updateSettings({ accent: key });
    feedback('soft');
  };

  return (
    <>
      <PageHeader emoji="⚙️" title="Paramètres" subtitle="Tout est réglable, rien n’est imposé" />

      <Card title="Mon profil" emoji="👤">
        <p className="muted" style={{ marginBottom: '0.7rem' }}>
          Le prénom affiché sur l’accueil. Il reste uniquement sur cet appareil.
        </p>
        <form className="stack" onSubmit={saveName}>
          <div className="field">
            <label className="field-label" htmlFor="child-name">
              Prénom de l’enfant
            </label>
            <input
              id="child-name"
              className="input"
              value={nameDraft}
              maxLength={24}
              placeholder="Ex. : Léa"
              autoComplete="off"
              onChange={(event) => setNameDraft(event.target.value)}
            />
          </div>
          <div className="row">
            <button type="submit" className="btn btn-primary">
              💾 Enregistrer le prénom
            </button>
            {nameDraft !== (profile?.name || '') ? (
              <span className="tiny">Modification pas encore enregistrée</span>
            ) : null}
          </div>
        </form>

        <div className="divider" />

        <p className="muted" style={{ marginBottom: '0.5rem' }}>
          Connexion Google (facultatif)
        </p>
        {auth ? (
          <div className="profile-card">
            {auth.picture ? (
              <img className="avatar" src={auth.picture} alt="" referrerPolicy="no-referrer" />
            ) : (
              <span className="avatar avatar-emoji" aria-hidden="true">
                👤
              </span>
            )}
            <div style={{ minWidth: 0 }}>
              <strong>{auth.name || 'Compte Google'}</strong>
              <p className="tiny">{auth.email}</p>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                signOut();
                feedback('soft');
              }}
            >
              Se déconnecter
            </button>
          </div>
        ) : (
          <>
            <GoogleButton
              onProfile={(googleProfile) => {
                setAuth(googleProfile);
                feedback('soft');
              }}
            />
            <p className="tiny" style={{ marginTop: '0.5rem' }}>
              Aucun compte n’est nécessaire pour utiliser AutiColor. La connexion Google sert
              seulement à afficher ton prénom et ta photo ; les données de l’application restent
              sur cet appareil.
            </p>
          </>
        )}
      </Card>

      <Card title="Couleurs" emoji="🎨">
        <p className="muted" style={{ marginBottom: '0.7rem' }}>
          Choisis la couleur qui te fait du bien.
        </p>
        <div className="chip-grid">
          {Object.entries(ACCENTS).map(([key, accent]) => (
            <button
              key={key}
              type="button"
              className={`chip ${settings.accent === key ? 'selected' : ''}`}
              onClick={() => changeAccent(key)}
              aria-pressed={settings.accent === key}
              style={{ background: accent.soft, borderColor: settings.accent === key ? accent.main : 'transparent' }}
            >
              <span aria-hidden="true">{accent.emoji}</span>
              {accent.label}
            </button>
          ))}
        </div>
      </Card>

      <Card title="Taille du texte" emoji="🔠">
        <p className="muted" style={{ marginBottom: '0.5rem' }}>
          Le texte change tout de suite, partout dans l’application.
        </p>
        <input
          className="range"
          type="range"
          min="0.9"
          max="1.45"
          step="0.05"
          value={settings.textScale}
          onChange={(event) => updateSettings({ textScale: clamp(Number(event.target.value), 0.9, 1.45) })}
          aria-label="Taille du texte"
        />
        <div className="row-between">
          <span className="tiny">A</span>
          <strong style={{ fontSize: `${settings.textScale}rem` }}>Aa</strong>
          <span className="tiny" style={{ fontSize: '1.3rem' }}>
            A
          </span>
        </div>
        <div className="chip-grid" style={{ marginTop: '0.6rem' }}>
          {TEXT_STEPS.map((step) => (
            <button
              key={step.value}
              type="button"
              className={`chip ${Math.abs(settings.textScale - step.value) < 0.001 ? 'selected' : ''}`}
              onClick={() => updateSettings({ textScale: step.value })}
            >
              {step.label}
            </button>
          ))}
        </div>
      </Card>

      <Card title="Confort" emoji="🧸">
        <Toggle
          label="Sons"
          hint="Petits sons doux quand tu touches un bouton. Désactivés par défaut."
          checked={settings.sounds}
          onChange={(value) => {
            updateSettings({ sounds: value });
            if (value) feedback('soft');
          }}
        />
        <Toggle
          label="Mode calme"
          hint="Couleurs plus douces, animations réduites et sons coupés."
          checked={settings.calmMode}
          onChange={(value) => updateSettings({ calmMode: value })}
        />
        <Toggle
          label="Réduire les animations"
          hint="Presque plus de mouvement à l’écran."
          checked={settings.reduceMotion}
          onChange={(value) => updateSettings({ reduceMotion: value })}
        />
        <Toggle
          label="Grandes cartes de communication"
          hint="Pour montrer plus facilement ce dont tu as besoin."
          checked={settings.bigCards}
          onChange={(value) => updateSettings({ bigCards: value })}
        />
      </Card>

      <Card title="Mes routines et mes emojis" emoji="✏️">
        <p className="muted" style={{ marginBottom: '0.7rem' }}>
          Les routines, les activités, les cartes et les objectifs se modifient directement dans
          leur page. Tu peux choisir un emoji pour chaque élément.
        </p>
        <div className="row">
          <a className="btn btn-soft" href="#/programme">
            📅 Modifier mon programme
          </a>
          <a className="btn btn-soft" href="#/sommeil">
            🌙 Modifier mes routines
          </a>
          <a className="btn btn-soft" href="#/communication">
            💬 Modifier mes cartes
          </a>
          <a className="btn btn-soft" href="#/objectifs">
            🎯 Modifier mes objectifs
          </a>
        </div>
      </Card>

      <Card title="Mes données" emoji="🔒">
        <p className="muted">
          Tout est enregistré uniquement sur cet appareil (LocalStorage). Aucun compte
          obligatoire, aucune donnée médicale, et tes données d’application ne sont jamais
          envoyées sur internet.
        </p>
        <p className="tiny" style={{ marginTop: '0.4rem' }}>
          <a href="/confidentialite.html" target="_blank" rel="noreferrer">
            🔒 Lire la politique de confidentialité
          </a>
        </p>
        <div className="stat-grid" style={{ marginTop: '0.8rem' }}>
          <div className="stat">
            <div className="v">{state.schedule.length}</div>
            <div className="k">activités</div>
          </div>
          <div className="stat">
            <div className="v">{state.cards.length}</div>
            <div className="k">cartes</div>
          </div>
          <div className="stat">
            <div className="v">{state.emotions.length}</div>
            <div className="k">émotions notées</div>
          </div>
          <div className="stat">
            <div className="v">{state.achievements.length}</div>
            <div className="k">réussites</div>
          </div>
        </div>
        {storageError ? (
          <p className="note-good" style={{ marginTop: '0.8rem' }}>
            <span aria-hidden="true">⚠️</span>
            <span>
              Le stockage local est indisponible (navigation privée ?). L’application fonctionne,
              mais les changements risquent de ne pas être gardés.
            </span>
          </p>
        ) : null}
        <button
          type="button"
          className="btn btn-danger"
          style={{ marginTop: '0.9rem' }}
          onClick={() =>
            ask('Toutes tes données AutiColor sur cet appareil seront effacées et remises à zéro.', () => {
              resetAll();
              feedback('soft');
            })
          }
        >
          🗑️ Effacer mes données
        </button>
      </Card>

      <Card title="Installer l’application" emoji="📲">
        <p className="muted">
          Android / ordinateur : ouvre le menu du navigateur puis « Installer l’application ».
          <br />
          iPhone / iPad : bouton Partager puis « Sur l’écran d’accueil ».
        </p>
        <p className="tiny" style={{ marginTop: '0.5rem' }}>
          Une fois installée, AutiColor s’ouvre comme une application et fonctionne aussi sans
          internet.
        </p>
      </Card>

      <p className="center tiny">AutiColor 🌈 — fait avec douceur, pour toi.</p>

      {dialog}
    </>
  );
}
