import { expect, test } from 'vitest';
import { AmbientParticles, type ParticlesPreset } from '@/shared/ui/particles/AmbientParticles';
import { createParticlesEngine } from '@/shared/ui/particles/particles-engine';

test('AmbientParticles is a function component', () => {
  expect(typeof AmbientParticles).toBe('function');
});

test('ParticlesPreset type covers expected presets', () => {
  const presets: ParticlesPreset[] = ['career', 'assessment', 'result', 'advisor'];
  expect(presets).toHaveLength(4);
});

test('createParticlesEngine is exported as a function', () => {
  expect(typeof createParticlesEngine).toBe('function');
});
