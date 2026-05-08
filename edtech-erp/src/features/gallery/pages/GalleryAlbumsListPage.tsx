import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { AlbumsGrid } from '../components/AlbumsGrid';
import { useDeleteAlbum, useGetAlbums } from '../services/gallery.service';

export default function GalleryAlbumsListPage() {
  const navigate = useNavigate();
  const listQuery = useGetAlbums();
  const deleteMutation = useDeleteAlbum();
  const data = listQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gallery"
        description="Browse school photos and media"
        actions={
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/gallery/albums/create')}>
            Create Album
          </Button>
        }
      />

      <AlbumsGrid
        data={data}
        isLoading={listQuery.isLoading}
        onView={(a) => navigate(`/gallery/albums/${a.id}`)}
        onEdit={(a) => navigate(`/gallery/albums/${a.id}/edit`)}
        onDelete={(a) => deleteMutation.mutate({ id: a.id })}
      />
    </div>
  );
}

