import { useState } from 'react';
import { Card, PageHeader, useConfirm } from '../components/UI';
import { DAYS, DAY_LABELS, MEAL_SLOTS } from '../lib/constants';
import { useApp } from '../store';

const IDEAS = ['Pâtes', 'Riz', 'Soupe', 'Purée', 'Poulet', 'Poisson', 'Légumes', 'Fruits'];

export default function Meals() {
  const { state, setMeal, patch, feedback } = useApp();
  const { ask, dialog } = useConfirm();
  const [ideaTarget, setIdeaTarget] = useState(null); // {day, slot}

  const meals = state.meals || {};

  const fillIdea = (idea) => {
    if (!ideaTarget) return;
    const current = meals[ideaTarget.day]?.[ideaTarget.slot] || '';
    const next = current ? `${current} · ${idea}` : idea;
    setMeal(ideaTarget.day, ideaTarget.slot, next);
    feedback('tap');
  };

  const clearWeek = () => {
    ask('Tous les repas de la semaine seront effacés.', () => {
      const empty = DAYS.reduce((acc, day) => {
        acc[day] = { matin: '', midi: '', soir: '' };
        return acc;
      }, {});
      patch({ meals: empty });
      feedback('soft');
    });
  };

  return (
    <>
      <PageHeader emoji="🍽️" title="Mes repas" subtitle="Le menu de ma semaine, comme je l’aime" />

      <Card>
        <div className="row-between">
          <div>
            <strong>Planning des repas</strong>
            <p className="tiny">Écris ce que tu manges, ou laisse vide si tu ne sais pas encore.</p>
          </div>
          <button type="button" className="btn btn-sm btn-ghost" onClick={clearWeek}>
            ♻️ Effacer
          </button>
        </div>
      </Card>

      <div className="stack">
        {DAYS.map((day) => (
          <section key={day} className="card meal-day">
            <h3>
              <span aria-hidden="true">📆</span>
              {DAY_LABELS[day]}
            </h3>
            {MEAL_SLOTS.map((slot) => (
              <div key={slot.id} className="meal-slot">
                <label htmlFor={`meal-${day}-${slot.id}`}>
                  <span aria-hidden="true">{slot.emoji}</span>
                  {slot.label}
                </label>
                <input
                  id={`meal-${day}-${slot.id}`}
                  className="input"
                  value={meals[day]?.[slot.id] || ''}
                  onChange={(event) => setMeal(day, slot.id, event.target.value)}
                  onFocus={() => setIdeaTarget({ day, slot: slot.id })}
                  placeholder="Exemple : pâtes au fromage"
                  maxLength={120}
                />
              </div>
            ))}
          </section>
        ))}
      </div>

      <Card title="Petites idées de repas" emoji="💡">
        <p className="tiny" style={{ marginBottom: '0.6rem' }}>
          Touche d’abord un champ de repas, puis une idée pour la remplir.
        </p>
        <div className="chip-grid">
          {IDEAS.map((idea) => (
            <button
              key={idea}
              type="button"
              className="chip"
              onClick={() => fillIdea(idea)}
              disabled={!ideaTarget}
            >
              <span aria-hidden="true">🍽️</span>
              {idea}
            </button>
          ))}
        </div>
      </Card>

      <p className="note-good">
        <span aria-hidden="true">🍎</span>
        <span>
          Manger peut être difficile certains jours. Ici, rien n’est obligatoire et rien n’est
          jugé.
        </span>
      </p>

      {dialog}
    </>
  );
}
