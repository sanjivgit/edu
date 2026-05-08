import { Navigate, Route, Routes } from 'react-router-dom';
import TeachersListPage from './TeachersListPage';
import TeachersCreatePage from './TeachersCreatePage';
import TeachersDetailPage from './TeachersDetailPage';
import TeachersEditPage from './TeachersEditPage';

export default function TeachersPage() {
  return (
    <Routes>
      <Route index element={<TeachersListPage />} />
      <Route path="create" element={<TeachersCreatePage />} />
      <Route path=":id" element={<TeachersDetailPage />} />
      <Route path=":id/edit" element={<TeachersEditPage />} />
      <Route path="*" element={<Navigate to="/teachers" replace />} />
    </Routes>
  );
}

