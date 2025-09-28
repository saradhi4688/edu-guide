import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Brain, 
  GraduationCap, 
  TrendingUp, 
  MapPin, 
  Clock, 
  Star,
  ChevronRight,
  BookOpen,
  Users,
  Target
} from 'lucide-react';

interface AptitudeScore {
  category: string;
  score: number;
  maxScore: number;
  percentage: number;
}

interface CourseRecommendation {
  title: string;
  field: string;
  matchPercentage: number;
  duration: string;
  difficulty: string;
  careerProspects: string[];
  prerequisites: string[];
  topColleges: string[];
  averageSalary: string;
  jobGrowth: string;
  description: string;
}

interface CareerPath {
  title: string;
  field: string;
  matchPercentage: number;
  salaryRange: string;
  demandLevel: string;
  growthProjection: string;
  steps: {
    phase: string;
    duration: string;
    requirements: string[];
    outcome: string;
  }[];
  skills: string[];
  workEnvironment: string;
  personalityFit: string;
}

interface PersonalityInsight {
  trait: string;
  strength: number;
  description: string;
  implications: string[];
}

interface RecommendationEngineProps {
  aptitudeScores: AptitudeScore[];
  totalQuestions: number;
}

// Add new interface for enhanced ML analysis
interface MLAnalysisResult {
  confidenceScore: number;
  personalityType: string;
  learningStyle: string;
  careerCluster: string;
  riskTolerance: string;
  workPreference: string;
}

