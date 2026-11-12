import { useState } from 'react';
import { Card, PageHeader, useConfirm } from '../components/UI';
import { EMOTIONS, NEEDS } from '../lib/constants';
import { frTime } from '../lib/utils';
import { useApp } from '../store';

export default function Emotions() {
  const { state, addEmotion, removeEmotion, feedback, say } = useApp();
  const { ask, dialog } = useConfirm();
  const [selected, setSelected] = useState(null);
  const [needs, setNeeds] = useState([]);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  const toggleNeed = (need) => {
    setNeeds((prev) => (prev.includes(need) ? prev.filter((item) => item !== need) : [...prev, need]));
    feedback('soft');
  };

  const save = () => {
    if (!selected) return;
    const emotion = EMOTIONS.find((item) => item.id === selected);
    const needLabels = NEEDS.filter((need) => needs.includes(need.id)).map((need) => need.label);
    addEmotion({
      emoji: emotion.emoji,
      label: emotion.label,
      needs: needLabels,
      note: note.trim(),
    });
    setSaved(true);
    setSelected(null);
    setNeeds([]);
    setNote('');
    feedback('done');
    if (say) say(`Merci d'avoir partagé. Tu te sens ${emotion.label.toLowerCase()}.`);
  };

  return (
    <>
      <PageHeader emoji="😊" title="Mes émotions" subtitle="Comment je me sens maintenant ?" />

      <Card>
        <p className="muted" style={{ marginBottom: '0.8rem' }}>
          Choisis l’image qui ressemble le plus à ce que tu ressens. Il n’y a pas de bonne ou de
          mauvaise réponse.
        </p>
        <div className="emotion-grid" role="group" aria-label="Choisir une émotion">
          {EMOTIONS.map((emotion) => (
            <button
              key={emotion.id}
              type="button"
              className={`emotion-btn ${selected === emotion.id ? 'selected' : ''}`}
              onClick={() => {
                setSelected(emotion.id);
                setSaved(false);
                feedback('soft');
              }}
              aria-pressed={selected === emotion.id}
            >
              <span className="e" aria-hidden="true">
                {emotion.emoji}
              </span>
              {emotion.label}
            </button>
          ))}
        </div>
      </Card>

      {selected ? (
        <Card title="De quoi ai-je besoin ?" emoji="🫶">
          <p className="muted" style={{ marginBottom: '0.7rem' }}>
            Tu peux en choisir plusieurs, ou aucun.
          </p>
          <div className="chip-grid">
            {NEEDS.map((need) => (
              <button
                key={need.id}
                type="button"
                className={`chip ${needs.includes(need.id) ? 'selected' : ''}`}
                onClick={() => toggleNeed(need.id)}
                aria-pressed={needs.includes(need.id)}
              >
                <span aria-hidden="true">{need.emoji}</span>
                {need.label}
              </button>
            ))}
          </div>
          <label className="field" style={{ marginTop: '0.9rem' }}>
            <span className="field-label">Envie d’écrire quelque chose ? (facultatif)</span>
            <textarea
              className="textarea"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Exemple : Le bruit me fatigue aujourd’hui."
              maxLength={400}
            />
          </label>
          <button type="button" className="btn btn-primary btn-block btn-lg" style={{ marginTop: '0.8rem' }} onClick={save}>
            💜 Enregistrer mon émotion
          </button>
        </Card>
      ) : null}

      {saved ? (
        <p className="note-good">
          <span aria-hidden="true">🤗</span>
          <span>Merci d’avoir partagé ton émotion. Tu peux aussi prendre une pause dans l’espace calme.</span>
        </p>
      ) : null}

      <Card
        title="Mes émotions notées"
        emoji="🗂️"
        action={
          <a className="btn btn-sm btn-soft" href="#/calme">
            🧸 Espace calme
          </a>
        }
      >
        {state.emotions.length === 0 ? (
          <p className="empty">Rien pour le moment. Tes émotions apparaîtront ici, sans jugement.</p>
        ) : (
          <ul className="task-list">
            {state.emotions.map((entry) => (
              <li key={entry.id} className="task" style={{ alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.8rem' }} aria-hidden="true">
                  {entry.emoji}
                </span>
                <span className="task-main" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.15rem' }}>
                  <strong>{entry.label}</strong>
                  <span className="tiny">{frTime(entry.at)}</span>
                  {entry.needs?.length ? (
                    <span className="tiny">Besoin : {entry.needs.join(' · ')}</span>
                  ) : null}
                  {entry.note ? <span className="tiny">« {entry.note} »</span> : null}
                </span>
                <button
                  type="button"
                  className="btn btn-icon btn-ghost"
                  onClick={() =>
                    ask('Cette émotion sera retirée de ton historique.', () => {
                      removeEmotion(entry.id);
                      feedback('soft');
                    })
                  }
                  aria-label="Supprimer cette émotion"
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {dialog}
    </>
  );
}
