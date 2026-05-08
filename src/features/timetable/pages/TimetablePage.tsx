import { Route, Routes } from 'react-router-dom';
import { RequireRole } from '@/components/shared/Guards';
import TimetableListPage from './TimetableListPage';
import TimetableEditPage from './TimetableEditPage';
import TimetableAssignPage from './TimetableAssignPage';

export default function TimetablePage() {
  return (
    <Routes>
      <Route index element={<TimetableListPage />} />
      <Route path="edit" element={<RequireRole roles={['superadmin', 'admin', 'teacher']}><TimetableEditPage /></RequireRole>} />
      <Route path="assign" element={<RequireRole roles={['superadmin', 'admin', 'teacher']}><TimetableAssignPage /></RequireRole>} />
    </Routes>
  );
}