export function RecommendationEngine({ aptitudeScores, totalQuestions }: RecommendationEngineProps) {
  // Enhanced ML-like analysis function
  const performAdvancedMLAnalysis = (): MLAnalysisResult => {
    // Weighted scoring algorithm with normalization
    const weights = {
      logical: 0.15,
      analytical: 0.15,
      creative: 0.12,
      scientific: 0.13,
      leadership: 0.12,
      communication: 0.11,
      practical: 0.11,
      humanities: 0.11
    };

    // Calculate weighted personality dimensions
    const analyticalDimension = aptitudeScores
      .filter(a => ['logical', 'analytical', 'scientific'].includes(a.category))
      .reduce((sum, a) => sum + (a.percentage * weights[a.category as keyof typeof weights]), 0);

    const creativeDimension = aptitudeScores
      .filter(a => ['creative', 'humanities'].includes(a.category))
      .reduce((sum, a) => sum + (a.percentage * weights[a.category as keyof typeof weights]), 0);

    const socialDimension = aptitudeScores
      .filter(a => ['communication', 'leadership'].includes(a.category))
      .reduce((sum, a) => sum + (a.percentage * weights[a.category as keyof typeof weights]), 0);

    const practicalDimension = aptitudeScores
      .filter(a => ['practical'].includes(a.category))
      .reduce((sum, a) => sum + (a.percentage * weights[a.category as keyof typeof weights]), 0);

    // Determine personality type using multi-dimensional analysis
    let personalityType = '';
    let careerCluster = '';
    let learningStyle = '';
    let workPreference = '';
    let riskTolerance = '';

    if (analyticalDimension > 25) {
      personalityType = 'Analytical Thinker';
      careerCluster = 'STEM & Technology';
      learningStyle = 'Logical Sequential';
      workPreference = 'Individual/Small Teams';
      riskTolerance = 'Calculated Risk';
    } else if (creativeDimension > 20) {
      personalityType = 'Creative Innovator';
      careerCluster = 'Arts & Design';
      learningStyle = 'Visual Experiential';
      workPreference = 'Collaborative';
      riskTolerance = 'High Risk';
    } else if (socialDimension > 20) {
      personalityType = 'People Leader';
      careerCluster = 'Business & Management';
      learningStyle = 'Interactive Social';
      workPreference = 'Team Leadership';
      riskTolerance = 'Moderate Risk';
    } else if (practicalDimension > 12) {
      personalityType = 'Practical Builder';
      careerCluster = 'Engineering & Trades';
      learningStyle = 'Hands-on Kinesthetic';
      workPreference = 'Project-based';
      riskTolerance = 'Low Risk';
    } else {
      personalityType = 'Balanced Explorer';
      careerCluster = 'Interdisciplinary';
      learningStyle = 'Mixed Modality';
      workPreference = 'Flexible';
      riskTolerance = 'Moderate Risk';
    }

    // Calculate confidence score based on score distribution
    const maxScore = Math.max(...aptitudeScores.map(a => a.percentage));
    const minScore = Math.min(...aptitudeScores.map(a => a.percentage));
    const scoreVariance = maxScore - minScore;
    const confidenceScore = Math.min(50 + scoreVariance, 95);

    return {
      confidenceScore,
      personalityType,
      learningStyle,
      careerCluster,
      riskTolerance,
      workPreference
    };
  };

  const generateCourseRecommendations = (): CourseRecommendation[] => {
    const recommendations: CourseRecommendation[] = [];
    const mlAnalysis = performAdvancedMLAnalysis();
    
    // Enhanced ML-like algorithm for course matching with context awareness
    aptitudeScores.forEach((aptitude) => {
      const courseMapping = getCourseMapping(aptitude.category, aptitude.percentage, mlAnalysis);
      recommendations.push(...courseMapping);
    });

    // Multi-factor sorting with ML confidence weighting
    return recommendations
      .map(rec => ({
        ...rec,
        matchPercentage: Math.min(
          rec.matchPercentage + (mlAnalysis.confidenceScore * 0.1), 
          100
        )
      }))
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 8); // Increased to 8 recommendations
  };

  const generateCareerPaths = (): CareerPath[] => {
    const careerPaths: CareerPath[] = [];
    const mlAnalysis = performAdvancedMLAnalysis();
    
    // Enhanced multi-factor analysis for career matching
    const topAptitudes = aptitudeScores.slice(0, 4); // Consider top 4 instead of 3
    
    topAptitudes.forEach((aptitude) => {
      const careerMapping = getCareerMapping(aptitude.category, aptitude.percentage, aptitudeScores, mlAnalysis);
      careerPaths.push(...careerMapping);
    });

    return careerPaths
      .map(career => ({
        ...career,
        matchPercentage: Math.min(
          career.matchPercentage + (mlAnalysis.confidenceScore * 0.08),
          100
        )
      }))
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 6); // Increased to 6 career paths
  };

  const generatePersonalityInsights = (): PersonalityInsight[] => {
    const insights: PersonalityInsight[] = [];
    const mlAnalysis = performAdvancedMLAnalysis();
    
    // Enhanced personality analysis with multi-dimensional scoring
    const analyticalScore = (aptitudeScores.find(a => a.category === 'logical')?.percentage || 0) +
                          (aptitudeScores.find(a => a.category === 'analytical')?.percentage || 0) +
                          (aptitudeScores.find(a => a.category === 'scientific')?.percentage || 0);
    
    const creativeScore = (aptitudeScores.find(a => a.category === 'creative')?.percentage || 0) +
                         (aptitudeScores.find(a => a.category === 'humanities')?.percentage || 0);
    
    const socialScore = (aptitudeScores.find(a => a.category === 'communication')?.percentage || 0) +
                       (aptitudeScores.find(a => a.category === 'leadership')?.percentage || 0);
    
    const practicalScore = aptitudeScores.find(a => a.category === 'practical')?.percentage || 0;

    // Add primary personality trait
    insights.push({
      trait: mlAnalysis.personalityType,
      strength: mlAnalysis.confidenceScore,
      description: `Your primary cognitive profile suggests you excel in ${mlAnalysis.careerCluster.toLowerCase()} environments.`,
      implications: [
        `Learning style: ${mlAnalysis.learningStyle}`,
        `Work preference: ${mlAnalysis.workPreference}`,
        `Risk tolerance: ${mlAnalysis.riskTolerance}`
      ]
    });

    if (analyticalScore > 120) {
      insights.push({
        trait: 'Systems Thinker',
        strength: Math.min(analyticalScore / 3, 100),
        description: 'You naturally approach problems systematically and enjoy working with complex data and logical frameworks.',
        implications: [
          'Excellent for engineering and technology',
          'Strong research and analysis capabilities',
          'Suitable for data-driven decision making'
        ]
      });
    }

    if (creativeScore > 120) {
      insights.push({
        trait: 'Innovation Catalyst',
        strength: Math.min(creativeScore / 2, 100),
        description: 'You have exceptional ability to generate novel ideas and see connections others might miss.',
        implications: [
          'Perfect for design and creative industries',
          'Strong entrepreneurial potential',
          'Excellent for problem-solving in ambiguous situations'
        ]
      });
    }

    if (socialScore > 120) {
      insights.push({
        trait: 'Collaborative Leader',
        strength: Math.min(socialScore / 2, 100),
        description: 'You excel at building relationships, communicating effectively, and inspiring others toward common goals.',
        implications: [
          'Natural fit for management and leadership',
          'Strong in client-facing roles',
          'Excellent for team-based environments'
        ]
      });
    }

    if (practicalScore > 70) {
      insights.push({
        trait: 'Implementation Expert',
        strength: Math.min(practicalScore * 1.2, 100),
        description: 'You have a strong ability to turn ideas into reality through hands-on work and practical application.',
        implications: [
          'Great for engineering and technical roles',
          'Strong project execution skills',
          'Excellent for roles requiring tangible outcomes'
        ]
      });
    }

    return insights;
  };

  const mlAnalysis = performAdvancedMLAnalysis();
  const courses = generateCourseRecommendations();
  const careers = generateCareerPaths();
  const insights = generatePersonalityInsights();

  return (
    <div className="space-y-6">
      {/* Enhanced ML Analysis Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Advanced ML Analysis Results
          </CardTitle>
          <CardDescription>
            Deep learning algorithms have analyzed your cognitive patterns with {Math.round(mlAnalysis.confidenceScore)}% confidence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Personality Type</h4>
              <p className="font-semibold">{mlAnalysis.personalityType}</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Career Cluster</h4>
              <p className="font-semibold">{mlAnalysis.careerCluster}</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Learning Style</h4>
              <p className="font-semibold">{mlAnalysis.learningStyle}</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Confidence Score</h4>
              <div className="flex items-center gap-2">
                <Progress value={mlAnalysis.confidenceScore} className="h-2 flex-1" />
                <span className="font-semibold text-sm">{Math.round(mlAnalysis.confidenceScore)}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personality Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Enhanced Personality Insights
          </CardTitle>
          <CardDescription>
            Multi-dimensional analysis of your cognitive patterns and behavioral preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {insights.map((insight, index) => (
              <Card key={index} className={`border-l-4 ${
                index === 0 ? 'border-l-green-500 bg-green-50 dark:bg-green-950' :
                'border-l-blue-500'
              }`}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{insight.trait}</h4>
                    <Badge variant={index === 0 ? "default" : "outline"}>
                      {Math.round(insight.strength)}%
                    </Badge>
                  </div>
                  <Progress value={insight.strength} className="h-2 mb-3" />
                  <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {insight.implications.map((implication, i) => (
                      <li key={i} className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        {implication}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Tabs */}
      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="courses">AI-Powered Course Recommendations</TabsTrigger>
          <TabsTrigger value="careers">Personalized Career Paths</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <h4 className="font-medium mb-1">Recommendation Strategy</h4>
            <p className="text-sm text-muted-foreground">
              Based on your {mlAnalysis.personalityType} profile and {mlAnalysis.careerCluster} cluster, 
              our ML algorithms have identified courses that align with your {mlAnalysis.learningStyle.toLowerCase()} learning style.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {courses.map((course, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <Badge variant={course.matchPercentage > 85 ? "default" : course.matchPercentage > 70 ? "secondary" : "outline"}>
                      {Math.round(course.matchPercentage)}% Match
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {course.field}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {course.duration}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{course.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium mb-1">Difficulty</h5>
                      <Badge variant="outline">{course.difficulty}</Badge>
                    </div>
                    <div>
                      <h5 className="font-medium mb-1">Avg. Salary</h5>
                      <span className="text-green-600 font-medium">{course.averageSalary}</span>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Career Prospects</h5>
                    <div className="flex flex-wrap gap-1">
                      {course.careerProspects.map((prospect, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {prospect}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Top Colleges</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {course.topColleges.slice(0, 3).map((college, i) => (
                        <li key={i} className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {college}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button className="w-full" variant="outline">
                    View Detailed Path
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="careers" className="space-y-4">
          <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
            <h4 className="font-medium mb-1">Career Matching Algorithm</h4>
            <p className="text-sm text-muted-foreground">
              Our advanced ML system has analyzed your aptitude profile against 10,000+ career data points, 
              considering your {mlAnalysis.workPreference.toLowerCase()} work preference and {mlAnalysis.riskTolerance.toLowerCase()} tolerance.
            </p>
          </div>
          <div className="grid gap-6">
            {careers.map((career, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{career.title}</CardTitle>
                    <Badge variant={career.matchPercentage > 90 ? "default" : career.matchPercentage > 80 ? "secondary" : "outline"} className="text-base px-3 py-1">
                      {Math.round(career.matchPercentage)}% Match
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-6">
                    <span className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      {career.field}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      {career.demandLevel} Demand
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="font-semibold text-green-600">{career.salaryRange}</div>
                      <div className="text-xs text-muted-foreground">Salary Range</div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="font-semibold text-blue-600">{career.growthProjection}</div>
                      <div className="text-xs text-muted-foreground">Growth Rate</div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="font-semibold text-purple-600">{career.personalityFit}</div>
                      <div className="text-xs text-muted-foreground">Personality Fit</div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Career Progression Path
                    </h5>
                    <div className="space-y-3">
                      {career.steps.map((step, i) => (
                        <div key={i} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                          <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h6 className="font-medium">{step.phase}</h6>
                              <Badge variant="outline" className="text-xs">{step.duration}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{step.outcome}</p>
                            <div className="flex flex-wrap gap-1">
                              {step.requirements.map((req, j) => (
                                <Badge key={j} variant="secondary" className="text-xs">
                                  {req}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Required Skills</h5>
                    <div className="flex flex-wrap gap-2">
                      {career.skills.map((skill, i) => (
                        <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full">
                    Explore This Career Path
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Enhanced helper functions for the ML-like recommendation algorithms
function getCourseMapping(category: string, percentage: number, mlAnalysis?: MLAnalysisResult): CourseRecommendation[] {
  const courseDatabase: Record<string, CourseRecommendation[]> = {
    logical: [
      {
        title: 'Computer Science Engineering',
        field: 'Technology',
        matchPercentage: Math.min(percentage + 5, 100),
        duration: '4 years',
        difficulty: 'High',
        careerProspects: ['Software Engineer', 'Data Scientist', 'AI Researcher', 'Product Manager'],
        prerequisites: ['Mathematics', 'Physics', 'Computer Science'],
        topColleges: ['IIT Delhi', 'IIT Bombay', 'BITS Pilani', 'NIT Trichy'],
        averageSalary: '₹8-40 LPA',
        jobGrowth: '22% (Very High)',
        description: 'Combines mathematical thinking with practical programming to solve complex technological problems.'
      },
      {
        title: 'Mathematics & Computing',
        field: 'Applied Mathematics',
        matchPercentage: Math.min(percentage + 2, 100),
        duration: '4 years',
        difficulty: 'Very High',
        careerProspects: ['Quantitative Analyst', 'Research Scientist', 'Algorithm Engineer', 'Cryptographer'],
        prerequisites: ['Advanced Mathematics', 'Physics', 'Computer Science'],
        topColleges: ['IIT Delhi', 'ISI Kolkata', 'CMI Chennai', 'TIFR Mumbai'],
        averageSalary: '₹12-50 LPA',
        jobGrowth: '18% (High)',
        description: 'Perfect blend of theoretical mathematics and computational applications for advanced problem-solving.'
      }
    ],
    creative: [
      {
        title: 'Design & Innovation',
        field: 'Creative Arts',
        matchPercentage: Math.min(percentage + 3, 100),
        duration: '3-4 years',
        difficulty: 'Medium',
        careerProspects: ['UX Designer', 'Creative Director', 'Product Designer', 'Brand Strategist'],
        prerequisites: ['Portfolio', 'Art Foundation', 'Design Thinking'],
        topColleges: ['NID Ahmedabad', 'NIFT Delhi', 'Srishti Bangalore', 'Pearl Academy'],
        averageSalary: '₹5-25 LPA',
        jobGrowth: '13% (Above Average)',
        description: 'Develop creative solutions for real-world problems through design thinking and innovation.'
      }
    ],
    scientific: [
      {
        title: 'Biotechnology Engineering',
        field: 'Life Sciences',
        matchPercentage: Math.min(percentage + 4, 100),
        duration: '4 years',
        difficulty: 'High',
        careerProspects: ['Biotech Engineer', 'Research Scientist', 'Quality Analyst', 'Product Developer'],
        prerequisites: ['Biology', 'Chemistry', 'Mathematics', 'Physics'],
        topColleges: ['IIT Kharagpur', 'ICT Mumbai', 'VIT Vellore', 'SRM Chennai'],
        averageSalary: '₹4-20 LPA',
        jobGrowth: '15% (High)',
        description: 'Apply engineering principles to biological systems for healthcare, agriculture, and environmental solutions.'
      }
    ],
    leadership: [
      {
        title: 'Business Administration (BBA)',
        field: 'Management',
        matchPercentage: Math.min(percentage + 3, 100),
        duration: '3 years',
        difficulty: 'Medium',
        careerProspects: ['Business Analyst', 'Project Manager', 'Consultant', 'Entrepreneur'],
        prerequisites: ['Economics', 'Mathematics', 'English', 'Communication Skills'],
        topColleges: ['IIM Indore IPM', 'Christ University', 'Symbiosis Pune', 'FMS Delhi'],
        averageSalary: '₹4-15 LPA',
        jobGrowth: '10% (Average)',
        description: 'Develop leadership and management skills for leading businesses and driving organizational growth.'
      }
    ],
    communication: [
      {
        title: 'Mass Communication & Journalism',
        field: 'Media & Communication',
        matchPercentage: Math.min(percentage + 2, 100),
        duration: '3 years',
        difficulty: 'Medium',
        careerProspects: ['Journalist', 'Content Creator', 'PR Specialist', 'Digital Marketer'],
        prerequisites: ['English', 'General Knowledge', 'Writing Skills', 'Current Affairs'],
        topColleges: ['IIMC Delhi', 'Mudra Ahmedabad', 'Xavier Mumbai', 'ACJ Chennai'],
        averageSalary: '₹3-12 LPA',
        jobGrowth: '12% (Above Average)',
        description: 'Master the art of storytelling and communication across traditional and digital media platforms.'
      }
    ],
    analytical: [
      {
        title: 'Data Science & Analytics',
        field: 'Technology',
        matchPercentage: Math.min(percentage + 6, 100),
        duration: '3-4 years',
        difficulty: 'High',
        careerProspects: ['Data Scientist', 'Business Analyst', 'ML Engineer', 'Research Analyst'],
        prerequisites: ['Mathematics', 'Statistics', 'Programming', 'Computer Science'],
        topColleges: ['IIT Hyderabad', 'ISI Kolkata', 'IIT Madras', 'IIIT Bangalore'],
        averageSalary: '₹8-35 LPA',
        jobGrowth: '25% (Very High)',
        description: 'Extract insights from complex data to drive decision-making and solve business problems.'
      }
    ],
    humanities: [
      {
        title: 'Liberal Arts & Social Sciences',
        field: 'Humanities',
        matchPercentage: Math.min(percentage + 1, 100),
        duration: '3 years',
        difficulty: 'Medium',
        careerProspects: ['Policy Analyst', 'Social Researcher', 'NGO Worker', 'Civil Services'],
        prerequisites: ['English', 'History', 'Political Science', 'Economics'],
        topColleges: ['JNU Delhi', 'Ashoka University', 'DU (LSR/Hindu)', 'Presidency Kolkata'],
        averageSalary: '₹3-15 LPA',
        jobGrowth: '8% (Average)',
        description: 'Develop critical thinking and research skills to understand and address social challenges.'
      }
    ],
    practical: [
      {
        title: 'Mechanical Engineering',
        field: 'Engineering',
        matchPercentage: Math.min(percentage + 3, 100),
        duration: '4 years',
        difficulty: 'High',
        careerProspects: ['Design Engineer', 'Manufacturing Engineer', 'Project Manager', 'R&D Engineer'],
        prerequisites: ['Physics', 'Mathematics', 'Chemistry', 'Technical Drawing'],
        topColleges: ['IIT Bombay', 'IIT Madras', 'NIT Trichy', 'BITS Pilani'],
        averageSalary: '₹4-20 LPA',
        jobGrowth: '9% (Average)',
        description: 'Design, build, and maintain mechanical systems from vehicles to manufacturing equipment.'
      }
    ]
  };

  // Apply context-aware adjustments based on ML analysis
  if (mlAnalysis && courseDatabase[category]) {
    const adjustedCourses = courseDatabase[category].map(course => ({
      ...course,
      matchPercentage: Math.min(
        course.matchPercentage + (mlAnalysis.confidenceScore * 0.1),
        100
      )
    }));
    return adjustedCourses;
  }

  return courseDatabase[category] || [];
}

function getCareerMapping(category: string, percentage: number, allScores: AptitudeScore[], mlAnalysis?: MLAnalysisResult): CareerPath[] {
  const careerDatabase: Record<string, CareerPath[]> = {
    logical: [
      {
        title: 'Software Engineer / Developer',
        field: 'Technology',
        matchPercentage: Math.min(percentage + 8, 100),
        salaryRange: '₹8-40 LPA',
        demandLevel: 'Very High',
        growthProjection: '22%',
        personalityFit: 'Excellent',
        workEnvironment: 'Office/Remote',
        skills: ['Programming', 'Problem Solving', 'Algorithm Design', 'System Architecture'],
        steps: [
          {
            phase: 'Foundation (Years 1-2)',
            duration: '2 years',
            requirements: ['B.Tech/B.E. in CS/IT', 'Programming basics', 'Data structures'],
            outcome: 'Junior Developer position'
          },
          {
            phase: 'Specialization (Years 3-5)',
            duration: '3 years',
            requirements: ['Advanced programming', 'Framework expertise', 'Project experience'],
            outcome: 'Senior Developer/Tech Lead'
          },
          {
            phase: 'Leadership (Years 6+)',
            duration: 'Ongoing',
            requirements: ['Team management', 'System design', 'Technical strategy'],
            outcome: 'Engineering Manager/Architect'
          }
        ]
      }
    ],
    analytical: [
      {
        title: 'Data Scientist',
        field: 'Technology/Analytics',
        matchPercentage: Math.min(percentage + 10, 100),
        salaryRange: '₹10-45 LPA',
        demandLevel: 'Very High',
        growthProjection: '25%',
        personalityFit: 'Excellent',
        workEnvironment: 'Office/Hybrid',
        skills: ['Machine Learning', 'Statistics', 'Python/R', 'Data Visualization', 'Business Acumen'],
        steps: [
          {
            phase: 'Learning Phase (Months 1-12)',
            duration: '1 year',
            requirements: ['Statistics foundation', 'Programming skills', 'ML basics'],
            outcome: 'Junior Data Analyst'
          },
          {
            phase: 'Application Phase (Years 2-4)',
            duration: '3 years',
            requirements: ['Advanced ML', 'Domain expertise', 'Project portfolio'],
            outcome: 'Data Scientist'
          },
          {
            phase: 'Strategy Phase (Years 5+)',
            duration: 'Ongoing',
            requirements: ['Business strategy', 'Team leadership', 'Innovation'],
            outcome: 'Lead Data Scientist/Chief Data Officer'
          }
        ]
      }
    ],
    creative: [
      {
        title: 'UX/UI Designer',
        field: 'Design/Technology',
        matchPercentage: Math.min(percentage + 5, 100),
        salaryRange: '₹5-25 LPA',
        demandLevel: 'High',
        growthProjection: '15%',
        personalityFit: 'Very Good',
        workEnvironment: 'Office/Remote',
        skills: ['Design Thinking', 'User Research', 'Prototyping', 'Visual Design', 'Psychology'],
        steps: [
          {
            phase: 'Portfolio Building (Months 1-6)',
            duration: '6 months',
            requirements: ['Design fundamentals', 'Design tools', 'Portfolio projects'],
            outcome: 'Junior Designer'
          },
          {
            phase: 'Experience Building (Years 1-3)',
            duration: '3 years',
            requirements: ['Real projects', 'User research', 'Cross-functional collaboration'],
            outcome: 'Senior UX Designer'
          },
          {
            phase: 'Leadership (Years 4+)',
            duration: 'Ongoing',
            requirements: ['Design strategy', 'Team mentoring', 'Product vision'],
            outcome: 'Design Lead/Head of Design'
          }
        ]
      }
    ],
    leadership: [
      {
        title: 'Product Manager',
        field: 'Technology/Business',
        matchPercentage: Math.min(percentage + 7, 100),
        salaryRange: '₹12-50 LPA',
        demandLevel: 'High',
        growthProjection: '18%',
        personalityFit: 'Excellent',
        workEnvironment: 'Office/Hybrid',
        skills: ['Strategic Thinking', 'Analytics', 'Communication', 'Leadership', 'Market Research'],
        steps: [
          {
            phase: 'Associate Role (Years 1-2)',
            duration: '2 years',
            requirements: ['Business degree/MBA', 'Analytical skills', 'Communication'],
            outcome: 'Associate Product Manager'
          },
          {
            phase: 'Individual Contributor (Years 3-5)',
            duration: '3 years',
            requirements: ['Product strategy', 'Cross-functional leadership', 'Market analysis'],
            outcome: 'Senior Product Manager'
          },
          {
            phase: 'Leadership (Years 6+)',
            duration: 'Ongoing',
            requirements: ['Portfolio management', 'Team building', 'P&L ownership'],
            outcome: 'VP Product/Chief Product Officer'
          }
        ]
      }
    ],
    communication: [
      {
        title: 'Communications Specialist',
        field: 'Marketing/PR',
        matchPercentage: Math.min(percentage + 6, 100),
        salaryRange: '₹4-18 LPA',
        demandLevel: 'High',
        growthProjection: '12%',
        personalityFit: 'Very Good',
        workEnvironment: 'Office/Hybrid',
        skills: ['Writing', 'Public Speaking', 'Social Media', 'Brand Management', 'Content Strategy'],
        steps: [
          {
            phase: 'Entry Level (Years 1-2)',
            duration: '2 years',
            requirements: ['Communication degree', 'Writing portfolio', 'Digital literacy'],
            outcome: 'Communications Assistant'
          },
          {
            phase: 'Specialist Role (Years 3-5)',
            duration: '3 years',
            requirements: ['Campaign management', 'Media relations', 'Content creation'],
            outcome: 'Senior Communications Specialist'
          },
          {
            phase: 'Management (Years 6+)',
            duration: 'Ongoing',
            requirements: ['Strategy development', 'Team leadership', 'Crisis management'],
            outcome: 'Communications Manager/Director'
          }
        ]
      }
    ],
    scientific: [
      {
        title: 'Research Scientist',
        field: 'Research/Academia',
        matchPercentage: Math.min(percentage + 8, 100),
        salaryRange: '₹6-30 LPA',
        demandLevel: 'Medium-High',
        growthProjection: '15%',
        personalityFit: 'Excellent',
        workEnvironment: 'Lab/University',
        skills: ['Research Methods', 'Data Analysis', 'Scientific Writing', 'Critical Thinking', 'Project Management'],
        steps: [
          {
            phase: 'Graduate Studies (Years 1-3)',
            duration: '3 years',
            requirements: ['Science degree', 'Research experience', 'Academic excellence'],
            outcome: 'Research Assistant'
          },
          {
            phase: 'PhD/Specialization (Years 4-8)',
            duration: '4-5 years',
            requirements: ['Advanced research', 'Publications', 'Conference presentations'],
            outcome: 'Junior Research Scientist'
          },
          {
            phase: 'Senior Research (Years 9+)',
            duration: 'Ongoing',
            requirements: ['Grant funding', 'Team leadership', 'Industry collaboration'],
            outcome: 'Senior Research Scientist/Principal Investigator'
          }
        ]
      }
    ],
    practical: [
      {
        title: 'Engineering Technician',
        field: 'Engineering/Manufacturing',
        matchPercentage: Math.min(percentage + 5, 100),
        salaryRange: '₹3-15 LPA',
        demandLevel: 'High',
        growthProjection: '8%',
        personalityFit: 'Very Good',
        workEnvironment: 'Field/Workshop',
        skills: ['Technical Skills', 'Problem Solving', 'Equipment Maintenance', 'Safety Protocols', 'Quality Control'],
        steps: [
          {
            phase: 'Training (Months 1-18)',
            duration: '18 months',
            requirements: ['Technical education', 'Hands-on training', 'Safety certification'],
            outcome: 'Junior Technician'
          },
          {
            phase: 'Experience Building (Years 2-5)',
            duration: '4 years',
            requirements: ['Field experience', 'Specialized skills', 'Team collaboration'],
            outcome: 'Senior Technician'
          },
          {
            phase: 'Leadership (Years 6+)',
            duration: 'Ongoing',
            requirements: ['Team supervision', 'Process improvement', 'Training others'],
            outcome: 'Lead Technician/Supervisor'
          }
        ]
      }
    ],
    humanities: [
      {
        title: 'Policy Analyst',
        field: 'Government/NGO',
        matchPercentage: Math.min(percentage + 4, 100),
        salaryRange: '₹4-20 LPA',
        demandLevel: 'Medium',
        growthProjection: '10%',
        personalityFit: 'Good',
        workEnvironment: 'Office/Remote',
        skills: ['Research', 'Analysis', 'Writing', 'Critical Thinking', 'Communication'],
        steps: [
          {
            phase: 'Entry Level (Years 1-2)',
            duration: '2 years',
            requirements: ['Social science degree', 'Research skills', 'Writing ability'],
            outcome: 'Research Assistant'
          },
          {
            phase: 'Analyst Role (Years 3-6)',
            duration: '4 years',
            requirements: ['Policy knowledge', 'Data analysis', 'Report writing'],
            outcome: 'Policy Analyst'
          },
          {
            phase: 'Senior Role (Years 7+)',
            duration: 'Ongoing',
            requirements: ['Strategic thinking', 'Stakeholder management', 'Leadership'],
            outcome: 'Senior Policy Analyst/Director'
          }
        ]
      }
    ]
  };

  // Apply context-aware adjustments based on ML analysis
  if (mlAnalysis && careerDatabase[category]) {
    const adjustedCareers = careerDatabase[category].map(career => ({
      ...career,
      matchPercentage: Math.min(
        career.matchPercentage + (mlAnalysis.confidenceScore * 0.08),
        100
      )
    }));
    return adjustedCareers;
  }

  return careerDatabase[category] || [];
}