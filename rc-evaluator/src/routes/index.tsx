import { ChatContainer } from '@/features/chat/components/ChatContainer';
import { PublicLayout } from '@/layouts/PublicLayout';
import { FeaturesPage } from '@/pages/landing/FeaturesPage';
import { HomePage } from '@/pages/landing/HomePage';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Marketing Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/features" element={<FeaturesPage />} />
        </Route>

        {/* Protected/App Routes */}
        <Route path="/chat" element={<ChatContainer />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};