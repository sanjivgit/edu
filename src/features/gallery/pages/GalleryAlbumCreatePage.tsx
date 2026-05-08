import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { AlbumForm } from '../components/AlbumForm';
import { useCreateAlbum } from '../services/gallery.service';
import type { CreateAlbumPayload } from '../validations/gallery.schema';

export default function GalleryAlbumCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateAlbum();

  const onSubmit = (values: CreateAlbumPayload) => {
    createMutation.mutate(
      {
        title: values.title,
        description: values.description ?? '',
        date: values.date,
        visibility: values.visibility,
      },
      { onSuccess: (created) => navigate(`/gallery/albums/${created.id}`) }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Album"
        description="Create a new gallery album"
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/gallery')}>
            Back
          </Button>
        }
      />

      <AlbumForm mode="create" onSubmit={onSubmit} isSubmitting={createMutation.isPending} />
    </div>
  );
}

