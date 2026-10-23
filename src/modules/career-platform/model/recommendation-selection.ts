export function selectRecommendation<T extends { careerId: string }>(items: readonly T[], careerId: string|null): T|null {
  return careerId === null ? null : items.find(item => item.careerId === careerId) ?? null;
}
