import { Module } from '@nestjs/common';
import { ScoreCardService } from './score-card.service';
import { ScoreCardController } from './score-card.controller';

@Module({
  controllers: [ScoreCardController],
  providers: [ScoreCardService],
})
export class ScoreCardModule {}
