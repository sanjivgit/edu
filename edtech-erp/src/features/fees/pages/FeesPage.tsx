import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireRole } from '@/components/shared/Guards';
import { MANAGEMENT_ROLES } from '@/config/access';
import FeeDetailPage from './FeeDetailPage';
import FeesListPage from './FeesListPage';
import FeesRecordPaymentPage from './FeesRecordPaymentPage';

export default function FeesPage() {
  return (
    <Routes>
      <Route index element={<FeesListPage />} />
      <Route
        path="record-payment"
        element={
          <RequireRole roles={MANAGEMENT_ROLES}>
            <FeesRecordPaymentPage />
          </RequireRole>
        }
      />
      <Route path=":id" element={<FeeDetailPage />} />
      <Route path="*" element={<Navigate to="/fees" replace />} />
    </Routes>
  );
}
