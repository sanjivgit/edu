import { Route, Routes } from 'react-router-dom';
import { RequireRole } from '@/components/shared/Guards';
import { ACCESS } from '@/config/access';
import SyllabusListPage from './SyllabusListPage';
import SyllabusCreatePage from './SyllabusCreatePage';
import SyllabusDetailPage from './SyllabusDetailPage';
import SyllabusEditPage from './SyllabusEditPage';

export default function SyllabusPage() {
  return (
    <Routes>
      <Route index element={<SyllabusListPage />} />
      <Route path="create" element={<RequireRole roles={[...ACCESS.manageSyllabus]}><SyllabusCreatePage /></RequireRole>} />
      <Route path=":syllabusId" element={<SyllabusDetailPage />} />
      <Route path=":syllabusId/edit" element={<RequireRole roles={[...ACCESS.manageSyllabus]}><SyllabusEditPage /></RequireRole>} />
    </Routes>
  );
}
