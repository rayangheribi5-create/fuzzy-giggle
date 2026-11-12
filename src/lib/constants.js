// Données par défaut et listes partagées de l'application AutiColor.

export const ACCENTS = {
  bleu: { label: 'Bleu', emoji: '💙', main: '#6fa8ff', soft: '#e3efff', deep: '#1f4b8f' },
  violet: { label: 'Violet', emoji: '💜', main: '#a98cff', soft: '#efe7ff', deep: '#4a2e8f' },
  rose: { label: 'Rose', emoji: '🩷', main: '#ff9dc4', soft: '#ffe6f1', deep: '#8f2b52' },
  vert: { label: 'Vert', emoji: '💚', main: '#7fd9b0', soft: '#e3fbf0', deep: '#1f6b4d' },
  jaune: { label: 'Jaune', emoji: '💛', main: '#ffcf5c', soft: '#fff5d9', deep: '#7a5600' },
};

export const DEFAULT_SETTINGS = {
  accent: 'bleu',
  textScale: 1,
  sounds: false,
  calmMode: false,
  reduceMotion: false,
  bigCards: false,
};

export const DEFAULT_PROFILE = {
  // Prénom de l'enfant : facultatif, jamais envoyé, gardé sur l'appareil.
  name: '',
  // true dès que l'écran de bienvenue a été vu (ou passé).
  onboarded: false,
};

export const DEFAULT_SCHEDULE = [
  { id: 's1', time: '07:00', emoji: '🌞', label: 'Réveil', done: false },
  { id: 's2', time: '07:30', emoji: '🥐', label: 'Petit-déjeuner', done: false },
  { id: 's3', time: '08:00', emoji: '👕', label: 'Habillage', done: false },
  { id: 's4', time: '08:30', emoji: '🏫', label: 'École', done: false },
  { id: 's5', time: '12:00', emoji: '🍽️', label: 'Déjeuner', done: false },
  { id: 's6', time: '15:00', emoji: '🎨', label: 'Activités', done: false },
  { id: 's7', time: '17:00', emoji: '✏️', label: 'Devoirs', done: false },
  { id: 's8', time: '19:00', emoji: '🍲', label: 'Dîner', done: false },
  { id: 's9', time: '20:00', emoji: '🚿', label: 'Douche', done: false },
  { id: 's10', time: '21:00', emoji: '🌙', label: 'Coucher', done: false },
];

export const EMOTIONS = [
  { id: 'heureux', emoji: '😀', label: 'Heureux' },
  { id: 'content', emoji: '🥰', label: 'Content' },
  { id: 'neutre', emoji: '😐', label: 'Neutre' },
  { id: 'fatigue', emoji: '😴', label: 'Fatigué' },
  { id: 'stresse', emoji: '😰', label: 'Stressé' },
  { id: 'triste', emoji: '😢', label: 'Triste' },
  { id: 'encolere', emoji: '😡', label: 'En colère' },
];

export const NEEDS = [
  { id: 'calin', emoji: '🤗', label: 'Un câlin' },
  { id: 'calme', emoji: '🤫', label: 'Du calme' },
  { id: 'pause', emoji: '🧸', label: 'Une pause' },
  { id: 'eau', emoji: '💧', label: 'De l’eau' },
  { id: 'manger', emoji: '🍎', label: 'À manger' },
  { id: 'parler', emoji: '🗣️', label: 'Parler' },
  { id: 'repos', emoji: '🛏️', label: 'Me reposer' },
  { id: 'musique', emoji: '🎧', label: 'De la musique douce' },
];

export const DEFAULT_CARDS = [
  { id: 'c1', emoji: '🆘', label: 'J’ai besoin d’aide' },
  { id: 'c2', emoji: '🤫', label: 'J’ai besoin de silence' },
  { id: 'c3', emoji: '🚽', label: 'Je veux aller aux toilettes' },
  { id: 'c4', emoji: '💧', label: 'Je veux boire' },
  { id: 'c5', emoji: '🍎', label: 'J’ai faim' },
  { id: 'c6', emoji: '🧸', label: 'Je veux faire une pause' },
  { id: 'c7', emoji: '❤️', label: 'J’ai besoin de réconfort' },
  { id: 'c8', emoji: '❌', label: 'Je ne veux pas' },
  { id: 'c9', emoji: '✅', label: 'Oui' },
  { id: 'c10', emoji: '🙋', label: 'Je veux parler' },
];

