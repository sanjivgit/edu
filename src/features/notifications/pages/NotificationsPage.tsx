import { Route, Routes } from 'react-router-dom';
import { RequireRole } from '@/components/shared/Guards';
import NotificationsListPage from './NotificationsListPage';
import NotificationsCreatePage from './NotificationsCreatePage';
import NotificationsDetailPage from './NotificationsDetailPage';
import NotificationsEditPage from './NotificationsEditPage';

export default function NotificationsPage() {
  return (
    <Routes>
      <Route index element={<NotificationsListPage />} />
      <Route path="create" element={<RequireRole roles={['superadmin', 'admin', 'teacher']}><NotificationsCreatePage /></RequireRole>} />
      <Route path=":notificationId" element={<NotificationsDetailPage />} />
      <Route path=":notificationId/edit" element={<RequireRole roles={['superadmin', 'admin', 'teacher']}><NotificationsEditPage /></RequireRole>} />
    </Routes>
  );
}
