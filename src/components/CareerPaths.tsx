import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { DetailedCareerPath } from './DetailedCareerPath';
import { 
  TrendingUp, 
  Search, 
  Users, 
  IndianRupee, 
  Clock, 
  BookOpen,
  Award,
  Building,
  ArrowRight,
  ExternalLink,
  Brain,
  Target,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

const careerPaths = [
  {
    id: 'software-engineer',
    title: 'Software Engineer/Developer',
    field: 'Technology',
    salary: '₹4-25 LPA',
    demand: 'Very High',
    growth: '+15% annually',
    education: {
      degree: 'B.Tech/B.E. Computer Science, BCA, MCA',
      duration: '3-4 years',
      skills: ['Programming', 'Problem Solving', 'System Design']
    },
    path: [
      { stage: 'Education', items: ['10+2 (PCM)', 'Engineering Entrance (JEE)', 'B.Tech Computer Science'] },
      { stage: 'Skills', items: ['Programming Languages', 'Data Structures', 'Web Development', 'Database Management'] },
      { stage: 'Experience', items: ['Internships', 'Projects', 'Open Source Contributions'] },
      { stage: 'Career', items: ['Junior Developer', 'Senior Developer', 'Tech Lead', 'Engineering Manager'] }
    ],
    exams: ['JEE Main', 'JEE Advanced', 'BITSAT', 'VITEEE'],
    companies: ['Google', 'Microsoft', 'Amazon', 'Flipkart', 'TCS', 'Infosys'],
    resources: [
      { title: 'Coding Bootcamps', type: 'Course', url: '#' },
      { title: 'GitHub Projects', type: 'Practice', url: '#' },
      { title: 'LeetCode', type: 'Practice', url: '#' },
      { title: 'Stack Overflow', type: 'Community', url: '#' }
    ]
  },
  {
    id: 'doctor',
    title: 'Medical Doctor',
    field: 'Healthcare',
    salary: '₹6-30 LPA',
    demand: 'High',
    growth: '+7% annually',
    education: {
      degree: 'MBBS, MD/MS (Specialization)',
      duration: '5.5-8 years',
      skills: ['Medical Knowledge', 'Patient Care', 'Decision Making']
    },
    path: [
      { stage: 'Education', items: ['10+2 (PCB)', 'NEET Qualification', 'MBBS (5.5 years)'] },
      { stage: 'Specialization', items: ['Internship', 'NEET PG', 'MD/MS (3 years)'] },
      { stage: 'Practice', items: ['Residency', 'Fellowship (Optional)', 'Independent Practice'] },
      { stage: 'Career', items: ['Junior Doctor', 'Senior Consultant', 'Department Head', 'Hospital Director'] }
    ],
    exams: ['NEET UG', 'NEET PG', 'AIIMS', 'JIPMER'],
    companies: ['AIIMS', 'Apollo Hospitals', 'Fortis', 'Max Healthcare', 'Government Hospitals'],
    resources: [
      { title: 'Medical Council of India', type: 'Authority', url: '#' },
      { title: 'Medical Journals', type: 'Research', url: '#' },
      { title: 'Clinical Rotations', type: 'Experience', url: '#' },
      { title: 'Medical Conferences', type: 'Networking', url: '#' }
    ]
  },
  {
    id: 'chartered-accountant',
    title: 'Chartered Accountant (CA)',
    field: 'Finance',
    salary: '₹5-20 LPA',
    demand: 'High',
    growth: '+6% annually',
    education: {
      degree: 'CA Foundation, Intermediate, Final',
      duration: '4-5 years',
      skills: ['Accounting', 'Taxation', 'Auditing', 'Financial Analysis']
    },
    path: [
      { stage: 'Education', items: ['10+2 (Any Stream)', 'CA Foundation', 'CA Intermediate'] },
      { stage: 'Training', items: ['Articleship (3 years)', 'CA Final', 'Membership'] },
      { stage: 'Specialization', items: ['Taxation', 'Auditing', 'Corporate Finance', 'Consulting'] },
      { stage: 'Career', items: ['Junior CA', 'Senior CA', 'Partner', 'CFO'] }
    ],
    exams: ['CA Foundation', 'CA Intermediate', 'CA Final'],
    companies: ['Big 4 (Deloitte, PwC, EY, KPMG)', 'Corporate Houses', 'Government', 'Own Practice'],
    resources: [
      { title: 'ICAI Study Materials', type: 'Course', url: '#' },
      { title: 'Taxation Updates', type: 'News', url: '#' },
      { title: 'Audit Practices', type: 'Practice', url: '#' },
      { title: 'CA Community', type: 'Community', url: '#' }
    ]
  },
  {
    id: 'civil-servant',
    title: 'Civil Services (IAS/IPS)',
    field: 'Government',
    salary: '₹8-25 LPA',
    demand: 'Medium',
    growth: 'Stable',
    education: {
      degree: 'Graduate in any discipline',
      duration: '3-4 years + Preparation',
      skills: ['Leadership', 'Policy Making', 'Public Administration']
    },
    path: [
      { stage: 'Education', items: ['10+2 (Any Stream)', 'Graduation (Any Subject)', 'UPSC Preparation'] },
      { stage: 'Selection', items: ['UPSC Prelims', 'UPSC Mains', 'Interview'] },
      { stage: 'Training', items: ['Foundation Course', 'Professional Training', 'District Training'] },
      { stage: 'Career', items: ['Assistant Collector', 'Collector', 'Secretary', 'Chief Secretary'] }
    ],
    exams: ['UPSC CSE', 'State PSC', 'SSC CGL'],
    companies: ['Central Government', 'State Governments', 'Public Sector'],
    resources: [
      { title: 'NCERT Books', type: 'Study Material', url: '#' },
      { title: 'Current Affairs', type: 'News', url: '#' },
      { title: 'Mock Tests', type: 'Practice', url: '#' },
      { title: 'UPSC Community', type: 'Community', url: '#' }
    ]
  },
  {
    id: 'teacher',
    title: 'Teacher/Professor',
    field: 'Education',
    salary: '₹3-15 LPA',
    demand: 'Medium',
    growth: '+4% annually',
    education: {
      degree: 'B.Ed, M.Ed, PhD (for Higher Education)',
      duration: '3-6 years',
      skills: ['Subject Knowledge', 'Communication', 'Pedagogy']
    },
    path: [
      { stage: 'Education', items: ['10+2', 'Graduation (Subject)', 'B.Ed (2 years)'] },
      { stage: 'Qualification', items: ['TET/CTET', 'NET/SET (for Colleges)', 'PhD (for Universities)'] },
      { stage: 'Experience', items: ['Student Teaching', 'Teaching Practice', 'Research'] },
      { stage: 'Career', items: ['Primary Teacher', 'Secondary Teacher', 'Principal', 'Professor'] }
    ],
    exams: ['TET', 'CTET', 'NET', 'SET', 'PhD Entrance'],
    companies: ['Government Schools', 'Private Schools', 'Colleges', 'Universities'],
    resources: [
      { title: 'Teaching Methods', type: 'Course', url: '#' },
      { title: 'Educational Research', type: 'Research', url: '#' },
      { title: 'Teacher Communities', type: 'Community', url: '#' },
      { title: 'Curriculum Guides', type: 'Reference', url: '#' }
    ]
  },
  {
    id: 'nda-officer',
    title: 'Defence Officer (NDA)',
    field: 'Defence',
    salary: '₹6-20 LPA',
    demand: 'High',
    growth: 'Stable',
    education: {
      degree: '10+2 (PCM for Air Force/Navy, Any stream for Army)',
      duration: '4 years training',
      skills: ['Leadership', 'Physical Fitness', 'Strategic Thinking']
    },
    path: [
      { stage: 'Education', items: ['10+2 (Age 16.5-19.5)', 'NDA Entrance', 'Selection Process'] },
      { stage: 'Training', items: ['NDA Khadakwasla (3 years)', 'IMA/INA/AFA (1 year)', 'Commissioning'] },
      { stage: 'Service', items: ['Lieutenant/Sub-Lieutenant', 'Captain/Lieutenant', 'Major/Lt.Commander'] },
      { stage: 'Career', items: ['Colonel/Commander', 'Brigadier/Commodore', 'General/Admiral'] }
    ],
    exams: ['NDA Entrance', 'CDS', 'AFCAT', 'Naval Academy'],
    companies: ['Indian Army', 'Indian Navy', 'Indian Air Force', 'Coast Guard'],
    resources: [
      { title: 'NDA Study Material', type: 'Course', url: '#' },
      { title: 'Physical Fitness Guide', type: 'Training', url: '#' },
      { title: 'Current Affairs', type: 'News', url: '#' },
      { title: 'Defence Community', type: 'Community', url: '#' }
    ]
  },
  {
    id: 'bank-officer',
    title: 'Banking Officer',
    field: 'Banking & Finance',
    salary: '₹3-12 LPA',
    demand: 'High',
    growth: '+5% annually',
    education: {
      degree: 'Graduation in any discipline',
      duration: '3-4 years',
      skills: ['Financial Knowledge', 'Customer Service', 'Risk Assessment']
    },
    path: [
      { stage: 'Education', items: ['10+2', 'Graduation (Any Subject)', 'Banking Exam Preparation'] },
      { stage: 'Selection', items: ['IBPS PO/Clerk', 'SBI PO/Clerk', 'RBI Grade B', 'NABARD'] },
      { stage: 'Training', items: ['Bank Training Program', 'Probationary Training', 'On-job Training'] },
      { stage: 'Career', items: ['Probationary Officer', 'Assistant Manager', 'Manager', 'General Manager'] }
    ],
    exams: ['IBPS PO/Clerk', 'SBI PO/Clerk', 'RBI Grade B', 'NABARD Grade A/B'],
    companies: ['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'PNB', 'BOI'],
    resources: [
      { title: 'Banking Awareness', type: 'Course', url: '#' },
      { title: 'Quantitative Aptitude', type: 'Practice', url: '#' },
      { title: 'Current Affairs', type: 'News', url: '#' },
      { title: 'Banking Community', type: 'Community', url: '#' }
    ]
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    field: 'Technology',
    salary: '₹3-15 LPA',
    demand: 'Very High',
    growth: '+20% annually',
    education: {
      degree: 'B.Tech/B.Sc. in CS/Statistics/Mathematics',
      duration: '3-4 years + Certification',
      skills: ['Statistical Analysis', 'Programming', 'Data Visualization']
    },
    path: [
      { stage: 'Education', items: ['10+2 (PCM)', 'B.Tech/B.Sc.', 'Data Analytics Certification'] },
      { stage: 'Skills', items: ['Python/R', 'SQL', 'Excel', 'Tableau/Power BI', 'Statistics'] },
      { stage: 'Experience', items: ['Internships', 'Projects', 'Portfolio Building'] },
      { stage: 'Career', items: ['Junior Analyst', 'Data Analyst', 'Senior Analyst', 'Data Scientist'] }
    ],
    exams: ['JEE Main', 'State Engineering Exams', 'Google Analytics Certified', 'Tableau Certified'],
    companies: ['Google', 'Microsoft', 'IBM', 'Accenture', 'Deloitte', 'TCS'],
    resources: [
      { title: 'Python for Data Science', type: 'Course', url: '#' },
      { title: 'Kaggle Competitions', type: 'Practice', url: '#' },
      { title: 'Data Science Community', type: 'Community', url: '#' },
      { title: 'Analytics Vidhya', type: 'Learning', url: '#' }
    ]
  },
  {
    id: 'ai-engineer',
    title: 'AI/ML Engineer',
    field: 'Technology',
    salary: '₹6-30 LPA',
    demand: 'Very High',
    growth: '+25% annually',
    education: {
      degree: 'B.Tech/M.Tech in CS/AI/ML',
      duration: '4-6 years',
      skills: ['Machine Learning', 'Deep Learning', 'Programming', 'Mathematics']
    },
    path: [
      { stage: 'Education', items: ['10+2 (PCM)', 'B.Tech Computer Science', 'AI/ML Specialization'] },
      { stage: 'Skills', items: ['Python', 'TensorFlow/PyTorch', 'Linear Algebra', 'Statistics', 'Cloud Platforms'] },
      { stage: 'Experience', items: ['ML Projects', 'Research Papers', 'Open Source Contributions'] },
      { stage: 'Career', items: ['ML Engineer', 'AI Researcher', 'Principal Engineer', 'AI Architect'] }
    ],
    exams: ['JEE Advanced', 'GATE', 'Google AI Certified', 'AWS ML Certified'],
    companies: ['OpenAI', 'Google DeepMind', 'Microsoft', 'NVIDIA', 'Flipkart', 'Ola'],
    resources: [
      { title: 'Machine Learning Course', type: 'Course', url: '#' },
      { title: 'Research Papers', type: 'Research', url: '#' },
      { title: 'GitHub Projects', type: 'Practice', url: '#' },
      { title: 'AI Community', type: 'Community', url: '#' }
    ]
  },
  {
    id: 'digital-marketer',
    title: 'Digital Marketing Specialist',
    field: 'Marketing',
    salary: '₹2-12 LPA',
    demand: 'High',
    growth: '+12% annually',
    education: {
      degree: 'Graduation in any field + Digital Marketing Certification',
      duration: '3-4 years',
      skills: ['SEO/SEM', 'Social Media', 'Content Creation', 'Analytics']
    },
    path: [
      { stage: 'Education', items: ['10+2', 'Graduation (Any Field)', 'Digital Marketing Course'] },
      { stage: 'Skills', items: ['Google Ads', 'Facebook Ads', 'SEO', 'Content Writing', 'Analytics'] },
      { stage: 'Experience', items: ['Internships', 'Freelance Projects', 'Portfolio Building'] },
      { stage: 'Career', items: ['Digital Marketing Executive', 'Manager', 'Head of Marketing', 'CMO'] }
    ],
    exams: ['Google Ads Certified', 'Facebook Blueprint', 'HubSpot Certified', 'Hootsuite Certified'],
    companies: ['Google', 'Facebook', 'Amazon', 'Flipkart', 'Zomato', 'Digital Agencies'],
    resources: [
      { title: 'Google Digital Marketing Course', type: 'Course', url: '#' },
      { title: 'SEO Tools', type: 'Tools', url: '#' },
      { title: 'Marketing Blogs', type: 'Learning', url: '#' },
      { title: 'Digital Marketing Community', type: 'Community', url: '#' }
    ]
  },
  {
    id: 'pharma-scientist',
    title: 'Pharmaceutical Scientist',
    field: 'Healthcare',
    salary: '₹3-18 LPA',
    demand: 'High',
    growth: '+8% annually',
    education: {
      degree: 'B.Pharm/M.Pharm/PharmD',
      duration: '4-6 years',
      skills: ['Drug Development', 'Research', 'Quality Control', 'Regulatory Affairs']
    },
    path: [
      { stage: 'Education', items: ['10+2 (PCB)', 'NEET/JEE/State Exams', 'B.Pharm (4 years)'] },
      { stage: 'Specialization', items: ['M.Pharm', 'PharmD', 'Research Projects'] },
      { stage: 'Experience', items: ['Internships', 'Research Work', 'Industry Training'] },
      { stage: 'Career', items: ['Research Associate', 'Senior Scientist', 'Principal Scientist', 'R&D Head'] }
    ],
    exams: ['NEET', 'GPAT', 'State Pharmacy Exams', 'GATE (Biotechnology)'],
    companies: ['Sun Pharma', 'Dr. Reddy\'s', 'Cipla', 'Lupin', 'Biocon', 'Pfizer'],
    resources: [
      { title: 'Pharmaceutical Sciences', type: 'Course', url: '#' },
      { title: 'Drug Development Process', type: 'Learning', url: '#' },
      { title: 'Pharma News', type: 'News', url: '#' },
      { title: 'Pharmaceutical Community', type: 'Community', url: '#' }
    ]
  },
  {
    id: 'civil-engineer',
    title: 'Civil Engineer',
    field: 'Engineering',
    salary: '₹3-15 LPA',
    demand: 'Medium',
    growth: '+6% annually',
    education: {
      degree: 'B.Tech/B.E. Civil Engineering',
      duration: '4 years',
      skills: ['Structural Design', 'Project Management', 'AutoCAD', 'Construction Knowledge']
    },
    path: [
      { stage: 'Education', items: ['10+2 (PCM)', 'JEE Main/State Exams', 'B.Tech Civil Engineering'] },
      { stage: 'Skills', items: ['AutoCAD', 'STAAD Pro', 'Project Management', 'Site Planning'] },
      { stage: 'Experience', items: ['Internships', 'Site Experience', 'Government Projects'] },
      { stage: 'Career', items: ['Junior Engineer', 'Project Engineer', 'Project Manager', 'Chief Engineer'] }
    ],
    exams: ['JEE Main', 'JEE Advanced', 'State Engineering Exams', 'GATE', 'ESE'],
    companies: ['L&T', 'DLF', 'Godrej Properties', 'BHEL', 'NTPC', 'PWD'],
    resources: [
      { title: 'Structural Engineering', type: 'Course', url: '#' },
      { title: 'Construction Management', type: 'Learning', url: '#' },
      { title: 'Engineering News', type: 'News', url: '#' },
      { title: 'Civil Engineering Community', type: 'Community', url: '#' }
    ]
  }
];

export function CareerPaths() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedField, setSelectedField] = useState('all');
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [recommendedCareers, setRecommendedCareers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<'browse' | 'detailed'>('browse');

  const fields = Array.from(new Set(careerPaths.map(career => career.field)));

  useEffect(() => {
    fetchRecommendedCareers();
  }, []);

  const fetchRecommendedCareers = async () => {
    try {
      setLoading(true);
      const response = await api.getCareerPathSuggestions();
      if (response?.careerPaths) {
        setRecommendedCareers(response.careerPaths);
      }
    } catch (error: any) {
      // Silently handle error - user might not have taken quiz yet
      console.log('No career recommendations available yet');
    } finally {
      setLoading(false);
    }
  };

  const filteredCareers = careerPaths.filter(career => {
    const matchesSearch = career.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         career.field.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesField = selectedField === 'all' || career.field === selectedField;
    
    return matchesSearch && matchesField;
  });

  const selectedCareerData = careerPaths.find(career => career.id === selectedCareer);

  if (activeView === 'detailed' && selectedCareer) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => {
            setActiveView('browse');
            setSelectedCareer(null);
          }}
        >
          ← Back to Career Paths
        </Button>
        <DetailedCareerPath careerType={selectedCareer} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Career Paths</h1>
          <p className="text-muted-foreground">
            Explore career options with detailed roadmaps from education to employment
          </p>
        </div>
      </div>

      {/* AI-Powered Recommendations */}
      {recommendedCareers.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI-Powered Career Recommendations
            </CardTitle>
            <CardDescription>
              Based on your aptitude assessment results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedCareers.slice(0, 3).map((career, index) => (
                <Card key={index} className="border-2 border-purple-200 hover:border-purple-400 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedCareer(career.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''));
                        setActiveView('detailed');
                      }}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="default" className="bg-purple-600">
                        {career.matchPercentage}% Match
                      </Badge>
                      <Target className="h-4 w-4 text-purple-600" />
                    </div>
                    <h4 className="font-semibold mb-1">{career.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{career.field}</p>
                    <div className="text-xs text-green-600 font-medium">
                      {career.salaryRange} • {career.demandLevel} Demand
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {recommendedCareers.length > 3 && (
              <div className="mt-4 text-center">
                <Button variant="outline">
                  View All {recommendedCareers.length} Recommendations
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeView === 'browse' && (
        <>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search careers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedField} onValueChange={setSelectedField}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fields</SelectItem>
                {fields.map(field => (
                  <SelectItem key={field} value={field}>{field}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Career Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCareers.map(career => (
              <Card 
                key={career.id} 
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                onClick={() => {
                  setSelectedCareer(career.id);
                  setActiveView('detailed');
                }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{career.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {career.field}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={career.demand === 'Very High' ? 'default' : 
                              career.demand === 'High' ? 'secondary' : 'outline'}
                    >
                      {career.demand}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-3 w-3 text-green-600" />
                      <span className="font-medium">{career.salary}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-3 w-3 text-blue-600" />
                      <span className="text-muted-foreground">{career.growth}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-2">Required Education:</h4>
                    <p className="text-sm text-muted-foreground">{career.education.degree}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-2">Key Skills:</h4>
                    <div className="flex flex-wrap gap-1">
                      {career.education.skills.slice(0, 3).map(skill => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCareer(career.id);
                      setActiveView('detailed');
                    }}
                  >
                    View Detailed Path <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {filteredCareers.length === 0 && activeView === 'browse' && (
        <Card>
          <CardContent className="text-center py-12">
            <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No careers found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or field filter
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}