import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { ChatThread } from '../components/ChatThread';
import { MessageComposer } from '../components/MessageComposer';
import {
  useGetConversationById,
  useGetMessagesByConversation,
  useMarkConversationRead,
  useSendMessage,
} from '../services/chat.service';

export default function ChatConversationPage() {
  const navigate = useNavigate();
  const { conversationId } = useParams();

  const convQuery = useGetConversationById({ conversationId });
  const conv = convQuery.data;
  const msgsQuery = useGetMessagesByConversation({ conversationId });
  const messages = msgsQuery.data ?? [];

  const sendMutation = useSendMessage();
  const readMutation = useMarkConversationRead();

  useEffect(() => {
    if (!conversationId) return;
    readMutation.mutate({ conversationId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  if (!conv) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Chat"
          description="Conversation"
          actions={
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/chat')}>
              Back
            </Button>
          }
        />
        <div className="text-sm text-muted-foreground">{convQuery.isLoading ? 'Loading...' : 'Conversation not found.'}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Messages & Chat"
        description="Conversation"
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/chat')}>
            Back
          </Button>
        }
      />

      <ChatThread conversation={conv} messages={messages} isLoading={msgsQuery.isLoading} />
      <MessageComposer
        conversationId={conv.id}
        isSending={sendMutation.isPending}
        onSend={(p) => sendMutation.mutate(p)}
      />
    </div>
  );
}

