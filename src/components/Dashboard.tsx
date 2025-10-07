import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { api } from '../utils/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { 
  Brain, 
  BookOpen, 
  GraduationCap, 
  TrendingUp, 
  Bell, 
  User,
  CheckCircle,
  AlertCircle,
  Calendar,
  Zap,
  Target,
  Award,
  MapPin,
  BarChart3,
  PieChart,
  Sparkles,
  Clock,
  Star,
  ArrowUp,
  ArrowDown,
  Users,
  Building,
  Bookmark
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  RadialBarChart,
  RadialBar,
  Cell
} from 'recharts';
import { useLocale } from './LocaleContext';
import GuidedTour from './GuidedTour';
import { logEvent } from '../utils/telemetry';
import { useState } from 'react';

const quickLinks = [
  {
    title: 'Complete Profile',
    description: 'Add your academic details and interests',
    icon: User,
    href: '/profile',
    color: 'bg-blue-500'
  },
  {
    title: 'Take Aptitude Quiz',
    description: 'Discover your strengths and interests',
    icon: Brain,
    href: '/quiz',
    color: 'bg-purple-500'
  },
  {
    title: 'Smart Recommendations',
    description: 'AI-powered college & course matching',
    icon: Zap,
    href: '/advanced-recommendation-engine',
    color: 'bg-yellow-500',
    featured: true
  },
  {
    title: 'Find Colleges',
    description: 'Search nearby institutions',
    icon: GraduationCap,
    href: '/colleges',
    color: 'bg-orange-500'
  }
];

const recentAlerts = [
  {
    title: 'JEE Main Registration',
    description: 'Last date: March 15, 2025',
    type: 'exam',
    urgent: true
  },
  {
    title: 'Delhi University Admissions',
    description: 'Applications open: April 1, 2025',
    type: 'admission',
    urgent: false
  },
  {
    title: 'Merit Scholarship',
    description: 'Apply by: March 30, 2025',
    type: 'scholarship',
    urgent: true
  }
];

const recommendations = [
  {
    title: 'Computer Science Engineering',
    type: 'course',
    match: 92,
    reason: 'Based on your math and logical reasoning scores'
  },
  {
    title: 'IIT Delhi',
    type: 'college',
    match: 88,
    reason: 'Matches your preferred location and course'
  },
  {
    title: 'Software Developer',
    type: 'career',
    match: 95,
    reason: 'Aligns with your technical interests'
  }
];

// Default data for users who haven't taken quiz
const defaultSkillDistribution = [
  { name: 'Take Quiz', value: 0, color: '#e5e7eb' },
  { name: 'To See', value: 0, color: '#e5e7eb' },
  { name: 'Your Skills', value: 0, color: '#e5e7eb' },
  { name: 'Analysis', value: 0, color: '#e5e7eb' }
];

const defaultCollegeInterestData = [
  { category: 'Complete Quiz', count: 0, percentage: 0 },
  { category: 'To See Interests', count: 0, percentage: 0 }
];

