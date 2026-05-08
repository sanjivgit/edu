import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireRole } from '@/components/shared/Guards';
import TransportRoutesListPage from './TransportRoutesListPage';
import TransportRouteCreatePage from './TransportRouteCreatePage';
import TransportRouteDetailPage from './TransportRouteDetailPage';
import TransportRouteEditPage from './TransportRouteEditPage';

export default function TransportPage() {
  return (
    <Routes>
      <Route index element={<TransportRoutesListPage />} />
      <Route path="routes" element={<Navigate to="/transport" replace />} />
      <Route path="routes/create" element={<RequireRole roles={['superadmin', 'admin']}><TransportRouteCreatePage /></RequireRole>} />
      <Route path="routes/:routeId" element={<TransportRouteDetailPage />} />
      <Route path="routes/:routeId/edit" element={<RequireRole roles={['superadmin', 'admin']}><TransportRouteEditPage /></RequireRole>} />
    </Routes>
  );
}
