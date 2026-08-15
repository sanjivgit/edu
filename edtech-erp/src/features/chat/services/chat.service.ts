import { useQuery } from '@tanstack/react-query';
import apiClient, { unwrapApi } from '@/lib/apiClient';
import type { ApiResponse } from '@/types';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';

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

interface BackendMessage {
  id: string;
  conversationId: string;
  direction: MessageDirection;
  sender: string;
  text: string;
  at: string;
}

interface BackendConversationDetail {
  id: string;
  title: string;
  isGroup: boolean;
  participants: Array<{ id: string; name: string; avatar?: string }>;
  updatedAt: string;
}

function toConversationRecord(c: {
  id: string;
  title: string;
  subtitle?: string;
  avatarName?: string;
  unreadCount?: number;
  lastMessage?: string;
  updatedAt: string;
}): ConversationRecord {
  return {
    id: c.id,
    title: c.title,
    subtitle: c.subtitle ?? '',
    avatarName: c.avatarName ?? (c.title ?? '?')[0],
    unreadCount: c.unreadCount ?? 0,
    lastMessage: c.lastMessage ?? '',
    updatedAt: c.updatedAt,
  };
}

function toConversationDetail(c: BackendConversationDetail): ConversationRecord {
  return {
    id: c.id,
    title: c.title,
    subtitle: c.participants.map((p) => p.name).join(', '),
    avatarName: (c.title ?? '?')[0],
    unreadCount: 0,
    lastMessage: '',
    updatedAt: c.updatedAt,
  };
}

export const useGetConversations = () =>
  useQuery({
    queryKey: [API, 'conversations'],
    queryFn: async () => {
      const res = await apiClient
        .get<
          ApiResponse<
            Array<{
              id: string;
              title: string;
              subtitle: string;
              avatarName: string;
              unreadCount: number;
              lastMessage: string;
              updatedAt: string;
            }>
          >
        >(`${API}/conversations`)
        .then(unwrapApi);
      return (res ?? [])
        .map(toConversationRecord)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
  });

export const useGetConversationById = ({ conversationId }: { conversationId?: string }) =>
  useQuery({
    queryKey: [API, 'conversations', conversationId],
    queryFn: async () => {
      if (!conversationId) return null;
      const res = await apiClient
        .get<ApiResponse<BackendConversationDetail>>(`${API}/conversations/${conversationId}`)
        .then(unwrapApi);
      return res ? toConversationDetail(res) : null;
    },
    enabled: !!conversationId,
  });

export const useGetMessagesByConversation = ({ conversationId }: { conversationId?: string }) =>
  useQuery({
    queryKey: [API, 'messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const res = await apiClient
        .get<ApiResponse<BackendMessage[]>>(`${API}/conversations/${conversationId}/messages`)
        .then(unwrapApi);
      return (res ?? [])
        .map((m) => ({
          id: m.id,
          conversationId: m.conversationId,
          direction: m.direction,
          sender: m.sender,
          text: m.text,
          at: m.at,
        }))
        .sort((a, b) => a.at.localeCompare(b.at));
    },
    enabled: !!conversationId,
  });

export const useSendMessage = () =>
  useAppMutation<ChatMessage, { conversationId: string; text: string }>({
    mutationFn: async (body) => {
      const msg = await apiClient
        .post<ApiResponse<BackendMessage>>(`${API}/conversations/${body.conversationId}/messages`, {
          content: body.text,
        })
        .then(unwrapApi);
      return {
        id: msg.id,
        conversationId: msg.conversationId,
        direction: msg.direction,
        sender: msg.sender,
        text: msg.text,
        at: msg.at,
      };
    },
    successMsg: 'Message sent',
    errorMsg: 'Failed to send message',
    invalidateQueryKeys: [[API, 'messages'], [API, 'conversations']],
    onSuccessNotificationVisible: false,
  });

export const useMarkConversationRead = () =>
  useAppMutation<{ conversationId: string }, { conversationId: string }>({
    mutationFn: async (body) => {
      await apiClient.patch(`${API}/conversations/${body.conversationId}/read`);
      return { conversationId: body.conversationId };
    },
    successMsg: 'Marked as read',
    errorMsg: 'Failed to mark as read',
    invalidateQueryKeys: [[API, 'conversations']],
    onSuccessNotificationVisible: false,
    onErrorNotificationVisible: false,
  });
