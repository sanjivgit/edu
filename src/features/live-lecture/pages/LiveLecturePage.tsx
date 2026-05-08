import { ModuleCrudPage } from '@/features/common/components/ModuleCrudPage';

export default function LiveLecturePage() {
  return (
    <ModuleCrudPage
      moduleKey="live-lecture"
      title="Live Classes"
      description="Join and host live learning sessions"
      entityLabel="Live Session"
    />
  );
}
