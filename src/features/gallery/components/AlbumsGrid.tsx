import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import type { AlbumRecord } from '../services/gallery.service';

const VIS_LABEL: Record<string, string> = {
  public: 'Public',
  students: 'Students',
  parents: 'Parents',
  staff: 'Staff',
};

export function AlbumsGrid({
  data,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
}: {
  data: AlbumRecord[];
  isLoading?: boolean;
  onView: (album: AlbumRecord) => void;
  onEdit: (album: AlbumRecord) => void;
  onDelete: (album: AlbumRecord) => void;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="h-36 rounded-xl bg-muted animate-pulse" />
            <div className="mt-3 h-4 w-2/3 bg-muted rounded animate-pulse" />
            <div className="mt-2 h-3 w-1/2 bg-muted rounded animate-pulse" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((a) => (
        <Card key={a.id} className="overflow-hidden">
          <div className="relative">
            <img src={a.coverUrl} alt={a.title} className="h-40 w-full object-cover" />
            <div className="absolute top-3 left-3">
              <StatusBadge status={VIS_LABEL[a.visibility] ?? a.visibility} />
            </div>
            <div className="absolute top-2 right-2 flex gap-1.5">
              <Button size="icon-sm" variant="ghost" className="bg-background/80 hover:bg-background" onClick={() => onView(a)} title="View">
                <Eye className="h-4 w-4" />
              </Button>
              <Button size="icon-sm" variant="ghost" className="bg-background/80 hover:bg-background" onClick={() => onEdit(a)} title="Edit">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="icon-sm" variant="ghost" className="bg-background/80 hover:bg-background" onClick={() => onDelete(a)} title="Delete">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="p-4">
            <p className="font-semibold">{a.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{new Date(a.date).toLocaleDateString('en-IN')}</p>
            {a.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{a.description}</p>}
          </div>
        </Card>
      ))}
    </div>
  );
}

