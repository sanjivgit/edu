import { Route, Routes } from 'react-router-dom';
import { RequireRole } from '@/components/shared/Guards';
import { ACCESS } from '@/config/access';
import NoticeboardListPage from './NoticeboardListPage';
import NoticeboardCreatePage from './NoticeboardCreatePage';
import NoticeboardDetailPage from './NoticeboardDetailPage';
import NoticeboardEditPage from './NoticeboardEditPage';

export default function NoticeboardPage() {
  return (
    <Routes>
      <Route index element={<NoticeboardListPage />} />
      <Route path="create" element={<RequireRole roles={[...ACCESS.manageNotices]}><NoticeboardCreatePage /></RequireRole>} />
      <Route path=":noticeId" element={<NoticeboardDetailPage />} />
      <Route path=":noticeId/edit" element={<RequireRole roles={[...ACCESS.manageNotices]}><NoticeboardEditPage /></RequireRole>} />
    </Routes>
  );
}
