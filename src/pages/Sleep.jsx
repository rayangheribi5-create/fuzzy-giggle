import { useEffect, useMemo, useState } from 'react';
import { Card, EmojiPicker, Modal, PageHeader, useConfirm } from '../components/UI';
import { useApp } from '../store';

const EMPTY_STEP = { emoji: '🌙', label: '' };

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

function minutesOf(time) {
  const [hours, minutes] = String(time || '00:00').split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export default function Sleep() {
  const { state, updateSleep, addSleepStep, updateSleepStep, removeSleepStep, feedback } = useApp();
  const { ask, dialog } = useConfirm();
  const [form, setForm] = useState(null); // { kind, id?, emoji, label }
  const [notifyStatus, setNotifyStatus] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported',
  );
  const now = useClock();
  const sleep = state.sleep;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const bedDiff = minutesOf(sleep.bedTime) - currentMinutes;
  const wakeDiff = minutesOf(sleep.wakeTime) - currentMinutes;

  const inAppReminder = useMemo(() => {
    if (!sleep.reminders) return null;
    if (bedDiff > 0 && bedDiff <= 20) return `Bientôt l’heure du coucher (${sleep.bedTime}) 🌙`;
    if (wakeDiff > 0 && wakeDiff <= 20) return `Bientôt l’heure du réveil (${sleep.wakeTime}) 🌞`;
    return null;
  }, [sleep.reminders, sleep.bedTime, sleep.wakeTime, bedDiff, wakeDiff]);

  useEffect(() => {
    if (!sleep.reminders || notifyStatus !== 'granted') return;
    if (!inAppReminder) return;
    try {
      new Notification('AutiColor', { body: inAppReminder, icon: '/icons/icon-192.png' });
    } catch {
      // pas de notification : le rappel reste visible dans la page
    }
    // on ne notifie qu'au moment où le rappel apparaît
  }, [inAppReminder, sleep.reminders, notifyStatus]);

  const toggleReminders = async () => {
    const next = !sleep.reminders;
    if (next && typeof Notification !== 'undefined' && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        setNotifyStatus(permission);
      } catch {
        setNotifyStatus('unsupported');
      }
    }
    updateSleep({ reminders: next });
    feedback('soft');
  };

  const saveStep = (event) => {
    event.preventDefault();
    const label = (form.label || '').trim();
    if (!label) return;
    const payload = { emoji: form.emoji || '🌙', label };
    if (form.id) updateSleepStep(form.kind, form.id, payload);
    else addSleepStep(form.kind, payload);
    feedback('tap');
    setForm(null);
  };

  const routineBlock = (kind, title, emoji, hint) => (
    <Card
      title={title}
      emoji={emoji}
      action={
        <button type="button" className="btn btn-sm btn-soft" onClick={() => setForm({ kind, ...EMPTY_STEP })}>
          ➕ Étape
        </button>
      }
    >
      <p className="tiny" style={{ marginBottom: '0.6rem' }}>
        {hint}
      </p>
      {(sleep[kind] || []).length === 0 ? (
        <p className="empty">Aucune étape pour l’instant.</p>
      ) : (
        <ul className="task-list">
          {(sleep[kind] || []).map((step, index) => (
            <li key={step.id} className="task">
              <span className="task-time">{index + 1}</span>
              <span className="task-main">
                <span className="task-emoji" aria-hidden="true">
                  {step.emoji}
                </span>
                <span className="task-label">{step.label}</span>
              </span>
              <button
                type="button"
                className="btn btn-icon btn-ghost"
                onClick={() => setForm({ kind, id: step.id, emoji: step.emoji, label: step.label })}
                aria-label={`Modifier ${step.label}`}
              >
                ✏️
              </button>
              <button
                type="button"
                className="btn btn-icon btn-ghost"
                onClick={() =>
                  ask(`L’étape « ${step.label} » sera supprimée.`, () => {
                    removeSleepStep(kind, step.id);
                    feedback('soft');
                  })
                }
                aria-label={`Supprimer ${step.label}`}
              >
                🗑️
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );

  return (
    <>
      <PageHeader emoji="🌙" title="Mon sommeil" subtitle="Ma routine du soir et du matin" />

      <Card>
        <div className="row" style={{ gap: '0.8rem' }}>
          <label className="field" style={{ flex: 1, minWidth: '9rem' }}>
            <span className="field-label">🌙 Heure du coucher</span>
            <input
              className="input"
              type="time"
              value={sleep.bedTime}
              onChange={(event) => updateSleep({ bedTime: event.target.value })}
            />
          </label>
          <label className="field" style={{ flex: 1, minWidth: '9rem' }}>
            <span className="field-label">🌞 Heure du réveil</span>
            <input
              className="input"
              type="time"
              value={sleep.wakeTime}
              onChange={(event) => updateSleep({ wakeTime: event.target.value })}
            />
          </label>
        </div>

        <div className="switch-row" style={{ marginTop: '0.7rem' }}>
          <span className="switch-text">
            <strong>Rappels facultatifs</strong>
            <span className="tiny">
              Un petit rappel 20 minutes avant, dans l’application (et en notification si tu
              l’acceptes).
            </span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={sleep.reminders}
            aria-label="Rappels facultatifs"
            className={`switch ${sleep.reminders ? 'on' : ''}`}
            onClick={toggleReminders}
          />
        </div>

        {sleep.reminders ? (
          <p className="note-good" style={{ marginTop: '0.7rem' }}>
            <span aria-hidden="true">🔔</span>
            <span>
              Rappels activés. {notifyStatus === 'denied'
                ? 'Les notifications sont bloquées par le navigateur, mais le rappel reste visible dans la page.'
                : notifyStatus === 'granted'
                  ? 'Les notifications sont autorisées.'
                  : 'Le rappel s’affiche dans l’application.'}
            </span>
          </p>
        ) : null}

        {inAppReminder ? (
          <p className="note-good" style={{ marginTop: '0.7rem' }}>
            <span aria-hidden="true">⏰</span>
            <span>{inAppReminder}</span>
          </p>
        ) : null}
      </Card>

      {routineBlock(
        'bedRoutine',
        'Routine du coucher',
        '🌙',
        'Des étapes calmes, dans l’ordre que tu préfères. Tu peux en ajouter, en modifier ou en supprimer.',
      )}

      {routineBlock(
        'wakeRoutine',
        'Routine du réveil',
        '🌞',
        'Pour commencer la journée en douceur, sans se presser.',
      )}

      <p className="note-good">
        <span aria-hidden="true">🛏️</span>
        <span>
          Le sommeil change d’un jour à l’autre. Si une routine n’est pas suivie, ce n’est pas
          grave du tout.
        </span>
      </p>

      <Modal
        open={Boolean(form)}
        title={form?.id ? 'Modifier l’étape' : 'Nouvelle étape'}
        onClose={() => setForm(null)}
        actions={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setForm(null)}>
              Annuler
            </button>
            <button type="submit" form="sleep-form" className="btn btn-primary">
              💾 Enregistrer
            </button>
          </>
        }
      >
        {form ? (
          <form id="sleep-form" className="stack" onSubmit={saveStep}>
            <label className="field">
              <span className="field-label">Nom de l’étape</span>
              <input
                className="input"
                value={form.label}
                onChange={(event) => setForm({ ...form, label: event.target.value })}
                placeholder="Exemple : Écouter une histoire"
                autoFocus
                required
              />
            </label>
            <EmojiPicker
              value={form.emoji}
              onChange={(emoji) => setForm({ ...form, emoji })}
              label="Choisir un emoji pour l’étape"
            />
          </form>
        ) : null}
      </Modal>

      {dialog}
    </>
  );
}
