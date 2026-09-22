import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireRole } from '@/components/shared/Guards';
import { ACCESS } from '@/config/access';
import AdmissionCreatePage from './AdmissionCreatePage';
import AdmissionDetailPage from './AdmissionDetailPage';
import AdmissionEditPage from './AdmissionEditPage';
import AdmissionListPage from './AdmissionListPage';

export default function AdmissionPage() {
  return (
    <Routes>
      <Route index element={<AdmissionListPage />} />
      <Route path="new" element={<RequireRole roles={[...ACCESS.manageAdmissions]}><AdmissionCreatePage /></RequireRole>} />
      <Route path=":admissionId" element={<AdmissionDetailPage />} />
      <Route path=":admissionId/edit" element={<RequireRole roles={[...ACCESS.manageAdmissions]}><AdmissionEditPage /></RequireRole>} />
      <Route path="*" element={<Navigate to="/admissions" replace />} />
    </Routes>
  );
}
