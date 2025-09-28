import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Target, 
  TrendingUp, 
  Calendar, 
  CheckCircle, 
  Clock,
  Plus,
  Edit,
  Trash2,
  Star,
  Award,
  BookOpen,
  GraduationCap,
  Users,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Trophy,
  Flag,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { toast } from 'sonner@2.0.3';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'academic' | 'career' | 'personal' | 'skill';
  priority: 'low' | 'medium' | 'high';
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
  targetDate: string;
  createdAt: string;
  completedAt?: string;
  progress: number;
  milestones: Milestone[];
  isPublic: boolean;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: string;
  targetDate: string;
}

interface ProgressMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  category: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
  category: string;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface StudySession {
  id: string;
  subject: string;
  duration: number; // in minutes
  date: string;
  notes: string;
  efficiency: number; // 1-10 scale
}

export function ProgressTracker() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [metrics, setMetrics] = useState<ProgressMetric[]>([]);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    category: 'academic' as const,
    priority: 'medium' as const,
    targetDate: '',
    isPublic: false
  });

  // Sample data
  const sampleGoals: Goal[] = [
    {
      id: '1',
      title: 'Complete Engineering Aptitude Quiz',
      description: 'Finish all 12 sections of the engineering aptitude assessment',
      category: 'academic',
      priority: 'high',
      status: 'in_progress',
      targetDate: '2024-02-15',
      createdAt: '2024-01-01',
      progress: 75,
      isPublic: true,
      milestones: [
        { id: '1', title: 'Complete Math Section', description: 'Finish mathematics questions', completed: true, completedAt: '2024-01-10', targetDate: '2024-01-15' },
        { id: '2', title: 'Complete Physics Section', description: 'Finish physics questions', completed: true, completedAt: '2024-01-20', targetDate: '2024-01-25' },
        { id: '3', title: 'Complete Chemistry Section', description: 'Finish chemistry questions', completed: false, targetDate: '2024-02-05' },
        { id: '4', title: 'Review and Submit', description: 'Review all answers and submit', completed: false, targetDate: '2024-02-15' }
      ]
    },
    {
      id: '2',
      title: 'Explore 50 Colleges',
      description: 'Research and explore 50 different colleges for engineering',
      category: 'career',
      priority: 'medium',
      status: 'in_progress',
      targetDate: '2024-03-01',
      createdAt: '2024-01-05',
      progress: 60,
      isPublic: true,
      milestones: [
        { id: '1', title: 'Explore 25 Colleges', description: 'Research first 25 colleges', completed: true, completedAt: '2024-01-25', targetDate: '2024-01-30' },
        { id: '2', title: 'Explore 50 Colleges', description: 'Complete research on 50 colleges', completed: false, targetDate: '2024-03-01' }
      ]
    },
    {
      id: '3',
      title: 'Improve Communication Skills',
      description: 'Join debate club and practice public speaking',
      category: 'personal',
      priority: 'low',
      status: 'not_started',
      targetDate: '2024-04-01',
      createdAt: '2024-01-10',
      progress: 0,
      isPublic: false,
      milestones: [
        { id: '1', title: 'Join Debate Club', description: 'Register for debate club', completed: false, targetDate: '2024-02-01' },
        { id: '2', title: 'First Speech', description: 'Give first public speech', completed: false, targetDate: '2024-03-01' }
      ]
    }
  ];

  const sampleAchievements: Achievement[] = [
    {
      id: '1',
      title: 'Quiz Master',
      description: 'Completed 10 aptitude quizzes',
      icon: '🧠',
      earnedAt: '2024-01-15',
      category: 'academic',
      points: 100,
      rarity: 'common'
    },
    {
      id: '2',
      title: 'College Explorer',
      description: 'Explored 25+ colleges',
      icon: '🏛️',
      earnedAt: '2024-01-20',
      category: 'career',
      points: 150,
      rarity: 'rare'
    },
    {
      id: '3',
      title: 'Streak Keeper',
      description: 'Maintained 7-day study streak',
      icon: '🔥',
      earnedAt: '2024-01-22',
      category: 'personal',
      points: 200,
      rarity: 'epic'
    }
  ];

  const sampleStudySessions: StudySession[] = [
    { id: '1', subject: 'Mathematics', duration: 120, date: '2024-01-20', notes: 'Focused on calculus and algebra', efficiency: 8 },
    { id: '2', subject: 'Physics', duration: 90, date: '2024-01-19', notes: 'Worked on mechanics problems', efficiency: 7 },
    { id: '3', subject: 'Chemistry', duration: 150, date: '2024-01-18', notes: 'Organic chemistry reactions', efficiency: 9 },
    { id: '4', subject: 'English', duration: 60, date: '2024-01-17', notes: 'Reading comprehension practice', efficiency: 6 }
  ];

  const sampleMetrics: ProgressMetric[] = [
    { id: '1', name: 'Quizzes Completed', value: 8, target: 12, unit: 'quizzes', category: 'academic', trend: 'up', change: 2 },
    { id: '2', name: 'Colleges Explored', value: 30, target: 50, unit: 'colleges', category: 'career', trend: 'up', change: 5 },
    { id: '3', name: 'Study Hours', value: 45, target: 60, unit: 'hours', category: 'academic', trend: 'up', change: 8 },
    { id: '4', name: 'Goals Achieved', value: 3, target: 8, unit: 'goals', category: 'personal', trend: 'stable', change: 0 }
  ];

  useEffect(() => {
    setGoals(sampleGoals);
    setAchievements(sampleAchievements);
    setStudySessions(sampleStudySessions);
    setMetrics(sampleMetrics);
  }, []);

  const completedGoals = goals.filter(goal => goal.status === 'completed').length;
  const inProgressGoals = goals.filter(goal => goal.status === 'in_progress').length;
  const totalPoints = achievements.reduce((sum, achievement) => sum + achievement.points, 0);
  const currentStreak = 7; // This would be calculated from study sessions

  const weeklyStudyData = [
    { day: 'Mon', hours: 2, efficiency: 8 },
    { day: 'Tue', hours: 1.5, efficiency: 7 },
    { day: 'Wed', hours: 3, efficiency: 9 },
    { day: 'Thu', hours: 2.5, efficiency: 8 },
    { day: 'Fri', hours: 1, efficiency: 6 },
    { day: 'Sat', hours: 4, efficiency: 9 },
    { day: 'Sun', hours: 2, efficiency: 7 }
  ];

  const categoryProgress = [
    { name: 'Academic', value: 75, color: '#3b82f6' },
    { name: 'Career', value: 60, color: '#8b5cf6' },
    { name: 'Personal', value: 30, color: '#06b6d4' },
    { name: 'Skills', value: 45, color: '#10b981' }
  ];

  const handleCreateGoal = () => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      ...goalForm,
      status: 'not_started',
      createdAt: new Date().toISOString(),
      progress: 0,
      milestones: []
    };
    setGoals([...goals, newGoal]);
    setGoalForm({ title: '', description: '', category: 'academic', priority: 'medium', targetDate: '', isPublic: false });
    setShowGoalForm(false);
    toast.success('Goal created successfully!');
  };

  const handleUpdateGoal = () => {
    if (!editingGoal) return;
    setGoals(goals.map(goal => 
      goal.id === editingGoal.id 
        ? { ...goal, ...goalForm }
        : goal
    ));
    setEditingGoal(null);
    setGoalForm({ title: '', description: '', category: 'academic', priority: 'medium', targetDate: '', isPublic: false });
    toast.success('Goal updated successfully!');
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
    toast.success('Goal deleted successfully!');
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    setGoals(goals.map(goal => 
      goal.id === goalId 
        ? {
            ...goal,
            milestones: goal.milestones.map(milestone =>
              milestone.id === milestoneId
                ? { ...milestone, completed: !milestone.completed, completedAt: !milestone.completed ? new Date().toISOString() : undefined }
                : milestone
            )
          }
        : goal
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'paused': return 'outline';
      default: return 'outline';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Progress Tracker</h1>
          <p className="text-muted-foreground mt-1">
            Track your goals, achievements, and academic progress
          </p>
        </div>
        <Button onClick={() => setShowGoalForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Goal
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Goals Completed</p>
                <p className="text-2xl font-bold">{completedGoals}</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {inProgressGoals} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="text-2xl font-bold">{totalPoints}</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {achievements.length} achievements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Study Streak</p>
                <p className="text-2xl font-bold">{currentStreak}</p>
              </div>
              <Zap className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              days in a row
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Study Hours</p>
                <p className="text-2xl font-bold">
                  {Math.round(studySessions.reduce((sum, session) => sum + session.duration, 0) / 60)}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              this month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="goals" className="space-y-6">
        <TabsList>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="study-sessions">Study Sessions</TabsTrigger>
        </TabsList>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {goals.map(goal => (
              <Card key={goal.id} className="hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      <CardDescription className="mt-1">{goal.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityColor(goal.priority)}>
                        {goal.priority}
                      </Badge>
                      <Badge variant={getStatusColor(goal.status)}>
                        {goal.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Target Date</span>
                    <span>{new Date(goal.targetDate).toLocaleDateString()}</span>
                  </div>

                  {goal.milestones.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Milestones</p>
                      <div className="space-y-2">
                        {goal.milestones.map(milestone => (
                          <div key={milestone.id} className="flex items-center gap-2">
                            <button
                              onClick={() => toggleMilestone(goal.id, milestone.id)}
                              className={`h-4 w-4 rounded border-2 flex items-center justify-center ${
                                milestone.completed 
                                  ? 'bg-green-500 border-green-500' 
                                  : 'border-gray-300'
                              }`}
                            >
                              {milestone.completed && <CheckCircle className="h-3 w-3 text-white" />}
                            </button>
                            <span className={`text-sm ${milestone.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {milestone.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setEditingGoal(goal);
                        setGoalForm({
                          title: goal.title,
                          description: goal.description,
                          category: goal.category,
                          priority: goal.priority,
                          targetDate: goal.targetDate,
                          isPublic: goal.isPublic
                        });
                        setShowGoalForm(true);
                      }}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteGoal(goal.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map(achievement => (
              <Card key={achievement.id} className="hover:shadow-lg transition-all duration-200">
                <CardHeader className="text-center">
                  <div className="text-4xl mb-2">{achievement.icon}</div>
                  <CardTitle className="text-lg">{achievement.title}</CardTitle>
                  <CardDescription>{achievement.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-2">
                  <Badge className={getRarityColor(achievement.rarity)}>
                    {achievement.rarity}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    +{achievement.points} points
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Earned on {new Date(achievement.earnedAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Study Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Study Hours</CardTitle>
                <CardDescription>Study time and efficiency this week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={weeklyStudyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="hours" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Progress by Category</CardTitle>
                <CardDescription>Completion status across different areas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPieChart>
                    <Pie
                      data={categoryProgress}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {categoryProgress.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map(metric => (
              <Card key={metric.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{metric.name}</p>
                      <p className="text-2xl font-bold">{metric.value}</p>
                      <p className="text-xs text-muted-foreground">
                        Target: {metric.target} {metric.unit}
                      </p>
                    </div>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      metric.trend === 'up' ? 'bg-green-100' :
                      metric.trend === 'down' ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      <TrendingUp className={`h-4 w-4 ${
                        metric.trend === 'up' ? 'text-green-600' :
                        metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                      }`} />
                    </div>
                  </div>
                  <Progress value={(metric.value / metric.target) * 100} className="mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Study Sessions Tab */}
        <TabsContent value="study-sessions" className="space-y-6">
          <div className="space-y-4">
            {studySessions.map(session => (
              <Card key={session.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{session.subject}</p>
                        <p className="text-sm text-muted-foreground">
                          {Math.floor(session.duration / 60)}h {session.duration % 60}m
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Efficiency: {session.efficiency}/10</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {session.notes && (
                    <p className="text-sm text-muted-foreground mt-2">{session.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Goal Form Modal */}
      {showGoalForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</CardTitle>
              <CardDescription>
                {editingGoal ? 'Update your goal details' : 'Set a new goal to track your progress'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={goalForm.title}
                  onChange={(e) => setGoalForm({...goalForm, title: e.target.value})}
                  placeholder="Goal title"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={goalForm.description}
                  onChange={(e) => setGoalForm({...goalForm, description: e.target.value})}
                  placeholder="Describe your goal"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={goalForm.category} onValueChange={(value: any) => setGoalForm({...goalForm, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="career">Career</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="skill">Skill</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={goalForm.priority} onValueChange={(value: any) => setGoalForm({...goalForm, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Target Date</label>
                <Input
                  type="date"
                  value={goalForm.targetDate}
                  onChange={(e) => setGoalForm({...goalForm, targetDate: e.target.value})}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  onClick={editingGoal ? handleUpdateGoal : handleCreateGoal}
                  disabled={!goalForm.title || !goalForm.description}
                >
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowGoalForm(false);
                    setEditingGoal(null);
                    setGoalForm({ title: '', description: '', category: 'academic', priority: 'medium', targetDate: '', isPublic: false });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
