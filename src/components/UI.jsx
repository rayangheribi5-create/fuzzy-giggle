import { useEffect, useId, useState } from 'react';

/* Petits composants réutilisables, gros et faciles à toucher. */

export function PageHeader({ emoji, title, subtitle, children }) {
  return (
    <header className="row-between" style={{ alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', gap: '0.7rem', alignItems: 'center' }}>
        <span aria-hidden="true" style={{ fontSize: '2rem' }}>
          {emoji}
        </span>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{title}</h1>
          {subtitle ? <p className="muted">{subtitle}</p> : null}
        </div>
      </div>
      {children ? <div className="row">{children}</div> : null}
    </header>
  );
}

export function Card({ title, emoji, action, children, className = '' }) {
  return (
    <section className={`card ${className}`}>
      {title ? (
        <div className="card-head">
          <h2 className="card-title">
            {emoji ? <span className="emoji" aria-hidden="true">{emoji}</span> : null}
            {title}
          </h2>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function Toggle({ checked, onChange, label, hint, id }) {
  const generatedId = useId();
  const switchId = id || generatedId;
  return (
    <div className="switch-row">
      <label className="switch-text" htmlFor={switchId}>
        <strong>{label}</strong>
        {hint ? <span className="tiny">{hint}</span> : null}
      </label>
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`switch ${checked ? 'on' : ''}`}
        onClick={() => onChange(!checked)}
      />
    </div>
  );
}

export function Modal({ open, title, onClose, children, actions }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <h2>{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Fermer">
            ✖️
          </button>
        </div>
        {children}
        {actions ? <div className="modal-actions">{actions}</div> : null}
      </div>
    </div>
  );
}

const EMOJI_CHOICES = [
  '🌞', '🌙', '⭐', '🌟', '✨', '☀️', '🌈', '☁️', '🌧️', '❄️',
  '🥐', '🍎', '🍌', '🥕', '🍽️', '🍲', '🍕', '🍪', '🥛', '💧',
  '👕', '👟', '🧦', '🧢', '🪥', '🚿', '🛁', '🛏️', '🧸', '🪁',
  '🏫', '📚', '✏️', '🎨', '🎵', '⚽', '🧩', '🎮', '📺', '🎧',
  '😀', '🥰', '😐', '😴', '😰', '😢', '😡', '🤗', '❤️', '💙',
  '💜', '💚', '💛', '🤫', '🗣️', '🙋', '✅', '❌', '🆘', '🚽',
  '🎯', '🏆', '👍', '🤝', '🧘', '🌳', '🌊', '🐶', '🐱', '🦋',
];

export function EmojiPicker({ value, onChange, label = 'Choisir un emoji' }) {
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <div className="row" style={{ marginBottom: '0.35rem' }}>
        <input
          className="input"
          style={{ maxWidth: '6.5rem', textAlign: 'center', fontSize: '1.4rem' }}
          value={value}
          onChange={(event) => onChange(event.target.value.slice(0, 4))}
          aria-label="Emoji personnalisé"
        />
        <span className="tiny">Tu peux écrire ton propre emoji 🙂</span>
      </div>
      <div className="emoji-grid" role="group" aria-label={label}>
        {EMOJI_CHOICES.map((emoji) => (
          <button
            key={emoji}
            type="button"
            className={`emoji-option ${value === emoji ? 'selected' : ''}`}
            onClick={() => onChange(emoji)}
            aria-label={`Emoji ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Empty({ children }) {
  return <p className="empty">{children}</p>;
}

export function useConfirm() {
  const [pending, setPending] = useState(null);
  const ask = (message, onConfirm) => setPending({ message, onConfirm });
  const close = () => setPending(null);
  const dialog = (
    <Modal
      open={Boolean(pending)}
      title="On supprime ?"
      onClose={close}
      actions={
        <>
          <button type="button" className="btn btn-ghost" onClick={close}>
            Non, garder
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              pending?.onConfirm?.();
              close();
            }}
          >
            Oui, supprimer
          </button>
        </>
      }
    >
      <p className="muted">{pending?.message}</p>
    </Modal>
  );
  return { ask, dialog };
}
