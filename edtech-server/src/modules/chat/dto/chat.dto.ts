import { IsString, IsOptional, IsArray, MaxLength } from 'class-validator';

export class CreateConversationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  participantIds: string[];

  @IsOptional()
  @IsString()
  message?: string;
}

export class SendMessageDto {
  @IsString()
  @MaxLength(500, { message: 'Message must be under 500 characters' })
  content: string;
}
