import { Route, Routes } from 'react-router-dom';
import { RequireRole } from '@/components/shared/Guards';
import { ACCESS } from '@/config/access';
import HomeworkListPage from './HomeworkListPage';
import HomeworkCreatePage from './HomeworkCreatePage';
import HomeworkDetailPage from './HomeworkDetailPage';
import HomeworkEditPage from './HomeworkEditPage';

export default function HomeworkPage() {
  return (
    <Routes>
      <Route index element={<HomeworkListPage />} />
      <Route path="create" element={<RequireRole roles={[...ACCESS.manageHomework]}><HomeworkCreatePage /></RequireRole>} />
      <Route path=":homeworkId" element={<HomeworkDetailPage />} />
      <Route path=":homeworkId/edit" element={<RequireRole roles={[...ACCESS.manageHomework]}><HomeworkEditPage /></RequireRole>} />
    </Routes>
  );
}
