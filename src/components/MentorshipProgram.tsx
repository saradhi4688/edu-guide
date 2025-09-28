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
import { 
  Users, 
  MessageCircle, 
  Star, 
  Calendar, 
  MapPin, 
  GraduationCap,
  Award,
  Clock,
  Send,
  Search,
  Filter,
  Heart,
  ThumbsUp,
  BookOpen,
  Target,
  TrendingUp,
  UserPlus,
  Video,
  Phone,
  Mail,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Mentor {
  id: string;
  name: string;
  avatar: string;
  currentRole: string;
  company: string;
  experience: number;
  education: string;
  specialization: string[];
  rating: number;
  totalMentees: number;
  availability: string;
  location: string;
  bio: string;
  achievements: string[];
  languages: string[];
  hourlyRate?: number;
  isVerified: boolean;
  responseTime: string;
  successStories: number;
}

interface MentorshipRequest {
  id: string;
  mentorId: string;
  studentId: string;
  subject: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: string;
  scheduledAt?: string;
  duration?: number;
  feedback?: {
    rating: number;
    comment: string;
  };
}

interface StudyGroup {
  id: string;
  name: string;
  subject: string;
  description: string;
  members: number;
  maxMembers: number;
  createdBy: string;
  createdAt: string;
  nextMeeting: string;
  isPublic: boolean;
  tags: string[];
}

export function MentorshipProgram() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState({
    subject: '',
    message: '',
    preferredTime: '',
    duration: 60
  });

  const subjects = [
    'Engineering', 'Medicine', 'Commerce', 'Arts', 'Science', 
    'Computer Science', 'Business', 'Law', 'Design', 'Other'
  ];

  const sampleMentors: Mentor[] = [
    {
      id: '1',
      name: 'Dr. Priya Sharma',
      avatar: '',
      currentRole: 'Senior Software Engineer',
      company: 'Google',
      experience: 8,
      education: 'B.Tech IIT Delhi, MS Stanford',
      specialization: ['Computer Science', 'Data Science', 'AI/ML'],
      rating: 4.9,
      totalMentees: 45,
      availability: 'Weekends',
      location: 'Bangalore',
      bio: 'Passionate about helping students achieve their tech dreams. 8+ years in software engineering with expertise in full-stack development.',
      achievements: ['Google Scholar', 'Tech Innovation Award 2023'],
      languages: ['English', 'Hindi'],
      hourlyRate: 1500,
      isVerified: true,
      responseTime: '2 hours',
      successStories: 12
    },
    {
      id: '2',
      name: 'Rajesh Kumar',
      avatar: '',
      currentRole: 'Chartered Accountant',
      company: 'Deloitte',
      experience: 12,
      education: 'CA, MBA Finance',
      specialization: ['Commerce', 'Finance', 'Taxation'],
      rating: 4.8,
      totalMentees: 32,
      availability: 'Evenings',
      location: 'Mumbai',
      bio: 'Experienced CA helping students navigate the world of commerce and finance. Specialized in taxation and audit.',
      achievements: ['CA Excellence Award', 'Top Performer 2022'],
      languages: ['English', 'Hindi', 'Marathi'],
      hourlyRate: 1200,
      isVerified: true,
      responseTime: '4 hours',
      successStories: 8
    },
    {
      id: '3',
      name: 'Dr. Anjali Mehta',
      avatar: '',
      currentRole: 'Medical Officer',
      company: 'AIIMS Delhi',
      experience: 6,
      education: 'MBBS, MD Medicine',
      specialization: ['Medicine', 'Biology', 'NEET Preparation'],
      rating: 4.9,
      totalMentees: 28,
      availability: 'Weekends',
      location: 'Delhi',
      bio: 'Dedicated medical professional helping aspiring doctors achieve their dreams. Expert in NEET preparation and medical career guidance.',
      achievements: ['AIIMS Gold Medal', 'Best Resident Doctor 2021'],
      languages: ['English', 'Hindi'],
      hourlyRate: 2000,
      isVerified: true,
      responseTime: '1 hour',
      successStories: 15
    }
  ];

  const sampleStudyGroups: StudyGroup[] = [
    {
      id: '1',
      name: 'JEE Main Study Group',
      subject: 'Engineering',
      description: 'Comprehensive preparation for JEE Main 2025. We cover Physics, Chemistry, and Mathematics with regular mock tests.',
      members: 15,
      maxMembers: 20,
      createdBy: 'Amit Singh',
      createdAt: '2024-01-15',
      nextMeeting: '2024-01-20T10:00:00Z',
      isPublic: true,
      tags: ['JEE', 'Engineering', 'Physics', 'Chemistry', 'Math']
    },
    {
      id: '2',
      name: 'NEET Biology Discussion',
      subject: 'Medicine',
      description: 'Focus on Biology concepts, diagrams, and problem-solving techniques for NEET preparation.',
      members: 22,
      maxMembers: 25,
      createdBy: 'Sneha Patel',
      createdAt: '2024-01-10',
      nextMeeting: '2024-01-18T14:00:00Z',
      isPublic: true,
      tags: ['NEET', 'Biology', 'Medicine', 'MCQ']
    },
    {
      id: '3',
      name: 'Commerce Career Guidance',
      subject: 'Commerce',
      description: 'Exploring career options in commerce, CA preparation, and business studies.',
      members: 8,
      maxMembers: 15,
      createdBy: 'Rohit Gupta',
      createdAt: '2024-01-12',
      nextMeeting: '2024-01-19T16:00:00Z',
      isPublic: true,
      tags: ['Commerce', 'CA', 'Business', 'Career']
    }
  ];

  useEffect(() => {
    setMentors(sampleMentors);
    setStudyGroups(sampleStudyGroups);
  }, []);

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.specialization.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubject = selectedSubject === 'all' || mentor.specialization.includes(selectedSubject);
    return matchesSearch && matchesSubject;
  });

  const handleRequestMentorship = () => {
    if (!selectedMentor) return;
    
    const newRequest: MentorshipRequest = {
      id: Date.now().toString(),
      mentorId: selectedMentor.id,
      studentId: 'current-user',
      subject: requestForm.subject,
      message: requestForm.message,
      status: 'pending',
      createdAt: new Date().toISOString(),
      duration: requestForm.duration
    };

    setRequests([...requests, newRequest]);
    setShowRequestForm(false);
    setRequestForm({ subject: '', message: '', preferredTime: '', duration: 60 });
    toast.success('Mentorship request sent successfully!');
  };

  const joinStudyGroup = (groupId: string) => {
    setStudyGroups(groups => 
      groups.map(group => 
        group.id === groupId 
          ? { ...group, members: Math.min(group.members + 1, group.maxMembers) }
          : group
      )
    );
    toast.success('Joined study group successfully!');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mentorship & Peer Support</h1>
          <p className="text-muted-foreground mt-1">
            Connect with experienced mentors and join study groups
          </p>
        </div>
        <Button onClick={() => setShowRequestForm(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Request Mentorship
        </Button>
      </div>

      <Tabs defaultValue="mentors" className="space-y-6">
        <TabsList>
          <TabsTrigger value="mentors">Find Mentors</TabsTrigger>
          <TabsTrigger value="study-groups">Study Groups</TabsTrigger>
          <TabsTrigger value="my-requests">My Requests</TabsTrigger>
        </TabsList>

        {/* Mentors Tab */}
        <TabsContent value="mentors" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search mentors by name or specialization..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Mentors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map(mentor => (
              <Card key={mentor.id} className="hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={mentor.avatar} />
                        <AvatarFallback>{mentor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{mentor.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {mentor.rating} ({mentor.totalMentees} mentees)
                        </CardDescription>
                      </div>
                    </div>
                    {mentor.isVerified && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Verified
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium">{mentor.currentRole}</p>
                    <p className="text-sm text-muted-foreground">{mentor.company}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Specialization:</p>
                    <div className="flex flex-wrap gap-1">
                      {mentor.specialization.map(spec => (
                        <Badge key={spec} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Experience</p>
                      <p className="font-medium">{mentor.experience} years</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Response Time</p>
                      <p className="font-medium">{mentor.responseTime}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <p className="text-muted-foreground">Success Stories</p>
                      <p className="font-medium">{mentor.successStories} students placed</p>
                    </div>
                    {mentor.hourlyRate && (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Rate</p>
                        <p className="font-medium">₹{mentor.hourlyRate}/hr</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        setSelectedMentor(mentor);
                        setShowRequestForm(true);
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
            ))}
          </div>
        </TabsContent>

        {/* Study Groups Tab */}
        <TabsContent value="study-groups" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studyGroups.map(group => (
              <Card key={group.id} className="hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <CardDescription>{group.subject}</CardDescription>
                    </div>
                    <Badge variant={group.isPublic ? "default" : "secondary"}>
                      {group.isPublic ? "Public" : "Private"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{group.description}</p>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {group.members}/{group.maxMembers} members
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(group.nextMeeting).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {group.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      disabled={group.members >= group.maxMembers}
                      onClick={() => joinStudyGroup(group.id)}
                    >
                      <UserPlus className="h-3 w-3 mr-1" />
                      {group.members >= group.maxMembers ? 'Full' : 'Join'}
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageCircle className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* My Requests Tab */}
        <TabsContent value="my-requests" className="space-y-6">
          <div className="space-y-4">
            {requests.map(request => {
              const mentor = mentors.find(m => m.id === request.mentorId);
              return (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={mentor?.avatar} />
                          <AvatarFallback>{mentor?.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{mentor?.name}</p>
                          <p className="text-sm text-muted-foreground">{request.subject}</p>
                        </div>
                      </div>
                      <Badge variant={
                        request.status === 'accepted' ? 'default' :
                        request.status === 'pending' ? 'secondary' :
                        request.status === 'rejected' ? 'destructive' : 'outline'
                      }>
                        {request.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{request.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Sent on {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Mentorship Request Modal */}
      {showRequestForm && selectedMentor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Request Mentorship</CardTitle>
              <CardDescription>
                Send a mentorship request to {selectedMentor.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Subject/Area</label>
                <Select value={requestForm.subject} onValueChange={(value) => setRequestForm({...requestForm, subject: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  placeholder="Tell the mentor about your goals and what you'd like to learn..."
                  value={requestForm.message}
                  onChange={(e) => setRequestForm({...requestForm, message: e.target.value})}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Preferred Duration (minutes)</label>
                <Select value={requestForm.duration.toString()} onValueChange={(value) => setRequestForm({...requestForm, duration: parseInt(value)})}>
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
                  onClick={handleRequestMentorship}
                  disabled={!requestForm.subject || !requestForm.message}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Request
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowRequestForm(false);
                    setSelectedMentor(null);
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
