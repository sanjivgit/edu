import { Route, Routes } from 'react-router-dom';
import { RequireRole } from '@/components/shared/Guards';
import NoticeboardListPage from './NoticeboardListPage';
import NoticeboardCreatePage from './NoticeboardCreatePage';
import NoticeboardDetailPage from './NoticeboardDetailPage';
import NoticeboardEditPage from './NoticeboardEditPage';

export default function NoticeboardPage() {
  return (
    <Routes>
      <Route index element={<NoticeboardListPage />} />
      <Route path="create" element={<RequireRole roles={['superadmin', 'admin', 'teacher']}><NoticeboardCreatePage /></RequireRole>} />
      <Route path=":noticeId" element={<NoticeboardDetailPage />} />
      <Route path=":noticeId/edit" element={<RequireRole roles={['superadmin', 'admin', 'teacher']}><NoticeboardEditPage /></RequireRole>} />
    </Routes>
  );
}
