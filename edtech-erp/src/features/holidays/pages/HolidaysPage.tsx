import { Route, Routes } from 'react-router-dom';
import HolidaysListPage from './HolidaysListPage';
import HolidaysCreatePage from './HolidaysCreatePage';
import HolidaysDetailPage from './HolidaysDetailPage';
import HolidaysEditPage from './HolidaysEditPage';

export default function HolidaysPage() {
  return (
    <Routes>
      <Route index element={<HolidaysListPage />} />
      <Route path="create" element={<HolidaysCreatePage />} />
      <Route path=":holidayId" element={<HolidaysDetailPage />} />
      <Route path=":holidayId/edit" element={<HolidaysEditPage />} />
    </Routes>
  );
}
