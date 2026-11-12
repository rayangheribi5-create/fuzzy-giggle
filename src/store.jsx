import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ACCENTS,
  DEFAULT_CARDS,
  DEFAULT_GOALS,
  DEFAULT_MEALS,
  DEFAULT_SCHEDULE,
  DEFAULT_SETTINGS,
  DEFAULT_SLEEP,
} from './lib/constants';
import { todayKey, uid } from './lib/utils';
import { playTone, speak, vibrate } from './lib/feedback';

const STORAGE_KEY = 'auticolor:v1';

function defaultState() {
  return {
    version: 1,
    settings: { ...DEFAULT_SETTINGS },
    scheduleDate: todayKey(),
    schedule: DEFAULT_SCHEDULE.map((item) => ({ ...item })),
    emotions: [],
    cards: DEFAULT_CARDS.map((item) => ({ ...item })),
    goals: DEFAULT_GOALS.map((item) => ({ ...item })),
    achievements: [],
    routineDays: {},
    meals: JSON.parse(JSON.stringify(DEFAULT_MEALS)),
    sleep: JSON.parse(JSON.stringify(DEFAULT_SLEEP)),
  };
}

function normalize(raw) {
  const base = defaultState();
  if (!raw || typeof raw !== 'object') return base;

  const state = {
    ...base,
    ...raw,
    settings: { ...base.settings, ...(raw.settings || {}) },
    schedule: Array.isArray(raw.schedule) && raw.schedule.length ? raw.schedule : base.schedule,
    cards: Array.isArray(raw.cards) && raw.cards.length ? raw.cards : base.cards,
    goals: Array.isArray(raw.goals) ? raw.goals : base.goals,
    emotions: Array.isArray(raw.emotions) ? raw.emotions : [],
    achievements: Array.isArray(raw.achievements) ? raw.achievements : [],
    routineDays: raw.routineDays && typeof raw.routineDays === 'object' ? raw.routineDays : {},
    meals: { ...base.meals, ...(raw.meals || {}) },
    sleep: {
      ...base.sleep,
      ...(raw.sleep || {}),
      bedRoutine: Array.isArray(raw.sleep?.bedRoutine) ? raw.sleep.bedRoutine : base.sleep.bedRoutine,
      wakeRoutine: Array.isArray(raw.sleep?.wakeRoutine) ? raw.sleep.wakeRoutine : base.sleep.wakeRoutine,
    },
  };

  if (!ACCENTS[state.settings.accent]) state.settings.accent = base.settings.accent;

  // Nouvelle journée : on remet les cases du programme à zéro (sans rien perdre d'autre).
  if (state.scheduleDate !== todayKey()) {
    state.scheduleDate = todayKey();
    state.schedule = state.schedule.map((item) => ({ ...item, done: false }));
  }

  return state;
}

