import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { ChatMessage, ConversationRecord } from '../services/chat.service';

export function ChatThread({
  conversation,
  messages,
  isLoading = false,
}: {
  conversation: ConversationRecord;
  messages: ChatMessage[];
  isLoading?: boolean;
}) {
  return (
    <Card className="flex flex-col min-h-[520px]">
      <div className="px-4 py-3 border-b border-border flex items-center gap-3">
        <Avatar name={conversation.avatarName} size="sm" />
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{conversation.title}</p>
          <p className="text-xs text-muted-foreground truncate">{conversation.subtitle}</p>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-auto space-y-3 bg-muted/10">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading messages...</div>
        ) : messages.length ? (
          messages.map((m) => (
            <div key={m.id} className={cn('flex', m.direction === 'out' ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[78%] rounded-2xl px-3 py-2 text-sm border',
                  m.direction === 'out'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border'
                )}
              >
                <p className="whitespace-pre-line">{m.text}</p>
                <p className={cn('text-[10px] mt-1 opacity-70', m.direction === 'out' ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                  {new Date(m.at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-muted-foreground">No messages yet.</div>
        )}
      </div>
    </Card>
  );
}

