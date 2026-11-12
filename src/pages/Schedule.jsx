import { useState } from 'react';
import { Card, EmojiPicker, Modal, PageHeader, useConfirm } from '../components/UI';
import { sortByTime } from '../lib/utils';
import { useApp } from '../store';

const EMPTY_FORM = { time: '12:00', emoji: '⭐', label: '' };

export default function Schedule() {
  const {
    state,
    progress,
    addActivity,
    updateActivity,
    removeActivity,
    toggleActivity,
    resetSchedule,
    feedback,
  } = useApp();
  const { ask, dialog } = useConfirm();
  const [form, setForm] = useState(null); // { id?, time, emoji, label }
  const tasks = sortByTime(state.schedule);

  const openNew = () => setForm({ ...EMPTY_FORM });
  const openEdit = (item) => setForm({ id: item.id, time: item.time, emoji: item.emoji, label: item.label });
  const closeForm = () => setForm(null);

  const save = (event) => {
    event.preventDefault();
    const label = (form.label || '').trim();
    if (!label) return;
    const payload = { time: form.time || '12:00', emoji: form.emoji || '⭐', label };
    if (form.id) updateActivity(form.id, payload);
    else addActivity(payload);
    feedback('tap');
    closeForm();
  };

  const confirmDelete = (item) => {
    ask(`« ${item.label} » sera retiré de ton programme.`, () => {
      removeActivity(item.id);
      feedback('soft');
    });
  };

  return (
    <>
      <PageHeader emoji="📅" title="Mon programme" subtitle="Ma journée, étape par étape" />

      <Card>
        <div className="row-between" style={{ marginBottom: '0.5rem' }}>
          <strong>
            Aujourd’hui : {progress.doneToday} sur {progress.totalToday} activités
          </strong>
          <span className="tiny">{progress.percentToday}%</span>
        </div>
        <div className="bar" role="progressbar" aria-valuenow={progress.percentToday} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: `${progress.percentToday}%` }} />
        </div>
        <div className="row" style={{ marginTop: '0.85rem' }}>
          <button type="button" className="btn btn-primary" onClick={openNew}>
            ➕ Ajouter une activité
          </button>
          <button type="button" className="btn btn-ghost" onClick={resetSchedule}>
            ♻️ Tout décocher
          </button>
        </div>
      </Card>

      <Card title="Ma journée" emoji="🌞">
        {tasks.length === 0 ? (
          <p className="empty">Ton programme est vide. Tu peux ajouter une activité quand tu veux 🙂</p>
        ) : (
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task.id} className={`task ${task.done ? 'done' : ''}`}>
                <button
                  type="button"
                  className="task-check"
                  onClick={() => {
                    toggleActivity(task.id);
                    feedback(task.done ? 'soft' : 'done');
                  }}
                  aria-pressed={task.done}
                  aria-label={`${task.done ? 'Décocher' : 'Cocher'} ${task.label}`}
                >
                  {task.done ? '✅' : '⬜'}
                </button>
                <span className="task-time">{task.time}</span>
                <span className="task-main">
                  <span className="task-emoji" aria-hidden="true">
                    {task.emoji}
                  </span>
                  <span className="task-label">{task.label}</span>
                </span>
                <button
                  type="button"
                  className="btn btn-icon btn-ghost"
                  onClick={() => openEdit(task)}
                  aria-label={`Modifier ${task.label}`}
                >
                  ✏️
                </button>
                <button
                  type="button"
                  className="btn btn-icon btn-ghost"
                  onClick={() => confirmDelete(task)}
                  aria-label={`Supprimer ${task.label}`}
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="note-good" style={{ marginTop: '0.9rem' }}>
          <span aria-hidden="true">💜</span>
          <span>
            Une activité non faite n’est jamais une faute. Ton programme peut changer, et c’est
            très bien.
          </span>
        </p>
      </Card>

      <Modal
        open={Boolean(form)}
        title={form?.id ? 'Modifier l’activité' : 'Nouvelle activité'}
        onClose={closeForm}
        actions={
          <>
            <button type="button" className="btn btn-ghost" onClick={closeForm}>
              Annuler
            </button>
            <button type="submit" form="activity-form" className="btn btn-primary">
              💾 Enregistrer
            </button>
          </>
        }
      >
        {form ? (
          <form id="activity-form" className="stack" onSubmit={save}>
            <label className="field">
              <span className="field-label">Nom de l’activité</span>
              <input
                className="input"
                value={form.label}
                onChange={(event) => setForm({ ...form, label: event.target.value })}
                placeholder="Exemple : Promenade"
                autoFocus
                required
              />
            </label>
            <label className="field">
              <span className="field-label">Heure</span>
              <input
                className="input"
                type="time"
                value={form.time}
                onChange={(event) => setForm({ ...form, time: event.target.value })}
              />
            </label>
            <EmojiPicker
              value={form.emoji}
              onChange={(emoji) => setForm({ ...form, emoji })}
              label="Choisir un emoji pour l’activité"
            />
            {form.id ? (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  confirmDelete(form);
                  closeForm();
                }}
              >
                🗑️ Supprimer cette activité
              </button>
            ) : null}
          </form>
        ) : null}
      </Modal>

      {dialog}
    </>
  );
}
