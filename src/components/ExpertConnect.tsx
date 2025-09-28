import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Users, 
  Search, 
  Filter, 
  Star, 
  MessageCircle, 
  Video,
  Phone,
  Mail,
  Calendar,
  Clock,
  MapPin,
  Award,
  Briefcase,
  GraduationCap,
  Building,
  ExternalLink,
  Send,
  Plus,
  Eye,
  EyeOff,
  Heart,
  Bookmark,
  Share,
  Download,
  User,
  CheckCircle,
  AlertCircle,
  Info,
  TrendingUp,
  Target,
  Zap,
  Globe,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Github,
  BookOpen,
  Lightbulb,
  Trophy,
  Shield,
  ThumbsUp,
  MessageSquare,
  VideoIcon,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Settings,
  MoreHorizontal,
  Edit,
  Trash2,
  Flag,
  Report,
  Block,
  Unblock
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Expert {
  id: string;
  name: string;
  avatar: string;
  title: string;
  company: string;
  experience: number;
  education: string;
  specialization: string[];
  rating: number;
  totalSessions: number;
  responseTime: string;
  availability: string;
  location: string;
  bio: string;
  achievements: string[];
  languages: string[];
  hourlyRate: number;
  isVerified: boolean;
  isOnline: boolean;
  lastActive: string;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
  expertise: {
    technical: string[];
    soft: string[];
    industries: string[];
  };
  sessionTypes: ('video' | 'audio' | 'chat' | 'in-person')[];
  availabilitySlots: {
    day: string;
    timeSlots: string[];
  }[];
  reviews: {
    id: string;
    studentName: string;
    rating: number;
    comment: string;
    date: string;
  }[];
  successStories: number;
  averageSessionRating: number;
}

interface SessionRequest {
  id: string;
  expertId: string;
  studentId: string;
  type: 'video' | 'audio' | 'chat' | 'in-person';
  subject: string;
  message: string;
  preferredDate: string;
  preferredTime: string;
  duration: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  createdAt: string;
  scheduledAt?: string;
  completedAt?: string;
  feedback?: {
    rating: number;
    comment: string;
  };
}

interface NetworkingEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  type: 'webinar' | 'workshop' | 'conference' | 'meetup' | 'panel';
  speakers: Expert[];
  attendees: number;
  maxAttendees: number;
  isOnline: boolean;
  location?: string;
  meetingLink?: string;
  topics: string[];
  registrationDeadline: string;
  isRegistered: boolean;
  cost: number;
  currency: string;
}

