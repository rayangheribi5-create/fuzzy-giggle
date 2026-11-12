import { useEffect, useState } from 'react';
import { Card, EmojiPicker, Modal, PageHeader, useConfirm } from '../components/UI';
import { speechAvailable } from '../lib/feedback';
import { useApp } from '../store';

const EMPTY_FORM = { emoji: '⭐', label: '' };

export default function Communication() {
  const { state, settings, updateSettings, addCard, updateCard, removeCard, feedback, say, soundOn } =
    useApp();
  const { ask, dialog } = useConfirm();
  const [bigCard, setBigCard] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const canSpeak = speechAvailable();

  useEffect(() => {
    if (!bigCard) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setBigCard(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [bigCard]);

  const openCard = (card) => {
    setBigCard(card);
    feedback('soft');
  };

  const save = (event) => {
    event.preventDefault();
    const label = (form.label || '').trim();
    if (!label) return;
    const payload = { emoji: form.emoji || '⭐', label };
    if (form.id) updateCard(form.id, payload);
    else addCard(payload);
    feedback('tap');
    setForm(null);
  };

  return (
    <>
      <PageHeader emoji="💬" title="Communication" subtitle="Montrer ce dont j’ai besoin, en grand" />

      <Card>
        <div className="row-between">
          <div>
            <strong>Mes cartes</strong>
            <p className="tiny">Touche une carte pour l’afficher en très grand.</p>
          </div>
          <div className="row">
            <button
              type="button"
              className={`btn btn-sm ${editing ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setEditing((prev) => !prev)}
              aria-pressed={editing}
            >
              {editing ? '✔️ Terminer' : '✏️ Modifier'}
            </button>
            <button type="button" className="btn btn-sm btn-soft" onClick={() => setForm({ ...EMPTY_FORM })}>
              ➕ Carte
            </button>
          </div>
        </div>
        <div className="divider" />
        <div className="comm-grid">
          {state.cards.map((card) => (
            <div key={card.id} style={{ position: 'relative' }}>
              <button type="button" className="comm-card" style={{ width: '100%' }} onClick={() => openCard(card)}>
                <span className="e" aria-hidden="true">
                  {card.emoji}
                </span>
                <span className="l">{card.label}</span>
              </button>
              {editing ? (
                <div className="row" style={{ marginTop: '0.3rem', justifyContent: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    onClick={() => setForm({ id: card.id, emoji: card.emoji, label: card.label })}
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    onClick={() =>
                      ask(`La carte « ${card.label} » sera supprimée.`, () => {
                        removeCard(card.id);
                        feedback('soft');
                      })
                    }
                  >
                    🗑️
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </Card>

      <Card title="Affichage" emoji="🔍">
        <div className="switch-row">
          <span className="switch-text">
            <strong>Cartes encore plus grandes</strong>
            <span className="tiny">Pratique sur une tablette ou pour montrer à quelqu’un.</span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={settings.bigCards}
            aria-label="Cartes encore plus grandes"
            className={`switch ${settings.bigCards ? 'on' : ''}`}
            onClick={() => updateSettings({ bigCards: !settings.bigCards })}
          />
        </div>
        <p className="note-good" style={{ marginTop: '0.8rem' }}>
          <span aria-hidden="true">💜</span>
          <span>
            Montrer une carte est une vraie façon de parler. Tu peux aussi créer tes propres cartes
            avec tes mots.
          </span>
        </p>
      </Card>

      {bigCard ? (
        <div
          className="big-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={bigCard.label}
          onClick={() => setBigCard(null)}
        >
          <span className="e" aria-hidden="true">
            {bigCard.emoji}
          </span>
          <span className="l">{bigCard.label}</span>
          <div className="actions">
            {canSpeak ? (
              <button
                type="button"
                className="btn btn-lg btn-primary"
                onClick={(event) => {
                  event.stopPropagation();
                  say(bigCard.label);
                }}
                disabled={!soundOn}
                title={soundOn ? 'Écouter la phrase' : 'Active les sons dans les paramètres'}
              >
                🔊 Écouter
              </button>
            ) : null}
            <button type="button" className="btn btn-lg btn-ghost" onClick={() => setBigCard(null)}>
              ✖️ Fermer
            </button>
          </div>
          <p className="tiny" style={{ maxWidth: '26ch' }}>
            Touche l’écran pour fermer.
          </p>
        </div>
      ) : null}

      <Modal
        open={Boolean(form)}
        title={form?.id ? 'Modifier la carte' : 'Nouvelle carte'}
        onClose={() => setForm(null)}
        actions={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setForm(null)}>
              Annuler
            </button>
            <button type="submit" form="card-form" className="btn btn-primary">
              💾 Enregistrer
            </button>
          </>
        }
      >
        {form ? (
          <form id="card-form" className="stack" onSubmit={save}>
            <label className="field">
              <span className="field-label">Texte de la carte</span>
              <input
                className="input"
                value={form.label}
                onChange={(event) => setForm({ ...form, label: event.target.value })}
                placeholder="Exemple : Je veux me reposer"
                autoFocus
                required
              />
            </label>
            <EmojiPicker
              value={form.emoji}
              onChange={(emoji) => setForm({ ...form, emoji })}
              label="Choisir un emoji pour la carte"
            />
          </form>
        ) : null}
      </Modal>

      {dialog}
    </>
  );
}
