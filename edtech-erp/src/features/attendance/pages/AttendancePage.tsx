import { Route, Routes } from 'react-router-dom';
import { RequireRole } from '@/components/shared/Guards';
import { TEACHING_STAFF_ROLES } from '@/config/access';
import AttendanceMarkPage from './AttendanceMarkPage';
import AttendanceHistoryPage from './AttendanceHistoryPage';
import AttendanceSessionDetailPage from './AttendanceSessionDetailPage';

export default function AttendancePage() {
  return (
    <Routes>
      <Route
        index
        element={
          <RequireRole roles={TEACHING_STAFF_ROLES} redirectTo="/attendance/history">
            <AttendanceMarkPage />
          </RequireRole>
        }
      />
      <Route path="history" element={<AttendanceHistoryPage />} />
      <Route path="sessions/:sessionId" element={<AttendanceSessionDetailPage />} />
    </Routes>
  );
}
