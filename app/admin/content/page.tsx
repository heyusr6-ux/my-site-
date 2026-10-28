import { getResources, getSettings, getSectionConfig, getSkills, DEFAULT_ORDER } from '@/lib/content';
import ContentClient from './ContentClient';

export const dynamic = 'force-dynamic';

export default async function ContentPage() {
  const [skills, resources, s, cfg] = await Promise.all([getSkills(), getResources(), getSettings(), getSectionConfig()]);
  const progress = [1, 2].map((i) => ({ name: s[`progress_${i}_name`] || '', pct: Number(s[`progress_${i}_pct`]) || 0 }));
  const order = [...cfg.order, ...DEFAULT_ORDER.filter((k) => !cfg.order.includes(k))];
  return <ContentClient skills={skills} resources={resources} progress={progress} order={order} hidden={cfg.hidden} />;
}
