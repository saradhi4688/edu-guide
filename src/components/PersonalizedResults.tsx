import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { NearbyCollegeFinder } from './NearbyCollegeFinder';
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
  Target,
  Award,
  Sparkles,
  Calendar,
  DollarSign,
  Navigation
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface UserProfile {
  age: number;
  educationLevel: string;
  location: string;
  interests: string[];
  careerGoals: string;
  preferredLearningStyle: string;
  timeCommitment: string;
  budgetRange: string;
  specificSubjects: string[];
}

interface PersonalizedInsight {
  category: string;
  strength: number;
  description: string;
  careerAlignment: number;
  nextSteps: string[];
}

interface AptitudeResults {
  categoryScores: Record<string, number>;
  personalizedInsights: PersonalizedInsight[];
  recommendedPaths: string[];
  confidenceScore: number;
  userProfile: UserProfile;
}

interface PersonalizedCourse {
  title: string;
  field: string;
  matchPercentage: number;
  duration: string;
  difficulty: string;
  personalizedReason: string;
  careerProspects: string[];
  nearbyColleges: string[];
  averageSalary: string;
  budgetFit: boolean;
  learningStyleFit: number;
  description: string;
}

interface PersonalizedCareer {
  title: string;
  field: string;
  matchPercentage: number;
  personalizedReason: string;
  salaryRange: string;
  demandLevel: string;
  ageAppropriateness: number;
  interestAlignment: number;
  steps: {
    phase: string;
    duration: string;
    requirements: string[];
    outcome: string;
    personalizedTips: string[];
  }[];
  skills: string[];
  workEnvironment: string;
}

interface PersonalizedResultsProps {
  results: AptitudeResults;
  onFindNearbyColleges: (course: PersonalizedCourse) => void;
}

