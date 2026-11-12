import { useEffect, useRef, useState } from 'react';
import { Card, PageHeader } from '../components/UI';
import { useApp } from '../store';

const PHASES = [
  { key: 'inhale', label: 'Inspire doucement par le nez 🌬️', seconds: 4 },
  { key: 'hold', label: 'Garde l’air un instant 🤫', seconds: 2 },
  { key: 'exhale', label: 'Souffle lentement par la bouche 😮‍💨', seconds: 6 },
];

const PICTURES = [
  { className: 'pic-1', scene: '🌊🐚', caption: 'Une plage calme' },
  { className: 'pic-2', scene: '🌅☁️', caption: 'Un ciel doux du soir' },
  { className: 'pic-3', scene: '🌲🌙', caption: 'Une forêt silencieuse' },
  { className: 'pic-4', scene: '🦋🌷', caption: 'Un jardin tranquille' },
];

const TIPS = [
  { emoji: '🧸', text: 'Je peux choisir un objet doux à tenir dans mes mains.' },
  { emoji: '🎧', text: 'Je peux mettre un casque ou des bouchons si le bruit est trop fort.' },
  { emoji: '💡', text: 'Je peux baisser la lumière ou fermer les rideaux.' },
  { emoji: '🚶', text: 'Je peux marcher un peu, lentement, sans parler.' },
  { emoji: '💧', text: 'Je peux boire un verre d’eau fraîche.' },
  { emoji: '🫶', text: 'Je peux dire « j’ai besoin d’une pause » avec une carte.' },
];

export default function Calm() {
  const { settings, updateSettings, feedback } = useApp();
  const [running, setRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(PHASES[0].seconds);
  const timerRef = useRef(null);

  const phase = PHASES[phaseIndex];

  useEffect(() => {
    if (!running) {
      window.clearTimeout(timerRef.current);
      return undefined;
    }

    const tick = () => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;
        // fin de la phase : on passe à la suivante
        setPhaseIndex((index) => {
          const next = (index + 1) % PHASES.length;
          if (next === 0) {
            setCycles((count) => count + 1);
            feedback('soft');
          }
          setSecondsLeft(PHASES[next].seconds);
          return next;
        });
        return PHASES[(phaseIndex + 1) % PHASES.length].seconds;
      });
    };

    timerRef.current = window.setTimeout(tick, 1000);
    return () => window.clearTimeout(timerRef.current);
  }, [running, phaseIndex, secondsLeft, feedback]);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const start = () => {
    setRunning(true);
    setPhaseIndex(0);
    setSecondsLeft(PHASES[0].seconds);
    setCycles(0);
    feedback('soft');
  };

  const stop = () => {
    setRunning(false);
    setPhaseIndex(0);
    setSecondsLeft(PHASES[0].seconds);
  };

  return (
    <>
      <PageHeader emoji="🧸" title="Espace calme" subtitle="Respirer, se poser, sans aucune pression" />

      <Card>
        <div className="breath-stage">
          <div
            className={`breath-circle ${running ? phase.key : ''}`}
            aria-live="polite"
            aria-label={running ? phase.label : 'Respiration arrêtée'}
          >
            {running ? `${secondsLeft} s` : '🌿'}
          </div>
          <p className="breath-caption">
            {running ? phase.label : 'Quand tu veux, on respire ensemble.'}
          </p>
          <div className="row" style={{ justifyContent: 'center' }}>
            {running ? (
              <button type="button" className="btn btn-lg btn-ghost" onClick={stop}>
                ⏸️ Arrêter
              </button>
            ) : (
              <button type="button" className="btn btn-lg btn-primary" onClick={start}>
                ▶️ Commencer la respiration
              </button>
            )}
          </div>
          {cycles > 0 ? <p className="tiny">Respirations terminées : {cycles} 🌿</p> : null}
          <p className="tiny center" style={{ maxWidth: '40ch' }}>
            Inspire 4 secondes, garde 2 secondes, souffle 6 secondes. Aucun son ne démarre tout
            seul.
          </p>
        </div>
      </Card>

      <Card title="Réduire les stimulations" emoji="🌙">
        <div className="switch-row">
          <span className="switch-text">
            <strong>Mode calme</strong>
            <span className="tiny">Couleurs plus douces, animations réduites, sons coupés.</span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={settings.calmMode}
            aria-label="Mode calme"
            className={`switch ${settings.calmMode ? 'on' : ''}`}
            onClick={() => {
              updateSettings({ calmMode: !settings.calmMode });
              feedback('soft');
            }}
          />
        </div>
        <div className="switch-row">
          <span className="switch-text">
            <strong>Réduire les animations</strong>
            <span className="tiny">Les mouvements à l’écran deviennent très légers.</span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={settings.reduceMotion}
            aria-label="Réduire les animations"
            className={`switch ${settings.reduceMotion ? 'on' : ''}`}
            onClick={() => updateSettings({ reduceMotion: !settings.reduceMotion })}
          />
        </div>
      </Card>

      <Card title="Images apaisantes" emoji="🖼️">
        <div className="tile-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
          {PICTURES.map((picture) => (
            <div key={picture.caption} className={`calm-picture ${picture.className}`}>
              <span className="scene" aria-hidden="true">
                {picture.scene}
              </span>
              <span style={{ position: 'relative' }}>{picture.caption}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Conseils pour une pause" emoji="💡">
        <div className="stack">
          {TIPS.map((tip) => (
            <div key={tip.text} className="tip">
              <span className="e" aria-hidden="true">
                {tip.emoji}
              </span>
              <span>{tip.text}</span>
            </div>
          ))}
        </div>
      </Card>

      <p className="note-good">
        <span aria-hidden="true">💜</span>
        <span>
          Une pause n’est jamais une perte de temps. Tu peux rester ici aussi longtemps que tu en as
          besoin.
        </span>
      </p>
    </>
  );
}
