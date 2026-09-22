import { Route, Routes } from 'react-router-dom';
import { RequireRole } from '@/components/shared/Guards';
import { ACCESS } from '@/config/access';
import HolidaysListPage from './HolidaysListPage';
import HolidaysCreatePage from './HolidaysCreatePage';
import HolidaysDetailPage from './HolidaysDetailPage';
import HolidaysEditPage from './HolidaysEditPage';

export default function HolidaysPage() {
  return (
    <Routes>
      <Route index element={<HolidaysListPage />} />
      <Route path="create" element={<RequireRole roles={[...ACCESS.manageHolidays]}><HolidaysCreatePage /></RequireRole>} />
      <Route path=":holidayId" element={<HolidaysDetailPage />} />
      <Route path=":holidayId/edit" element={<RequireRole roles={[...ACCESS.manageHolidays]}><HolidaysEditPage /></RequireRole>} />
    </Routes>
  );
}
