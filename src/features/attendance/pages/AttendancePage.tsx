import { Route, Routes } from 'react-router-dom';
import AttendanceMarkPage from './AttendanceMarkPage';
import AttendanceHistoryPage from './AttendanceHistoryPage';
import AttendanceSessionDetailPage from './AttendanceSessionDetailPage';

export default function AttendancePage() {
  return (
    <Routes>
      <Route index element={<AttendanceMarkPage />} />
      <Route path="history" element={<AttendanceHistoryPage />} />
      <Route path="sessions/:sessionId" element={<AttendanceSessionDetailPage />} />
    </Routes>
  );
}
