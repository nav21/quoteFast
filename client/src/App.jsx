import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppLayout from './components/AppLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import CreateQuotePage from './pages/CreateQuotePage.jsx';
import QuoteViewPage from './pages/QuoteViewPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import ServicesPage from './pages/ServicesPage.jsx';
import QuoteDetailPage from './pages/QuoteDetailPage.jsx';
import VerifyEmailPage from './pages/VerifyEmailPage.jsx';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-cream">
          <Routes>
            {/* Public routes */}
            <Route path="/quote/:shareToken" element={<QuoteViewPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            } />

            {/* Authenticated routes with nav header */}
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/quotes/new" element={<CreateQuotePage />} />
              <Route path="/quotes/:id" element={<QuoteDetailPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/services" element={<ServicesPage />} />
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
