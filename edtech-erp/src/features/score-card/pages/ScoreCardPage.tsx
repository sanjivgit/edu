import { Route, Routes } from 'react-router-dom';
import ScoreCardListPage from './ScoreCardListPage';
import ScoreCardEntryPage from './ScoreCardEntryPage';
import ScoreCardStudentView from './ScoreCardStudentView';

export default function ScoreCardPage() {
  return (
    <Routes>
      <Route index element={<ScoreCardListPage />} />
      <Route path="exam/:examId" element={<ScoreCardEntryPage />} />
      <Route path="student/:studentId" element={<ScoreCardStudentView />} />
    </Routes>
  );
}
