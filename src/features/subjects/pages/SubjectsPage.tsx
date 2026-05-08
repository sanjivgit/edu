import { Route, Routes } from 'react-router-dom';
import { RequireRole } from '@/components/shared/Guards';
import SubjectsListPage from './SubjectsListPage';
import SubjectsCreatePage from './SubjectsCreatePage';
import SubjectsDetailPage from './SubjectsDetailPage';
import SubjectsEditPage from './SubjectsEditPage';

export default function SubjectsPage() {
  return (
    <Routes>
      <Route index element={<SubjectsListPage />} />
      <Route path="create" element={<RequireRole roles={['superadmin', 'admin', 'teacher']}><SubjectsCreatePage /></RequireRole>} />
      <Route path=":subjectId" element={<SubjectsDetailPage />} />
      <Route path=":subjectId/edit" element={<RequireRole roles={['superadmin', 'admin', 'teacher']}><SubjectsEditPage /></RequireRole>} />
    </Routes>
  );
}
