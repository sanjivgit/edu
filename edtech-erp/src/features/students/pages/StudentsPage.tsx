import { Navigate, Route, Routes } from 'react-router-dom';
import StudentsListPage from './StudentsListPage';
import StudentsCreatePage from './StudentsCreatePage';
import StudentsDetailPage from './StudentsDetailPage';
import StudentsEditPage from './StudentsEditPage';

export default function StudentsPage() {
  return (
    <Routes>
      <Route index element={<StudentsListPage />} />
      <Route path="create" element={<StudentsCreatePage />} />
      <Route path=":id" element={<StudentsDetailPage />} />
      <Route path=":id/edit" element={<StudentsEditPage />} />
      <Route path="*" element={<Navigate to="/students" replace />} />
    </Routes>
  );
}
