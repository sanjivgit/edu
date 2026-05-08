import { Route, Routes } from 'react-router-dom';
import { RequireRole } from '@/components/shared/Guards';
import SyllabusListPage from './SyllabusListPage';
import SyllabusCreatePage from './SyllabusCreatePage';
import SyllabusDetailPage from './SyllabusDetailPage';
import SyllabusEditPage from './SyllabusEditPage';

export default function SyllabusPage() {
  return (
    <Routes>
      <Route index element={<SyllabusListPage />} />
      <Route path="create" element={<RequireRole roles={['superadmin', 'admin']}><SyllabusCreatePage /></RequireRole>} />
      <Route path=":syllabusId" element={<SyllabusDetailPage />} />
      <Route path=":syllabusId/edit" element={<RequireRole roles={['superadmin', 'admin']}><SyllabusEditPage /></RequireRole>} />
    </Routes>
  );
}
