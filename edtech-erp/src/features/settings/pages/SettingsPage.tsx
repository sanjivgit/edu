import { Navigate, Route, Routes } from 'react-router-dom';
import SettingsLayoutPage from './SettingsLayoutPage';
import InstitutionSettingsPage from './InstitutionSettingsPage';
import ProfileSettingsPage from './ProfileSettingsPage';
import ThemeSettingsPage from './ThemeSettingsPage';
import NotificationPrefsSettingsPage from './NotificationPrefsSettingsPage';
import SecuritySettingsPage from './SecuritySettingsPage';
import DataBackupSettingsPage from './DataBackupSettingsPage';

export default function SettingsPage() {
  return (
    <Routes>
      <Route element={<SettingsLayoutPage />}>
        <Route index element={<Navigate to="/settings/institution" replace />} />
        <Route path="institution" element={<InstitutionSettingsPage />} />
        <Route path="profile" element={<ProfileSettingsPage />} />
        <Route path="theme" element={<ThemeSettingsPage />} />
        <Route path="notifications" element={<NotificationPrefsSettingsPage />} />
        <Route path="security" element={<SecuritySettingsPage />} />
        <Route path="data" element={<DataBackupSettingsPage />} />
      </Route>
    </Routes>
  );
}