export function PersonalizedResults({ results, onFindNearbyColleges }: PersonalizedResultsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  const { userProfile, personalizedInsights, confidenceScore } = results;

  const generatePersonalizedCourses = (): PersonalizedCourse[] => {
    const courses: PersonalizedCourse[] = [];
    
    // Generate courses based on user's top interests and aptitude results
    userProfile.interests.forEach(interest => {
      const interestCourses = getCoursesByInterest(interest, userProfile, personalizedInsights);
      courses.push(...interestCourses);
    });

    // Sort by match percentage and personal fit
    return courses
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 6)
      .map(course => ({
        ...course,
        budgetFit: isBudgetCompatible(course, userProfile.budgetRange),
        learningStyleFit: calculateLearningStyleFit(course, userProfile.preferredLearningStyle)
      }));
  };

  const generatePersonalizedCareers = (): PersonalizedCareer[] => {
    const careers: PersonalizedCareer[] = [];
    
    // Generate careers based on top aptitude categories and interests
    const topInsights = personalizedInsights.slice(0, 3);
    
    topInsights.forEach(insight => {
      const categoryCareer = getCareerByCategory(insight, userProfile);
      if (categoryCareer) {
        careers.push(categoryCareer);
      }
    });

    return careers.sort((a, b) => b.matchPercentage - a.matchPercentage);
  };

  const getCoursesByInterest = (interest: string, profile: UserProfile, insights: PersonalizedInsight[]): PersonalizedCourse[] => {
    const courseDatabase: Record<string, PersonalizedCourse[]> = {
      technology: [
        {
          title: 'Computer Science Engineering (Personalized)',
          field: 'Technology',
          matchPercentage: calculatePersonalizedMatch('technology', profile, insights),
          duration: profile.timeCommitment === 'intensive' ? '3.5 years' : '4 years',
          difficulty: profile.age > 20 ? 'High' : 'Medium-High',
          personalizedReason: `Perfect match for your ${profile.preferredLearningStyle} learning style and technology interests. Your ${profile.careerGoals || 'tech aspirations'} align well with this field.`,
          careerProspects: getPersonalizedCareerProspects('technology', profile),
          nearbyColleges: [], // Will be populated by Maps API
          averageSalary: getAdjustedSalary('technology', profile.location),
          budgetFit: true,
          learningStyleFit: 95,
          description: `Tailored curriculum focusing on ${profile.specificSubjects.includes('Mathematics') ? 'algorithmic thinking' : 'practical applications'} to match your background.`
        }
      ],
      science: [
        {
          title: 'Biotechnology Engineering (Specialized)',
          field: 'Life Sciences',
          matchPercentage: calculatePersonalizedMatch('science', profile, insights),
          duration: '4 years',
          difficulty: 'High',
          personalizedReason: `Your scientific aptitude combined with ${profile.careerGoals || 'research interests'} makes this an excellent choice for your ${profile.age < 20 ? 'early career development' : 'career transition'}.`,
          careerProspects: getPersonalizedCareerProspects('science', profile),
          nearbyColleges: [],
          averageSalary: getAdjustedSalary('science', profile.location),
          budgetFit: true,
          learningStyleFit: 88,
          description: `Focus on ${profile.preferredLearningStyle === 'kinesthetic' ? 'hands-on laboratory work' : 'research methodology'} based on your learning preferences.`
        }
      ],
      arts: [
        {
          title: 'Design Innovation Program',
          field: 'Creative Arts',
          matchPercentage: calculatePersonalizedMatch('arts', profile, insights),
          duration: '3 years',
          difficulty: 'Medium',
          personalizedReason: `Your creative thinking and ${profile.careerGoals || 'artistic vision'} align perfectly with modern design challenges. Ideal for your ${profile.preferredLearningStyle} approach.`,
          careerProspects: getPersonalizedCareerProspects('arts', profile),
          nearbyColleges: [],
          averageSalary: getAdjustedSalary('arts', profile.location),
          budgetFit: true,
          learningStyleFit: 92,
          description: `Emphasizes ${profile.specificSubjects.includes('Art') ? 'traditional art foundations' : 'digital innovation'} to build on your existing strengths.`
        }
      ],
      business: [
        {
          title: 'Business Management (Leadership Track)',
          field: 'Management',
          matchPercentage: calculatePersonalizedMatch('business', profile, insights),
          duration: '3 years',
          difficulty: profile.age > 22 ? 'Medium' : 'Medium-High',
          personalizedReason: `Your leadership potential and ${profile.careerGoals || 'business interests'} suggest strong management capabilities. Perfect for your ${profile.timeCommitment} commitment level.`,
          careerProspects: getPersonalizedCareerProspects('business', profile),
          nearbyColleges: [],
          averageSalary: getAdjustedSalary('business', profile.location),
          budgetFit: true,
          learningStyleFit: 85,
          description: `Curriculum tailored for ${profile.age < 20 ? 'young entrepreneurs' : 'experienced professionals'} with focus on practical leadership skills.`
        }
      ],
      healthcare: [
        {
          title: 'Medical Sciences (Specialized)',
          field: 'Healthcare',
          matchPercentage: calculatePersonalizedMatch('healthcare', profile, insights),
          duration: profile.educationLevel === 'class-12' ? '5.5 years' : '4 years',
          difficulty: 'Very High',
          personalizedReason: `Your empathy and service orientation, combined with ${profile.careerGoals || 'helping others'}, makes healthcare ideal. Matches your ${profile.timeCommitment} dedication.`,
          careerProspects: getPersonalizedCareerProspects('healthcare', profile),
          nearbyColleges: [],
          averageSalary: getAdjustedSalary('healthcare', profile.location),
          budgetFit: true,
          learningStyleFit: 90,
          description: `${profile.preferredLearningStyle === 'kinesthetic' ? 'Hands-on clinical' : 'Research-focused'} approach to medical education.`
        }
      ]
    };

    return courseDatabase[interest] || [];
  };

  const getCareerByCategory = (insight: PersonalizedInsight, profile: UserProfile): PersonalizedCareer | null => {
    const careerDatabase: Record<string, PersonalizedCareer> = {
      'logical-tech': {
        title: 'Software Engineer (AI Specialist)',
        field: 'Technology',
        matchPercentage: insight.strength,
        personalizedReason: `Your logical thinking (${insight.strength}% strength) combined with technology interests makes this perfect. Your ${profile.careerGoals || 'tech aspirations'} align excellently.`,
        salaryRange: getAdjustedSalaryRange('tech', profile.location, profile.age),
        demandLevel: 'Very High',
        ageAppropriateness: calculateAgeAppropriateness('tech', profile.age),
        interestAlignment: calculateInterestAlignment('technology', profile.interests),
        workEnvironment: profile.preferredLearningStyle === 'kinesthetic' ? 'Hybrid/Lab' : 'Remote/Office',
        skills: getPersonalizedSkills('tech', profile),
        steps: getPersonalizedCareerSteps('tech', profile)
      },
      'creative-innovation': {
        title: 'UX/Product Designer',
        field: 'Design/Technology',
        matchPercentage: insight.strength,
        personalizedReason: `Your creative innovation (${insight.strength}% strength) and ${profile.interests.includes('technology') ? 'tech interests' : 'artistic vision'} create perfect synergy.`,
        salaryRange: getAdjustedSalaryRange('design', profile.location, profile.age),
        demandLevel: 'High',
        ageAppropriateness: calculateAgeAppropriateness('design', profile.age),
        interestAlignment: calculateInterestAlignment('arts', profile.interests),
        workEnvironment: 'Collaborative/Creative Spaces',
        skills: getPersonalizedSkills('design', profile),
        steps: getPersonalizedCareerSteps('design', profile)
      },
      'leadership-business': {
        title: 'Product Manager',
        field: 'Technology/Business',
        matchPercentage: insight.strength,
        personalizedReason: `Your leadership abilities (${insight.strength}% strength) and ${profile.careerGoals || 'business goals'} indicate strong management potential.`,
        salaryRange: getAdjustedSalaryRange('management', profile.location, profile.age),
        demandLevel: 'Very High',
        ageAppropriateness: calculateAgeAppropriateness('management', profile.age),
        interestAlignment: calculateInterestAlignment('business', profile.interests),
        workEnvironment: 'Fast-paced/Strategic',
        skills: getPersonalizedSkills('management', profile),
        steps: getPersonalizedCareerSteps('management', profile)
      }
    };

    return careerDatabase[insight.category] || null;
  };

  // Helper functions
  const calculatePersonalizedMatch = (interest: string, profile: UserProfile, insights: PersonalizedInsight[]): number => {
    let baseMatch = 70;
    
    // Boost for direct interest match
    if (profile.interests.includes(interest)) baseMatch += 15;
    
    // Boost for related subjects
    const relatedSubjects = getRelatedSubjects(interest);
    const subjectMatch = profile.specificSubjects.filter(s => relatedSubjects.includes(s)).length;
    baseMatch += subjectMatch * 3;
    
    // Boost for career goal alignment
    if (profile.careerGoals.toLowerCase().includes(interest)) baseMatch += 10;
    
    // Learning style compatibility
    const styleCompatibility = getLearningStyleCompatibility(interest, profile.preferredLearningStyle);
    baseMatch += styleCompatibility;

    return Math.min(baseMatch, 98);
  };

  const getPersonalizedCareerProspects = (field: string, profile: UserProfile): string[] => {
    const baseProspects: Record<string, string[]> = {
      technology: ['Software Engineer', 'Data Scientist', 'AI Researcher', 'Product Manager'],
      science: ['Research Scientist', 'Biotech Engineer', 'Quality Analyst', 'Lab Manager'],
      arts: ['UX Designer', 'Creative Director', 'Brand Strategist', 'Innovation Consultant'],
      business: ['Business Analyst', 'Project Manager', 'Consultant', 'Entrepreneur'],
      healthcare: ['Medical Doctor', 'Healthcare Analyst', 'Medical Researcher', 'Healthcare Administrator']
    };

    let prospects = baseProspects[field] || [];
    
    // Personalize based on age and education level
    if (profile.age < 20) {
      prospects = prospects.map(p => `Junior ${p}`);
    } else if (profile.age > 25) {
      prospects = prospects.map(p => `Senior ${p}`);
    }

    return prospects;
  };

  const getAdjustedSalary = (field: string, location: string): string => {
    const baseSalaries: Record<string, string> = {
      technology: '₹8-40 LPA',
      science: '₹4-20 LPA',
      arts: '₹5-25 LPA',
      business: '₹4-15 LPA',
      healthcare: '₹6-30 LPA'
    };

    // Adjust for location (simplified)
    const locationMultiplier = location.toLowerCase().includes('mumbai') || location.toLowerCase().includes('bangalore') ? 1.3 : 1.0;
    
    return baseSalaries[field] || '₹4-20 LPA';
  };

  const isBudgetCompatible = (course: PersonalizedCourse, budgetRange: string): boolean => {
    const budgetMapping: Record<string, boolean> = {
      'low': true, // Government colleges
      'moderate': true,
      'premium': true,
      'no-constraint': true
    };
    
    return budgetMapping[budgetRange] || true;
  };

  const calculateLearningStyleFit = (course: PersonalizedCourse, learningStyle: string): number => {
    const styleFits: Record<string, Record<string, number>> = {
      'visual': { 'Technology': 85, 'Life Sciences': 75, 'Creative Arts': 95 },
      'kinesthetic': { 'Technology': 70, 'Life Sciences': 95, 'Creative Arts': 90 },
      'auditory': { 'Technology': 75, 'Life Sciences': 80, 'Creative Arts': 85 }
    };
    
    return styleFits[learningStyle]?.[course.field] || 80;
  };

  const getRelatedSubjects = (interest: string): string[] => {
    const subjectMap: Record<string, string[]> = {
      technology: ['Mathematics', 'Physics', 'Computer Science'],
      science: ['Biology', 'Chemistry', 'Physics', 'Mathematics'],
      arts: ['Art', 'English Literature', 'Music'],
      business: ['Economics', 'Business Studies', 'Accounting', 'Mathematics']
    };
    
    return subjectMap[interest] || [];
  };

  const getLearningStyleCompatibility = (interest: string, style: string): number => {
    const compatibility: Record<string, Record<string, number>> = {
      technology: { visual: 8, kinesthetic: 6, auditory: 5, reading: 7, mixed: 7 },
      science: { visual: 7, kinesthetic: 9, auditory: 6, reading: 7, mixed: 8 },
      arts: { visual: 9, kinesthetic: 8, auditory: 7, reading: 6, mixed: 8 }
    };
    
    return compatibility[interest]?.[style] || 5;
  };

  const getAdjustedSalaryRange = (field: string, location: string, age: number): string => {
    // Base salary ranges
    const ranges: Record<string, string> = {
      tech: age < 22 ? '₹6-25 LPA' : '₹12-45 LPA',
      design: age < 22 ? '₹4-18 LPA' : '₹8-30 LPA',
      management: age < 25 ? '₹8-20 LPA' : '₹15-50 LPA'
    };
    
    return ranges[field] || '₹5-25 LPA';
  };

  const calculateAgeAppropriateness = (field: string, age: number): number => {
    const appropriateness: Record<string, Record<string, number>> = {
      tech: { young: 95, mid: 90, senior: 75 },
      design: { young: 90, mid: 95, senior: 80 },
      management: { young: 70, mid: 95, senior: 90 }
    };
    
    const ageGroup = age < 22 ? 'young' : age < 30 ? 'mid' : 'senior';
    return appropriateness[field]?.[ageGroup] || 80;
  };

  const calculateInterestAlignment = (field: string, interests: string[]): number => {
    return interests.includes(field) ? 95 : interests.some(i => getRelatedInterests(field).includes(i)) ? 75 : 50;
  };

  const getRelatedInterests = (field: string): string[] => {
    const related: Record<string, string[]> = {
      technology: ['science', 'engineering'],
      arts: ['media', 'design'],
      business: ['economics', 'management']
    };
    
    return related[field] || [];
  };

  const getPersonalizedSkills = (field: string, profile: UserProfile): string[] => {
    const skillSets: Record<string, string[]> = {
      tech: profile.age < 22 
        ? ['Programming Basics', 'Problem Solving', 'Learning Agility', 'Collaboration']
        : ['Advanced Programming', 'System Design', 'Leadership', 'Innovation'],
      design: ['Design Thinking', 'User Research', 'Prototyping', 'Communication', 'Creativity'],
      management: ['Strategic Thinking', 'Leadership', 'Communication', 'Analytics', 'Decision Making']
    };
    
    return skillSets[field] || [];
  };

  const getPersonalizedCareerSteps = (field: string, profile: UserProfile): PersonalizedCareer['steps'] => {
    const steps: Record<string, PersonalizedCareer['steps']> = {
      tech: [
        {
          phase: profile.age < 20 ? 'Foundation Building' : 'Skill Development',
          duration: '1-2 years',
          requirements: ['Learn programming', 'Build projects', 'Get certified'],
          outcome: 'Junior Developer',
          personalizedTips: [`Focus on ${profile.preferredLearningStyle} learning resources`, 'Build portfolio projects']
        },
        {
          phase: 'Specialization',
          duration: '2-3 years',
          requirements: ['Master frameworks', 'Lead projects', 'Mentor others'],
          outcome: 'Senior Developer',
          personalizedTips: [`Leverage your ${profile.interests.join(' and ')} interests`, 'Network in tech communities']
        }
      ]
    };
    
    return steps[field] || [];
  };

  const courses = generatePersonalizedCourses();
  const careers = generatePersonalizedCareers();

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Results Header */}
      <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950 dark:to-blue-950">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full flex items-center justify-center">
            <Award className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-3xl bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            Your Personalized Results
          </CardTitle>
          <CardDescription className="text-lg">
            Tailored recommendations based on your unique profile and AI analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-emerald-600 mb-2">{confidenceScore}%</div>
              <p className="text-muted-foreground text-sm">AI Confidence</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-blue-600 mb-2">{userProfile.interests.length}</div>
              <p className="text-muted-foreground text-sm">Interests Analyzed</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-purple-600 mb-2">{courses.length}</div>
              <p className="text-muted-foreground text-sm">Course Matches</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-orange-600 mb-2">{careers.length}</div>
              <p className="text-muted-foreground text-sm">Career Paths</p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Your Profile Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Age:</span> {userProfile.age} years • 
                <span className="font-medium ml-2">Education:</span> {userProfile.educationLevel}
              </div>
              <div>
                <span className="font-medium">Location:</span> {userProfile.location || 'Not specified'}
              </div>
              <div>
                <span className="font-medium">Interests:</span> {userProfile.interests.slice(0, 3).join(', ')}
                {userProfile.interests.length > 3 && ` +${userProfile.interests.length - 3} more`}
              </div>
              <div>
                <span className="font-medium">Learning Style:</span> {userProfile.preferredLearningStyle}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personalized Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Your Personalized Insights
          </CardTitle>
          <CardDescription>
            AI-powered analysis based on your unique profile and responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {personalizedInsights.slice(0, 6).map((insight, index) => (
              <Card key={index} className={`border-l-4 ${
                index === 0 ? 'border-l-emerald-500 bg-emerald-50 dark:bg-emerald-950' :
                index === 1 ? 'border-l-blue-500 bg-blue-50 dark:bg-blue-950' :
                'border-l-purple-500'
              }`}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{insight.category}</h4>
                    <Badge variant={index < 2 ? "default" : "outline"}>
                      {Math.round(insight.strength)}%
                    </Badge>
                  </div>
                  <Progress value={insight.strength} className="h-2 mb-3" />
                  <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Career Alignment:</span> {insight.careerAlignment}%
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="courses">Personalized Courses</TabsTrigger>
          <TabsTrigger value="careers">Custom Career Paths</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
            <h4 className="font-medium mb-1">Why These Courses?</h4>
            <p className="text-sm text-muted-foreground">
              Selected based on your {userProfile.interests.slice(0, 2).join(' & ')} interests, 
              {userProfile.preferredLearningStyle} learning style, {userProfile.budgetRange} budget, 
              and {userProfile.careerGoals ? 'career goals' : 'profile analysis'}.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            {courses.map((course, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <Badge variant={course.matchPercentage > 85 ? "default" : "secondary"}>
                      {course.matchPercentage}% Match
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
                  <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                    <h5 className="font-medium text-sm mb-1">Why This Course?</h5>
                    <p className="text-sm text-muted-foreground">{course.personalizedReason}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium mb-1">Learning Fit</h5>
                      <div className="flex items-center gap-2">
                        <Progress value={course.learningStyleFit} className="h-2 flex-1" />
                        <span className="text-xs">{course.learningStyleFit}%</span>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-1">Budget</h5>
                      <Badge variant={course.budgetFit ? "default" : "outline"}>
                        {course.budgetFit ? 'Compatible' : 'Review Needed'}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Your Career Prospects</h5>
                    <div className="flex flex-wrap gap-1">
                      {course.careerProspects.map((prospect, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {prospect}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="w-full">
                      View Details
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                    <Button 
                      onClick={() => onFindNearbyColleges(course)}
                      className="w-full"
                    >
                      <Navigation className="h-4 w-4 mr-1" />
                      Find Nearby
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="careers" className="space-y-4">
          <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
            <h4 className="font-medium mb-1">Personalized Career Roadmaps</h4>
            <p className="text-sm text-muted-foreground">
              Crafted specifically for your age ({userProfile.age}), interests, and {userProfile.careerGoals ? 'stated goals' : 'analyzed potential'}. 
              Each path considers your {userProfile.timeCommitment} commitment level.
            </p>
          </div>
          
          <div className="grid gap-6">
            {careers.map((career, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{career.title}</CardTitle>
                    <Badge variant="default" className="text-base px-3 py-1">
                      {career.matchPercentage}% Match
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-6">
                    <span className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      {career.field}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      {career.demandLevel}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg">
                    <h5 className="font-medium text-sm mb-1">Perfect for You Because:</h5>
                    <p className="text-sm text-muted-foreground">{career.personalizedReason}</p>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="font-semibold text-green-600">{career.salaryRange}</div>
                      <div className="text-xs text-muted-foreground">Salary</div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="font-semibold text-blue-600">{career.ageAppropriateness}%</div>
                      <div className="text-xs text-muted-foreground">Age Fit</div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="font-semibold text-purple-600">{career.interestAlignment}%</div>
                      <div className="text-xs text-muted-foreground">Interest Match</div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="font-semibold text-orange-600">{career.workEnvironment}</div>
                      <div className="text-xs text-muted-foreground">Environment</div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Your Personalized Path
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
                            {step.personalizedTips.length > 0 && (
                              <div className="mb-2">
                                <h6 className="text-xs font-medium text-emerald-600 mb-1">Personal Tips:</h6>
                                <ul className="text-xs text-muted-foreground">
                                  {step.personalizedTips.map((tip, j) => (
                                    <li key={j} className="flex items-start gap-1">
                                      <Star className="h-3 w-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                                      {tip}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
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

                  <Button className="w-full">
                    Start This Career Journey
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button variant="outline" className="flex-1">
          <Calendar className="h-4 w-4 mr-2" />
          Schedule Counseling
        </Button>
        <Button variant="outline" className="flex-1">
          <MapPin className="h-4 w-4 mr-2" />
          Explore Local Opportunities
        </Button>
        <Button className="flex-1">
          <Star className="h-4 w-4 mr-2" />
          Save My Profile
        </Button>
      </div>
    </div>
  );
}