// Retours sensoriels : petits sons doux et lecture vocale, toujours facultatifs.

let audioContext = null;

function getContext() {
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!audioContext) audioContext = new Ctx();
  if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
  return audioContext;
}

/**
 * Joue un petit son doux.
 * @param {boolean} enabled - false si les sons sont désactivés (ou en mode calme).
 * @param {'tap'|'done'|'soft'} kind
 */
export function playTone(enabled, kind = 'tap') {
  if (!enabled) return;
  try {
    const ctx = getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = kind === 'done' ? [523.25, 659.25] : kind === 'soft' ? [392] : [440];
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.06, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    gain.connect(ctx.destination);

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.14);
      osc.connect(gain);
      osc.start(now + index * 0.14);
      osc.stop(now + 0.4 + index * 0.14);
    });
  } catch {
    // le son est un bonus : on n'interrompt jamais l'application
  }
}

export function speak(text, enabled) {
  if (!enabled) return false;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.92;
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

export function speechAvailable() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function vibrate(enabled) {
  if (!enabled) return;
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    navigator.vibrate(18);
  }
}
