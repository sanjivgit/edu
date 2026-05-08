import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AlbumForm } from '../components/AlbumForm';
import { useGetAlbumById, useUpdateAlbum } from '../services/gallery.service';
import type { UpdateAlbumPayload } from '../validations/gallery.schema';

export default function GalleryAlbumEditPage() {
  const navigate = useNavigate();
  const { albumId } = useParams();
  const albumQuery = useGetAlbumById({ albumId });
  const album = albumQuery.data;
  const updateMutation = useUpdateAlbum();

  if (!album) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit Album"
          description="Update album details"
          actions={
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/gallery')}>
              Back
            </Button>
          }
        />
        <Card>
          <div className="text-sm text-muted-foreground">{albumQuery.isLoading ? 'Loading...' : 'Album not found.'}</div>
        </Card>
      </div>
    );
  }

  const onSubmit = (values: UpdateAlbumPayload | any) => {
    updateMutation.mutate(
      {
        id: album.id,
        title: values.title,
        description: values.description ?? '',
        date: values.date,
        visibility: values.visibility,
      },
      { onSuccess: (updated) => navigate(`/gallery/albums/${updated.id}`) }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Album"
        description="Update album details"
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate(`/gallery/albums/${album.id}`)}>
            Back
          </Button>
        }
      />

      <AlbumForm
        mode="edit"
        defaultValues={{ ...album, id: album.id } as any}
        onSubmit={onSubmit}
        isSubmitting={updateMutation.isPending}
      />
    </div>
  );
}

