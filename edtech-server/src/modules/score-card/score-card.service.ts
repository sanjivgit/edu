import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateScoreCardDto, UpdateScoreCardItemsDto } from './dto/score-card.dto';

@Injectable()
export class ScoreCardService {
  constructor(private prisma: PrismaService) {}

  async createOrUpdate(dto: CreateScoreCardDto) {
    const existing = await this.prisma.scoreCard.findUnique({
      where: { examId_studentId: { examId: dto.examId, studentId: dto.studentId } },
    });

    const totalMarks = dto.items.reduce((sum, item) => sum + item.totalMarks, 0);
    const obtainedMarks = dto.items.reduce((sum, item) => sum + item.obtainedMarks, 0);
    const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;

    if (existing) {
      await this.prisma.scoreCardItem.deleteMany({ where: { scoreCardId: existing.id } });
      const updated = await this.prisma.scoreCard.update({
        where: { id: existing.id },
        data: {
          totalMarks,
          obtainedMarks,
          percentage,
          academicYearId: dto.academicYearId ?? undefined,
          items: {
            create: dto.items.map((item) => ({
              examPaperId: item.examPaperId,
              subjectName: item.subjectName,
              totalMarks: item.totalMarks,
              obtainedMarks: item.obtainedMarks,
              grade: item.grade,
              remarks: item.remarks,
            })),
          },
        },
        include: { items: true, student: true, exam: true, class_: true },
      });
      return updated;
    }

    return this.prisma.scoreCard.create({
      data: {
        examId: dto.examId,
        studentId: dto.studentId,
        classId: dto.classId,
        academicYearId: dto.academicYearId ?? undefined,
        totalMarks,
        obtainedMarks,
        percentage,
        items: {
          create: dto.items.map((item) => ({
            examPaperId: item.examPaperId,
            subjectName: item.subjectName,
            totalMarks: item.totalMarks,
            obtainedMarks: item.obtainedMarks,
            grade: item.grade,
            remarks: item.remarks,
          })),
        },
      },
      include: { items: true, student: true, exam: true, class_: true },
    });
  }

  async findByExamAndStudent(examId: string, studentId: string) {
    const scoreCard = await this.prisma.scoreCard.findUnique({
      where: { examId_studentId: { examId, studentId } },
      include: { items: true, student: true, exam: true, class_: true },
    });
    if (!scoreCard) throw new NotFoundException('Score card not found');
    return scoreCard;
  }

  async findByExam(examId: string) {
    return this.prisma.scoreCard.findMany({
      where: { examId },
      include: { items: true, student: true, class_: true, academicYear: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByStudent(studentId: string, academicYearId?: string) {
    return this.prisma.scoreCard.findMany({
      where: {
        studentId,
        ...(academicYearId ? { academicYearId } : {}),
      },
      include: { items: true, exam: true, class_: true, academicYear: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async publish(scoreCardIds: string[]) {
    await this.prisma.scoreCard.updateMany({
      where: { id: { in: scoreCardIds } },
      data: { status: 'published', publishedAt: new Date() },
    });
    return this.prisma.scoreCard.findMany({
      where: { id: { in: scoreCardIds } },
      include: { items: true, student: true, exam: true },
    });
  }

  async remove(id: string) {
    const scoreCard = await this.prisma.scoreCard.findUnique({ where: { id } });
    if (!scoreCard) throw new NotFoundException('Score card not found');
    await this.prisma.scoreCard.delete({ where: { id } });
    return { message: 'Score card deleted successfully' };
  }
}
