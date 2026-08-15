import { Injectable, NotFoundException } from '@nestjs/common';
import { MessageDirection, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateConversationDto, SendMessageDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getConversations(userId: string) {
    const participants = await this.prisma.conversationParticipant.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            participants: { include: { user: { select: { id: true, name: true, avatar: true } } } },
            messages: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
        },
      },
      orderBy: { conversation: { updatedAt: 'desc' } },
    });

    return participants.map((p) => {
      const conv = p.conversation;
      const others = conv.participants.filter((cp) => cp.userId !== userId);
      const lastMessage = conv.messages[0];
      return {
        id: conv.id,
        title: conv.title ?? others.map((o) => o.user.name).join(', '),
        subtitle: others.length > 1 ? `${others.length} participants` : others[0]?.user.name ?? '',
        avatarName: (conv.title ?? others[0]?.user.name ?? '?')[0],
        unreadCount: p.unreadCount,
        lastMessage: lastMessage?.text ?? '',
        updatedAt: conv.updatedAt,
      };
    });
  }

  async getConversation(id: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        participants: { include: { user: { select: { id: true, name: true, avatar: true } } } },
      },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');

    const isParticipant = conversation.participants.some((p) => p.userId === userId);
    if (!isParticipant) throw new NotFoundException('Conversation not found');

    const others = conversation.participants.filter((p) => p.userId !== userId);
    return {
      id: conversation.id,
      title: conversation.title ?? others.map((o) => o.user.name).join(', '),
      isGroup: conversation.isGroup,
      participants: others.map((o) => o.user),
      updatedAt: conversation.updatedAt,
    };
  }

  async getMessages(conversationId: string, userId: string) {
    await this.getConversation(conversationId, userId);
    const messages = await this.prisma.chatMessage.findMany({
      where: { conversationId },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'asc' },
    });
    return messages.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      direction: m.senderId === userId ? 'out' : 'in',
      sender: m.sender.name,
      text: m.text,
      at: m.createdAt,
    }));
  }

  async sendMessage(conversationId: string, dto: SendMessageDto, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: true },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');
    const isParticipant = conversation.participants.some((p) => p.userId === userId);
    if (!isParticipant) throw new NotFoundException('Conversation not found');

    const message = await this.prisma.chatMessage.create({
      data: {
        conversationId,
        senderId: userId,
        text: dto.content,
        direction: MessageDirection.out,
      },
      include: { sender: { select: { id: true, name: true } } },
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // bump unread counts for other participants
    await this.prisma.conversationParticipant.updateMany({
      where: { conversationId, userId: { not: userId }, lastReadAt: { not: new Date(0) } },
      data: { unreadCount: { increment: 1 } },
    });

    return {
      id: message.id,
      conversationId,
      direction: 'out',
      sender: message.sender.name,
      text: message.text,
      at: message.createdAt,
    };
  }

  async markRead(conversationId: string, userId: string) {
    await this.getConversation(conversationId, userId);
    await this.prisma.conversationParticipant.updateMany({
      where: { conversationId, userId },
      data: { unreadCount: 0, lastReadAt: new Date() },
    });
    await this.prisma.chatMessage.updateMany({
      where: { conversationId, senderId: { not: userId } },
      data: { readAt: new Date() },
    });
    return { message: 'Conversation marked as read' };
  }

  async createConversation(dto: CreateConversationDto, userId: string) {
    const participantIds = [...new Set([...dto.participantIds, userId])];

    // For 1:1 chats, find an existing direct conversation
    if (participantIds.length === 2) {
      const existing = await this.prisma.conversation.findFirst({
        where: {
          isGroup: false,
          participants: { every: { userId: { in: participantIds } } },
        },
        include: { participants: true },
      });
      if (existing && existing.participants.length === 2) {
        if (dto.message) {
          await this.sendMessage(existing.id, { content: dto.message }, userId);
        }
        return existing;
      }
    }

    const conversation = await this.prisma.conversation.create({
      data: {
        title: dto.title,
        isGroup: participantIds.length > 2,
        createdBy: userId,
        participants: {
          create: participantIds.map((pid) => ({ userId: pid })),
        },
      },
      include: { participants: { include: { user: { select: { id: true, name: true } } } } },
    });

    if (dto.message) {
      await this.prisma.chatMessage.create({
        data: {
          conversationId: conversation.id,
          senderId: userId,
          text: dto.message,
          direction: MessageDirection.out,
        },
      });
    }

    return conversation;
  }
}