export const DEFAULT_GOALS = [
  { id: 'g1', emoji: '🪥', label: 'Me brosser les dents matin et soir', done: false },
  { id: 'g2', emoji: '🧺', label: 'Ranger mes affaires', done: false },
  { id: 'g3', emoji: '📚', label: 'Lire 10 minutes', done: false },
];

export const DAYS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

export const DAY_LABELS = {
  lundi: 'Lundi',
  mardi: 'Mardi',
  mercredi: 'Mercredi',
  jeudi: 'Jeudi',
  vendredi: 'Vendredi',
  samedi: 'Samedi',
  dimanche: 'Dimanche',
};

export const MEAL_SLOTS = [
  { id: 'matin', emoji: '🥐', label: 'Petit-déjeuner' },
  { id: 'midi', emoji: '🍽️', label: 'Déjeuner' },
  { id: 'soir', emoji: '🍲', label: 'Dîner' },
];

export const DEFAULT_MEALS = DAYS.reduce((acc, day) => {
  acc[day] = { matin: '', midi: '', soir: '' };
  return acc;
}, {});

export const DEFAULT_SLEEP = {
  bedTime: '21:00',
  wakeTime: '07:00',
  reminders: false,
  bedRoutine: [
    { id: 'b1', emoji: '🧸', label: 'Ranger mes jouets' },
    { id: 'b2', emoji: '🚿', label: 'Douche ou bain' },
    { id: 'b3', emoji: '🪥', label: 'Brossage des dents' },
    { id: 'b4', emoji: '📖', label: 'Une histoire au calme' },
    { id: 'b5', emoji: '🌙', label: 'Lumière douce et dodo' },
  ],
  wakeRoutine: [
    { id: 'w1', emoji: '🌞', label: 'Ouvrir les rideaux' },
    { id: 'w2', emoji: '💧', label: 'Boire un verre d’eau' },
    { id: 'w3', emoji: '👕', label: 'M’habiller' },
    { id: 'w4', emoji: '🥐', label: 'Petit-déjeuner' },
  ],
};

export const TILES = [
  {
    path: 'programme',
    emoji: '📅',
    label: 'Mon programme',
    hint: 'Ma journée étape par étape',
    tone: 'bleu',
  },
  {
    path: 'emotions',
    emoji: '😊',
    label: 'Mes émotions',
    hint: 'Comment je me sens',
    tone: 'jaune',
  },
  {
    path: 'communication',
    emoji: '💬',
    label: 'Communication',
    hint: 'Montrer ce dont j’ai besoin',
    tone: 'rose',
  },
  {
    path: 'calme',
    emoji: '🧸',
    label: 'Espace calme',
    hint: 'Respirer et me poser',
    tone: 'vert',
  },
  {
    path: 'progres',
    emoji: '⭐',
    label: 'Mes progrès',
    hint: 'Mes réussites, sans pression',
    tone: 'violet',
  },
  {
    path: 'objectifs',
    emoji: '🎯',
    label: 'Mes objectifs',
    hint: 'Mes petits buts à moi',
    tone: 'bleu',
  },
  {
    path: 'repas',
    emoji: '🍽️',
    label: 'Mes repas',
    hint: 'Le menu de la semaine',
    tone: 'vert',
  },
  {
    path: 'sommeil',
    emoji: '🌙',
    label: 'Mon sommeil',
    hint: 'Routine du soir et du matin',
    tone: 'violet',
  },
];

export const NAV_ITEMS = [
  { path: 'accueil', emoji: '🏠', label: 'Accueil' },
  { path: 'programme', emoji: '📅', label: 'Programme' },
  { path: 'emotions', emoji: '😊', label: 'Émotions' },
  { path: 'communication', emoji: '💬', label: 'Parler' },
  { path: 'calme', emoji: '🧸', label: 'Calme' },
];

export const ALL_PAGES = [
  ...NAV_ITEMS,
  { path: 'progres', emoji: '⭐', label: 'Mes progrès' },
  { path: 'objectifs', emoji: '🎯', label: 'Mes objectifs' },
  { path: 'repas', emoji: '🍽️', label: 'Mes repas' },
  { path: 'sommeil', emoji: '🌙', label: 'Mon sommeil' },
  { path: 'parametres', emoji: '⚙️', label: 'Paramètres' },
];
