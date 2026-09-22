import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks';
import { AlbumsGrid } from '../components/AlbumsGrid';
import { useDeleteAlbum, useGetAlbums } from '../services/gallery.service';

export default function GalleryAlbumsListPage() {
  const navigate = useNavigate();
  const { isTeachingStaff } = useAuth();
  const listQuery = useGetAlbums();
  const deleteMutation = useDeleteAlbum();
  const data = listQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gallery"
        description="Browse school photos and media"
        actions={
          isTeachingStaff ? (
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/gallery/albums/create')}>
              Create Album
            </Button>
          ) : undefined
        }
      />

      <AlbumsGrid
        data={data}
        isLoading={listQuery.isLoading}
        onView={(a) => navigate(`/gallery/albums/${a.id}`)}
        onEdit={isTeachingStaff ? (a) => navigate(`/gallery/albums/${a.id}/edit`) : undefined}
        onDelete={isTeachingStaff ? (a) => deleteMutation.mutate({ id: a.id }) : undefined}
      />
    </div>
  );
}
