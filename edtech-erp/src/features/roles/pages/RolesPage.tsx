import { Route, Routes } from 'react-router-dom';
import { RequireRole } from '@/components/shared/Guards';
import { ACCESS } from '@/config/access';
import RolesListPage from './RolesListPage';
import RoleCreatePage from './RoleCreatePage';
import RoleDetailPage from './RoleDetailPage';
import RoleEditPage from './RoleEditPage';

export default function RolesPage() {
  return (
    <Routes>
      <Route index element={<RolesListPage />} />
      <Route path="create" element={<RequireRole roles={[...ACCESS.manageRoles]}><RoleCreatePage /></RequireRole>} />
      <Route path=":roleId" element={<RoleDetailPage />} />
      <Route path=":roleId/edit" element={<RequireRole roles={[...ACCESS.manageRoles]}><RoleEditPage /></RequireRole>} />
    </Routes>
  );
}
