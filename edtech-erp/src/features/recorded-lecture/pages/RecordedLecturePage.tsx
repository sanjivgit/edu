import { ModuleCrudPage } from '@/features/common/components/ModuleCrudPage';

export default function RecordedLecturePage() {
  return (
    <ModuleCrudPage
      moduleKey="recorded-lecture"
      title="Recorded Lectures"
      description="Browse recorded learning content"
      entityLabel="Lecture"
    />
  );
}