function loadState() {
  if (typeof window === 'undefined') return defaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return normalize(JSON.parse(raw));
  } catch {
    return defaultState();
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, setState] = useState(loadState);
  const [storageError, setStorageError] = useState(false);

  // Sauvegarde automatique sur l'appareil.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [state]);

  // Application des préférences visuelles sur la racine du document.
  useEffect(() => {
    const { settings } = state;
    const accent = ACCENTS[settings.accent] || ACCENTS.bleu;
    const root = document.documentElement;
    root.style.setProperty('--accent', accent.main);
    root.style.setProperty('--accent-soft', accent.soft);
    root.style.setProperty('--accent-deep', accent.deep);
    root.style.fontSize = `${16 * (settings.textScale || 1)}px`;
    root.dataset.calm = settings.calmMode ? 'true' : 'false';
    root.dataset.motion = settings.reduceMotion || settings.calmMode ? 'reduced' : 'normal';
    root.dataset.bigCards = settings.bigCards ? 'true' : 'false';

    const themeColor = settings.calmMode ? accent.soft : accent.soft;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', themeColor);
  }, [state.settings]);

  const patch = useCallback((updater) => {
    setState((prev) => (typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }));
  }, []);

  const updateSettings = useCallback(
    (changes) => {
      patch((prev) => ({ ...prev, settings: { ...prev.settings, ...changes } }));
    },
    [patch],
  );

  const soundOn = state.settings.sounds && !state.settings.calmMode;

  const feedback = useCallback(
    (kind = 'tap') => {
      playTone(soundOn, kind);
      if (kind !== 'soft') vibrate(soundOn);
    },
    [soundOn],
  );

  const say = useCallback((text) => speak(text, soundOn), [soundOn]);

  // ---- Programme -----------------------------------------------------------
  const addActivity = useCallback(
    (activity) => {
      patch((prev) => ({
        ...prev,
        schedule: [
          ...prev.schedule,
          { id: uid('act'), done: false, emoji: '⭐', label: 'Nouvelle activité', time: '12:00', ...activity },
        ],
      }));
    },
    [patch],
  );

  const updateActivity = useCallback(
    (id, changes) => {
      patch((prev) => ({
        ...prev,
        schedule: prev.schedule.map((item) => (item.id === id ? { ...item, ...changes } : item)),
      }));
    },
    [patch],
  );

  const removeActivity = useCallback(
    (id) => {
      patch((prev) => ({ ...prev, schedule: prev.schedule.filter((item) => item.id !== id) }));
    },
    [patch],
  );

  const toggleActivity = useCallback(
    (id) => {
      patch((prev) => ({
        ...prev,
        schedule: prev.schedule.map((item) =>
          item.id === id ? { ...item, done: !item.done } : item,
        ),
      }));
    },
    [patch],
  );

  const resetSchedule = useCallback(() => {
    patch((prev) => ({ ...prev, schedule: prev.schedule.map((item) => ({ ...item, done: false })) }));
  }, [patch]);

  // ---- Émotions ------------------------------------------------------------
  const addEmotion = useCallback(
    (entry) => {
      patch((prev) => ({
        ...prev,
        emotions: [
          { id: uid('emo'), at: new Date().toISOString(), needs: [], note: '', ...entry },
          ...prev.emotions,
        ].slice(0, 120),
      }));
    },
    [patch],
  );

  const removeEmotion = useCallback(
    (id) => {
      patch((prev) => ({ ...prev, emotions: prev.emotions.filter((item) => item.id !== id) }));
    },
    [patch],
  );

  // ---- Cartes de communication --------------------------------------------
  const addCard = useCallback(
    (card) => {
      patch((prev) => ({
        ...prev,
        cards: [...prev.cards, { id: uid('card'), emoji: '⭐', label: 'Nouvelle carte', ...card }],
      }));
    },
    [patch],
  );

  const updateCard = useCallback(
    (id, changes) => {
      patch((prev) => ({
        ...prev,
        cards: prev.cards.map((item) => (item.id === id ? { ...item, ...changes } : item)),
      }));
    },
    [patch],
  );

  const removeCard = useCallback(
    (id) => {
      patch((prev) => ({ ...prev, cards: prev.cards.filter((item) => item.id !== id) }));
    },
    [patch],
  );

  // ---- Objectifs -----------------------------------------------------------
  const addGoal = useCallback(
    (goal) => {
      patch((prev) => ({
        ...prev,
        goals: [...prev.goals, { id: uid('goal'), emoji: '🎯', label: 'Nouvel objectif', done: false, ...goal }],
      }));
    },
    [patch],
  );

  const updateGoal = useCallback(
    (id, changes) => {
      patch((prev) => ({
        ...prev,
        goals: prev.goals.map((item) => (item.id === id ? { ...item, ...changes } : item)),
      }));
    },
    [patch],
  );

  const removeGoal = useCallback(
    (id) => {
      patch((prev) => ({ ...prev, goals: prev.goals.filter((item) => item.id !== id) }));
    },
    [patch],
  );

  const toggleGoal = useCallback(
    (id) => {
      patch((prev) => ({
        ...prev,
        goals: prev.goals.map((item) => (item.id === id ? { ...item, done: !item.done } : item)),
      }));
    },
    [patch],
  );

  // ---- Petites réussites ---------------------------------------------------
  const addAchievement = useCallback(
    (achievement) => {
      patch((prev) => ({
        ...prev,
        achievements: [
          { id: uid('win'), at: new Date().toISOString(), emoji: '🌟', label: '', ...achievement },
          ...prev.achievements,
        ].slice(0, 200),
      }));
    },
    [patch],
  );

  const removeAchievement = useCallback(
    (id) => {
      patch((prev) => ({ ...prev, achievements: prev.achievements.filter((item) => item.id !== id) }));
    },
    [patch],
  );

  // ---- Calendrier des routines --------------------------------------------
  const toggleRoutineDay = useCallback(
    (key) => {
      patch((prev) => {
        const routineDays = { ...prev.routineDays };
        if (routineDays[key]) delete routineDays[key];
        else routineDays[key] = true;
        return { ...prev, routineDays };
      });
    },
    [patch],
  );

  // ---- Repas ---------------------------------------------------------------
  const setMeal = useCallback(
    (day, slot, value) => {
      patch((prev) => ({
        ...prev,
        meals: { ...prev.meals, [day]: { ...(prev.meals[day] || {}), [slot]: value } },
      }));
    },
    [patch],
  );

  // ---- Sommeil -------------------------------------------------------------
  const updateSleep = useCallback(
    (changes) => {
      patch((prev) => ({ ...prev, sleep: { ...prev.sleep, ...changes } }));
    },
    [patch],
  );

  const addSleepStep = useCallback(
    (kind, step) => {
      patch((prev) => ({
        ...prev,
        sleep: {
          ...prev.sleep,
          [kind]: [...(prev.sleep[kind] || []), { id: uid('step'), emoji: '🌙', label: 'Nouvelle étape', ...step }],
        },
      }));
    },
    [patch],
  );

  const updateSleepStep = useCallback(
    (kind, id, changes) => {
      patch((prev) => ({
        ...prev,
        sleep: {
          ...prev.sleep,
          [kind]: (prev.sleep[kind] || []).map((item) =>
            item.id === id ? { ...item, ...changes } : item,
          ),
        },
      }));
    },
    [patch],
  );

  const removeSleepStep = useCallback(
    (kind, id) => {
      patch((prev) => ({
        ...prev,
        sleep: { ...prev.sleep, [kind]: (prev.sleep[kind] || []).filter((item) => item.id !== id) },
      }));
    },
    [patch],
  );

  // ---- Réinitialisation ----------------------------------------------------
  const resetAll = useCallback(() => {
    const fresh = defaultState();
    setState(fresh);
  }, []);

  const progress = useMemo(() => {
    const doneToday = state.schedule.filter((item) => item.done).length;
    const totalToday = state.schedule.length;
    const goalsDone = state.goals.filter((goal) => goal.done).length;
    const routineCount = Object.keys(state.routineDays).length;
    return {
      doneToday,
      totalToday,
      goalsDone,
      totalGoals: state.goals.length,
      routineCount,
      wins: state.achievements.length,
      percentToday: totalToday ? Math.round((doneToday / totalToday) * 100) : 0,
    };
  }, [state.schedule, state.goals, state.achievements, state.routineDays]);

  const value = useMemo(
    () => ({
      state,
      settings: state.settings,
      progress,
      storageError,
      soundOn,
      feedback,
      say,
      patch,
      updateSettings,
      addActivity,
      updateActivity,
      removeActivity,
      toggleActivity,
      resetSchedule,
      addEmotion,
      removeEmotion,
      addCard,
      updateCard,
      removeCard,
      addGoal,
      updateGoal,
      removeGoal,
      toggleGoal,
      addAchievement,
      removeAchievement,
      toggleRoutineDay,
      setMeal,
      updateSleep,
      addSleepStep,
      updateSleepStep,
      removeSleepStep,
      resetAll,
    }),
    [
      state,
      progress,
      storageError,
      soundOn,
      feedback,
      say,
      patch,
      updateSettings,
      addActivity,
      updateActivity,
      removeActivity,
      toggleActivity,
      resetSchedule,
      addEmotion,
      removeEmotion,
      addCard,
      updateCard,
      removeCard,
      addGoal,
      updateGoal,
      removeGoal,
      toggleGoal,
      addAchievement,
      removeAchievement,
      toggleRoutineDay,
      setMeal,
      updateSleep,
      addSleepStep,
      updateSleepStep,
      removeSleepStep,
      resetAll,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp doit être utilisé dans AppProvider');
  return ctx;
}

export { STORAGE_KEY };
