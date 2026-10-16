import developerIllustration from '@/assets/careers/career-dev.svg';
import dataIllustration from '@/assets/careers/career-data.svg';
import designIllustration from '@/assets/careers/career-design.svg';
import healthIllustration from '@/assets/careers/career-health.svg';
import { categories } from '../model/career.types';
import type { CategoryId } from '../model/career.types';

const illustrations: Partial<Record<CategoryId, string>> = { technology: developerIllustration, data: dataIllustration, creative: designIllustration, health: healthIllustration };

export function CareerIllustration({ category, size = 58 }: { category: CategoryId; size?: number }) {
  const src = illustrations[category];
  return <span aria-hidden="true">{src ? <img src={src} alt="" width={size} height={size} /> : categories.find(c => c.id === category)?.icon}</span>;
}
