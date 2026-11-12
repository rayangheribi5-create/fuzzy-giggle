import { useState } from 'react';
import { Card, PageHeader, useConfirm } from '../components/UI';
import { frShortDate, frTime, monthGrid, todayKey } from '../lib/utils';
import { useApp } from '../store';

export default function Progress() {
  const { state, progress, addAchievement, removeAchievement, toggleRoutineDay, feedback } = useApp();
  const { ask, dialog } = useConfirm();
  const [winLabel, setWinLabel] = useState('');
  const [winEmoji, setWinEmoji] = useState('🌟');
  const [monthOffset, setMonthOffset] = useState(0);

  const reference = new Date();
  reference.setMonth(reference.getMonth() + monthOffset);
  reference.setDate(1);
  const cells = monthGrid(reference);
  const monthLabel = reference.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const today = todayKey();

  const addWin = (event) => {
    event.preventDefault();
    const label = winLabel.trim();
    if (!label) return;
    addAchievement({ emoji: winEmoji || '🌟', label });
    setWinLabel('');
    feedback('done');
  };

  const doneToday = state.schedule.filter((task) => task.done);
  const doneGoals = state.goals.filter((goal) => goal.done);

  return (
    <>
      <PageHeader emoji="⭐" title="Mes progrès" subtitle="Mes réussites, à mon rythme" />

      <Card>
        <div className="stat-grid">
          <div className="stat">
            <div className="v">{progress.doneToday}</div>
            <div className="k">activités faites aujourd’hui</div>
          </div>
          <div className="stat">
            <div className="v">{progress.wins}</div>
            <div className="k">petites réussites</div>
          </div>
          <div className="stat">
            <div className="v">{progress.goalsDone}</div>
            <div className="k">objectifs atteints</div>
          </div>
          <div className="stat">
            <div className="v">{progress.routineCount}</div>
            <div className="k">jours de routine</div>
          </div>
        </div>
        <div style={{ marginTop: '0.9rem' }}>
          <div className="row-between" style={{ marginBottom: '0.35rem' }}>
            <span className="tiny">Ma journée</span>
            <span className="tiny">{progress.percentToday}%</span>
          </div>
          <div className="bar">
            <span style={{ width: `${progress.percentToday}%` }} />
          </div>
        </div>
        <p className="note-good" style={{ marginTop: '0.9rem' }}>
          <span aria-hidden="true">🌱</span>
          <span>
            Ici, il n’y a pas de score à battre. Chaque petit pas compte, et les jours sans rien
            sont permis.
          </span>
        </p>
      </Card>

      <Card title="Calendrier de mes routines" emoji="🗓️">
        <div className="row-between" style={{ marginBottom: '0.6rem' }}>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => setMonthOffset((prev) => prev - 1)}
            aria-label="Mois précédent"
          >
            ⬅️
          </button>
          <strong style={{ textTransform: 'capitalize' }}>{monthLabel}</strong>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => setMonthOffset((prev) => prev + 1)}
            aria-label="Mois suivant"
          >
            ➡️
          </button>
        </div>
        <div className="calendar" role="grid" aria-label={`Calendrier ${monthLabel}`}>
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
            <div key={`${day}-${index}`} className="calendar-head">
              {day}
            </div>
          ))}
          {cells.map((cell) => {
            const marked = Boolean(state.routineDays[cell.key]);
            return (
              <button
                key={cell.key}
                type="button"
                className={`calendar-day ${cell.inMonth ? '' : 'out'} ${cell.key === today ? 'today' : ''} ${
                  marked ? 'marked' : ''
                }`}
                onClick={() => {
                  toggleRoutineDay(cell.key);
                  feedback('soft');
                }}
                aria-pressed={marked}
                aria-label={`${frShortDate(cell.key)} ${marked ? 'routine faite' : 'sans routine notée'}`}
              >
                <span>{cell.dayNumber}</span>
                {marked ? <span className="dot" aria-hidden="true" /> : null}
              </button>
            );
          })}
        </div>
        <p className="tiny" style={{ marginTop: '0.6rem' }}>
          Touche un jour pour noter une routine faite (ou pour l’enlever). Aucun jour n’est
          obligatoire.
        </p>
      </Card>

      <Card title="Mes petites réussites" emoji="🌟">
        <form className="row" onSubmit={addWin} style={{ marginBottom: '0.8rem' }}>
          <input
            className="input"
            style={{ maxWidth: '5rem', textAlign: 'center', fontSize: '1.2rem' }}
            value={winEmoji}
            onChange={(event) => setWinEmoji(event.target.value.slice(0, 4))}
            aria-label="Emoji de la réussite"
          />
          <input
            className="input"
            style={{ flex: 1, minWidth: '9rem' }}
            value={winLabel}
            onChange={(event) => setWinLabel(event.target.value)}
            placeholder="Exemple : J’ai demandé de l’aide"
            aria-label="Décrire une réussite"
          />
          <button type="submit" className="btn btn-primary">
            ➕ Ajouter
          </button>
        </form>
        {state.achievements.length === 0 ? (
          <p className="empty">
            Aucune réussite notée pour le moment. Une réussite peut être toute petite : boire de
            l’eau, demander une pause, sourire…
          </p>
        ) : (
          <ul className="task-list">
            {state.achievements.map((win) => (
              <li key={win.id} className="task">
                <span style={{ fontSize: '1.5rem' }} aria-hidden="true">
                  {win.emoji}
                </span>
                <span className="task-main" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 0 }}>
                  <strong style={{ fontSize: '0.95rem' }}>{win.label}</strong>
                  <span className="tiny">{frTime(win.at)}</span>
                </span>
                <button
                  type="button"
                  className="btn btn-icon btn-ghost"
                  onClick={() =>
                    ask('Cette réussite sera retirée de la liste.', () => {
                      removeAchievement(win.id);
                      feedback('soft');
                    })
                  }
                  aria-label="Supprimer cette réussite"
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Aujourd’hui en un coup d’œil" emoji="🔎">
        <p className="tiny" style={{ marginBottom: '0.5rem' }}>
          Activités terminées ({doneToday.length}/{state.schedule.length})
        </p>
        {doneToday.length === 0 ? (
          <p className="muted">Rien de coché pour l’instant. C’est parfaitement okay 🙂</p>
        ) : (
          <div className="chip-grid">
            {doneToday.map((task) => (
              <span key={task.id} className="chip selected">
                <span aria-hidden="true">{task.emoji}</span>
                {task.label}
              </span>
            ))}
          </div>
        )}
        <div className="divider" />
        <p className="tiny" style={{ marginBottom: '0.5rem' }}>
          Objectifs atteints ({doneGoals.length}/{state.goals.length})
        </p>
        {doneGoals.length === 0 ? (
          <p className="muted">Aucun objectif atteint pour l’instant. Ils viendront quand ils viendront 💜</p>
        ) : (
          <div className="chip-grid">
            {doneGoals.map((goal) => (
              <span key={goal.id} className="chip selected">
                <span aria-hidden="true">{goal.emoji}</span>
                {goal.label}
              </span>
            ))}
          </div>
        )}
      </Card>

      {dialog}
    </>
  );
}
