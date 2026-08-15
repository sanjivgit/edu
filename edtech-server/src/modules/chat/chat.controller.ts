import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateConversationDto, SendMessageDto } from './dto/chat.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('chat')
@Controller('chat')
@ApiBearerAuth()
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('conversations')
  conversations(@CurrentUser('id') userId: string) {
    return this.chatService.getConversations(userId);
  }

  @Get('conversations/:id')
  conversation(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.chatService.getConversation(id, userId);
  }

  @Get('conversations/:id/messages')
  messages(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.chatService.getMessages(id, userId);
  }

  @Post('conversations')
  create(@Body() dto: CreateConversationDto, @CurrentUser('id') userId: string) {
    return this.chatService.createConversation(dto, userId);
  }

  @Post('conversations/:id/messages')
  sendMessage(
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.chatService.sendMessage(id, dto, userId);
  }

  @Patch('conversations/:id/read')
  markRead(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.chatService.markRead(id, userId);
  }
}
