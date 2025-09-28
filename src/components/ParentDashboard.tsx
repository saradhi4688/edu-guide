import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Clock,
  BookOpen,
  Target,
  MessageCircle,
  Bell,
  Star,
  Award,
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Eye,
  Settings,
  Plus,
  Search,
  Filter,
  BarChart3,
  PieChart,
  Activity
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
  Cell
} from 'recharts';
import { toast } from 'sonner@2.0.3';

interface Child {
  id: string;
  name: string;
  age: number;
  class: string;
  school: string;
  email: string;
  phone: string;
  profileComplete: boolean;
  lastActive: string;
  avatar?: string;
}

interface ChildProgress {
  childId: string;
  quizCompleted: number;
  totalQuizzes: number;
  collegesExplored: number;
  careerPathsViewed: number;
  timeSpent: number; // in minutes
  goalsSet: number;
  goalsAchieved: number;
  lastActivity: string;
  currentStreak: number;
  longestStreak: number;
}

interface Notification {
  id: string;
  childId: string;
  type: 'achievement' | 'reminder' | 'alert' | 'progress';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
}

interface ParentSettings {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  privacy: {
    shareProgress: boolean;
    allowMentorship: boolean;
    showLocation: boolean;
  };
  communication: {
    preferredLanguage: string;
    timezone: string;
  };
}

