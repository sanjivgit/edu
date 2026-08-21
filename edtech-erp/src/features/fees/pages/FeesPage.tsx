import { Navigate, Route, Routes } from 'react-router-dom';
import FeeDetailPage from './FeeDetailPage';
import FeesListPage from './FeesListPage';
import FeesRecordPaymentPage from './FeesRecordPaymentPage';

export default function FeesPage() {
  return (
    <Routes>
      <Route index element={<FeesListPage />} />
      <Route path="record-payment" element={<FeesRecordPaymentPage />} />
      <Route path=":id" element={<FeeDetailPage />} />
      <Route path="*" element={<Navigate to="/fees" replace />} />
    </Routes>
  );
}
