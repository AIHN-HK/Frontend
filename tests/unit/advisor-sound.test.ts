import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  isAdvisorSoundEnabled,
  setAdvisorSoundEnabled,
  playAdvisorReplySound,
  _resetSoundStateForTesting,
} from '@/modules/advisor/model/advisor-sound';

describe('advisor-sound', () => {
  let store: Record<string, string>;
  const mockLocalStorage = {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    key: vi.fn(() => null),
    length: 0,
  };

  beforeEach(() => {
    store = {};
    _resetSoundStateForTesting();
    vi.stubGlobal('localStorage', mockLocalStorage as unknown as Storage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('defaults to sound enabled (true) when nothing is stored', () => {
    expect(isAdvisorSoundEnabled()).toBe(true);
  });

  it('updates state and persists to localStorage when toggled', () => {
    setAdvisorSoundEnabled(false);
    expect(isAdvisorSoundEnabled()).toBe(false);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('aihn.advisor.sound-enabled', 'false');

    setAdvisorSoundEnabled(true);
    expect(isAdvisorSoundEnabled()).toBe(true);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('aihn.advisor.sound-enabled', 'true');
  });

  it('plays audio when sound is enabled', () => {
    const playMock = vi.fn().mockImplementation(() => Promise.resolve());
    class MockAudio {
      public src: string;
      public volume = 1;
      public currentTime = 0;
      public play = playMock;
      constructor(src: string) {
        this.src = src;
      }
    }
    vi.stubGlobal('Audio', MockAudio);

    setAdvisorSoundEnabled(true);
    playAdvisorReplySound();

    expect(playMock).toHaveBeenCalledTimes(1);
  });

  it('does not play audio when sound is disabled', () => {
    const playMock = vi.fn();
    class MockAudio {
      public src: string;
      public volume = 1;
      public currentTime = 0;
      public play = playMock;
      constructor(src: string) {
        this.src = src;
      }
    }
    vi.stubGlobal('Audio', MockAudio);

    setAdvisorSoundEnabled(false);
    playAdvisorReplySound();

    expect(playMock).not.toHaveBeenCalled();
  });

  it('handles playback promise rejection gracefully without throwing', () => {
    const playMock = vi.fn().mockImplementation(() => Promise.reject(new Error('Autoplay blocked')));
    class MockAudio {
      public src: string;
      public volume = 1;
      public currentTime = 0;
      public play = playMock;
      constructor(src: string) {
        this.src = src;
      }
    }
    vi.stubGlobal('Audio', MockAudio);

    setAdvisorSoundEnabled(true);
    expect(() => playAdvisorReplySound()).not.toThrow();
  });
});
