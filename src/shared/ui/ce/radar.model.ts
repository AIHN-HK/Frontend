export const radarCodes = ['R', 'I', 'A', 'S', 'E', 'C'] as const;
export type RadarCode = typeof radarCodes[number];
export type RadarValues = Record<RadarCode, number | null>;

export function radarVertices(values: RadarValues, radius = 50): string {
  return radarCodes.map((code, index) => {
    const value = values[code];
    if (value !== null && (!Number.isFinite(value) || value < 0 || value > 100)) throw new Error('Radar values must be between 0 and 100');
    const angle = -Math.PI / 2 + index * Math.PI / 3;
    const length = (value ?? 0) / 100 * radius;
    return `${Number((75 + Math.cos(angle) * length).toFixed(3))},${Number((75 + Math.sin(angle) * length).toFixed(3))}`;
  }).join(' ');
}