const performanceMetrics = [
  { 
    title: 'Quiz Score', 
    value: 87, 
    change: +5, 
    trend: 'up',
    icon: Brain,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  { 
    title: 'Profile Match', 
    value: 92, 
    change: +8, 
    trend: 'up',
    icon: Target,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  { 
    title: 'College Visits', 
    value: 24, 
    change: +12, 
    trend: 'up',
    icon: Building,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  { 
    title: 'Saved Courses', 
    value: 8, 
    change: +2, 
    trend: 'up',
    icon: Bookmark,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100'
  }
];

export function Dashboard() {
  const { user } = useAuth();
  const { t } = useLocale();
  const [dashboardData, setDashboardData] = useState({
    alerts: [],
    recommendations: [],
    profileCompletion: 35,
    quizData: null as any,
    userSkills: defaultSkillDistribution,
    collegeInterests: defaultCollegeInterestData,
    achievements: [] as any[]
  });
  const [loading, setLoading] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Log dashboard view for lightweight telemetry
  useEffect(() => { try { logEvent('dashboard_view'); } catch (e) {} }, []);

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      const [alertsResponse, recommendationsResponse, quizResponse, achievementsResponse] = await Promise.all([
        api.getAlerts().catch(() => ({ alerts: recentAlerts })),
        api.getRecommendations().catch(() => ({ recommendations })),
        api.getUserQuizData().catch(() => null),
        api.getUserAchievements().catch(() => ({ achievements: [] }))
      ]);

      // Build safe computed values
      let userSkills = defaultSkillDistribution;
      let collegeInterests = defaultCollegeInterestData;
      let userAchievements = [
        {
          title: 'Getting Started',
          description: 'Complete your quiz to unlock achievements',
          icon: Target,
          variant: 'secondary'
        }
      ];

      if (quizResponse?.quizData) {
        const quizData = quizResponse.quizData;

        // Convert quiz results to skill distribution
        if (quizData.subjectScores) {
          userSkills = Object.entries(quizData.subjectScores).map(([subject, score], index) => ({
            name: subject,
            value: Number(score),
            color: ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'][index % 5]
          }));
        }

        // Convert interests to college distribution
        if (quizData.interests) {
          const interestCounts: Record<string, number> = {};
          quizData.interests.forEach((interest: string) => {
            if (interest.includes('Engineering') || interest.includes('Technology')) {
              interestCounts['Engineering'] = (interestCounts['Engineering'] || 0) + 1;
            } else if (interest.includes('Medical') || interest.includes('Health')) {
              interestCounts['Medical'] = (interestCounts['Medical'] || 0) + 1;
            } else if (interest.includes('Arts') || interest.includes('Creative')) {
              interestCounts['Arts'] = (interestCounts['Arts'] || 0) + 1;
            } else {
              interestCounts['Commerce'] = (interestCounts['Commerce'] || 0) + 1;
            }
          });

          const total = Object.values(interestCounts).reduce((sum, count) => sum + count, 0) || 1;
          collegeInterests = Object.entries(interestCounts).map(([category, count]) => ({
            category,
            count: Number(count),
            percentage: Math.round((Number(count) / total) * 100)
          }));
        }

        // Generate achievements based on quiz performance
        userAchievements = [];
        if (quizData.overallScore >= 80) {
          userAchievements.push({
            title: 'High Achiever',
            description: `Scored ${quizData.overallScore}% in aptitude test`,
            icon: Award,
            variant: 'default'
          });
        }
        if (quizData.completedQuizzes >= 5) {
          userAchievements.push({
            title: 'Quiz Master',
            description: `Completed ${quizData.completedQuizzes} aptitude tests`,
            icon: Brain,
            variant: 'default'
          });
        }
        if (Object.keys(quizData.subjectScores || {}).length >= 3) {
          userAchievements.push({
            title: 'Well Rounded',
            description: 'Assessed in multiple subjects',
            icon: Star,
            variant: 'secondary'
          });
        }
      }

      if (achievementsResponse?.achievements?.length > 0) {
        userAchievements = [...userAchievements, ...achievementsResponse.achievements];
      }

      setDashboardData({
        alerts: alertsResponse.alerts || recentAlerts,
        recommendations: recommendationsResponse.recommendations || recommendations,
        profileCompletion: (user as any).profileCompleted ? 100 : 35,
        quizData: quizResponse?.quizData,
        userSkills,
        collegeInterests,
        achievements: userAchievements.slice(0, 3)
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setDashboardData({
        alerts: recentAlerts,
        recommendations: recommendations,
        profileCompletion: 35,
        quizData: null,
        userSkills: defaultSkillDistribution,
        collegeInterests: defaultCollegeInterestData,
        achievements: [{
          title: 'Getting Started',
          description: 'Complete your quiz to unlock achievements',
          icon: Target,
          variant: 'secondary'
        }]
      });
    } finally {
      setLoading(false);
    }
  };

  const userSkills = useMemo(() => dashboardData.userSkills || defaultSkillDistribution, [dashboardData.userSkills]);
  const collegeInterests = useMemo(() => dashboardData.collegeInterests || defaultCollegeInterestData, [dashboardData.collegeInterests]);
  const achievements = useMemo(() => dashboardData.achievements || [], [dashboardData.achievements]);
  const profileCompletion = dashboardData.profileCompletion;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="animate-pulse text-lg">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{`${t('welcome')}, ${user?.displayName || ''}!`}</h1>
          <p className="text-muted-foreground mt-1">Let's continue your educational journey</p>
        </div>
        <Badge variant={profileCompletion === 100 ? "default" : "secondary"}>
          {`Profile ${profileCompletion}% Complete`}
        </Badge>
      </div>

      {/* Profile Completion (and Onboarding) */}
      {profileCompletion < 100 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              {t('complete_your_profile')}
            </CardTitle>
            <CardDescription>
              Complete your profile to get personalized recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={profileCompletion} className="mb-3" />
            <Link to="/profile" onClick={() => logEvent('onboarding_click', { action: 'complete_profile' })}>
              <Button variant="outline" size="sm">
                {t('complete_profile')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Guided Tour (first-run) */}
      <GuidedTour />

      {/* Onboarding checklist / Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Follow these steps to quickly get value from the app</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="space-y-2">
            <li className="flex items-center justify-between">
              <div>
                <div className="font-medium">Complete Profile</div>
                <div className="text-sm text-muted-foreground">Add academics & preferences</div>
              </div>
              <div>
                {profileCompletion >= 100 ? <Badge variant="default">Done</Badge> : <Link to="/profile" onClick={() => logEvent('onboarding_click', { action: 'complete_profile' })}><Button size="sm">Go</Button></Link>}
              </div>
            </li>

            <li className="flex items-center justify-between">
              <div>
                <div className="font-medium">Take Aptitude Quiz</div>
                <div className="text-sm text-muted-foreground">Understand your strengths</div>
              </div>
              <div>
                {dashboardData.quizData ? <Badge variant="default">Done</Badge> : <Link to="/quiz" onClick={() => logEvent('onboarding_click', { action: 'take_quiz' })}><Button size="sm">Start</Button></Link>}
              </div>
            </li>

            <li className="flex items-center justify-between">
              <div>
                <div className="font-medium">Generate Recommendations</div>
                <div className="text-sm text-muted-foreground">Find colleges & courses near you</div>
              </div>
              <div>
                <Link to="/advanced-recommendation-engine" onClick={() => logEvent('onboarding_click', { action: 'generate_recs' })}><Button size="sm">Try</Button></Link>
              </div>
            </li>

            <li className="flex items-center justify-between">
              <div>
                <div className="font-medium">Explore Streams & Courses</div>
                <div className="text-sm text-muted-foreground">Save courses you like</div>
              </div>
              <div>
                <Link to="/streams" onClick={() => logEvent('onboarding_click', { action: 'explore_streams' })}><Button size="sm">Explore</Button></Link>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title} className="hover:shadow-md transition-all duration-200 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                    <Icon className={`h-5 w-5 ${metric.color}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.trend === 'up' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {Math.abs(metric.change)}%
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className="text-sm text-muted-foreground">{metric.title}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.title} to={link.href}>
              <Card className="hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 rounded-xl ${link.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">{link.title}</CardTitle>
                  <CardDescription>{link.description}</CardDescription>
                  {link.featured && (
                    <Badge className="w-fit mt-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t('recent_alerts')}
            </CardTitle>
            <Link to="/alerts">
              <Button variant="outline" size="sm">{t('view_all')}</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboardData.alerts.map((alert, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  alert.urgent ? 'bg-red-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <h4 className="font-medium">{alert.title}</h4>
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {alert.type}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t('ai_recommendations')}
            </CardTitle>
            <CardDescription>
              Personalized suggestions based on your profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboardData.recommendations.map((rec, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <h4 className="font-medium">{rec.title}</h4>
                  <p className="text-sm text-muted-foreground">{rec.reason}</p>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {rec.type}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-green-600">
                    {rec.match}%
                  </div>
                  <div className="text-xs text-muted-foreground">match</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skills Analysis Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              {t('skill_analysis')}
            </CardTitle>
            <CardDescription>
              {dashboardData.quizData ? 'Your performance by subject' : 'Complete quiz to see your skill analysis'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart data={userSkills || defaultSkillDistribution} innerRadius="30%" outerRadius="80%">
                <RadialBar dataKey="value" cornerRadius={10} label={{ position: 'insideStart', fill: '#fff' }}>
                  {(userSkills || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </RadialBar>
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {/* Additional UI could go here */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
