import { Route, Routes } from 'react-router-dom';
import AuditLogsListPage from './AuditLogsListPage';
import AuditLogDetailPage from './AuditLogDetailPage';

export default function AuditLogsPage() {
  return (
    <Routes>
      <Route index element={<AuditLogsListPage />} />
      <Route path=":logId" element={<AuditLogDetailPage />} />
    </Routes>
  );
}
