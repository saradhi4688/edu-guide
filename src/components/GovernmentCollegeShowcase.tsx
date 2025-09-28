import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { 
  Award, 
  Users, 
  TrendingUp, 
  Building2, 
  Star,
  MapPin,
  DollarSign,
  GraduationCap,
  Target,
  CheckCircle,
  BookOpen,
  Trophy,
  Globe,
  Briefcase
} from 'lucide-react';

interface CollegeData {
  name: string;
  location: string;
  establishedYear: number;
  nirfRanking: number;
  totalStudents: number;
  facultyRatio: string;
  placementRate: number;
  averagePackage: string;
  topRecruiters: string[];
  notableAlumni: string[];
  achievements: string[];
  fees: string;
  infrastructure: {
    library: boolean;
    labs: number;
    hostels: boolean;
    sports: boolean;
    wifi: boolean;
  };
  courses: string[];
}

export function GovernmentCollegeShowcase() {
  const [selectedState, setSelectedState] = useState<string>('all');

  const governmentColleges: CollegeData[] = [
    {
      name: "St. Stephen's College, Delhi",
      location: "Delhi",
      establishedYear: 1881,
      nirfRanking: 2,
      totalStudents: 1500,
      facultyRatio: "1:10",
      placementRate: 95,
      averagePackage: "₹8-12 LPA",
      topRecruiters: ["Goldman Sachs", "McKinsey", "Google", "Microsoft", "UPSC"],
      notableAlumni: ["Shashi Tharoor", "Kapil Sibal", "Manmohan Singh"],
      achievements: [
        "Ranked #2 in NIRF College Rankings 2023",
        "100+ years of academic excellence",
        "Alumni in highest government positions"
      ],
      fees: "₹15,000-20,000/year",
      infrastructure: {
        library: true,
        labs: 15,
        hostels: true,
        sports: true,
        wifi: true
      },
      courses: ["BA Economics", "BA English", "BSc Physics", "BSc Chemistry"]
    },
    {
      name: "Presidency University, Kolkata",
      location: "West Bengal",
      establishedYear: 1817,
      nirfRanking: 8,
      totalStudents: 2000,
      facultyRatio: "1:12",
      placementRate: 88,
      averagePackage: "₹6-10 LPA",
      topRecruiters: ["TCS", "Infosys", "Wipro", "Deloitte", "State Government"],
      notableAlumni: ["Satyajit Ray", "Amartya Sen", "Jagadish Chandra Bose"],
      achievements: [
        "First higher education institution in India",
        "Nobel Prize winners among alumni",
        "Rich heritage in science and arts"
      ],
      fees: "₹8,000-12,000/year",
      infrastructure: {
        library: true,
        labs: 20,
        hostels: true,
        sports: true,
        wifi: true
      },
      courses: ["BA History", "BSc Mathematics", "Economics Honors", "Political Science"]
    },
    {
      name: "Government College, Rajasthan",
      location: "Rajasthan",
      establishedYear: 1954,
      nirfRanking: 45,
      totalStudents: 3500,
      facultyRatio: "1:15",
      placementRate: 75,
      averagePackage: "₹4-7 LPA",
      topRecruiters: ["Rajasthan Government", "Banking Sector", "Teaching", "Police Services"],
      notableAlumni: ["Several IAS Officers", "District Collectors", "Bank Managers"],
      achievements: [
        "Highest UPSC success rate in region",
        "Strong government job placement",
        "Affordable quality education"
      ],
      fees: "₹3,000-5,000/year",
      infrastructure: {
        library: true,
        labs: 8,
        hostels: true,
        sports: true,
        wifi: false
      },
      courses: ["BA Arts", "BCom", "BSc", "BEd"]
    },
    {
      name: "Government Medical College, Kerala",
      location: "Kerala",
      establishedYear: 1959,
      nirfRanking: 12,
      totalStudents: 1200,
      facultyRatio: "1:8",
      placementRate: 100,
      averagePackage: "₹8-15 LPA",
      topRecruiters: ["Government Hospitals", "Private Hospitals", "AIIMS", "PGI"],
      notableAlumni: ["Leading Doctors", "Medical Researchers", "Health Officials"],
      achievements: [
        "100% medical license pass rate",
        "Excellent clinical training",
        "Top-tier medical education at low cost"
      ],
      fees: "₹25,000-30,000/year",
      infrastructure: {
        library: true,
        labs: 25,
        hostels: true,
        sports: true,
        wifi: true
      },
      courses: ["MBBS", "BDS", "BSc Nursing", "Physiotherapy"]
    }
  ];

  const states = ['all', 'Delhi', 'West Bengal', 'Rajasthan', 'Kerala'];

  const filteredColleges = selectedState === 'all' 
    ? governmentColleges 
    : governmentColleges.filter(college => college.location === selectedState);

  const getSuccessColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 75) return 'text-yellow-600';
    return 'text-blue-600';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Trophy className="h-8 w-8 text-primary" />
          <h1 className="text-3xl">Government College Excellence</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Discover how government colleges across India are producing successful graduates, 
          offering world-class education at affordable costs, and building the nation's future leaders.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Award className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">70%</p>
                <p className="text-sm text-muted-foreground">Top colleges are government</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">₹10K</p>
                <p className="text-sm text-muted-foreground">Average annual fees</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">85%</p>
                <p className="text-sm text-muted-foreground">Average placement rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">50L+</p>
                <p className="text-sm text-muted-foreground">Students enrolled</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="showcase" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="showcase" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            College Showcase
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Vs Private Colleges
          </TabsTrigger>
          <TabsTrigger value="success" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Success Metrics
          </TabsTrigger>
        </TabsList>

        {/* College Showcase Tab */}
        <TabsContent value="showcase" className="space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <label className="text-sm font-medium">Filter by State:</label>
            <div className="flex gap-2">
              {states.map(state => (
                <Button
                  key={state}
                  variant={selectedState === state ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedState(state)}
                >
                  {state === 'all' ? 'All States' : state}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {filteredColleges.map((college, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{college.name}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {college.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4" />
                          NIRF #{college.nirfRanking}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      Est. {college.establishedYear}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Students</div>
                      <div className="font-medium">{college.totalStudents.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Faculty Ratio</div>
                      <div className="font-medium">{college.facultyRatio}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Placement Rate</div>
                      <div className={`font-medium ${getSuccessColor(college.placementRate)}`}>
                        {college.placementRate}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Average Package</div>
                      <div className="font-medium text-green-600">{college.averagePackage}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Annual Fees</div>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      {college.fees}
                    </Badge>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Infrastructure</div>
                    <div className="flex flex-wrap gap-1">
                      {college.infrastructure.library && (
                        <Badge variant="outline" className="text-xs">
                          <BookOpen className="h-3 w-3 mr-1" />
                          Library
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        Labs ({college.infrastructure.labs})
                      </Badge>
                      {college.infrastructure.hostels && (
                        <Badge variant="outline" className="text-xs">Hostels</Badge>
                      )}
                      {college.infrastructure.sports && (
                        <Badge variant="outline" className="text-xs">Sports</Badge>
                      )}
                      {college.infrastructure.wifi && (
                        <Badge variant="outline" className="text-xs">
                          <Globe className="h-3 w-3 mr-1" />
                          WiFi
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Top Recruiters</div>
                    <div className="flex flex-wrap gap-1">
                      {college.topRecruiters.slice(0, 3).map(recruiter => (
                        <Badge key={recruiter} variant="secondary" className="text-xs">
                          {recruiter}
                        </Badge>
                      ))}
                      {college.topRecruiters.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{college.topRecruiters.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Key Achievements</div>
                    <div className="space-y-1">
                      {college.achievements.slice(0, 2).map((achievement, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {achievement}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl mb-2">Government vs Private Colleges</h2>
            <p className="text-muted-foreground">
              Compare key metrics and see why government colleges are excellent choices
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Trophy className="h-5 w-5" />
                  Government Colleges
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Average Annual Fees</span>
                    <Badge variant="outline" className="text-green-600">₹5,000-30,000</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Faculty Quality</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <Star className="h-4 w-4 text-yellow-500" />
                      <Star className="h-4 w-4 text-yellow-500" />
                      <Star className="h-4 w-4 text-yellow-500" />
                      <Star className="h-4 w-4 text-yellow-500" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Research Opportunities</span>
                    <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Government Job Prep</span>
                    <Badge className="bg-green-100 text-green-800">Superior</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Alumni Network</span>
                    <Badge className="bg-green-100 text-green-800">Strong</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Return on Investment</span>
                    <Badge className="bg-green-100 text-green-800">Very High</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Building2 className="h-5 w-5" />
                  Private Colleges
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Average Annual Fees</span>
                    <Badge variant="outline" className="text-red-600">₹1,00,000-5,00,000</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Faculty Quality</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <Star className="h-4 w-4 text-yellow-500" />
                      <Star className="h-4 w-4 text-yellow-500" />
                      <Star className="h-4 w-4 text-gray-300" />
                      <Star className="h-4 w-4 text-gray-300" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Research Opportunities</span>
                    <Badge variant="secondary">Moderate</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Government Job Prep</span>
                    <Badge variant="secondary">Average</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Alumni Network</span>
                    <Badge variant="secondary">Variable</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Return on Investment</span>
                    <Badge variant="secondary">Moderate</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Key Advantages of Government Colleges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <h4 className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    Financial Benefits
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• 10-20x lower fees than private colleges</li>
                    <li>• Scholarships for deserving students</li>
                    <li>• No hidden costs or sudden fee hikes</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-blue-600" />
                    Academic Excellence
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Highly qualified permanent faculty</li>
                    <li>• Established curriculum and standards</li>
                    <li>• Strong research culture</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-purple-600" />
                    Career Advantages
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Better preparation for government jobs</li>
                    <li>• Strong alumni networks in administration</li>
                    <li>• Equal opportunities regardless of background</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Success Metrics Tab */}
        <TabsContent value="success" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl mb-2">Success by the Numbers</h2>
            <p className="text-muted-foreground">
              Data-driven proof of government college excellence across India
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  UPSC Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600">65%</div>
                    <p className="text-sm text-muted-foreground">
                      IAS officers have government college background
                    </p>
                  </div>
                  <Progress value={65} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    Higher than private college graduates (35%)
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Banking Sector Leadership
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">80%</div>
                    <p className="text-sm text-muted-foreground">
                      Bank managers from government colleges
                    </p>
                  </div>
                  <Progress value={80} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    Strong foundation in commerce and economics
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-green-600" />
                  Research Publications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">70%</div>
                    <p className="text-sm text-muted-foreground">
                      Research papers from government institutions
                    </p>
                  </div>
                  <Progress value={70} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    Leading in scientific research and innovation
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Employment Outcomes by Stream</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span>Arts Graduates - Government Services</span>
                    <span className="text-sm font-medium">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span>Commerce Graduates - Banking & Finance</span>
                    <span className="text-sm font-medium">90%</span>
                  </div>
                  <Progress value={90} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span>Science Graduates - Technical Roles</span>
                    <span className="text-sm font-medium">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Regional Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h4>North India</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Delhi University Colleges</span>
                      <Badge variant="outline">15+ in top 50</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>IAS Success Rate</span>
                      <Badge variant="outline">40% from DU</Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4>South India</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Government Medical Colleges</span>
                      <Badge variant="outline">95% pass rate</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Engineering Placements</span>
                      <Badge variant="outline">85% success</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}