export function ExpertConnect() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [networkingEvents, setNetworkingEvents] = useState<NetworkingEvent[]>([]);
  const [sessionRequests, setSessionRequests] = useState<SessionRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedSessionType, setSelectedSessionType] = useState('all');
  const [showSessionRequest, setShowSessionRequest] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [sessionRequest, setSessionRequest] = useState({
    type: 'video' as const,
    subject: '',
    message: '',
    preferredDate: '',
    preferredTime: '',
    duration: 60
  });
  const [savedExperts, setSavedExperts] = useState<string[]>([]);
  const [showExpertDetails, setShowExpertDetails] = useState<string | null>(null);

  // Sample data
  const sampleExperts: Expert[] = [
    {
      id: '1',
      name: 'Dr. Priya Sharma',
      avatar: '',
      title: 'Senior Software Engineer',
      company: 'Google',
      experience: 8,
      education: 'B.Tech IIT Delhi, MS Stanford',
      specialization: ['Computer Science', 'Data Science', 'AI/ML'],
      rating: 4.9,
      totalSessions: 150,
      responseTime: '2 hours',
      availability: 'Weekends',
      location: 'Bangalore',
      bio: 'Passionate about helping students achieve their tech dreams. 8+ years in software engineering with expertise in full-stack development, machine learning, and cloud computing.',
      achievements: ['Google Scholar', 'Tech Innovation Award 2023', 'Mentor of the Year 2022'],
      languages: ['English', 'Hindi'],
      hourlyRate: 2000,
      isVerified: true,
      isOnline: true,
      lastActive: '2024-01-15T10:30:00Z',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/priyasharma',
        github: 'https://github.com/priyasharma',
        website: 'https://priyasharma.dev'
      },
      expertise: {
        technical: ['Python', 'JavaScript', 'React', 'Node.js', 'AWS', 'Docker'],
        soft: ['Leadership', 'Communication', 'Problem Solving', 'Team Management'],
        industries: ['Technology', 'E-commerce', 'Fintech', 'Healthcare']
      },
      sessionTypes: ['video', 'audio', 'chat'],
      availabilitySlots: [
        { day: 'Saturday', timeSlots: ['10:00 AM', '2:00 PM', '4:00 PM'] },
        { day: 'Sunday', timeSlots: ['11:00 AM', '3:00 PM', '5:00 PM'] }
      ],
      reviews: [
        {
          id: '1',
          studentName: 'Arjun Kumar',
          rating: 5,
          comment: 'Excellent mentor! Helped me understand complex algorithms and land my dream job at Microsoft.',
          date: '2024-01-10'
        },
        {
          id: '2',
          studentName: 'Sneha Patel',
          rating: 5,
          comment: 'Very patient and knowledgeable. Great career guidance and technical insights.',
          date: '2024-01-08'
        }
      ],
      successStories: 25,
      averageSessionRating: 4.9
    },
    {
      id: '2',
      name: 'Rajesh Kumar',
      avatar: '',
      title: 'Chartered Accountant',
      company: 'Deloitte',
      experience: 12,
      education: 'CA, MBA Finance',
      specialization: ['Commerce', 'Finance', 'Taxation'],
      rating: 4.8,
      totalSessions: 120,
      responseTime: '4 hours',
      availability: 'Evenings',
      location: 'Mumbai',
      bio: 'Experienced CA helping students navigate the world of commerce and finance. Specialized in taxation, audit, and financial planning.',
      achievements: ['CA Excellence Award', 'Top Performer 2022', 'Best Mentor Award'],
      languages: ['English', 'Hindi', 'Marathi'],
      hourlyRate: 1500,
      isVerified: true,
      isOnline: false,
      lastActive: '2024-01-14T18:20:00Z',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/rajeshkumar',
        website: 'https://rajeshkumar-ca.com'
      },
      expertise: {
        technical: ['Taxation', 'Auditing', 'Financial Analysis', 'Compliance'],
        soft: ['Communication', 'Analytical Thinking', 'Client Management'],
        industries: ['Finance', 'Banking', 'Consulting', 'Manufacturing']
      },
      sessionTypes: ['video', 'audio', 'chat', 'in-person'],
      availabilitySlots: [
        { day: 'Monday', timeSlots: ['6:00 PM', '7:00 PM', '8:00 PM'] },
        { day: 'Wednesday', timeSlots: ['6:00 PM', '7:00 PM', '8:00 PM'] },
        { day: 'Friday', timeSlots: ['6:00 PM', '7:00 PM', '8:00 PM'] }
      ],
      reviews: [
        {
          id: '3',
          studentName: 'Rohit Gupta',
          rating: 5,
          comment: 'Amazing guidance for CA preparation. Clear explanations and practical examples.',
          date: '2024-01-12'
        }
      ],
      successStories: 18,
      averageSessionRating: 4.8
    },
    {
      id: '3',
      name: 'Dr. Anjali Mehta',
      avatar: '',
      title: 'Medical Officer',
      company: 'AIIMS Delhi',
      experience: 6,
      education: 'MBBS, MD Medicine',
      specialization: ['Medicine', 'Biology', 'NEET Preparation'],
      rating: 4.9,
      totalSessions: 95,
      responseTime: '1 hour',
      availability: 'Weekends',
      location: 'Delhi',
      bio: 'Dedicated medical professional helping aspiring doctors achieve their dreams. Expert in NEET preparation and medical career guidance.',
      achievements: ['AIIMS Gold Medal', 'Best Resident Doctor 2021', 'Medical Excellence Award'],
      languages: ['English', 'Hindi'],
      hourlyRate: 2500,
      isVerified: true,
      isOnline: true,
      lastActive: '2024-01-15T09:15:00Z',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/anjali-mehta',
        website: 'https://anjali-mehta-md.com'
      },
      expertise: {
        technical: ['Medicine', 'Biology', 'Anatomy', 'Physiology', 'Pathology'],
        soft: ['Patient Care', 'Communication', 'Critical Thinking'],
        industries: ['Healthcare', 'Medical Education', 'Research']
      },
      sessionTypes: ['video', 'audio', 'chat'],
      availabilitySlots: [
        { day: 'Saturday', timeSlots: ['9:00 AM', '11:00 AM', '2:00 PM'] },
        { day: 'Sunday', timeSlots: ['10:00 AM', '12:00 PM', '3:00 PM'] }
      ],
      reviews: [
        {
          id: '4',
          studentName: 'Kavya Singh',
          rating: 5,
          comment: 'Outstanding mentor! Helped me crack NEET with a great rank. Very supportive and knowledgeable.',
          date: '2024-01-11'
        }
      ],
      successStories: 22,
      averageSessionRating: 4.9
    }
  ];

  const sampleNetworkingEvents: NetworkingEvent[] = [
    {
      id: '1',
      title: 'Tech Career Guidance Webinar',
      description: 'Learn about the latest trends in technology and how to build a successful tech career.',
      date: '2024-02-15',
      time: '7:00 PM',
      duration: 90,
      type: 'webinar',
      speakers: [sampleExperts[0]],
      attendees: 45,
      maxAttendees: 100,
      isOnline: true,
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      topics: ['Career Planning', 'Technology Trends', 'Skill Development'],
      registrationDeadline: '2024-02-14',
      isRegistered: false,
      cost: 0,
      currency: 'INR'
    },
    {
      id: '2',
      title: 'Finance & Commerce Career Workshop',
      description: 'Interactive workshop on career opportunities in finance and commerce sectors.',
      date: '2024-02-20',
      time: '6:00 PM',
      duration: 120,
      type: 'workshop',
      speakers: [sampleExperts[1]],
      attendees: 28,
      maxAttendees: 50,
      isOnline: true,
      meetingLink: 'https://zoom.us/j/123456789',
      topics: ['Finance Careers', 'CA Preparation', 'Banking Jobs'],
      registrationDeadline: '2024-02-19',
      isRegistered: true,
      cost: 500,
      currency: 'INR'
    },
    {
      id: '3',
      title: 'Medical Career Panel Discussion',
      description: 'Panel discussion with medical professionals about various career paths in medicine.',
      date: '2024-02-25',
      time: '5:00 PM',
      duration: 150,
      type: 'panel',
      speakers: [sampleExperts[2]],
      attendees: 67,
      maxAttendees: 80,
      isOnline: false,
      location: 'AIIMS Delhi, Conference Hall',
      topics: ['Medical Specializations', 'NEET Preparation', 'Research Opportunities'],
      registrationDeadline: '2024-02-24',
      isRegistered: false,
      cost: 0,
      currency: 'INR'
    }
  ];

  useEffect(() => {
    setExperts(sampleExperts);
    setNetworkingEvents(sampleNetworkingEvents);
  }, []);

  const filteredExperts = experts.filter(expert => {
    const matchesSearch = expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expert.specialization.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         expert.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = selectedSpecialization === 'all' || 
                                 expert.specialization.includes(selectedSpecialization);
    const matchesIndustry = selectedIndustry === 'all' || 
                           expert.expertise.industries.includes(selectedIndustry);
    const matchesSessionType = selectedSessionType === 'all' || 
                              expert.sessionTypes.includes(selectedSessionType as any);
    return matchesSearch && matchesSpecialization && matchesIndustry && matchesSessionType;
  });

  const handleSessionRequest = () => {
    if (!selectedExpert) return;
    
    const newRequest: SessionRequest = {
      id: Date.now().toString(),
      expertId: selectedExpert.id,
      studentId: 'current-user',
      type: sessionRequest.type,
      subject: sessionRequest.subject,
      message: sessionRequest.message,
      preferredDate: sessionRequest.preferredDate,
      preferredTime: sessionRequest.preferredTime,
      duration: sessionRequest.duration,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setSessionRequests([...sessionRequests, newRequest]);
    setShowSessionRequest(false);
    setSessionRequest({
      type: 'video',
      subject: '',
      message: '',
      preferredDate: '',
      preferredTime: '',
      duration: 60
    });
    toast.success('Session request sent successfully!');
  };

  const saveExpert = (expertId: string) => {
    if (savedExperts.includes(expertId)) {
      setSavedExperts(savedExperts.filter(id => id !== expertId));
      toast.success('Expert removed from saved list');
    } else {
      setSavedExperts([...savedExperts, expertId]);
      toast.success('Expert saved successfully');
    }
  };

  const registerForEvent = (eventId: string) => {
    setNetworkingEvents(events => 
      events.map(event => 
        event.id === eventId 
          ? { ...event, isRegistered: !event.isRegistered, attendees: event.isRegistered ? event.attendees - 1 : event.attendees + 1 }
          : event
      )
    );
    const event = networkingEvents.find(e => e.id === eventId);
    if (event) {
      toast.success(event.isRegistered ? 'Registration cancelled' : 'Registered successfully!');
    }
  };

  const getSpecializationColor = (specialization: string) => {
    const colors = {
      'Computer Science': 'bg-blue-100 text-blue-800',
      'Data Science': 'bg-purple-100 text-purple-800',
      'AI/ML': 'bg-green-100 text-green-800',
      'Commerce': 'bg-orange-100 text-orange-800',
      'Finance': 'bg-yellow-100 text-yellow-800',
      'Medicine': 'bg-red-100 text-red-800',
      'Biology': 'bg-indigo-100 text-indigo-800'
    };
    return colors[specialization as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'webinar': return 'bg-blue-100 text-blue-800';
      case 'workshop': return 'bg-green-100 text-green-800';
      case 'conference': return 'bg-purple-100 text-purple-800';
      case 'meetup': return 'bg-orange-100 text-orange-800';
      case 'panel': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const specializations = ['all', 'Computer Science', 'Data Science', 'AI/ML', 'Commerce', 'Finance', 'Medicine', 'Biology'];
  const industries = ['all', 'Technology', 'E-commerce', 'Fintech', 'Healthcare', 'Finance', 'Banking', 'Consulting'];
  const sessionTypes = ['all', 'video', 'audio', 'chat', 'in-person'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Expert Connect</h1>
          <p className="text-muted-foreground mt-1">
            Connect with industry professionals for career guidance and mentorship
          </p>
        </div>
        <Button onClick={() => setShowSessionRequest(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Request Session
        </Button>
      </div>

      <Tabs defaultValue="experts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="experts">Find Experts</TabsTrigger>
          <TabsTrigger value="events">Networking Events</TabsTrigger>
          <TabsTrigger value="sessions">My Sessions</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
        </TabsList>

        {/* Experts Tab */}
        <TabsContent value="experts" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search experts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                  <SelectTrigger>
                    <SelectValue placeholder="Specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {specializations.map(spec => (
                      <SelectItem key={spec} value={spec}>
                        {spec === 'all' ? 'All Specializations' : spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map(industry => (
                      <SelectItem key={industry} value={industry}>
                        {industry === 'all' ? 'All Industries' : industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedSessionType} onValueChange={setSelectedSessionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Session Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessionTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Experts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredExperts.map(expert => (
              <Card key={expert.id} className="hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={expert.avatar} />
                          <AvatarFallback>{expert.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        {expert.isOnline && (
                          <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{expert.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <span>{expert.title}</span>
                          {expert.isVerified && <CheckCircle className="h-3 w-3 text-blue-500" />}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {expert.isOnline ? 'Online' : 'Offline'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium">{expert.company}</p>
                    <p className="text-sm text-muted-foreground">{expert.experience} years experience</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Specialization:</p>
                    <div className="flex flex-wrap gap-1">
                      {expert.specialization.map(spec => (
                        <Badge key={spec} className={`text-xs ${getSpecializationColor(spec)}`}>
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Rating</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{expert.rating}</span>
                        <span className="text-muted-foreground">({expert.totalSessions})</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Response Time</p>
                      <p className="font-medium">{expert.responseTime}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <p className="text-muted-foreground">Success Stories</p>
                      <p className="font-medium">{expert.successStories} students</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Rate</p>
                      <p className="font-medium">₹{expert.hourlyRate}/hr</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        setSelectedExpert(expert);
                        setShowSessionRequest(true);
                      }}
                    >
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Connect
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => saveExpert(expert.id)}
                    >
                      {savedExperts.includes(expert.id) ? (
                        <Heart className="h-3 w-3 fill-red-500 text-red-500" />
                      ) : (
                        <Heart className="h-3 w-3" />
                      )}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setShowExpertDetails(showExpertDetails === expert.id ? null : expert.id)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>

                  {showExpertDetails === expert.id && (
                    <div className="space-y-3 pt-3 border-t">
                      <div>
                        <p className="text-sm font-medium mb-2">Bio:</p>
                        <p className="text-xs text-muted-foreground">{expert.bio}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-2">Technical Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {expert.expertise.technical.map(skill => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Availability:</p>
                        <div className="space-y-1">
                          {expert.availabilitySlots.map(slot => (
                            <div key={slot.day} className="text-xs text-muted-foreground">
                              <span className="font-medium">{slot.day}:</span> {slot.timeSlots.join(', ')}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Recent Reviews:</p>
                        <div className="space-y-2">
                          {expert.reviews.slice(0, 2).map(review => (
                            <div key={review.id} className="text-xs border-l-2 border-blue-200 pl-2">
                              <div className="flex items-center gap-1 mb-1">
                                <span className="font-medium">{review.studentName}</span>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                  ))}
                                </div>
                              </div>
                              <p className="text-muted-foreground">{review.comment}</p>
                            </div>
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

        {/* Networking Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {networkingEvents.map(event => (
              <Card key={event.id} className="hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <CardDescription className="mt-1">{event.description}</CardDescription>
                    </div>
                    <Badge className={getEventTypeColor(event.type)}>
                      {event.type}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Date & Time</p>
                      <p className="font-medium">
                        {new Date(event.date).toLocaleDateString()} at {event.time}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-medium">{event.duration} minutes</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Attendees</p>
                      <p className="font-medium">{event.attendees}/{event.maxAttendees}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cost</p>
                      <p className="font-medium">
                        {event.cost === 0 ? 'Free' : `₹${event.cost}`}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Speakers:</p>
                    <div className="flex items-center gap-2">
                      {event.speakers.map(speaker => (
                        <div key={speaker.id} className="flex items-center gap-1">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={speaker.avatar} />
                            <AvatarFallback className="text-xs">{speaker.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium">{speaker.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Topics:</p>
                    <div className="flex flex-wrap gap-1">
                      {event.topics.map(topic => (
                        <Badge key={topic} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Deadline: {new Date(event.registrationDeadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {event.isOnline ? (
                        <Globe className="h-4 w-4" />
                      ) : (
                        <MapPin className="h-4 w-4" />
                      )}
                      <span>{event.isOnline ? 'Online' : event.location}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => registerForEvent(event.id)}
                      disabled={event.attendees >= event.maxAttendees && !event.isRegistered}
                    >
                      {event.isRegistered ? 'Registered' : 
                       event.attendees >= event.maxAttendees ? 'Full' : 'Register'}
                    </Button>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* My Sessions Tab */}
        <TabsContent value="sessions" className="space-y-6">
          <div className="space-y-4">
            {sessionRequests.map(request => {
              const expert = experts.find(e => e.id === request.expertId);
              return (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={expert?.avatar} />
                          <AvatarFallback>{expert?.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{expert?.name}</p>
                          <p className="text-sm text-muted-foreground">{request.subject}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          request.status === 'accepted' ? 'default' :
                          request.status === 'pending' ? 'secondary' :
                          request.status === 'rejected' ? 'destructive' : 'outline'
                        }>
                          {request.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{request.message}</p>
                    {request.scheduledAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Scheduled: {new Date(request.scheduledAt).toLocaleString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Saved Tab */}
        <TabsContent value="saved" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {savedExperts.map(expertId => {
              const expert = experts.find(e => e.id === expertId);
              if (!expert) return null;

              return (
                <Card key={expertId} className="hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={expert.avatar} />
                          <AvatarFallback>{expert.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{expert.name}</CardTitle>
                          <CardDescription>{expert.title} at {expert.company}</CardDescription>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => saveExpert(expertId)}
                      >
                        <Heart className="h-3 w-3 fill-red-500 text-red-500" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{expert.rating}</span>
                        <span className="text-sm text-muted-foreground">({expert.totalSessions} sessions)</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Rate</p>
                        <p className="font-medium">₹{expert.hourlyRate}/hr</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedExpert(expert);
                          setShowSessionRequest(true);
                        }}
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Connect
                      </Button>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {savedExperts.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No saved experts</h3>
                <p className="text-muted-foreground">
                  Save experts to view them here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Session Request Modal */}
      {showSessionRequest && selectedExpert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Request Session</CardTitle>
              <CardDescription>
                Request a session with {selectedExpert.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Session Type</label>
                <Select value={sessionRequest.type} onValueChange={(value: any) => setSessionRequest({...sessionRequest, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedExpert.sessionTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Subject/Topic</label>
                <Input
                  value={sessionRequest.subject}
                  onChange={(e) => setSessionRequest({...sessionRequest, subject: e.target.value})}
                  placeholder="What would you like to discuss?"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  value={sessionRequest.message}
                  onChange={(e) => setSessionRequest({...sessionRequest, message: e.target.value})}
                  placeholder="Tell the expert about your goals and what you'd like to learn..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Preferred Date</label>
                  <Input
                    type="date"
                    value={sessionRequest.preferredDate}
                    onChange={(e) => setSessionRequest({...sessionRequest, preferredDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Preferred Time</label>
                  <Input
                    type="time"
                    value={sessionRequest.preferredTime}
                    onChange={(e) => setSessionRequest({...sessionRequest, preferredTime: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Duration (minutes)</label>
                <Select value={sessionRequest.duration.toString()} onValueChange={(value) => setSessionRequest({...sessionRequest, duration: parseInt(value)})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  onClick={handleSessionRequest}
                  disabled={!sessionRequest.subject || !sessionRequest.message}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Request
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowSessionRequest(false);
                    setSelectedExpert(null);
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
