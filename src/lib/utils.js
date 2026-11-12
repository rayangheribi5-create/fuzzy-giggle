// Petits utilitaires partagés (identifiants, dates, formatage).

export function uid(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function todayKey(date = new Date()) {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

export function dateKey(date) {
  return todayKey(date);
}

export function frDate(date = new Date()) {
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function frShortDate(isoDate) {
  const d = new Date(`${isoDate}T12:00:00`);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export function frTime(isoString) {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Grille du mois (6 semaines max) pour le calendrier des routines.
export function monthGrid(reference = new Date()) {
  const first = new Date(reference.getFullYear(), reference.getMonth(), 1);
  const start = new Date(first);
  const offset = (first.getDay() + 6) % 7; // lundi = 0
  start.setDate(first.getDate() - offset);

  const cells = [];
  for (let i = 0; i < 42; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push({
      date: d,
      key: todayKey(d),
      inMonth: d.getMonth() === reference.getMonth(),
      dayNumber: d.getDate(),
    });
  }
  return cells;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function sortByTime(items) {
  return [...items].sort((a, b) => {
    const [ah, am] = String(a.time || '00:00').split(':').map(Number);
    const [bh, bm] = String(b.time || '00:00').split(':').map(Number);
    return (ah || 0) * 60 + (am || 0) - ((bh || 0) * 60 + (bm || 0));
  });
}
