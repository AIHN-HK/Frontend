const SOUND_STORAGE_KEY = 'aihn.advisor.sound-enabled';
const SOUND_PATH = '/sounds/shrug.wav';

let cachedAudio: HTMLAudioElement | null = null;

function getLocalStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
    if (typeof localStorage !== 'undefined') return localStorage;
  } catch {
    return null;
  }
  return null;
}

function getAudioConstructor(): typeof Audio | null {
  try {
    if (typeof window !== 'undefined' && window.Audio) return window.Audio;
    if (typeof Audio !== 'undefined') return Audio;
  } catch {
    return null;
  }
  return null;
}

export function isAdvisorSoundEnabled(): boolean {
  const storage = getLocalStorage();
  if (!storage) return true;
  try {
    const stored = storage.getItem(SOUND_STORAGE_KEY);
    return stored === null ? true : stored === 'true';
  } catch {
    return true;
  }
}

export function setAdvisorSoundEnabled(enabled: boolean): void {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.setItem(SOUND_STORAGE_KEY, String(enabled));
  } catch {
    // Silently ignore storage quota/security errors
  }
}

export function playAdvisorReplySound(): void {
  const AudioCtor = getAudioConstructor();
  if (!AudioCtor) return;
  if (!isAdvisorSoundEnabled()) return;

  try {
    if (!cachedAudio) {
      cachedAudio = new AudioCtor(SOUND_PATH);
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

