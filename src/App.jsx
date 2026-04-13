import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/shared/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ThreadDetailPage from './pages/ThreadDetailPage';
import CreateThreadPage from './pages/CreateThreadPage';
import LeaderboardPage from './pages/LeaderboardPage';
import NotFoundPage from './pages/NotFoundPage';

const App = () => (
  <BrowserRouter>
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/" element={<HomePage />} />
      <Route path="/threads/:threadId" element={<ThreadDetailPage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />

      {/* Protected */}
      <Route
        path="/threads/create"
        element={(
          <ProtectedRoute>
            <CreateThreadPage />
          </ProtectedRoute>
        )}
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </BrowserRouter>
);

export default App;
