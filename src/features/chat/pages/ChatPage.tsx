import { Route, Routes } from 'react-router-dom';
import ChatInboxPage from './ChatInboxPage';
import ChatConversationPage from './ChatConversationPage';

export default function ChatPage() {
  return (
    <Routes>
      <Route index element={<ChatInboxPage />} />
      <Route path=":conversationId" element={<ChatConversationPage />} />
    </Routes>
  );
}
