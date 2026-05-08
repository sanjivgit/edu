import { Route, Routes } from 'react-router-dom';
import SyllabusListPage from './SyllabusListPage';
import SyllabusCreatePage from './SyllabusCreatePage';
import SyllabusDetailPage from './SyllabusDetailPage';
import SyllabusEditPage from './SyllabusEditPage';

export default function SyllabusPage() {
  return (
    <Routes>
      <Route index element={<SyllabusListPage />} />
      <Route path="create" element={<SyllabusCreatePage />} />
      <Route path=":syllabusId" element={<SyllabusDetailPage />} />
      <Route path=":syllabusId/edit" element={<SyllabusEditPage />} />
    </Routes>
  );
}
