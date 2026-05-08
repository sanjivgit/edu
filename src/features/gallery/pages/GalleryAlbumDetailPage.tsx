import { ArrowLeft, Pencil } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { AddMediaForm } from '../components/AddMediaForm';
import { MediaGrid } from '../components/MediaGrid';
import { useAddMediaToAlbum, useGetAlbumById, useGetMediaByAlbum } from '../services/gallery.service';
import type { AddMediaPayload } from '../validations/gallery.schema';

const VIS_LABEL: Record<string, string> = {
  public: 'Public',
  students: 'Students',
  parents: 'Parents',
  staff: 'Staff',
};

export default function GalleryAlbumDetailPage() {
  const navigate = useNavigate();
  const { albumId } = useParams();
  const albumQuery = useGetAlbumById({ albumId });
  const album = albumQuery.data;
  const mediaQuery = useGetMediaByAlbum({ albumId });
  const addMutation = useAddMediaToAlbum();

  if (!album) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Album"
          description="Album details"
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

  const onAdd = (values: AddMediaPayload) => {
    addMutation.mutate({
      albumId: album.id,
      type: values.type,
      url: values.url,
      caption: values.caption ?? '',
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={album.title}
        description={album.description ?? 'Album details and media'}
        actions={
          <>
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/gallery')}>
              Back
            </Button>
            <Button size="sm" leftIcon={<Pencil className="h-4 w-4" />} onClick={() => navigate(`/gallery/albums/${album.id}/edit`)}>
              Edit
            </Button>
          </>
        }
      />

      <Card className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Date</p>
            <p className="text-sm font-semibold">{new Date(album.date).toLocaleDateString('en-IN')}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Visibility</p>
            <div className="mt-1">
              <StatusBadge status={VIS_LABEL[album.visibility] ?? album.visibility} />
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Media</p>
            <p className="text-sm font-semibold font-mono">{(mediaQuery.data ?? []).length}</p>
          </div>
        </div>
      </Card>

      <AddMediaForm albumId={album.id} onSubmit={onAdd} isSubmitting={addMutation.isPending} />

      <MediaGrid items={mediaQuery.data ?? []} isLoading={mediaQuery.isLoading} />
    </div>
  );
}

