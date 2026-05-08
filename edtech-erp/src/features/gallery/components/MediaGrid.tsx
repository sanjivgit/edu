import { Card } from '@/components/ui/Card';
import type { MediaItem } from '../services/gallery.service';

export function MediaGrid({ items, isLoading = false }: { items: MediaItem[]; isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="h-32 bg-muted animate-pulse" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {items.map((m) => (
        <Card key={m.id} className="overflow-hidden">
          {m.type === 'image' ? (
            <img src={m.url} alt={m.caption ?? ''} className="h-32 w-full object-cover" />
          ) : (
            <div className="h-32 w-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
              Video
            </div>
          )}
          {m.caption && <div className="p-2 text-xs text-muted-foreground line-clamp-2">{m.caption}</div>}
        </Card>
      ))}
    </div>
  );
}

