import { ChevronRight } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { ConversationRecord } from '../services/chat.service';

export function ConversationsList({
  data,
  activeId,
  onSelect,
  isLoading = false,
}: {
  data: ConversationRecord[];
  activeId?: string;
  onSelect: (c: ConversationRecord) => void;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <Card className="p-4 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
            <div className="flex-1">
              <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
              <div className="mt-2 h-3 w-2/3 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </Card>
    );
  }

  return (
    <Card padding="sm">
      <div className="divide-y divide-border">
        {data.map((c) => {
          const active = c.id === activeId;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-muted/30 transition-colors',
                active && 'bg-muted/30'
              )}
            >
              <Avatar name={c.avatarName} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold truncate">{c.title}</p>
                  {c.unreadCount > 0 && (
                    <Badge variant="success" className="text-[10px] px-2 py-0.5">
                      {c.unreadCount}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{c.subtitle}</p>
                <p className="text-xs text-muted-foreground/80 truncate mt-1">{c.lastMessage}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          );
        })}
      </div>
    </Card>
  );
}

