import { Module } from '@nestjs/common';
import { NoticeboardService } from './noticeboard.service';
import { NoticeboardController } from './noticeboard.controller';

@Module({
  controllers: [NoticeboardController],
  providers: [NoticeboardService],
})
export class NoticeboardModule {}
