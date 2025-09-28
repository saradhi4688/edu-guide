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
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertCircle, 
  CheckCircle,
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
  Info
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
  Radar
} from 'recharts';
import { toast } from 'sonner@2.0.3';

interface AdmissionPrediction {
  collegeId: string;
  collegeName: string;
  course: string;
  probability: number;
  confidence: number;
  factors: {
    academic: number;
    extracurricular: number;
    location: number;
    competition: number;
    profile: number;
  };
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  backupOptions: string[];
}

interface SuccessPrediction {
  careerPath: string;
  successProbability: number;
  factors: {
    marketDemand: number;
    skillMatch: number;
    education: number;
    experience: number;
    networking: number;
  };
  timeline: {
    shortTerm: string;
    mediumTerm: string;
    longTerm: string;
  };
  salaryProjection: {
    entry: number;
    mid: number;
    senior: number;
  };
  challenges: string[];
  opportunities: string[];
}

interface RiskAssessment {
  category: string;
  riskLevel: 'low' | 'medium' | 'high';
  description: string;
  mitigation: string[];
  impact: number;
}

interface MarketTrend {
  field: string;
  demand: number;
  growth: number;
  salary: number;
  competition: number;
  future: number;
}

export function PredictiveAnalytics() {
  const [admissionPredictions, setAdmissionPredictions] = useState<AdmissionPrediction[]>([]);
  const [successPredictions, setSuccessPredictions] = useState<SuccessPrediction[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([]);
  const [selectedField, setSelectedField] = useState('all');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  // Sample data
  const sampleAdmissionPredictions: AdmissionPrediction[] = [
    {
      collegeId: '1',
      collegeName: 'IIT Delhi',
      course: 'Computer Science Engineering',
      probability: 75,
      confidence: 85,
      factors: {
        academic: 90,
        extracurricular: 70,
        location: 80,
        competition: 60,
        profile: 85
      },
      recommendations: [
        'Improve JEE Main score by 50+ points',
        'Add more technical projects to portfolio',
        'Consider backup options with 60-70% probability'
      ],
      riskLevel: 'medium',
      backupOptions: ['IIT Bombay', 'IIT Madras', 'NIT Trichy']
    },
    {
      collegeId: '2',
      collegeName: 'Delhi University',
      course: 'B.Sc Computer Science',
      probability: 90,
      confidence: 92,
      factors: {
        academic: 85,
        extracurricular: 75,
        location: 95,
        competition: 80,
        profile: 88
      },
      recommendations: [
        'Maintain current academic performance',
        'Prepare for entrance exam',
        'Apply for early admission'
      ],
      riskLevel: 'low',
      backupOptions: ['JNU', 'Jamia Millia', 'Ambedkar University']
    },
    {
      collegeId: '3',
      collegeName: 'AIIMS Delhi',
      course: 'MBBS',
      probability: 45,
      confidence: 78,
      factors: {
        academic: 95,
        extracurricular: 60,
        location: 70,
        competition: 30,
        profile: 80
      },
      recommendations: [
        'Focus on NEET preparation',
        'Improve biology and chemistry scores',
        'Consider alternative medical colleges'
      ],
      riskLevel: 'high',
      backupOptions: ['AIIMS Bhopal', 'JIPMER', 'State Medical Colleges']
    }
  ];

  const sampleSuccessPredictions: SuccessPrediction[] = [
    {
      careerPath: 'Software Engineer',
      successProbability: 88,
      factors: {
        marketDemand: 95,
        skillMatch: 85,
        education: 80,
        experience: 70,
        networking: 75
      },
      timeline: {
        shortTerm: '6-12 months to get first job',
        mediumTerm: '2-3 years to become senior developer',
        longTerm: '5-7 years to reach tech lead position'
      },
      salaryProjection: {
        entry: 6,
        mid: 15,
        senior: 35
      },
      challenges: [
        'High competition in entry-level positions',
        'Need to continuously update skills',
        'Long working hours in some companies'
      ],
      opportunities: [
        'Remote work opportunities',
        'High growth potential',
        'Multiple career paths available'
      ]
    },
    {
      careerPath: 'Data Scientist',
      successProbability: 82,
      factors: {
        marketDemand: 90,
        skillMatch: 80,
        education: 85,
        experience: 65,
        networking: 70
      },
      timeline: {
        shortTerm: '8-15 months to transition into data science',
        mediumTerm: '2-4 years to become senior data scientist',
        longTerm: '5-8 years to reach principal data scientist'
      },
      salaryProjection: {
        entry: 8,
        mid: 18,
        senior: 40
      },
      challenges: [
        'Requires strong mathematical background',
        'Need to learn multiple tools and technologies',
        'Competitive field with high expectations'
      ],
      opportunities: [
        'Growing demand across industries',
        'High salary potential',
        'Opportunity to work on cutting-edge problems'
      ]
    }
  ];

  const sampleRiskAssessments: RiskAssessment[] = [
    {
      category: 'Academic Performance',
      riskLevel: 'low',
      description: 'Current academic performance is strong and consistent',
      mitigation: ['Maintain current study schedule', 'Focus on weak subjects'],
      impact: 20
    },
    {
      category: 'Market Competition',
      riskLevel: 'medium',
      description: 'High competition in chosen field may affect job prospects',
      mitigation: ['Develop unique skills', 'Build strong portfolio', 'Network actively'],
      impact: 60
    },
    {
      category: 'Economic Factors',
      riskLevel: 'low',
      description: 'Economic conditions are favorable for the chosen career path',
      mitigation: ['Stay updated with industry trends', 'Build emergency fund'],
      impact: 30
    }
  ];

  const sampleMarketTrends: MarketTrend[] = [
    {
      field: 'Artificial Intelligence',
      demand: 95,
      growth: 90,
      salary: 85,
      competition: 70,
      future: 95
    },
    {
      field: 'Data Science',
      demand: 90,
      growth: 85,
      salary: 80,
      competition: 75,
      future: 90
    },
    {
      field: 'Cybersecurity',
      demand: 85,
      growth: 80,
      salary: 75,
      competition: 60,
      future: 85
    },
    {
      field: 'Cloud Computing',
      demand: 80,
      growth: 75,
      salary: 70,
      competition: 65,
      future: 80
    }
  ];

  useEffect(() => {
    setAdmissionPredictions(sampleAdmissionPredictions);
    setSuccessPredictions(sampleSuccessPredictions);
    setRiskAssessments(sampleRiskAssessments);
    setMarketTrends(sampleMarketTrends);
  }, []);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600';
    if (probability >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const radarData = successPredictions.map(prediction => ({
    subject: prediction.careerPath,
    A: prediction.factors.marketDemand,
    B: prediction.factors.skillMatch,
    C: prediction.factors.education,
    D: prediction.factors.experience,
    E: prediction.factors.networking,
    fullMark: 100
  }));

  const marketTrendData = marketTrends.map(trend => ({
    field: trend.field,
    demand: trend.demand,
    growth: trend.growth,
    salary: trend.salary,
    competition: trend.competition,
    future: trend.future
  }));

  const calculateOverallRisk = () => {
    const totalImpact = riskAssessments.reduce((sum, risk) => sum + risk.impact, 0);
    const weightedRisk = riskAssessments.reduce((sum, risk) => {
      const weight = risk.impact / totalImpact;
      const riskValue = risk.riskLevel === 'high' ? 3 : risk.riskLevel === 'medium' ? 2 : 1;
      return sum + (riskValue * weight);
    }, 0);
    
    if (weightedRisk >= 2.5) return 'high';
    if (weightedRisk >= 1.5) return 'medium';
    return 'low';
  };

  const overallRisk = calculateOverallRisk();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Predictive Analytics</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered predictions for admission chances and career success
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getRiskColor(overallRisk)}>
            Overall Risk: {overallRisk}
          </Badge>
          <Button variant="outline">
            <Calculator className="h-4 w-4 mr-2" />
            Recalculate
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Admission Chance</p>
                <p className="text-2xl font-bold">
                  {Math.round(admissionPredictions.reduce((sum, pred) => sum + pred.probability, 0) / admissionPredictions.length)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Across {admissionPredictions.length} colleges
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Probability</p>
                <p className="text-2xl font-bold">
                  {Math.round(successPredictions.reduce((sum, pred) => sum + pred.successProbability, 0) / successPredictions.length)}%
                </p>
              </div>
              <Trophy className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Career success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Market Demand</p>
                <p className="text-2xl font-bold">
                  {Math.round(marketTrends.reduce((sum, trend) => sum + trend.demand, 0) / marketTrends.length)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Average across fields
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Risk Level</p>
                <p className="text-2xl font-bold capitalize">{overallRisk}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Overall assessment
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="admissions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="admissions">Admission Predictions</TabsTrigger>
          <TabsTrigger value="career">Career Success</TabsTrigger>
          <TabsTrigger value="risks">Risk Assessment</TabsTrigger>
          <TabsTrigger value="market">Market Trends</TabsTrigger>
        </TabsList>

        {/* Admission Predictions Tab */}
        <TabsContent value="admissions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {admissionPredictions.map(prediction => (
              <Card key={prediction.collegeId} className="hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{prediction.collegeName}</CardTitle>
                      <CardDescription className="mt-1">{prediction.course}</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getProbabilityColor(prediction.probability)}`}>
                        {prediction.probability}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Confidence: {prediction.confidence}%
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Admission Probability</span>
                      <span>{prediction.probability}%</span>
                    </div>
                    <Progress value={prediction.probability} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Academic</p>
                      <p className="font-medium">{prediction.factors.academic}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Profile</p>
                      <p className="font-medium">{prediction.factors.profile}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Competition</p>
                      <p className="font-medium">{prediction.factors.competition}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-medium">{prediction.factors.location}%</p>
                    </div>
                  </div>

                  <div>
                    <Badge className={getRiskColor(prediction.riskLevel)}>
                      Risk: {prediction.riskLevel}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Key Recommendations:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {prediction.recommendations.slice(0, 2).map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowDetails(showDetails === prediction.collegeId ? null : prediction.collegeId)}
                  >
                    {showDetails === prediction.collegeId ? 'Hide Details' : 'Show Details'}
                  </Button>

                  {showDetails === prediction.collegeId && (
                    <div className="space-y-3 pt-3 border-t">
                      <div>
                        <p className="text-sm font-medium mb-2">All Recommendations:</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {prediction.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-blue-500 mt-1">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-2">Backup Options:</p>
                        <div className="flex flex-wrap gap-1">
                          {prediction.backupOptions.map((option, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {option}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Career Success Tab */}
        <TabsContent value="career" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {successPredictions.map((prediction, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{prediction.careerPath}</CardTitle>
                      <CardDescription className="mt-1">
                        Success Probability: {prediction.successProbability}%
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getProbabilityColor(prediction.successProbability)}`}>
                        {prediction.successProbability}%
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Success Probability</span>
                      <span>{prediction.successProbability}%</span>
                    </div>
                    <Progress value={prediction.successProbability} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Market Demand</p>
                      <p className="font-medium">{prediction.factors.marketDemand}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Skill Match</p>
                      <p className="font-medium">{prediction.factors.skillMatch}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Education</p>
                      <p className="font-medium">{prediction.factors.education}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Networking</p>
                      <p className="font-medium">{prediction.factors.networking}%</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Salary Projection (LPA):</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-blue-50 rounded">
                        <p className="text-xs text-muted-foreground">Entry</p>
                        <p className="font-medium">₹{prediction.salaryProjection.entry}L</p>
                      </div>
                      <div className="p-2 bg-green-50 rounded">
                        <p className="text-xs text-muted-foreground">Mid</p>
                        <p className="font-medium">₹{prediction.salaryProjection.mid}L</p>
                      </div>
                      <div className="p-2 bg-purple-50 rounded">
                        <p className="text-xs text-muted-foreground">Senior</p>
                        <p className="font-medium">₹{prediction.salaryProjection.senior}L</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Timeline:</p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p><strong>Short-term:</strong> {prediction.timeline.shortTerm}</p>
                      <p><strong>Medium-term:</strong> {prediction.timeline.mediumTerm}</p>
                      <p><strong>Long-term:</strong> {prediction.timeline.longTerm}</p>
                    </div>
                  </div>

                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowDetails(showDetails === `career-${index}` ? null : `career-${index}`)}
                  >
                    {showDetails === `career-${index}` ? 'Hide Details' : 'Show Details'}
                  </Button>

                  {showDetails === `career-${index}` && (
                    <div className="space-y-3 pt-3 border-t">
                      <div>
                        <p className="text-sm font-medium mb-2">Challenges:</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {prediction.challenges.map((challenge, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-red-500 mt-1">•</span>
                              {challenge}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-2">Opportunities:</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {prediction.opportunities.map((opportunity, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-green-500 mt-1">•</span>
                              {opportunity}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Career Factor Analysis</CardTitle>
              <CardDescription>Comparison of key factors across career paths</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Market Demand" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Radar name="Skill Match" dataKey="B" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                  <Radar name="Education" dataKey="C" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
                  <Radar name="Experience" dataKey="D" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  <Radar name="Networking" dataKey="E" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Assessment Tab */}
        <TabsContent value="risks" className="space-y-6">
          <div className="space-y-4">
            {riskAssessments.map((risk, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{risk.category}</h3>
                        <Badge className={getRiskColor(risk.riskLevel)}>
                          {risk.riskLevel} risk
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{risk.description}</p>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Mitigation Strategies:</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {risk.mitigation.map((strategy, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-blue-500 mt-1">•</span>
                              {strategy}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Impact</p>
                      <p className="text-lg font-bold">{risk.impact}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Market Trends Tab */}
        <TabsContent value="market" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {marketTrends.map((trend, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{trend.field}</CardTitle>
                  <CardDescription>Market analysis and future prospects</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Demand</p>
                      <p className="font-medium">{trend.demand}%</p>
                      <Progress value={trend.demand} className="h-1 mt-1" />
                    </div>
                    <div>
                      <p className="text-muted-foreground">Growth</p>
                      <p className="font-medium">{trend.growth}%</p>
                      <Progress value={trend.growth} className="h-1 mt-1" />
                    </div>
                    <div>
                      <p className="text-muted-foreground">Salary</p>
                      <p className="font-medium">{trend.salary}%</p>
                      <Progress value={trend.salary} className="h-1 mt-1" />
                    </div>
                    <div>
                      <p className="text-muted-foreground">Competition</p>
                      <p className="font-medium">{trend.competition}%</p>
                      <Progress value={trend.competition} className="h-1 mt-1" />
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Future Outlook</p>
                    <div className="flex items-center gap-2">
                      <Progress value={trend.future} className="flex-1 h-2" />
                      <span className="text-sm font-medium">{trend.future}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Market Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Market Trends Comparison</CardTitle>
              <CardDescription>Comparative analysis of different fields</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={marketTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="field" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="demand" fill="#3b82f6" name="Demand" />
                  <Bar dataKey="growth" fill="#8b5cf6" name="Growth" />
                  <Bar dataKey="salary" fill="#06b6d4" name="Salary" />
                  <Bar dataKey="competition" fill="#f59e0b" name="Competition" />
                  <Bar dataKey="future" fill="#10b981" name="Future" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
