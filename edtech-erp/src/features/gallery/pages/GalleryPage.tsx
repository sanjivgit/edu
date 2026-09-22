import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireRole } from '@/components/shared/Guards';
import { ACCESS } from '@/config/access';
import GalleryAlbumsListPage from './GalleryAlbumsListPage';
import GalleryAlbumCreatePage from './GalleryAlbumCreatePage';
import GalleryAlbumDetailPage from './GalleryAlbumDetailPage';
import GalleryAlbumEditPage from './GalleryAlbumEditPage';

export default function GalleryPage() {
  return (
    <Routes>
      <Route index element={<GalleryAlbumsListPage />} />
      <Route path="albums" element={<Navigate to="/gallery" replace />} />
      <Route path="albums/create" element={<RequireRole roles={[...ACCESS.manageGallery]}><GalleryAlbumCreatePage /></RequireRole>} />
      <Route path="albums/:albumId" element={<GalleryAlbumDetailPage />} />
      <Route path="albums/:albumId/edit" element={<RequireRole roles={[...ACCESS.manageGallery]}><GalleryAlbumEditPage /></RequireRole>} />
    </Routes>
  );
}
