const SOUND_STORAGE_KEY = 'aihn.advisor.sound-enabled';
const SOUND_PATH = '/sounds/shrug.wav';

let cachedAudio: HTMLAudioElement | null = null;

export function isAdvisorSoundEnabled(): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return true;
  try {
    const stored = window.localStorage.getItem(SOUND_STORAGE_KEY);
    return stored === null ? true : stored === 'true';
  } catch {
    return true;
  }
}

export function setAdvisorSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(SOUND_STORAGE_KEY, String(enabled));
  } catch {
    // Silently ignore storage quota/security errors
  }
}

export function playAdvisorReplySound(): void {
  if (typeof window === 'undefined' || typeof Audio === 'undefined') return;
  if (!isAdvisorSoundEnabled()) return;

  try {
    if (!cachedAudio) {
      cachedAudio = new Audio(SOUND_PATH);
      cachedAudio.volume = 0.65;
    }
    cachedAudio.currentTime = 0;
    const playPromise = cachedAudio.play();
    if (playPromise !== undefined && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        // Handled silently if browser autoplay policy blocks unprompted audio
      });
    }
  } catch {
    // Handled silently
  }
}

// Reset for testing
export function _resetSoundStateForTesting(): void {
  cachedAudio = null;
}

