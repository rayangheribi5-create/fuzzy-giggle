import { TILES } from '../lib/constants';
import { frDate, frTime } from '../lib/utils';
import { useApp } from '../store';

export default function Dashboard({ installState }) {
  const { state, progress, settings } = useApp();
  const nextTasks = state.schedule.filter((task) => !task.done).slice(0, 3);
  const lastEmotion = state.emotions[0];
  const doneGoals = state.goals.filter((goal) => goal.done);

  return (
    <>
      <section className="hero">
        <span className="hero-blob" aria-hidden="true" />
        <span className="hero-blob small" aria-hidden="true" />
        <h1>Bonjour 🌈</h1>
        <p>
          {frDate()}. Ici, tout est à ton rythme. Tu peux choisir une carte ci-dessous, sans
          aucune obligation.
        </p>
        <div className="hero-badges">
          <span className="badge">📅 {progress.doneToday}/{progress.totalToday} activités</span>
          <span className="badge">⭐ {progress.wins} réussites</span>
          <span className="badge">🎯 {progress.goalsDone}/{progress.totalGoals} objectifs</span>
          {settings.calmMode ? <span className="badge">🧸 Mode calme activé</span> : null}
        </div>
      </section>

      <section className="tile-grid" aria-label="Les espaces de l'application">
        {TILES.map((tile) => (
          <a key={tile.path} className={`tile tone-${tile.tone}`} href={`#/${tile.path}`}>
            <span className="tile-emoji" aria-hidden="true">
              {tile.emoji}
            </span>
            <span className="tile-label">{tile.label}</span>
            <span className="tile-hint">{tile.hint}</span>
            {tile.path === 'programme' ? (
              <span className="tile-badge">
                {progress.doneToday}/{progress.totalToday} faits
              </span>
            ) : null}
            {tile.path === 'progres' ? (
              <span className="tile-badge">{progress.wins} réussites</span>
            ) : null}
            {tile.path === 'objectifs' ? (
              <span className="tile-badge">{progress.goalsDone}/{progress.totalGoals}</span>
            ) : null}
          </a>
        ))}
      </section>

      <div className="card">
        <div className="card-head">
          <h2 className="card-title">
            <span className="emoji" aria-hidden="true">
              🕒
            </span>
            La suite de ma journée
          </h2>
          <a className="btn btn-sm btn-soft" href="#/programme">
            Voir tout
          </a>
        </div>
        {nextTasks.length === 0 ? (
          <p className="note-good">
            <span aria-hidden="true">🎉</span>
            <span>
              Toutes les activités du jour sont cochées. Bravo pour aujourd’hui, et repose-toi
              bien 💜
            </span>
          </p>
        ) : (
          <ul className="task-list">
            {nextTasks.map((task) => (
              <li key={task.id} className="task">
                <span className="task-time">{task.time}</span>
                <span className="task-main">
                  <span className="task-emoji" aria-hidden="true">
                    {task.emoji}
                  </span>
                  <span className="task-label">{task.label}</span>
                </span>
                <a className="btn btn-sm btn-soft" href="#/programme">
                  Cocher
                </a>
              </li>
            ))}
          </ul>
        )}
        <p className="tiny" style={{ marginTop: '0.7rem' }}>
          Si une activité n’est pas faite, ce n’est pas grave. On ne perd jamais de points ici 💜
        </p>
      </div>

      <div className="card">
        <div className="card-head">
          <h2 className="card-title">
            <span className="emoji" aria-hidden="true">
              😊
            </span>
            Comment je me sens ?
          </h2>
          <a className="btn btn-sm btn-soft" href="#/emotions">
            Choisir
          </a>
        </div>
        {lastEmotion ? (
          <div className="row" style={{ gap: '0.7rem' }}>
            <span style={{ fontSize: '2.2rem' }} aria-hidden="true">
              {lastEmotion.emoji}
            </span>
            <div>
              <strong>{lastEmotion.label}</strong>
              <p className="tiny">Noté le {frTime(lastEmotion.at)}</p>
            </div>
          </div>
        ) : (
          <p className="muted">Tu n’as pas encore choisi d’émotion aujourd’hui. C’est comme tu veux 🙂</p>
        )}
        <div className="divider" />
        <div className="row">
          <a className="btn btn-soft" href="#/communication">
            💬 Montrer une carte
          </a>
          <a className="btn btn-soft" href="#/calme">
            🧸 Prendre une pause
          </a>
        </div>
      </div>

      {doneGoals.length > 0 ? (
        <div className="note-good">
          <span aria-hidden="true">🌟</span>
          <span>
            Objectif réussi : <strong>{doneGoals[0].label}</strong>. Chaque petit pas compte !
          </span>
        </div>
      ) : null}

      <div className="card">
        <div className="card-head">
          <h2 className="card-title">
            <span className="emoji" aria-hidden="true">
              📲
            </span>
            Installer AutiColor
          </h2>
        </div>
        <p className="muted">
          Tu peux ajouter AutiColor sur ton téléphone ou ta tablette pour l’ouvrir comme une
          application, même sans internet.
        </p>
        <div className="row" style={{ marginTop: '0.7rem' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => installState?.install?.()}
            disabled={!installState?.canInstall}
          >
            ⬇️ Installer l’application
          </button>
          <span className="tiny">
            {installState?.installed
              ? 'AutiColor est déjà installé ✅'
              : 'Sur iPhone : Partager → « Sur l’écran d’accueil ».'}
          </span>
        </div>
      </div>

      <p className="center tiny">
        AutiColor ne demande pas de compte et n’envoie rien sur internet. Tout reste sur ton
        appareil 🔒
      </p>
    </>
  );
}
