import { Route, Routes } from 'react-router-dom';
import ReportsDashboardPage from './ReportsDashboardPage';

export default function ReportsPage() {
  return (
    <Routes>
      <Route index element={<ReportsDashboardPage />} />
    </Routes>
  );
}
