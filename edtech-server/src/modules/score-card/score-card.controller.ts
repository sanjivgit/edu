import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { ScoreCardService } from './score-card.service';
import { CreateScoreCardDto, PublishScoreCardDto } from './dto/score-card.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('score-cards')
@Controller('score-cards')
@ApiBearerAuth()
export class ScoreCardController {
  constructor(private scoreCardService: ScoreCardService) {}

  @Post()
  @Roles(UserRole.superadmin, UserRole.admin, UserRole.teacher)
  createOrUpdate(@Body() dto: CreateScoreCardDto) {
    return this.scoreCardService.createOrUpdate(dto);
  }

  @Get('exam/:examId')
  @Roles(UserRole.superadmin, UserRole.admin, UserRole.teacher)
  findByExam(@Param('examId') examId: string) {
    return this.scoreCardService.findByExam(examId);
  }

  @Get('exam/:examId/student/:studentId')
  findByExamAndStudent(
    @Param('examId') examId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.scoreCardService.findByExamAndStudent(examId, studentId);
  }

  @Get('student/:studentId')
  findByStudent(
    @Param('studentId') studentId: string,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.scoreCardService.findByStudent(studentId, academicYearId);
  }

  @Post('publish')
  @Roles(UserRole.superadmin, UserRole.admin)
  publish(@Body() dto: PublishScoreCardDto) {
    return this.scoreCardService.publish(dto.scoreCardIds);
  }

  @Delete(':id')
  @Roles(UserRole.superadmin, UserRole.admin)
  remove(@Param('id') id: string) {
    return this.scoreCardService.remove(id);
  }
}
