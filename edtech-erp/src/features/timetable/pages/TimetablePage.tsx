import { Route, Routes } from 'react-router-dom';
import { RequireRole } from '@/components/shared/Guards';
import { ACCESS } from '@/config/access';
import TimetableListPage from './TimetableListPage';
import TimetableEditPage from './TimetableEditPage';
import TimetableAssignPage from './TimetableAssignPage';

export default function TimetablePage() {
  return (
    <Routes>
      <Route index element={<TimetableListPage />} />
      <Route path="edit" element={<RequireRole roles={[...ACCESS.manageTimetable]}><TimetableEditPage /></RequireRole>} />
      <Route path="assign" element={<RequireRole roles={[...ACCESS.manageTimetable]}><TimetableAssignPage /></RequireRole>} />
    </Routes>
  );
}
