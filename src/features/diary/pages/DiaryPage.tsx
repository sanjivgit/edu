import { Route, Routes } from 'react-router-dom';
import { RequireRole } from '@/components/shared/Guards';
import DiaryListPage from './DiaryListPage';
import DiaryCreatePage from './DiaryCreatePage';
import DiaryDetailPage from './DiaryDetailPage';
import DiaryEditPage from './DiaryEditPage';

export default function DiaryPage() {
  return (
    <Routes>
      <Route index element={<DiaryListPage />} />
      <Route path="create" element={<RequireRole roles={['superadmin', 'admin', 'teacher']}><DiaryCreatePage /></RequireRole>} />
      <Route path=":entryId" element={<DiaryDetailPage />} />
      <Route path=":entryId/edit" element={<RequireRole roles={['superadmin', 'admin', 'teacher']}><DiaryEditPage /></RequireRole>} />
    </Routes>
  );
}
