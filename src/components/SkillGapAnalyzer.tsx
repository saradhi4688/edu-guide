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
  TrendingDown, 
  CheckCircle, 
  XCircle,
  Clock,
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
  EyeOff,
  Calculator,
  Brain,
  Lightbulb,
  ArrowUp,
  ArrowDown,
  Minus,
  Info,
  Plus,
  Edit,
  Trash2,
  Download,
  Share,
  Bookmark,
  ExternalLink,
  Search,
  Filter,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Save,
  Loader2,
  AlertCircle,
  CheckSquare,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Octagon,
  Diamond,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Video,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Globe,
  Link,
  FileText,
  Image,
  Music,
  Film,
  Headphones,
  Mic,
  Camera,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Desktop,
  Server,
  Database,
  Cloud,
  Wifi,
  Bluetooth,
  Battery,
  Power,
  Lock,
  Unlock,
  Shield,
  Key,
  User,
  UserCheck,
  UserX,
  UserPlus,
  Users2,
  UserCog,
  UserEdit,
  UserMinus,
  UserSearch,
  UserVoice,
  UserHeart,
  UserStar,
  UserTie,
  UserGraduate,
  UserBriefcase,
  UserCheck2,
  UserClock,
  UserCrown,
  UserGear,
  UserShield,
  UserTag,
  UserX2
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
  Area,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { toast } from 'sonner@2.0.3';

interface Skill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'domain' | 'tool' | 'language';
  importance: 'critical' | 'important' | 'nice-to-have';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  currentLevel: number; // 0-100
  targetLevel: number; // 0-100
  gap: number; // targetLevel - currentLevel
  priority: 'high' | 'medium' | 'low';
  learningTime: number; // estimated hours
  resources: SkillResource[];
  prerequisites: string[];
  relatedSkills: string[];
  industryDemand: number; // 0-100
  salaryImpact: number; // 0-100
  futureRelevance: number; // 0-100
}

interface SkillResource {
  id: string;
  title: string;
  type: 'course' | 'book' | 'video' | 'article' | 'practice' | 'certification';
  url: string;
  duration: string;
  difficulty: string;
  rating: number;
  cost: number;
  provider: string;
  description: string;
}

interface CareerPath {
  id: string;
  name: string;
  description: string;
  requiredSkills: string[];
  recommendedSkills: string[];
  averageSalary: number;
  growthRate: number;
  jobMarket: 'high' | 'medium' | 'low';
  entryLevel: string;
  seniorLevel: string;
  industries: string[];
  companies: string[];
}

interface LearningPlan {
  id: string;
  name: string;
  description: string;
  skills: string[];
  timeline: number; // weeks
  milestones: LearningMilestone[];
  estimatedCost: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completionRate: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'paused';
  createdAt: string;
  updatedAt: string;
}

interface LearningMilestone {
  id: string;
  title: string;
  description: string;
  skills: string[];
  duration: number; // weeks
  resources: string[];
  completed: boolean;
  completedAt?: string;
}

