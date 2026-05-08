import { Navigate, Route, Routes } from 'react-router-dom';
import AdmissionCreatePage from './AdmissionCreatePage';
import AdmissionDetailPage from './AdmissionDetailPage';
import AdmissionEditPage from './AdmissionEditPage';
import AdmissionListPage from './AdmissionListPage';

export default function AdmissionPage() {
  return (
    <Routes>
      <Route index element={<AdmissionListPage />} />
      <Route path="new" element={<AdmissionCreatePage />} />
      <Route path=":admissionId" element={<AdmissionDetailPage />} />
      <Route path=":admissionId/edit" element={<AdmissionEditPage />} />
      <Route path="*" element={<Navigate to="/admissions" replace />} />
    </Routes>
  );
}
