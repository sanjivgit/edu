import { Route, Routes } from 'react-router-dom';
import { RequireRole } from '@/components/shared/Guards';
import AssessmentListPage from './AssessmentListPage';
import AssessmentCreatePage from './AssessmentCreatePage';
import AssessmentDetailPage from './AssessmentDetailPage';
import AssessmentEditPage from './AssessmentEditPage';

export default function AssessmentPage() {
  return (
    <Routes>
      <Route index element={<AssessmentListPage />} />
      <Route path="create" element={<RequireRole roles={['superadmin', 'admin', 'teacher']}><AssessmentCreatePage /></RequireRole>} />
      <Route path=":assessmentId" element={<AssessmentDetailPage />} />
      <Route path=":assessmentId/edit" element={<RequireRole roles={['superadmin', 'admin', 'teacher']}><AssessmentEditPage /></RequireRole>} />
    </Routes>
  );
}
