import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  TrendingUp, 
  GraduationCap, 
  Users, 
  MapPin, 
  Clock, 
  DollarSign,
  Star,
  CheckCircle,
  ArrowRight,
  BookOpen,
  Target,
  Lightbulb
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface CareerPathDetails {
  title: string;
  field: string;
  description: string;
  salaryRange: string;
  demandLevel: string;
  growthProjection: string;
  workEnvironment: string;
  personalityFit: string;
  matchPercentage: number;
  
  progression: {
    level: string;
    title: string;
    duration: string;
    salary: string;
    responsibilities: string[];
    skills: string[];
  }[];
  
  education: {
    degree: string;
    duration: string;
    subjects: string[];
    topColleges: string[];
    averageFees: string;
  };
  
  skills: {
    technical: string[];
    soft: string[];
    emerging: string[];
  };
  
  dailyTasks: string[];
  challenges: string[];
  rewards: string[];
  
  industryInsights: {
    topCompanies: string[];
    locations: string[];
    trends: string[];
  };
}

interface DetailedCareerPathProps {
  careerType?: string;
}

export function DetailedCareerPath({ careerType = 'software-engineer' }: DetailedCareerPathProps) {
  const [careerData, setCareerData] = useState<CareerPathDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchCareerPathDetails();
  }, [careerType]);

  const fetchCareerPathDetails = async () => {
    try {
      setLoading(true);
      // Mock data for demo - in real app this would come from API
      const mockCareerData: CareerPathDetails = {
        title: 'Software Engineer / Developer',
        field: 'Technology',
        description: 'Software engineers design, develop, test, and maintain software applications and systems. They work with various programming languages and technologies to create solutions that meet user needs and business requirements.',
        salaryRange: '₹8-40 LPA',
        demandLevel: 'Very High',
        growthProjection: '22%',
        workEnvironment: 'Office/Remote/Hybrid',
        personalityFit: 'Excellent for analytical and logical thinkers',
        matchPercentage: 92,
        
        progression: [
          {
            level: 'Entry Level',
            title: 'Junior Software Engineer',
            duration: '0-2 years',
            salary: '₹3-8 LPA',
            responsibilities: [
              'Write clean, maintainable code',
              'Debug and fix software issues',
              'Participate in code reviews',
              'Learn company tech stack'
            ],
            skills: ['Basic programming', 'Version control', 'Debugging', 'Testing']
          },
          {
            level: 'Mid Level',
            title: 'Software Engineer',
            duration: '2-5 years',
            salary: '₹8-18 LPA',
            responsibilities: [
              'Design software architecture',
              'Lead small projects',
              'Mentor junior developers',
              'Optimize application performance'
            ],
            skills: ['Advanced programming', 'System design', 'Leadership', 'Project management']
          },
          {
            level: 'Senior Level',
            title: 'Senior Software Engineer',
            duration: '5-8 years',
            salary: '₹18-30 LPA',
            responsibilities: [
              'Architect complex systems',
              'Make technical decisions',
              'Cross-team collaboration',
              'Drive technical initiatives'
            ],
            skills: ['System architecture', 'Technical leadership', 'Strategic thinking', 'Innovation']
          },
          {
            level: 'Leadership',
            title: 'Tech Lead / Engineering Manager',
            duration: '8+ years',
            salary: '₹30-50+ LPA',
            responsibilities: [
              'Lead engineering teams',
              'Set technical strategy',
              'Stakeholder management',
              'Hire and develop talent'
            ],
            skills: ['Team management', 'Strategic planning', 'Communication', 'Business acumen']
          }
        ],
        
        education: {
          degree: 'B.Tech/B.E. in Computer Science or related field',
          duration: '4 years',
          subjects: [
            'Data Structures & Algorithms',
            'Computer Networks',
            'Database Management Systems',
            'Software Engineering',
            'Operating Systems',
            'Web Technologies'
          ],
          topColleges: [
            'IIT Delhi, Bombay, Madras',
            'BITS Pilani',
            'NIT Trichy, Warangal',
            'IIIT Hyderabad, Bangalore',
            'VIT Vellore',
            'SRM Chennai'
          ],
          averageFees: '₹2-20 LPA (varies by college type)'
        },
        
        skills: {
          technical: [
            'Programming Languages (Python, Java, JavaScript)',
            'Web Development (React, Node.js)',
            'Database Management (SQL, MongoDB)',
            'Cloud Platforms (AWS, Azure)',
            'Version Control (Git)',
            'Software Testing'
          ],
          soft: [
            'Problem Solving',
            'Communication',
            'Teamwork',
            'Time Management',
            'Adaptability',
            'Continuous Learning'
          ],
          emerging: [
            'Machine Learning/AI',
            'DevOps & CI/CD',
            'Microservices Architecture',
            'Blockchain Technology',
            'Mobile Development',
            'Cybersecurity'
          ]
        },
        
        dailyTasks: [
          'Writing and reviewing code',
          'Debugging and fixing issues',
          'Attending team meetings',
          'Collaborating with designers and product managers',
          'Testing software functionality',
          'Learning new technologies'
        ],
        
        challenges: [
          'Keeping up with rapidly changing technology',
          'Debugging complex issues',
          'Meeting project deadlines',
          'Balancing feature requests with technical debt',
          'Working in agile environments'
        ],
        
        rewards: [
          'High demand and job security',
          'Competitive salaries',
          'Flexible work arrangements',
          'Continuous learning opportunities',
          'Impact on millions of users',
          'Global career opportunities'
        ],
        
        industryInsights: {
          topCompanies: [
            'Google, Microsoft, Amazon',
            'Flipkart, Zomato, Paytm',
            'TCS, Infosys, Wipro',
            'Startups and unicorns',
            'Product companies',
            'Consulting firms'
          ],
          locations: [
            'Bangalore (Silicon Valley of India)',
            'Hyderabad (Cyberabad)',
            'Pune (IT hub)',
            'Chennai (Detroit of India)',
            'Mumbai (Financial capital)',
            'Delhi NCR (Corporate hub)'
          ],
          trends: [
            'AI/ML integration in all applications',
            'Remote and hybrid work models',
            'Cloud-first development',
            'Low-code/no-code platforms',
            'Focus on user experience',
            'Sustainable and green technology'
          ]
        }
      };
      
      setCareerData(mockCareerData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load career path details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="h-96 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!careerData) {
    return (
      <div className="p-6 max-w-6xl mx-auto text-center">
        <p className="text-muted-foreground">Failed to load career path details</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl mb-2">{careerData.title}</CardTitle>
              <CardDescription className="text-lg">
                {careerData.field} • {careerData.personalityFit}
              </CardDescription>
            </div>
            <div className="text-right">
              <Badge variant="default" className="text-lg px-4 py-2 mb-2">
                {careerData.matchPercentage}% Match
              </Badge>
              <div className="text-sm text-muted-foreground">
                Based on your aptitude
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
              <DollarSign className="h-5 w-5 mx-auto mb-1 text-green-600" />
              <div className="font-semibold">{careerData.salaryRange}</div>
              <div className="text-xs text-muted-foreground">Salary Range</div>
            </div>
            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
              <TrendingUp className="h-5 w-5 mx-auto mb-1 text-blue-600" />
              <div className="font-semibold">{careerData.growthProjection}</div>
              <div className="text-xs text-muted-foreground">Job Growth</div>
            </div>
            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
              <Users className="h-5 w-5 mx-auto mb-1 text-purple-600" />
              <div className="font-semibold">{careerData.demandLevel}</div>
              <div className="text-xs text-muted-foreground">Demand Level</div>
            </div>
            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
              <MapPin className="h-5 w-5 mx-auto mb-1 text-orange-600" />
              <div className="font-semibold">{careerData.workEnvironment}</div>
              <div className="text-xs text-muted-foreground">Work Style</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progression">Career Path</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="insights">Industry</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Career Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground leading-relaxed">
                {careerData.description}
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Daily Tasks
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {careerData.dailyTasks.map((task, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4 text-orange-600" />
                    Challenges
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {careerData.challenges.map((challenge, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                        {challenge}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-600" />
                    Rewards
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {careerData.rewards.map((reward, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        {reward}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progression" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Career Progression Path</CardTitle>
              <CardDescription>
                Typical career journey from entry-level to leadership positions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {careerData.progression.map((stage, index) => (
                  <div key={index} className="relative">
                    {index < careerData.progression.length - 1 && (
                      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-border"></div>
                    )}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-lg">{stage.title}</h4>
                          <Badge variant="outline">{stage.duration}</Badge>
                          <Badge variant="secondary">{stage.salary}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{stage.level}</p>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium mb-2">Key Responsibilities</h5>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {stage.responsibilities.map((resp, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <ArrowRight className="h-3 w-3 mt-1 flex-shrink-0" />
                                  {resp}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-medium mb-2">Required Skills</h5>
                            <div className="flex flex-wrap gap-1">
                              {stage.skills.map((skill, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Educational Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Degree & Duration</h4>
                  <p className="text-muted-foreground mb-1">{careerData.education.degree}</p>
                  <p className="text-sm text-muted-foreground">Duration: {careerData.education.duration}</p>
                  <p className="text-sm text-muted-foreground">Average Fees: {careerData.education.averageFees}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Core Subjects</h4>
                  <div className="flex flex-wrap gap-2">
                    {careerData.education.subjects.map((subject, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Top Colleges & Universities</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {careerData.education.topColleges.map((college, index) => (
                    <div key={index} className="p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{college}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Technical Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {careerData.skills.technical.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">{skill}</span>
                      <Badge variant="outline">Core</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Soft Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {careerData.skills.soft.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">{skill}</span>
                      <Badge variant="secondary">Essential</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Emerging Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {careerData.skills.emerging.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">{skill}</span>
                      <Badge>Future</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Industry Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Top Hiring Companies</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {careerData.industryInsights.topCompanies.map((company, index) => (
                      <div key={index} className="p-3 border rounded-lg text-center text-sm">
                        {company}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Key Locations</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {careerData.industryInsights.locations.map((location, index) => (
                      <div key={index} className="p-3 border rounded-lg text-center text-sm">
                        {location}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Industry Trends</h4>
                  <div className="space-y-3">
                    {careerData.industryInsights.trends.map((trend, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                        <TrendingUp className="h-4 w-4 mt-1 text-blue-600 flex-shrink-0" />
                        <span className="text-sm">{trend}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button className="flex-1">
          Find Relevant Courses
        </Button>
        <Button variant="outline" className="flex-1">
          Connect with Professionals
        </Button>
        <Button variant="secondary" className="flex-1">
          Save Career Path
        </Button>
      </div>
    </div>
  );
}