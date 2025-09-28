import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { 
  BookOpen, 
  TrendingUp, 
  Users, 
  Award, 
  MapPin, 
  DollarSign, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Target,
  GraduationCap,
  Briefcase,
  Building2,
  Star,
  ArrowRight,
  Info,
  HelpCircle,
  Trophy,
  ExternalLink
} from 'lucide-react';

interface StreamPathway {
  stream: string;
  description: string;
  subjects: string[];
  careerOptions: string[];
  governmentJobs: string[];
  averageSalary: string;
  topColleges: string[];
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  jobMarket: 'High' | 'Medium' | 'Low';
}

interface Misconception {
  myth: string;
  reality: string;
  evidence: string;
  category: string;
}

interface SuccessStory {
  name: string;
  stream: string;
  college: string;
  currentRole: string;
  salary: string;
  journey: string;
  advice: string;
}

export function EducationalAwarenessCenter() {
  const [selectedStream, setSelectedStream] = useState<string>('');
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());

  const streamPathways: StreamPathway[] = [
    {
      stream: 'Science',
      description: 'Opens doors to technical, medical, and research careers with high growth potential.',
      subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science'],
      careerOptions: ['Doctor', 'Engineer', 'Research Scientist', 'Data Scientist', 'Pharmacist', 'Lab Technician'],
      governmentJobs: ['ISRO Scientist', 'Medical Officer', 'Forest Officer', 'Railway Engineer', 'Bank IT Officer'],
      averageSalary: '₹4-12 LPA',
      topColleges: ['IIT Delhi', 'AIIMS', 'Jadavpur University', 'Delhi University', 'BHU'],
      duration: '3-6 years',
      difficulty: 'Hard',
      jobMarket: 'High'
    },
    {
      stream: 'Commerce',
      description: 'Perfect for business, finance, and entrepreneurship with stable career prospects.',
      subjects: ['Accountancy', 'Economics', 'Business Studies', 'Mathematics', 'Computer Applications'],
      careerOptions: ['Chartered Accountant', 'Business Analyst', 'Financial Advisor', 'Marketing Manager', 'Company Secretary'],
      governmentJobs: ['Bank Manager', 'Income Tax Officer', 'Auditor', 'Economic Service Officer', 'Custom Officer'],
      averageSalary: '₹3-8 LPA',
      topColleges: ['SRCC Delhi', 'LSR Delhi', 'Christ University', 'St. Xaviers Mumbai', 'Presidency Kolkata'],
      duration: '3-5 years',
      difficulty: 'Medium',
      jobMarket: 'High'
    },
    {
      stream: 'Arts/Humanities',
      description: 'Develops critical thinking and communication skills essential in modern economy.',
      subjects: ['History', 'Political Science', 'Psychology', 'Sociology', 'Literature', 'Geography'],
      careerOptions: ['Civil Services Officer', 'Journalist', 'Teacher', 'Social Worker', 'Content Writer', 'HR Manager'],
      governmentJobs: ['IAS/IPS Officer', 'Teacher', 'Diplomat', 'Museum Curator', 'Archaeological Survey Officer'],
      averageSalary: '₹2.5-15 LPA',
      topColleges: ['JNU Delhi', 'Presidency Kolkata', 'Loyola Chennai', 'Ferguson Pune', 'Miranda House Delhi'],
      duration: '3-4 years',
      difficulty: 'Medium',
      jobMarket: 'Medium'
    }
  ];

  const misconceptions: Misconception[] = [
    {
      myth: "Arts students don't get good jobs",
      reality: "Arts graduates often become top civil servants, journalists, and business leaders",
      evidence: "65% of IAS officers have Arts background. Average IAS salary: ₹56,000-2,50,000/month",
      category: "Career Prospects"
    },
    {
      myth: "Government college education is inferior",
      reality: "Many government colleges rank higher than private ones with better faculty and infrastructure",
      evidence: "7 out of top 10 colleges in NIRF rankings are government institutions",
      category: "College Quality"
    },
    {
      myth: "Commerce is only for family business",
      reality: "Commerce opens doors to banking, finance, consulting, and entrepreneurship",
      evidence: "85% of bank managers and 70% of CAs come from commerce background",
      category: "Stream Value"
    },
    {
      myth: "Science guarantees high-paying jobs",
      reality: "Job success depends on skills, specialization, and market demand, not just stream",
      evidence: "40% of science graduates need additional skills training for employment",
      category: "Job Security"
    },
    {
      myth: "Graduation is waste of time compared to skill courses",
      reality: "Graduation provides foundation knowledge and is mandatory for most government jobs",
      evidence: "90% of government job eligibility requires graduation as minimum qualification",
      category: "Education Value"
    }
  ];

  const successStories: SuccessStory[] = [
    {
      name: "Priya Sharma",
      stream: "Arts (History)",
      college: "Government College, Rajasthan",
      currentRole: "District Collector",
      salary: "₹1,20,000/month",
      journey: "Completed BA History from local government college, cleared UPSC in 2nd attempt",
      advice: "Focus on understanding concepts, not just memorizing. Government colleges provide excellent foundation."
    },
    {
      name: "Rahul Kumar",
      stream: "Commerce",
      college: "Government Commerce College, Bihar",
      currentRole: "Senior Bank Manager",
      salary: "₹85,000/month",
      journey: "BCom from government college, cleared banking exams, promoted to senior positions",
      advice: "Commerce opens many doors. Don't underestimate the power of government college education."
    },
    {
      name: "Anjali Singh",
      stream: "Science (Biology)",
      college: "Government Medical College",
      currentRole: "Medical Officer",
      salary: "₹1,50,000/month",
      journey: "Studied in government college, cleared NEET, now serving rural communities",
      advice: "Government medical colleges provide excellent clinical exposure and practical training."
    }
  ];

  const markModuleComplete = (moduleId: string) => {
    setCompletedModules(prev => new Set([...prev, moduleId]));
  };

  const getCompletionPercentage = () => {
    const totalModules = 4; // Pathways, Misconceptions, Success Stories, Action Plan
    return (completedModules.size / totalModules) * 100;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Lightbulb className="h-8 w-8 text-primary" />
          <h1 className="text-3xl">Educational Awareness Center</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Clear the confusion, bust the myths, and make informed decisions about your future. 
          Discover the real opportunities waiting for you after graduation.
        </p>
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <Progress value={getCompletionPercentage()} className="w-32" />
            <span className="text-sm">{Math.round(getCompletionPercentage())}% Complete</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="pathways" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pathways" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Stream Pathways
          </TabsTrigger>
          <TabsTrigger value="myths" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Myth Busters
          </TabsTrigger>
          <TabsTrigger value="stories" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Success Stories
          </TabsTrigger>
          <TabsTrigger value="action" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Action Plan
          </TabsTrigger>
        </TabsList>

        {/* Stream Pathways Tab */}
        <TabsContent value="pathways" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl mb-2">Choose Your Stream Wisely</h2>
            <p className="text-muted-foreground">
              Explore what each stream really offers - from subjects to careers to government job opportunities
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {streamPathways.map((pathway, index) => (
              <Card key={pathway.stream} className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      {pathway.stream}
                    </CardTitle>
                    <Badge variant={pathway.jobMarket === 'High' ? 'default' : 'secondary'}>
                      {pathway.jobMarket} Demand
                    </Badge>
                  </div>
                  <CardDescription>{pathway.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-4 w-4" />
                      Key Subjects
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {pathway.subjects.slice(0, 3).map(subject => (
                        <Badge key={subject} variant="outline" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                      {pathway.subjects.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{pathway.subjects.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="flex items-center gap-2 mb-2">
                      <Briefcase className="h-4 w-4" />
                      Career Options
                    </h4>
                    <div className="space-y-1 text-sm">
                      {pathway.careerOptions.slice(0, 3).map(career => (
                        <div key={career}>• {career}</div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="flex items-center gap-2 mb-2">
                      <Building2 className="h-4 w-4" />
                      Government Jobs
                    </h4>
                    <div className="space-y-1 text-sm">
                      {pathway.governmentJobs.slice(0, 2).map(job => (
                        <div key={job}>• {job}</div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        Salary Range
                      </div>
                      <div className="font-medium">{pathway.averageSalary}</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Duration
                      </div>
                      <div className="font-medium">{pathway.duration}</div>
                    </div>
                  </div>

                  <Button 
                    className="w-full"
                    onClick={() => {
                      setSelectedStream(pathway.stream);
                      markModuleComplete('pathways');
                    }}
                  >
                    Explore {pathway.stream} Path
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedStream && (
            <Card>
              <CardHeader>
                <CardTitle>Detailed Path: {selectedStream}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2">Top Government Colleges</h4>
                    <div className="space-y-1">
                      {streamPathways.find(p => p.stream === selectedStream)?.topColleges.map(college => (
                        <div key={college} className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-primary" />
                          {college}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-2">Next Steps</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Research nearby government colleges
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Check admission requirements
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Talk to current students/alumni
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Myth Busters Tab */}
        <TabsContent value="myths" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl mb-2">Let's Bust Some Myths</h2>
            <p className="text-muted-foreground">
              Separating facts from fiction about education and career paths
            </p>
          </div>

          <div className="space-y-4">
            {misconceptions.map((misconception, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-destructive mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="text-destructive mb-1">Myth: "{misconception.myth}"</h4>
                        <Badge variant="destructive" className="text-xs">
                          {misconception.category}
                        </Badge>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="text-green-700 dark:text-green-400 mb-2">
                          Reality: {misconception.reality}
                        </h4>
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Evidence:</strong> {misconception.evidence}
                          </AlertDescription>
                        </Alert>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button onClick={() => markModuleComplete('myths')}>
              I've Learned the Facts
              <CheckCircle className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </TabsContent>

        {/* Success Stories Tab */}
        <TabsContent value="stories" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl mb-2">Real Success Stories</h2>
            <p className="text-muted-foreground">
              Meet graduates who built successful careers from government colleges
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {successStories.map((story, index) => (
              <Card key={index} className="relative">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Star className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{story.name}</CardTitle>
                      <CardDescription>{story.currentRole}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Stream:</span>
                      <Badge variant="outline">{story.stream}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">College:</span>
                      <span className="text-sm text-right">{story.college}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Salary:</span>
                      <span className="text-sm font-medium text-green-600">{story.salary}</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="mb-1">Journey</h4>
                    <p className="text-sm text-muted-foreground">{story.journey}</p>
                  </div>
                  
                  <div>
                    <h4 className="mb-1">Advice</h4>
                    <p className="text-sm italic">"{story.advice}"</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button onClick={() => markModuleComplete('stories')}>
              Stories Inspire Me
              <Star className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </TabsContent>

        {/* Action Plan Tab */}
        <TabsContent value="action" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl mb-2">Your Action Plan</h2>
            <p className="text-muted-foreground">
              Concrete steps to make informed decisions about your education and career
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Immediate Actions (This Week)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">1</div>
                  <span>Take our aptitude quiz to understand your strengths</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">2</div>
                  <span>List 3 nearby government colleges in your area</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">3</div>
                  <span>Research admission requirements and dates</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">4</div>
                  <span>Talk to family about your interests and goals</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Short-term Goals (This Month)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs">1</div>
                  <span>Visit or call government colleges for information</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs">2</div>
                  <span>Connect with current students or alumni</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs">3</div>
                  <span>Explore government job opportunities in your preferred field</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs">4</div>
                  <span>Prepare for entrance exams if required</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Resources for Your Journey
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center p-4 border rounded-lg">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h4 className="mb-1">Course Information</h4>
                  <p className="text-sm text-muted-foreground">Use our Streams section to explore subjects and careers</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Building2 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h4 className="mb-1">College Finder</h4>
                  <p className="text-sm text-muted-foreground">Find nearby government colleges with our location tool</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h4 className="mb-1">Career Guidance</h4>
                  <p className="text-sm text-muted-foreground">Get personalized recommendations based on your profile</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Trophy className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h4 className="mb-1">College Excellence</h4>
                  <p className="text-sm text-muted-foreground">See how government colleges excel nationwide</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center space-y-4">
            <Button 
              size="lg"
              onClick={() => markModuleComplete('action')}
            >
              I'm Ready to Take Action!
              <CheckCircle className="h-5 w-5 ml-2" />
            </Button>
            
            <div className="flex justify-center gap-4">
              <Button variant="outline" asChild>
                <a href="/awareness-quiz">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Test Your Knowledge
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/colleges">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Find Colleges Now
                </a>
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Progress Summary */}
      {completedModules.size > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="mb-2">Great Progress! 🎉</h3>
              <p className="text-muted-foreground mb-4">
                You've completed {completedModules.size} out of 4 modules. 
                {completedModules.size === 4 ? " You're now equipped with the knowledge to make informed decisions!" : " Keep going to unlock all insights!"}
              </p>
              <div className="flex justify-center gap-2">
                {Array.from(completedModules).map(module => (
                  <Badge key={module} variant="default">
                    ✓ {module.charAt(0).toUpperCase() + module.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}