import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext';
import { ThemeProvider } from './components/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Sidebar } from './components/Sidebar';
import { ThemeToggle } from './components/ThemeToggle';
import { Toaster } from './components/ui/sonner';
import { LocaleProvider } from './components/LocaleContext';
import { LanguageSwitcher } from './components/LanguageSwitcher';

// Lazy-loaded route components to reduce initial bundle
const Dashboard = React.lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));
const Login = React.lazy(() => import('./components/Login').then(m => ({ default: m.Login })));
const Profile = React.lazy(() => import('./components/Profile').then(m => ({ default: m.Profile })));
const Quiz = React.lazy(() => import('./components/Quiz').then(m => ({ default: m.Quiz })));
const Streams = React.lazy(() => import('./components/Streams').then(m => ({ default: m.Streams })));
const EnhancedColleges = React.lazy(() => import('./components/EnhancedColleges').then(m => ({ default: m.EnhancedColleges })));
const CareerPaths = React.lazy(() => import('./components/CareerPaths').then(m => ({ default: m.CareerPaths })));
const Alerts = React.lazy(() => import('./components/Alerts').then(m => ({ default: m.Alerts })));
const AdvancedRecommendationEngine = React.lazy(() => import('./components/AdvancedRecommendationEngine').then(m => ({ default: m.AdvancedRecommendationEngine })));
const EducationalAwarenessCenter = React.lazy(() => import('./components/EducationalAwarenessCenter').then(m => ({ default: m.EducationalAwarenessCenter })));
const AwarenessQuiz = React.lazy(() => import('./components/AwarenessQuiz').then(m => ({ default: m.AwarenessQuiz })));
const AchievementSystem = React.lazy(() => import('./components/AchievementSystem').then(m => ({ default: m.AchievementSystem })));
const MentorshipProgram = React.lazy(() => import('./components/MentorshipProgram').then(m => ({ default: m.MentorshipProgram })));
const ParentDashboard = React.lazy(() => import('./components/ParentDashboard').then(m => ({ default: m.ParentDashboard })));
const ProgressTracker = React.lazy(() => import('./components/ProgressTracker').then(m => ({ default: m.ProgressTracker })));
const PredictiveAnalytics = React.lazy(() => import('./components/PredictiveAnalytics').then(m => ({ default: m.PredictiveAnalytics })));
const FinancialAidFinder = React.lazy(() => import('./components/FinancialAidFinder').then(m => ({ default: m.FinancialAidFinder })));
const ExpertConnect = React.lazy(() => import('./components/ExpertConnect').then(m => ({ default: m.ExpertConnect })));
const SkillGapAnalyzer = React.lazy(() => import('./components/SkillGapAnalyzer').then(m => ({ default: m.SkillGapAnalyzer })));
const AdminPanel = React.lazy(() => import('./components/AdminPanel').then(m => ({ default: m.AdminPanel })));
const QuizWeaverDemo = React.lazy(() => import('./components/QuizWeaverDemo').then(m => ({ default: m.QuizWeaverDemo })));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with theme toggle and language switcher */}
        <header className="flex items-center justify-end p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ErrorBoundary>
              <ThemeToggle />
            </ErrorBoundary>
          </div>
        </header>

        {/* Production notice banner - highlighted message shown across the site */}
        <div className="production-banner bg-yellow-50 border-b border-yellow-200 text-yellow-900 px-4 py-2 text-sm">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="production-banner__message">
              <strong className="font-medium">Notice:</strong> This site is under production and may contain static/demo values or incomplete features.
            </div>
            <div className="production-banner__dynamic text-muted-foreground">
              <span className="font-medium">Dynamic on this page:</span>
              <span className="ml-2">Authentication (signup/login, email verification), Personalized Dashboard, Profile updates, Quizzes &amp; Recommendations, Streams &amp; Courses, College Finder, Alerts.</span>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-auto">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Suspense fallback={<div className="p-6">Loading...</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <AppLayout>
      <Suspense fallback={<div className="p-6">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/streams" element={<Streams />} />
          <Route path="/colleges" element={<EnhancedColleges />} />
          <Route path="/careers" element={<CareerPaths />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/awareness" element={<EducationalAwarenessCenter />} />
          <Route path="/awareness-quiz" element={<AwarenessQuiz />} />
          <Route path="/advanced-recommendation-engine" element={<AdvancedRecommendationEngine />} />
          <Route path="/achievements" element={<AchievementSystem />} />
          <Route path="/mentorship" element={<MentorshipProgram />} />
          <Route path="/parent" element={<ParentDashboard />} />
          <Route path="/progress" element={<ProgressTracker />} />
          <Route path="/predictive" element={<PredictiveAnalytics />} />
          <Route path="/financial-aid" element={<FinancialAidFinder />} />
          <Route path="/experts" element={<ExpertConnect />} />
          <Route path="/skills" element={<SkillGapAnalyzer />} />
          <Route path="/admin" element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" replace />} />
          <Route path="/quiz-weaver-demo" element={<QuizWeaverDemo />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
}

export default function App() {
  // Keep console suppression as before
  React.useEffect(() => {
    const _mode = (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) ? process.env.NODE_ENV : (typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env.MODE : undefined);
    if (_mode === 'production') {
      const originalWarn = console.warn;
      const originalError = console.error;

      console.warn = (...args) => {
        const message = args.join(' ');
        if (
          message.includes('Function components cannot be given refs') ||
          message.includes('getPage') ||
          message.includes('timed out')
        ) {
          return;
        }
        originalWarn.apply(console, args);
      };

      console.error = (...args) => {
        const message = args.join(' ');
        if (
          message.includes('Message getPage') ||
          message.includes('response timed out')
        ) {
          return;
        }
        originalError.apply(console, args);
      };

      return () => {
        console.warn = originalWarn;
        console.error = originalError;
      };
    }
  }, []);

  return (
    <ErrorBoundary>
      <LocaleProvider>
        <ThemeProvider>
          <AuthProvider>
            <Router>
              <div className="min-h-screen bg-background">
                <AppRoutes />
                <Toaster />
              </div>
            </Router>
          </AuthProvider>
        </ThemeProvider>
      </LocaleProvider>
    </ErrorBoundary>
  );
}