export function SkillGapAnalyzer() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [learningPlans, setLearningPlans] = useState<LearningPlan[]>([]);
  const [selectedCareerPath, setSelectedCareerPath] = useState<string>('');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [showSkillDetails, setShowSkillDetails] = useState(false);
  const [showLearningPlan, setShowLearningPlan] = useState(false);
  const [newLearningPlan, setNewLearningPlan] = useState({
    name: '',
    description: '',
    timeline: 12,
    difficulty: 'intermediate' as const
  });

  // Sample data
  const sampleSkills: Skill[] = [
    {
      id: '1',
      name: 'Python Programming',
      category: 'technical',
      importance: 'critical',
      difficulty: 'intermediate',
      currentLevel: 60,
      targetLevel: 90,
      gap: 30,
      priority: 'high',
      learningTime: 120,
      resources: [
        {
          id: '1',
          title: 'Python for Data Science',
          type: 'course',
          url: 'https://example.com/python-course',
          duration: '40 hours',
          difficulty: 'intermediate',
          rating: 4.8,
          cost: 2999,
          provider: 'Coursera',
          description: 'Comprehensive Python course for data science applications'
        }
      ],
      prerequisites: ['Basic Programming', 'Mathematics'],
      relatedSkills: ['Data Analysis', 'Machine Learning', 'Web Development'],
      industryDemand: 95,
      salaryImpact: 85,
      futureRelevance: 90
    },
    {
      id: '2',
      name: 'Communication Skills',
      category: 'soft',
      importance: 'important',
      difficulty: 'beginner',
      currentLevel: 70,
      targetLevel: 85,
      gap: 15,
      priority: 'medium',
      learningTime: 40,
      resources: [
        {
          id: '2',
          title: 'Effective Communication Workshop',
          type: 'course',
          url: 'https://example.com/communication',
          duration: '20 hours',
          difficulty: 'beginner',
          rating: 4.5,
          cost: 1999,
          provider: 'Udemy',
          description: 'Improve your communication skills for professional success'
        }
      ],
      prerequisites: [],
      relatedSkills: ['Presentation Skills', 'Leadership', 'Teamwork'],
      industryDemand: 90,
      salaryImpact: 70,
      futureRelevance: 95
    },
    {
      id: '3',
      name: 'Machine Learning',
      category: 'technical',
      importance: 'critical',
      difficulty: 'advanced',
      currentLevel: 30,
      targetLevel: 80,
      gap: 50,
      priority: 'high',
      learningTime: 200,
      resources: [
        {
          id: '3',
          title: 'Machine Learning Specialization',
          type: 'course',
          url: 'https://example.com/ml-course',
          duration: '80 hours',
          difficulty: 'advanced',
          rating: 4.9,
          cost: 4999,
          provider: 'Stanford Online',
          description: 'Advanced machine learning concepts and applications'
        }
      ],
      prerequisites: ['Python Programming', 'Statistics', 'Linear Algebra'],
      relatedSkills: ['Deep Learning', 'AI', 'Data Science'],
      industryDemand: 85,
      salaryImpact: 95,
      futureRelevance: 95
    }
  ];

  const sampleCareerPaths: CareerPath[] = [
    {
      id: '1',
      name: 'Data Scientist',
      description: 'Analyze complex data to help organizations make informed decisions',
      requiredSkills: ['Python Programming', 'Statistics', 'Machine Learning', 'Data Analysis'],
      recommendedSkills: ['SQL', 'Communication Skills', 'Business Acumen'],
      averageSalary: 1200000,
      growthRate: 15,
      jobMarket: 'high',
      entryLevel: 'Data Analyst',
      seniorLevel: 'Principal Data Scientist',
      industries: ['Technology', 'Finance', 'Healthcare', 'E-commerce'],
      companies: ['Google', 'Microsoft', 'Amazon', 'Flipkart', 'Paytm']
    },
    {
      id: '2',
      name: 'Software Engineer',
      description: 'Design, develop, and maintain software applications',
      requiredSkills: ['Programming', 'Data Structures', 'Algorithms', 'System Design'],
      recommendedSkills: ['Communication Skills', 'Teamwork', 'Problem Solving'],
      averageSalary: 800000,
      growthRate: 12,
      jobMarket: 'high',
      entryLevel: 'Junior Developer',
      seniorLevel: 'Tech Lead',
      industries: ['Technology', 'Fintech', 'E-commerce', 'Gaming'],
      companies: ['Google', 'Microsoft', 'Amazon', 'TCS', 'Infosys']
    }
  ];

  const sampleLearningPlans: LearningPlan[] = [
    {
      id: '1',
      name: 'Data Science Foundation',
      description: 'Complete learning path for becoming a data scientist',
      skills: ['Python Programming', 'Statistics', 'Machine Learning', 'Data Analysis'],
      timeline: 24,
      milestones: [
        {
          id: '1',
          title: 'Python Basics',
          description: 'Learn Python programming fundamentals',
          skills: ['Python Programming'],
          duration: 4,
          resources: ['Python Course 1', 'Python Practice'],
          completed: true,
          completedAt: '2024-01-15'
        },
        {
          id: '2',
          title: 'Statistics & Data Analysis',
          description: 'Master statistical concepts and data analysis',
          skills: ['Statistics', 'Data Analysis'],
          duration: 6,
          resources: ['Statistics Course', 'Data Analysis Workshop'],
          completed: false
        }
      ],
      estimatedCost: 15000,
      difficulty: 'intermediate',
      completionRate: 25,
      status: 'in-progress',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15'
    }
  ];

  useEffect(() => {
    setSkills(sampleSkills);
    setCareerPaths(sampleCareerPaths);
    setLearningPlans(sampleLearningPlans);
  }, []);

  const currentCareerPath = careerPaths.find(path => path.id === selectedCareerPath);
  const criticalSkills = skills.filter(skill => skill.importance === 'critical');
  const highPrioritySkills = skills.filter(skill => skill.priority === 'high');
  const completedSkills = skills.filter(skill => skill.currentLevel >= skill.targetLevel);
  const inProgressSkills = skills.filter(skill => skill.currentLevel > 0 && skill.currentLevel < skill.targetLevel);

  const skillGapData = skills.map(skill => ({
    name: skill.name,
    current: skill.currentLevel,
    target: skill.targetLevel,
    gap: skill.gap
  }));

  const categoryData = [
    { name: 'Technical', value: skills.filter(s => s.category === 'technical').length, color: '#3b82f6' },
    { name: 'Soft', value: skills.filter(s => s.category === 'soft').length, color: '#8b5cf6' },
    { name: 'Domain', value: skills.filter(s => s.category === 'domain').length, color: '#06b6d4' },
    { name: 'Tool', value: skills.filter(s => s.category === 'tool').length, color: '#10b981' },
    { name: 'Language', value: skills.filter(s => s.category === 'language').length, color: '#f59e0b' }
  ];

  const priorityData = [
    { name: 'High', value: skills.filter(s => s.priority === 'high').length, color: '#ef4444' },
    { name: 'Medium', value: skills.filter(s => s.priority === 'medium').length, color: '#f59e0b' },
    { name: 'Low', value: skills.filter(s => s.priority === 'low').length, color: '#10b981' }
  ];

  const handleSkillUpdate = (skillId: string, newLevel: number) => {
    setSkills(skills.map(skill => 
      skill.id === skillId 
        ? { ...skill, currentLevel: newLevel, gap: skill.targetLevel - newLevel }
        : skill
    ));
  };

  const handleCreateLearningPlan = () => {
    const newPlan: LearningPlan = {
      id: Date.now().toString(),
      ...newLearningPlan,
      skills: highPrioritySkills.map(skill => skill.id),
      milestones: [],
      estimatedCost: 0,
      completionRate: 0,
      status: 'not-started',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setLearningPlans([...learningPlans, newPlan]);
    setNewLearningPlan({ name: '', description: '', timeline: 12, difficulty: 'intermediate' });
    setShowLearningPlan(false);
    toast.success('Learning plan created successfully!');
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'important': return 'bg-yellow-100 text-yellow-800';
      case 'nice-to-have': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'not-started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Skill Gap Analyzer</h1>
          <p className="text-muted-foreground mt-1">
            Identify skills needed for your career and track your learning progress
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowLearningPlan(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Learning Plan
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Career Path Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Career Path</CardTitle>
          <CardDescription>Choose your target career to analyze required skills</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedCareerPath} onValueChange={setSelectedCareerPath}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a career path" />
            </SelectTrigger>
            <SelectContent>
              {careerPaths.map(path => (
                <SelectItem key={path.id} value={path.id}>
                  {path.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Skills</p>
                <p className="text-2xl font-bold">{skills.length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {criticalSkills.length} critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedSkills.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round((completedSkills.length / skills.length) * 100)}% complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{inProgressSkills.length}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {highPrioritySkills.length} high priority
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Learning Plans</p>
                <p className="text-2xl font-bold">{learningPlans.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {learningPlans.filter(plan => plan.status === 'in-progress').length} active
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="skills" className="space-y-6">
        <TabsList>
          <TabsTrigger value="skills">Skills Analysis</TabsTrigger>
          <TabsTrigger value="gaps">Skill Gaps</TabsTrigger>
          <TabsTrigger value="learning">Learning Plans</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Skills Analysis Tab */}
        <TabsContent value="skills" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {skills.map(skill => (
              <Card key={skill.id} className="hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{skill.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {skill.category} • {skill.difficulty}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getImportanceColor(skill.importance)}>
                        {skill.importance}
                      </Badge>
                      <Badge className={getPriorityColor(skill.priority)}>
                        {skill.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Current Level</span>
                      <span>{skill.currentLevel}%</span>
                    </div>
                    <Progress value={skill.currentLevel} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Target Level</span>
                      <span>{skill.targetLevel}%</span>
                    </div>
                    <Progress value={skill.targetLevel} className="h-2" />
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Gap</p>
                      <p className="font-medium text-red-600">{skill.gap}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Learning Time</p>
                      <p className="font-medium">{skill.learningTime}h</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Industry Demand</p>
                      <p className="font-medium">{skill.industryDemand}%</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        setSelectedSkill(skill);
                        setShowSkillDetails(true);
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Skill Gaps Tab */}
        <TabsContent value="gaps" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skill Gap Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Skill Gap Analysis</CardTitle>
                <CardDescription>Current vs Target skill levels</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={skillGapData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="current" fill="#3b82f6" name="Current" />
                    <Bar dataKey="target" fill="#10b981" name="Target" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Skills by Category</CardTitle>
                <CardDescription>Distribution of skills across different categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Priority Skills */}
          <Card>
            <CardHeader>
              <CardTitle>High Priority Skills</CardTitle>
              <CardDescription>Skills that need immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {highPrioritySkills.map(skill => (
                  <div key={skill.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{skill.name}</h3>
                        <Badge className={getDifficultyColor(skill.difficulty)}>
                          {skill.difficulty}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <span>Gap: {skill.gap}%</span>
                        <span>Time: {skill.learningTime}h</span>
                        <span>Demand: {skill.industryDemand}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Current</p>
                      <p className="text-lg font-bold">{skill.currentLevel}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Learning Plans Tab */}
        <TabsContent value="learning" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {learningPlans.map(plan => (
              <Card key={plan.id} className="hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <CardDescription className="mt-1">{plan.description}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(plan.status)}>
                      {plan.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{plan.completionRate}%</span>
                    </div>
                    <Progress value={plan.completionRate} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Timeline</p>
                      <p className="font-medium">{plan.timeline} weeks</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Skills</p>
                      <p className="font-medium">{plan.skills.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cost</p>
                      <p className="font-medium">₹{plan.estimatedCost.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Difficulty</p>
                      <p className="font-medium">{plan.difficulty}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Milestones:</p>
                    <div className="space-y-2">
                      {plan.milestones.map(milestone => (
                        <div key={milestone.id} className="flex items-center gap-2">
                          <div className={`h-4 w-4 rounded border-2 flex items-center justify-center ${
                            milestone.completed 
                              ? 'bg-green-500 border-green-500' 
                              : 'border-gray-300'
                          }`}>
                            {milestone.completed && <CheckCircle className="h-3 w-3 text-white" />}
                          </div>
                          <span className={`text-sm ${milestone.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {milestone.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <Play className="h-3 w-3 mr-1" />
                      Continue
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Priority Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Skills by Priority</CardTitle>
                <CardDescription>Distribution of skills by priority level</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Learning Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
                <CardDescription>Overall skill development over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={[
                    { month: 'Jan', progress: 20 },
                    { month: 'Feb', progress: 35 },
                    { month: 'Mar', progress: 45 },
                    { month: 'Apr', progress: 60 },
                    { month: 'May', progress: 70 },
                    { month: 'Jun', progress: 80 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="progress" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Career Path Analysis */}
          {currentCareerPath && (
            <Card>
              <CardHeader>
                <CardTitle>Career Path Analysis: {currentCareerPath.name}</CardTitle>
                <CardDescription>{currentCareerPath.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Salary</p>
                    <p className="text-lg font-bold">₹{currentCareerPath.averageSalary.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Growth Rate</p>
                    <p className="text-lg font-bold">{currentCareerPath.growthRate}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Job Market</p>
                    <p className="text-lg font-bold capitalize">{currentCareerPath.jobMarket}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Required Skills</p>
                    <p className="text-lg font-bold">{currentCareerPath.requiredSkills.length}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Required Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {currentCareerPath.requiredSkills.map(skill => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Top Companies:</p>
                  <div className="flex flex-wrap gap-2">
                    {currentCareerPath.companies.map(company => (
                      <Badge key={company} variant="secondary">
                        {company}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Skill Details Modal */}
      {showSkillDetails && selectedSkill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{selectedSkill.name}</CardTitle>
              <CardDescription>
                {selectedSkill.category} • {selectedSkill.difficulty} • {selectedSkill.importance}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-2">Current Level</p>
                  <Progress value={selectedSkill.currentLevel} className="h-3" />
                  <p className="text-sm text-muted-foreground mt-1">{selectedSkill.currentLevel}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Target Level</p>
                  <Progress value={selectedSkill.targetLevel} className="h-3" />
                  <p className="text-sm text-muted-foreground mt-1">{selectedSkill.targetLevel}%</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium">Industry Demand</p>
                  <p className="text-lg font-bold">{selectedSkill.industryDemand}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Salary Impact</p>
                  <p className="text-lg font-bold">{selectedSkill.salaryImpact}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Future Relevance</p>
                  <p className="text-lg font-bold">{selectedSkill.futureRelevance}%</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Learning Resources:</p>
                <div className="space-y-2">
                  {selectedSkill.resources.map(resource => (
                    <div key={resource.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{resource.title}</h4>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{resource.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{resource.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{resource.provider} • {resource.duration}</span>
                        <span>₹{resource.cost.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Prerequisites:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSkill.prerequisites.map(prereq => (
                    <Badge key={prereq} variant="outline">
                      {prereq}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Related Skills:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSkill.relatedSkills.map(skill => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Start Learning
                </Button>
                <Button variant="outline" onClick={() => setShowSkillDetails(false)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Learning Plan Modal */}
      {showLearningPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Create Learning Plan</CardTitle>
              <CardDescription>Create a personalized learning plan for your skill development</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Plan Name</label>
                <Input
                  value={newLearningPlan.name}
                  onChange={(e) => setNewLearningPlan({...newLearningPlan, name: e.target.value})}
                  placeholder="Enter plan name"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newLearningPlan.description}
                  onChange={(e) => setNewLearningPlan({...newLearningPlan, description: e.target.value})}
                  placeholder="Describe your learning goals"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Timeline (weeks)</label>
                  <Input
                    type="number"
                    value={newLearningPlan.timeline}
                    onChange={(e) => setNewLearningPlan({...newLearningPlan, timeline: parseInt(e.target.value) || 12})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Difficulty</label>
                  <Select value={newLearningPlan.difficulty} onValueChange={(value: any) => setNewLearningPlan({...newLearningPlan, difficulty: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  onClick={handleCreateLearningPlan}
                  disabled={!newLearningPlan.name || !newLearningPlan.description}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Plan
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowLearningPlan(false)}
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
