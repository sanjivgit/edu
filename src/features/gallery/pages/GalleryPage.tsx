import { Navigate, Route, Routes } from 'react-router-dom';
import GalleryAlbumsListPage from './GalleryAlbumsListPage';
import GalleryAlbumCreatePage from './GalleryAlbumCreatePage';
import GalleryAlbumDetailPage from './GalleryAlbumDetailPage';
import GalleryAlbumEditPage from './GalleryAlbumEditPage';

export default function GalleryPage() {
  return (
    <Routes>
      <Route index element={<GalleryAlbumsListPage />} />
      <Route path="albums" element={<Navigate to="/gallery" replace />} />
      <Route path="albums/create" element={<GalleryAlbumCreatePage />} />
      <Route path="albums/:albumId" element={<GalleryAlbumDetailPage />} />
      <Route path="albums/:albumId/edit" element={<GalleryAlbumEditPage />} />
    </Routes>
  );
}
