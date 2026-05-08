import { useQuery } from '@tanstack/react-query';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';
import { mockDelay } from '@/shared/utils';

export type MessageDirection = 'in' | 'out';

export interface ConversationRecord {
  id: string;
  title: string;
  subtitle: string;
  avatarName: string;
  unreadCount: number;
  lastMessage: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  direction: MessageDirection;
  sender: string;
  text: string;
  at: string; // ISO datetime
}

const API = '/chat';
let conversationStore: ConversationRecord[] = [];
let messageStore: ChatMessage[] = [];

function ensureSeed() {
  if (conversationStore.length) return;
  const now = new Date();
  const iso = (d: Date) => d.toISOString();

  conversationStore = [
    {
      id: 'C-1',
      title: 'Ms. Joshi',
      subtitle: 'Science · Class 10-A',
      avatarName: 'Ms. Joshi',
      unreadCount: 2,
      lastMessage: 'Please remind students to bring lab coat.',
      updatedAt: iso(new Date(now.getTime() - 1000 * 60 * 10)),
    },
    {
      id: 'C-2',
      title: 'Parents Group (10-A)',
      subtitle: 'Broadcast',
      avatarName: 'Parents Group',
      unreadCount: 0,
      lastMessage: 'Tomorrow is PTM at 10:00 AM.',
      updatedAt: iso(new Date(now.getTime() - 1000 * 60 * 30)),
    },
    {
      id: 'C-3',
      title: 'Mr. Verma',
      subtitle: 'Mathematics · Class 10-A',
      avatarName: 'Mr. Verma',
      unreadCount: 1,
      lastMessage: 'Share the algebra worksheet link.',
      updatedAt: iso(new Date(now.getTime() - 1000 * 60 * 55)),
    },
  ];

  messageStore = [
    {
      id: 'M-1',
      conversationId: 'C-1',
      direction: 'in',
      sender: 'Ms. Joshi',
      text: 'Hi, can you ensure lab coats for tomorrow?',
      at: iso(new Date(now.getTime() - 1000 * 60 * 40)),
    },
    {
      id: 'M-2',
      conversationId: 'C-1',
      direction: 'out',
      sender: 'Admin',
      text: 'Sure. I’ll notify the class.',
      at: iso(new Date(now.getTime() - 1000 * 60 * 35)),
    },
    {
      id: 'M-3',
      conversationId: 'C-1',
      direction: 'in',
      sender: 'Ms. Joshi',
      text: 'Please remind students to bring lab coat.',
      at: iso(new Date(now.getTime() - 1000 * 60 * 10)),
    },
    {
      id: 'M-4',
      conversationId: 'C-3',
      direction: 'in',
      sender: 'Mr. Verma',
      text: 'Share the algebra worksheet link.',
      at: iso(new Date(now.getTime() - 1000 * 60 * 55)),
    },
    {
      id: 'M-5',
      conversationId: 'C-2',
      direction: 'out',
      sender: 'Admin',
      text: 'Tomorrow is PTM at 10:00 AM.',
      at: iso(new Date(now.getTime() - 1000 * 60 * 30)),
    },
  ];
}

export const useGetConversations = () =>
  useQuery({
    queryKey: [API, 'conversations'],
    queryFn: async () => {
      await mockDelay(150);
      ensureSeed();
      return [...conversationStore].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
  });

export const useGetConversationById = ({ conversationId }: { conversationId?: string }) =>
  useQuery({
    queryKey: [API, 'conversations', conversationId],
    queryFn: async () => {
      await mockDelay(120);
      ensureSeed();
      return conversationStore.find((c) => c.id === conversationId) ?? null;
    },
    enabled: !!conversationId,
  });

export const useGetMessagesByConversation = ({ conversationId }: { conversationId?: string }) =>
  useQuery({
    queryKey: [API, 'messages', conversationId],
    queryFn: async () => {
      await mockDelay(120);
      ensureSeed();
      return messageStore
        .filter((m) => m.conversationId === conversationId)
        .sort((a, b) => a.at.localeCompare(b.at));
    },
    enabled: !!conversationId,
  });

export const useSendMessage = () =>
  useAppMutation({
    mutationFn: async (body: { conversationId: string; text: string }) => {
      await mockDelay(180);
      ensureSeed();
      const conv = conversationStore.find((c) => c.id === body.conversationId);
      if (!conv) throw new Error('Conversation not found');
      const msg: ChatMessage = {
        id: `M-${messageStore.length + 1}`,
        conversationId: body.conversationId,
        direction: 'out',
        sender: 'Admin',
        text: body.text,
        at: new Date().toISOString(),
      };
      messageStore = [...messageStore, msg];
      conversationStore = conversationStore.map((c) =>
        c.id === body.conversationId
          ? { ...c, lastMessage: body.text, updatedAt: msg.at, unreadCount: 0 }
          : c
      );
      return msg;
    },
    successMsg: 'Message sent',
    errorMsg: 'Failed to send message',
    invalidateQueryKeys: [[API, 'messages'], [API, 'conversations']],
    onSuccessNotificationVisible: false,
  });

export const useMarkConversationRead = () =>
  useAppMutation({
    mutationFn: async (body: { conversationId: string }) => {
      await mockDelay(80);
      ensureSeed();
      conversationStore = conversationStore.map((c) =>
        c.id === body.conversationId ? { ...c, unreadCount: 0 } : c
      );
      return { conversationId: body.conversationId };
    },
    successMsg: 'Marked as read',
    errorMsg: 'Failed to mark as read',
    invalidateQueryKeys: [[API, 'conversations']],
    onSuccessNotificationVisible: false,
    onErrorNotificationVisible: false,
  });

