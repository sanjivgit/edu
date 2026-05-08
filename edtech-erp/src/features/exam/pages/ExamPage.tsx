import { Route, Routes } from 'react-router-dom';
import { RequireRole } from '@/components/shared/Guards';
import ExamListPage from './ExamListPage';
import ExamCreatePage from './ExamCreatePage';
import ExamDetailPage from './ExamDetailPage';
import ExamEditPage from './ExamEditPage';

export default function ExamPage() {
  return (
    <Routes>
      <Route index element={<ExamListPage />} />
      <Route path="create" element={<RequireRole roles={['superadmin', 'admin', 'teacher']}><ExamCreatePage /></RequireRole>} />
      <Route path=":examId" element={<ExamDetailPage />} />
      <Route path=":examId/edit" element={<RequireRole roles={['superadmin', 'admin', 'teacher']}><ExamEditPage /></RequireRole>} />
    </Routes>
  );
}
