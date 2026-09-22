import { Route, Routes } from 'react-router-dom';
import { RequireRole } from '@/components/shared/Guards';
import { ACCESS } from '@/config/access';
import AssessmentListPage from './AssessmentListPage';
import AssessmentCreatePage from './AssessmentCreatePage';
import AssessmentDetailPage from './AssessmentDetailPage';
import AssessmentEditPage from './AssessmentEditPage';

export default function AssessmentPage() {
  return (
    <Routes>
      <Route index element={<AssessmentListPage />} />
      <Route path="create" element={<RequireRole roles={[...ACCESS.manageAssessments]}><AssessmentCreatePage /></RequireRole>} />
      <Route path=":assessmentId" element={<AssessmentDetailPage />} />
      <Route path=":assessmentId/edit" element={<RequireRole roles={[...ACCESS.manageAssessments]}><AssessmentEditPage /></RequireRole>} />
    </Routes>
  );
}
