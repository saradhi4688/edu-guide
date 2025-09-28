import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext';
import { ThemeProvider } from './components/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';
import { Profile } from './components/Profile';
import { Quiz } from './components/Quiz';
import { Streams } from './components/Streams';
import { Colleges } from './components/Colleges';
import { EnhancedColleges } from './components/EnhancedColleges';
import { CareerPaths } from './components/CareerPaths';
import { Alerts } from './components/Alerts';
import { AdvancedRecommendationEngine } from './components/AdvancedRecommendationEngine';
import { EducationalAwarenessCenter } from './components/EducationalAwarenessCenter';
import { AwarenessQuiz } from './components/AwarenessQuiz';
import { ThemeToggle } from './components/ThemeToggle';
import { Toaster } from './components/ui/sonner';
import { AchievementSystem } from './components/AchievementSystem';
import { MentorshipProgram } from './components/MentorshipProgram';
import { ParentDashboard } from './components/ParentDashboard';
import { ProgressTracker } from './components/ProgressTracker';
import { PredictiveAnalytics } from './components/PredictiveAnalytics';
import { FinancialAidFinder } from './components/FinancialAidFinder';
import { ExpertConnect } from './components/ExpertConnect';
import { SkillGapAnalyzer } from './components/SkillGapAnalyzer';
import { AdminPanel } from './components/AdminPanel';
// Lazy TODOs: AchievementSystem, SocialLearning, MarketIntelligence, AdminPanel

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="flex h-screen bg-background">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with theme toggle */}
        <header className="flex items-center justify-end p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <ErrorBoundary>
            <ThemeToggle />
          </ErrorBoundary>
        </header>
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
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }
  
  return (
    <AppLayout>
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
        {/* Admin-only route guard */}
        <Route path="/admin" element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default function App() {
  // Suppress certain console warnings in production
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      const originalWarn = console.warn;
      const originalError = console.error;
      
      console.warn = (...args) => {
        const message = args.join(' ');
        // Suppress known warnings that are not actionable by users
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
        // Suppress certain errors that are handled gracefully
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
    </ErrorBoundary>
  );
}