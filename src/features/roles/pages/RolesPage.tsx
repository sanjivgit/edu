import { Route, Routes } from 'react-router-dom';
import RolesListPage from './RolesListPage';
import RoleCreatePage from './RoleCreatePage';
import RoleDetailPage from './RoleDetailPage';
import RoleEditPage from './RoleEditPage';

export default function RolesPage() {
  return (
    <Routes>
      <Route index element={<RolesListPage />} />
      <Route path="create" element={<RoleCreatePage />} />
      <Route path=":roleId" element={<RoleDetailPage />} />
      <Route path=":roleId/edit" element={<RoleEditPage />} />
    </Routes>
  );
}