export function ParentDashboard() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [childProgress, setChildProgress] = useState<ChildProgress[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<ParentSettings>({
    notifications: { email: true, sms: false, push: true },
    privacy: { shareProgress: true, allowMentorship: true, showLocation: false },
    communication: { preferredLanguage: 'English', timezone: 'Asia/Kolkata' }
  });
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChild, setNewChild] = useState({
    name: '',
    age: 16,
    class: '12th',
    school: '',
    email: '',
    phone: ''
  });

  // Sample data
  const sampleChildren: Child[] = [
    {
      id: '1',
      name: 'Arjun Sharma',
      age: 17,
      class: '12th',
      school: 'Delhi Public School',
      email: 'arjun.sharma@email.com',
      phone: '+91 98765 43210',
      profileComplete: true,
      lastActive: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      name: 'Priya Sharma',
      age: 15,
      class: '10th',
      school: 'Delhi Public School',
      email: 'priya.sharma@email.com',
      phone: '+91 98765 43211',
      profileComplete: false,
      lastActive: '2024-01-14T15:20:00Z'
    }
  ];

  const sampleProgress: ChildProgress[] = [
    {
      childId: '1',
      quizCompleted: 8,
      totalQuizzes: 12,
      collegesExplored: 25,
      careerPathsViewed: 15,
      timeSpent: 1240,
      goalsSet: 5,
      goalsAchieved: 3,
      lastActivity: '2024-01-15T10:30:00Z',
      currentStreak: 7,
      longestStreak: 15
    },
    {
      childId: '2',
      quizCompleted: 3,
      totalQuizzes: 8,
      collegesExplored: 12,
      careerPathsViewed: 8,
      timeSpent: 680,
      goalsSet: 3,
      goalsAchieved: 1,
      lastActivity: '2024-01-14T15:20:00Z',
      currentStreak: 3,
      longestStreak: 8
    }
  ];

  const sampleNotifications: Notification[] = [
    {
      id: '1',
      childId: '1',
      type: 'achievement',
      title: 'Quiz Completed!',
      message: 'Arjun completed the Engineering Aptitude Quiz with 85% score',
      timestamp: '2024-01-15T10:30:00Z',
      isRead: false,
      priority: 'medium'
    },
    {
      id: '2',
      childId: '1',
      type: 'reminder',
      title: 'JEE Main Registration',
      message: 'Registration deadline for JEE Main 2025 is approaching',
      timestamp: '2024-01-14T09:00:00Z',
      isRead: false,
      priority: 'high'
    },
    {
      id: '3',
      childId: '2',
      type: 'progress',
      title: 'Profile Incomplete',
      message: 'Priya needs to complete her profile for better recommendations',
      timestamp: '2024-01-13T14:20:00Z',
      isRead: true,
      priority: 'low'
    }
  ];

  useEffect(() => {
    setChildren(sampleChildren);
    setChildProgress(sampleProgress);
    setNotifications(sampleNotifications);
    if (sampleChildren.length > 0) {
      setSelectedChild(sampleChildren[0]);
    }
  }, []);

  const currentProgress = selectedChild ? 
    childProgress.find(p => p.childId === selectedChild.id) : null;

  const childNotifications = selectedChild ? 
    notifications.filter(n => n.childId === selectedChild.id) : [];

  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  const progressData = [
    { name: 'Quizzes', completed: currentProgress?.quizCompleted || 0, total: currentProgress?.totalQuizzes || 0 },
    { name: 'Colleges', completed: currentProgress?.collegesExplored || 0, total: 50 },
    { name: 'Career Paths', completed: currentProgress?.careerPathsViewed || 0, total: 30 },
    { name: 'Goals', completed: currentProgress?.goalsAchieved || 0, total: currentProgress?.goalsSet || 0 }
  ];

  const timeSpentData = [
    { day: 'Mon', minutes: 120 },
    { day: 'Tue', minutes: 180 },
    { day: 'Wed', minutes: 90 },
    { day: 'Thu', minutes: 200 },
    { day: 'Fri', minutes: 150 },
    { day: 'Sat', minutes: 300 },
    { day: 'Sun', minutes: 200 }
  ];

  const handleAddChild = () => {
    const child: Child = {
      id: Date.now().toString(),
      ...newChild,
      profileComplete: false,
      lastActive: new Date().toISOString()
    };
    setChildren([...children, child]);
    setNewChild({ name: '', age: 16, class: '12th', school: '', email: '', phone: '' });
    setShowAddChild(false);
    toast.success('Child added successfully!');
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    ));
  };

  const sendMessageToChild = (childId: string) => {
    toast.success('Message sent to child!');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Parent Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor your child's educational journey and progress
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowAddChild(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Child
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Children Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Child</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {children.map(child => (
              <Card 
                key={child.id} 
                className={`cursor-pointer transition-all ${
                  selectedChild?.id === child.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedChild(child)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{child.name}</p>
                      <p className="text-sm text-muted-foreground">{child.class} • {child.school}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={child.profileComplete ? "default" : "secondary"}>
                          {child.profileComplete ? "Complete" : "Incomplete"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Last active: {new Date(child.lastActive).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedChild && (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Quiz Progress</p>
                    <p className="text-2xl font-bold">
                      {currentProgress?.quizCompleted}/{currentProgress?.totalQuizzes}
                    </p>
                  </div>
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <Progress 
                  value={(currentProgress?.quizCompleted || 0) / (currentProgress?.totalQuizzes || 1) * 100} 
                  className="mt-2" 
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Time Spent</p>
                    <p className="text-2xl font-bold">
                      {Math.floor((currentProgress?.timeSpent || 0) / 60)}h
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  This week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Streak</p>
                    <p className="text-2xl font-bold">{currentProgress?.currentStreak}</p>
                  </div>
                  <Target className="h-8 w-8 text-orange-600" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Best: {currentProgress?.longestStreak} days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Goals Achieved</p>
                    <p className="text-2xl font-bold">
                      {currentProgress?.goalsAchieved}/{currentProgress?.goalsSet}
                    </p>
                  </div>
                  <Award className="h-8 w-8 text-purple-600" />
                </div>
                <Progress 
                  value={(currentProgress?.goalsAchieved || 0) / (currentProgress?.goalsSet || 1) * 100} 
                  className="mt-2" 
                />
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="communication">Communication</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Progress Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Activity</CardTitle>
                    <CardDescription>Time spent on platform (minutes)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={timeSpentData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="minutes" stroke="#3b82f6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Progress Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Progress Breakdown</CardTitle>
                    <CardDescription>Completion status across different areas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={progressData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="completed" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {childNotifications.slice(0, 5).map(notification => (
                      <div key={notification.id} className="flex items-start gap-3 p-3 rounded-lg border">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          notification.type === 'achievement' ? 'bg-green-100' :
                          notification.type === 'reminder' ? 'bg-yellow-100' :
                          notification.type === 'alert' ? 'bg-red-100' : 'bg-blue-100'
                        }`}>
                          {notification.type === 'achievement' ? <Award className="h-4 w-4" /> :
                           notification.type === 'reminder' ? <Clock className="h-4 w-4" /> :
                           notification.type === 'alert' ? <AlertCircle className="h-4 w-4" /> :
                           <Activity className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notification.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant={notification.priority === 'high' ? 'destructive' : 
                                       notification.priority === 'medium' ? 'default' : 'secondary'}>
                          {notification.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Progress Tab */}
            <TabsContent value="progress" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {progressData.map(item => (
                  <Card key={item.name}>
                    <CardHeader>
                      <CardTitle>{item.name}</CardTitle>
                      <CardDescription>
                        {item.completed} of {item.total} completed
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Progress value={(item.completed / item.total) * 100} className="mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {Math.round((item.completed / item.total) * 100)}% complete
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">All Notifications</h3>
                <Badge variant="outline">
                  {unreadNotifications} unread
                </Badge>
              </div>
              
              <div className="space-y-4">
                {notifications.map(notification => (
                  <Card key={notification.id} className={notification.isRead ? 'opacity-75' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            notification.type === 'achievement' ? 'bg-green-100' :
                            notification.type === 'reminder' ? 'bg-yellow-100' :
                            notification.type === 'alert' ? 'bg-red-100' : 'bg-blue-100'
                          }`}>
                            {notification.type === 'achievement' ? <Award className="h-4 w-4" /> :
                             notification.type === 'reminder' ? <Clock className="h-4 w-4" /> :
                             notification.type === 'alert' ? <AlertCircle className="h-4 w-4" /> :
                             <Activity className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="font-medium">{notification.title}</p>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(notification.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={notification.priority === 'high' ? 'destructive' : 
                                         notification.priority === 'medium' ? 'default' : 'secondary'}>
                            {notification.priority}
                          </Badge>
                          {!notification.isRead && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => markNotificationAsRead(notification.id)}
                            >
                              Mark Read
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Communication Tab */}
            <TabsContent value="communication" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Communicate with {selectedChild.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <Button onClick={() => sendMessageToChild(selectedChild.id)}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                    <Button variant="outline">
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                    <Button variant="outline">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Email:</strong> {selectedChild.email}</p>
                      <p><strong>Phone:</strong> {selectedChild.phone}</p>
                      <p><strong>School:</strong> {selectedChild.school}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Add Child Modal */}
      {showAddChild && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Add Child</CardTitle>
              <CardDescription>Add a new child to monitor their progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={newChild.name}
                  onChange={(e) => setNewChild({...newChild, name: e.target.value})}
                  placeholder="Child's name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Age</label>
                  <Input
                    type="number"
                    value={newChild.age}
                    onChange={(e) => setNewChild({...newChild, age: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Class</label>
                  <Select value={newChild.class} onValueChange={(value) => setNewChild({...newChild, class: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9th">9th</SelectItem>
                      <SelectItem value="10th">10th</SelectItem>
                      <SelectItem value="11th">11th</SelectItem>
                      <SelectItem value="12th">12th</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">School</label>
                <Input
                  value={newChild.school}
                  onChange={(e) => setNewChild({...newChild, school: e.target.value})}
                  placeholder="School name"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={newChild.email}
                  onChange={(e) => setNewChild({...newChild, email: e.target.value})}
                  placeholder="Child's email"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={newChild.phone}
                  onChange={(e) => setNewChild({...newChild, phone: e.target.value})}
                  placeholder="Phone number"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  onClick={handleAddChild}
                  disabled={!newChild.name || !newChild.email}
                >
                  Add Child
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddChild(false)}
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
