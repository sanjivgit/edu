import { describe, it, expect } from 'vitest';
import { act, waitFor } from '@testing-library/react';
import { renderHookWithProviders } from '@/test/utils';
import {
  useGetConversations,
  useGetConversationById,
  useGetMessagesByConversation,
  useSendMessage,
  useMarkConversationRead,
} from '@/features/chat/services/chat.service';

describe('chat integration', () => {
  it('loads conversations, mapped to records and sorted by newest first', async () => {
    const { result } = renderHookWithProviders(() => useGetConversations());

    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 });

    const conversations = result.current.data ?? [];
    expect(conversations).toHaveLength(2);
    expect(conversations[0].id).toBe('conv-2');
    expect(conversations[1].id).toBe('conv-1');
    expect(conversations[1]).toMatchObject({
      title: 'Maths Group',
      subtitle: '3 participants',
      avatarName: 'M',
      unreadCount: 2,
      lastMessage: 'See you tomorrow',
    });
  });

  it('loads a conversation detail and maps participants into the subtitle', async () => {
    const { result } = renderHookWithProviders(() => useGetConversationById({ conversationId: 'conv-1' }));

    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 });

    const record = result.current.data;
    expect(record).not.toBeNull();
    expect(record?.id).toBe('conv-1');
    expect(record?.title).toBe('Maths Group');
    expect(record?.subtitle).toBe('Riya Sharma, Aman Verma');
    expect(record?.avatarName).toBe('M');
  });

  it('loads messages mapped and sorted oldest first', async () => {
    const { result } = renderHookWithProviders(() => useGetMessagesByConversation({ conversationId: 'conv-1' }));

    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 });

    const messages = result.current.data ?? [];
    expect(messages).toHaveLength(2);
    expect(messages[0].id).toBe('msg-1');
    expect(messages[0].direction).toBe('in');
    expect(messages[0].sender).toBe('Riya Sharma');
    expect(messages[1].direction).toBe('out');
    expect(messages[1].text).toBe('Hi Riya!');
  });

  it('sends a message using the content body field and returns the mapped message', async () => {
    const { result } = renderHookWithProviders(() => useSendMessage());

    await act(async () => {
      result.current.mutate({ conversationId: 'conv-1', text: 'Hello backend!' });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 });

    const msg = result.current.data;
    expect(msg?.text).toBe('Hello backend!');
    expect(msg?.conversationId).toBe('conv-1');
    expect(msg?.direction).toBe('out');
    expect(msg?.sender).toBe('Admin User');
  });

  it('marks a conversation as read via PATCH', async () => {
    const { result } = renderHookWithProviders(() => useMarkConversationRead());

    await act(async () => {
      result.current.mutate({ conversationId: 'conv-1' });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 });

    expect(result.current.data?.conversationId).toBe('conv-1');
  });
});
