import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BookOpen, Search, Filter, TrendingUp, Users, Clock, Award } from 'lucide-react';

const streams = [
  {
    id: 'science',
    name: 'Science',
    description: 'Mathematics, Physics, Chemistry, Biology',
    icon: '🔬',
    popularity: 85,
    duration: '2 years',
    difficulty: 'High',
    careers: ['Engineering', 'Medicine', 'Research', 'Technology'],
    courses: [
      {
        id: 'pcm',
        name: 'Physics, Chemistry, Mathematics (PCM)',
        description: 'Core subjects for engineering and technology careers',
        subjects: ['Physics', 'Chemistry', 'Mathematics', 'English'],
        eligibility: 'Class 10 with 60% in Science and Math',
        careers: ['Engineering', 'Architecture', 'Computer Science', 'Pilot'],
        colleges: 150,
        averageFees: '₹50,000 - ₹2,00,000'
      },
      {
        id: 'pcb',
        name: 'Physics, Chemistry, Biology (PCB)',
        description: 'Essential for medical and life sciences',
        subjects: ['Physics', 'Chemistry', 'Biology', 'English'],
        eligibility: 'Class 10 with 60% in Science',
        careers: ['Doctor', 'Nurse', 'Pharmacist', 'Biotechnology'],
        colleges: 120,
        averageFees: '₹1,00,000 - ₹15,00,000'
      }
    ]
  },
  {
    id: 'commerce',
    name: 'Commerce',
    description: 'Business, Economics, Accounting, Mathematics',
    icon: '💼',
    popularity: 70,
    duration: '2 years',
    difficulty: 'Medium',
    careers: ['Business', 'Finance', 'Economics', 'Management'],
    courses: [
      {
        id: 'commerce-math',
        name: 'Commerce with Mathematics',
        description: 'Ideal for analytical business careers',
        subjects: ['Accountancy', 'Business Studies', 'Economics', 'Mathematics', 'English'],
        eligibility: 'Class 10 with 50% marks',
        careers: ['CA', 'Finance Analyst', 'Economist', 'Banking'],
        colleges: 200,
        averageFees: '₹20,000 - ₹1,00,000'
      },
      {
        id: 'commerce-no-math',
        name: 'Commerce without Mathematics',
        description: 'Focus on business and social aspects',
        subjects: ['Accountancy', 'Business Studies', 'Economics', 'Physical Education', 'English'],
        eligibility: 'Class 10 with 50% marks',
        careers: ['Business Management', 'Marketing', 'HR', 'Journalism'],
        colleges: 180,
        averageFees: '₹15,000 - ₹80,000'
      }
    ]
  },
  {
    id: 'arts',
    name: 'Arts/Humanities',
    description: 'Literature, History, Psychology, Political Science',
    icon: '🎨',
    popularity: 60,
    duration: '2 years',
    difficulty: 'Medium',
    careers: ['Civil Services', 'Teaching', 'Media', 'Social Work'],
    courses: [
      {
        id: 'arts-humanities',
        name: 'Arts & Humanities',
        description: 'Explore human culture, society, and creative expression',
        subjects: ['History', 'Political Science', 'Psychology', 'English', 'Geography'],
        eligibility: 'Class 10 with 45% marks',
        careers: ['IAS/IPS', 'Lawyer', 'Teacher', 'Journalist'],
        colleges: 300,
        averageFees: '₹10,000 - ₹60,000'
      }
    ]
  },
  {
    id: 'vocational',
    name: 'Vocational',
    description: 'Skill-based training for immediate employment',
    icon: '🔧',
    popularity: 40,
    duration: '1-2 years',
    difficulty: 'Low-Medium',
    careers: ['Technical Skills', 'Entrepreneurship', 'Specialized Jobs'],
    courses: [
      {
        id: 'it-vocational',
        name: 'Information Technology',
        description: 'Practical IT skills and computer applications',
        subjects: ['Computer Applications', 'Web Development', 'Database Management', 'Networking'],
        eligibility: 'Class 10 pass',
        careers: ['Web Developer', 'System Admin', 'IT Support', 'Digital Marketing'],
        colleges: 80,
        averageFees: '₹25,000 - ₹1,20,000'
      },
      {
        id: 'retail-vocational',
        name: 'Retail Management',
        description: 'Business operations and customer service skills',
        subjects: ['Retail Operations', 'Customer Service', 'Marketing', 'Business Communication'],
        eligibility: 'Class 10 pass',
        careers: ['Store Manager', 'Sales Executive', 'Entrepreneur', 'Supply Chain'],
        colleges: 60,
        averageFees: '₹15,000 - ₹80,000'
      }
    ]
  }
];

export function Streams() {
  const [selectedStream, setSelectedStream] = useState('science');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');

  const selectedStreamData = streams.find(stream => stream.id === selectedStream);
  
  const filteredCourses = selectedStreamData?.courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterBy === 'all') return matchesSearch;
    if (filterBy === 'high-demand') return matchesSearch && course.colleges > 100;
    if (filterBy === 'affordable') return matchesSearch && course.averageFees.includes('₹10,000');
    
    return matchesSearch;
  }) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Streams & Courses</h1>
          <p className="text-muted-foreground">
            Explore different academic paths and find the right fit for your interests
          </p>
        </div>
      </div>

      {/* Stream Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {streams.map((stream) => (
          <Card 
            key={stream.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedStream === stream.id ? 'border-primary shadow-md' : ''
            }`}
            onClick={() => setSelectedStream(stream.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="text-2xl">{stream.icon}</div>
                <Badge variant="outline">
                  {stream.popularity}% popular
                </Badge>
              </div>
              <CardTitle className="text-lg">{stream.name}</CardTitle>
              <CardDescription className="text-sm">
                {stream.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  {stream.duration}
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3" />
                  {stream.difficulty} difficulty
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  {stream.courses.length} courses
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Stream Details */}
      {selectedStreamData && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{selectedStreamData.icon}</span>
                    {selectedStreamData.name} Stream
                  </CardTitle>
                  <CardDescription>
                    Popular career paths: {selectedStreamData.careers.join(', ')}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {selectedStreamData.popularity}% choose this
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                <SelectItem value="high-demand">High Demand</SelectItem>
                <SelectItem value="affordable">Most Affordable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Courses List */}
          <div className="space-y-4">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{course.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {course.description}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">
                      {course.colleges} colleges
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Subjects */}
                  <div>
                    <h4 className="font-medium mb-2">Core Subjects:</h4>
                    <div className="flex flex-wrap gap-2">
                      {course.subjects.map((subject) => (
                        <Badge key={subject} variant="secondary">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Career Options */}
                  <div>
                    <h4 className="font-medium mb-2">Career Opportunities:</h4>
                    <div className="flex flex-wrap gap-2">
                      {course.careers.map((career) => (
                        <Badge key={career} variant="outline">
                          {career}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Course Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <h5 className="font-medium text-sm">Eligibility</h5>
                      <p className="text-sm text-muted-foreground">{course.eligibility}</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm">Average Fees</h5>
                      <p className="text-sm text-muted-foreground">{course.averageFees}</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm">Colleges Offering</h5>
                      <p className="text-sm text-muted-foreground">{course.colleges}+ institutions</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm">
                      Find Colleges
                    </Button>
                    <Button variant="outline" size="sm">
                      Compare Courses
                    </Button>
                    <Button variant="outline" size="sm">
                      Career Roadmap
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No courses found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or filters
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}