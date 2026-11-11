export interface ParticlesOptions {
  count: number;
  spread: number;
  speed: number;
  colors: readonly string[];
  opacity: number;
  size: number;
  glow: number;
  twinkle: number;
  hoverEffect?: 'parallax' | 'repel' | 'attract';
  hoverRadius?: number;
  hoverFactor?: number;
  clickBurst?: boolean;
}
