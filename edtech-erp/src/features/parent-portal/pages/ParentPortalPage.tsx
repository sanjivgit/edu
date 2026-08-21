import { Navigate, Route, Routes } from 'react-router-dom';
import ParentFeesPage from './ParentFeesPage';
import ParentFeeDetailPage from './ParentFeeDetailPage';

export default function ParentPortalPage() {
  return (
    <Routes>
      <Route path="fees" element={<ParentFeesPage />} />
      <Route path="fees/:id" element={<ParentFeeDetailPage />} />
      <Route path="*" element={<Navigate to="/parent-portal/fees" replace />} />
    </Routes>
  );
}
