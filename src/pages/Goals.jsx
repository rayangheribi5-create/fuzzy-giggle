import { useState } from 'react';
import { Card, EmojiPicker, Modal, PageHeader, useConfirm } from '../components/UI';
import { useApp } from '../store';

const EMPTY_FORM = { emoji: '🎯', label: '' };

export default function Goals() {
  const { state, progress, addGoal, updateGoal, removeGoal, toggleGoal, feedback } = useApp();
  const { ask, dialog } = useConfirm();
  const [form, setForm] = useState(null);

  const save = (event) => {
    event.preventDefault();
    const label = (form.label || '').trim();
    if (!label) return;
    const payload = { emoji: form.emoji || '🎯', label };
    if (form.id) updateGoal(form.id, payload);
    else addGoal(payload);
    feedback('tap');
    setForm(null);
  };

  const percent = progress.totalGoals
    ? Math.round((progress.goalsDone / progress.totalGoals) * 100)
    : 0;

  return (
    <>
      <PageHeader emoji="🎯" title="Mes objectifs" subtitle="Mes petits buts à moi, sans comparaison" />

      <Card>
        <div className="row-between" style={{ marginBottom: '0.4rem' }}>
          <strong>
            {progress.goalsDone} sur {progress.totalGoals} objectifs atteints
          </strong>
          <span className="tiny">{percent}%</span>
        </div>
        <div className="bar">
          <span style={{ width: `${percent}%` }} />
        </div>
        <div className="row" style={{ marginTop: '0.9rem' }}>
          <button type="button" className="btn btn-primary" onClick={() => setForm({ ...EMPTY_FORM })}>
            ➕ Nouvel objectif
          </button>
          <a className="btn btn-ghost" href="#/progres">
            ⭐ Voir mes progrès
          </a>
        </div>
      </Card>

      <Card title="Mes objectifs" emoji="🎯">
        {state.goals.length === 0 ? (
          <p className="empty">
            Aucun objectif pour l’instant. Un objectif peut être tout simple : mettre mes chaussures,
            boire de l’eau, demander un câlin.
          </p>
        ) : (
          <ul className="task-list">
            {state.goals.map((goal) => (
              <li key={goal.id} className={`task ${goal.done ? 'done' : ''}`}>
                <button
                  type="button"
                  className="task-check"
                  onClick={() => {
                    toggleGoal(goal.id);
                    feedback(goal.done ? 'soft' : 'done');
                  }}
                  aria-pressed={goal.done}
                  aria-label={`${goal.done ? 'Décocher' : 'Marquer atteint'} ${goal.label}`}
                >
                  {goal.done ? '✅' : '⬜'}
                </button>
                <span className="task-main">
                  <span className="task-emoji" aria-hidden="true">
                    {goal.emoji}
                  </span>
                  <span className="task-label">{goal.label}</span>
                </span>
                <button
                  type="button"
                  className="btn btn-icon btn-ghost"
                  onClick={() => setForm({ id: goal.id, emoji: goal.emoji, label: goal.label })}
                  aria-label={`Modifier ${goal.label}`}
                >
                  ✏️
                </button>
                <button
                  type="button"
                  className="btn btn-icon btn-ghost"
                  onClick={() =>
                    ask(`L’objectif « ${goal.label} » sera supprimé.`, () => {
                      removeGoal(goal.id);
                      feedback('soft');
                    })
                  }
                  aria-label={`Supprimer ${goal.label}`}
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="note-good" style={{ marginTop: '0.9rem' }}>
          <span aria-hidden="true">🌻</span>
          <span>
            Un objectif non atteint n’est pas un échec. Tu peux le modifier, le mettre de côté ou le
            supprimer quand tu veux.
          </span>
        </p>
      </Card>

      <Modal
        open={Boolean(form)}
        title={form?.id ? 'Modifier l’objectif' : 'Nouvel objectif'}
        onClose={() => setForm(null)}
        actions={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setForm(null)}>
              Annuler
            </button>
            <button type="submit" form="goal-form" className="btn btn-primary">
              💾 Enregistrer
            </button>
          </>
        }
      >
        {form ? (
          <form id="goal-form" className="stack" onSubmit={save}>
            <label className="field">
              <span className="field-label">Mon objectif</span>
              <input
                className="input"
                value={form.label}
                onChange={(event) => setForm({ ...form, label: event.target.value })}
                placeholder="Exemple : Ranger mes chaussures"
                autoFocus
                required
              />
            </label>
            <EmojiPicker
              value={form.emoji}
              onChange={(emoji) => setForm({ ...form, emoji })}
              label="Choisir un emoji pour l’objectif"
            />
          </form>
        ) : null}
      </Modal>

      {dialog}
    </>
  );
}
