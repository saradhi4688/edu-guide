import React, { useState, useEffect } from 'react';
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
  const [dashboardData, setDashboardData] = useState({
    alerts: [],
    recommendations: [],
    profileCompletion: 35,
    quizData: null,
    userSkills: null,
    collegeInterests: null,
    achievements: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
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
      
      // Process quiz data for skills and interests
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
          const interestCounts = {};
          quizData.interests.forEach(interest => {
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

          const total = Object.values(interestCounts).reduce((sum, count) => sum + count, 0);
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
        profileCompletion: user.profileCompleted ? 100 : 35,
        quizData: quizResponse?.quizData,
        userSkills,
        collegeInterests,
        achievements: userAchievements.slice(0, 3) // Show only top 3
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Use fallback data
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

  const profileCompletion = dashboardData.profileCompletion;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="animate-pulse text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.displayName}!</h1>
          <p className="text-muted-foreground mt-1">
            Let's continue your educational journey
          </p>
        </div>
        <Badge variant={profileCompletion === 100 ? "default" : "secondary"}>
          Profile {profileCompletion}% Complete
        </Badge>
      </div>

      {/* Profile Completion */}
      {profileCompletion < 100 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Complete Your Profile
            </CardTitle>
            <CardDescription>
              Complete your profile to get personalized recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={profileCompletion} className="mb-3" />
            <Link to="/profile">
              <Button variant="outline" size="sm">
                Complete Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

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
              Recent Alerts
            </CardTitle>
            <Link to="/alerts">
              <Button variant="outline" size="sm">View All</Button>
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
              AI Recommendations
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
              Skill Analysis
            </CardTitle>
            <CardDescription>
              {dashboardData.quizData ? 'Your performance by subject' : 'Complete quiz to see your skill analysis'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart data={dashboardData.userSkills} innerRadius="30%" outerRadius="80%">
                <RadialBar dataKey="value" cornerRadius={10} label={{ position: 'insideStart', fill: '#fff' }}>
                  {dashboardData.userSkills.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </RadialBar>
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {dashboardData.userSkills.map((skill, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: skill.color }}
                    />
                    <span>{skill.name}</span>
                  </div>
                  <span className="font-medium">{skill.value}%</span>
                </div>
              ))}
            </div>
            {!dashboardData.quizData && (
              <div className="mt-4 text-center">
                <Link to="/quiz">
                  <Button size="sm">
                    <Brain className="h-4 w-4 mr-2" />
                    Take Quiz Now
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* College Interest Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              College Interest Distribution
            </CardTitle>
            <CardDescription>
              {dashboardData.quizData ? 'Your interests by category' : 'Complete quiz to see your interests'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dashboardData.collegeInterests}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            {!dashboardData.quizData && (
              <div className="mt-4 text-center">
                <Link to="/quiz">
                  <Button size="sm" variant="outline">
                    <Target className="h-4 w-4 mr-2" />
                    Discover Your Interests
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Achievement Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Recent Achievements
          </CardTitle>
          <CardDescription>
            {dashboardData.quizData ? 'Your latest milestones' : 'Complete quiz to unlock achievements'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    achievement.variant === 'default' ? 'bg-green-100' :
                    achievement.variant === 'secondary' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <Icon className={`h-4 w-4 ${
                      achievement.variant === 'default' ? 'text-green-600' :
                      achievement.variant === 'secondary' ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{achievement.title}</p>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                  <Badge variant={achievement.variant}>
                    {dashboardData.quizData && achievement.variant === 'default' ? 'Achieved' : 'Locked'}
                  </Badge>
                </div>
              );
            })}
          </div>
          {!dashboardData.quizData && (
            <div className="mt-4 text-center">
              <Link to="/quiz">
                <Button size="sm" variant="outline">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start Your Journey
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Important Dates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 text-center">
                <div className="text-lg font-bold">15</div>
                <div className="text-xs text-muted-foreground">MAR</div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium">JEE Main Registration Closes</h4>
                <p className="text-sm text-muted-foreground">Don't miss the deadline!</p>
              </div>
              <Badge variant="destructive">3 days left</Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 text-center">
                <div className="text-lg font-bold">1</div>
                <div className="text-xs text-muted-foreground">APR</div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium">University Admissions Begin</h4>
                <p className="text-sm text-muted-foreground">Start preparing your documents</p>
              </div>
              <Badge variant="outline">19 days left</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}