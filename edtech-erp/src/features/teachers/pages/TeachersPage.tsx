import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireRole } from '@/components/shared/Guards';
import { ACCESS } from '@/config/access';
import TeachersListPage from './TeachersListPage';
import TeachersCreatePage from './TeachersCreatePage';
import TeachersDetailPage from './TeachersDetailPage';
import TeachersEditPage from './TeachersEditPage';

export default function TeachersPage() {
  return (
    <Routes>
      <Route index element={<TeachersListPage />} />
      <Route path="create" element={<RequireRole roles={[...ACCESS.manageTeachers]}><TeachersCreatePage /></RequireRole>} />
      <Route path=":id" element={<TeachersDetailPage />} />
      <Route path=":id/edit" element={<RequireRole roles={[...ACCESS.manageTeachers]}><TeachersEditPage /></RequireRole>} />
      <Route path="*" element={<Navigate to="/teachers" replace />} />
    </Routes>
  );
}
