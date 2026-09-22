import { Route, Routes } from 'react-router-dom';
import { RequireRole } from '@/components/shared/Guards';
import { ACCESS } from '@/config/access';
import ScoreCardListPage from './ScoreCardListPage';
import ScoreCardEntryPage from './ScoreCardEntryPage';
import ScoreCardStudentView from './ScoreCardStudentView';

export default function ScoreCardPage() {
  return (
    <Routes>
      <Route index element={<ScoreCardListPage />} />
      <Route path="exam/:examId" element={<RequireRole roles={[...ACCESS.manageScoreCards]}><ScoreCardEntryPage /></RequireRole>} />
      <Route path="student/:studentId" element={<ScoreCardStudentView />} />
    </Routes>
  );
}
