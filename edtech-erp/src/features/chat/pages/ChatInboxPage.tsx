import { MessageSquarePlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { ConversationsList } from '../components/ConversationsList';
import { useGetConversations } from '../services/chat.service';

export default function ChatInboxPage() {
  const navigate = useNavigate();
  const convQuery = useGetConversations();
  const data = convQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages & Chat"
        description="Communicate with teachers and students"
        actions={
          <Button
            size="sm"
            variant="outline"
            leftIcon={<MessageSquarePlus className="h-4 w-4" />}
            onClick={() => navigate(data[0] ? `/chat/${data[0].id}` : '/chat')}
          >
            Open Latest
          </Button>
        }
      />

      <ConversationsList
        data={data}
        isLoading={convQuery.isLoading}
        onSelect={(c) => navigate(`/chat/${c.id}`)}
      />
    </div>
  );
}

