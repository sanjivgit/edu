import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireRole } from '@/components/shared/Guards';
import { ACCESS } from '@/config/access';
import StudentsListPage from './StudentsListPage';
import StudentsCreatePage from './StudentsCreatePage';
import StudentsDetailPage from './StudentsDetailPage';
import StudentsEditPage from './StudentsEditPage';

export default function StudentsPage() {
  return (
    <Routes>
      <Route index element={<StudentsListPage />} />
      <Route path="create" element={<RequireRole roles={[...ACCESS.manageStudents]}><StudentsCreatePage /></RequireRole>} />
      <Route path=":id" element={<StudentsDetailPage />} />
      <Route path=":id/edit" element={<RequireRole roles={[...ACCESS.manageStudents]}><StudentsEditPage /></RequireRole>} />
      <Route path="*" element={<Navigate to="/students" replace />} />
    </Routes>
  );
}
