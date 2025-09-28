import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../utils/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { User, BookOpen, MapPin, Languages } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

const interests = [
  'Mathematics', 'Science', 'Arts', 'Literature', 'History', 'Geography',
  'Computer Science', 'Physics', 'Chemistry', 'Biology', 'Economics',
  'Psychology', 'Philosophy', 'Music', 'Sports', 'Technology'
];

const strengths = [
  'Logical Reasoning', 'Creative Thinking', 'Problem Solving', 'Communication',
  'Leadership', 'Team Work', 'Analytical Skills', 'Research', 'Public Speaking',
  'Writing', 'Mathematical Ability', 'Scientific Aptitude'
];

export function Profile() {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    age: '',
    class: '',
    school: '',
    city: '',
    state: '',
    preferredStream: '',
    language: user?.locale || 'en',
    interests: [] as string[],
    strengths: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const profile = await api.getProfile();
      if (profile.profileData) {
        setFormData(prev => ({
          ...prev,
          ...profile.profileData,
          displayName: user.displayName,
          language: user.locale
        }));
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const profileCompletion = calculateCompletion();

  function calculateCompletion() {
    const fields = ['displayName', 'age', 'class', 'school', 'city', 'state', 'preferredStream'];
    const completed = fields.filter(field => formData[field as keyof typeof formData]).length;
    const interestsComplete = formData.interests.length > 0 ? 1 : 0;
    const strengthsComplete = formData.strengths.length > 0 ? 1 : 0;
    
    return Math.round(((completed + interestsComplete + strengthsComplete) / (fields.length + 2)) * 100);
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: 'interests' | 'strengths', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ 
        displayName: formData.displayName,
        profileCompleted: profileCompletion >= 80,
        locale: formData.language as 'en' | 'hi',
        profileData: {
          age: formData.age,
          class: formData.class,
          school: formData.school,
          city: formData.city,
          state: formData.state,
          preferredStream: formData.preferredStream,
          interests: formData.interests,
          strengths: formData.strengths
        }
      });
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Complete your profile to get personalized recommendations</p>
        </div>
        <div className="text-right">
          <Progress value={profileCompletion} className="w-32 mb-2" />
          <Badge variant={profileCompletion >= 80 ? "default" : "secondary"}>
            {profileCompletion}% Complete
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="interests">Interests</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>Your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Full Name</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    placeholder="Your age"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Your city"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="delhi">Delhi</SelectItem>
                      <SelectItem value="maharashtra">Maharashtra</SelectItem>
                      <SelectItem value="karnataka">Karnataka</SelectItem>
                      <SelectItem value="tamil-nadu">Tamil Nadu</SelectItem>
                      <SelectItem value="uttar-pradesh">Uttar Pradesh</SelectItem>
                      <SelectItem value="west-bengal">West Bengal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Academic Information
              </CardTitle>
              <CardDescription>Your educational background</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="class">Current Class</Label>
                  <Select value={formData.class} onValueChange={(value) => handleInputChange('class', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">Class 10</SelectItem>
                      <SelectItem value="11">Class 11</SelectItem>
                      <SelectItem value="12">Class 12</SelectItem>
                      <SelectItem value="graduate">Graduate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="school">School/College</Label>
                  <Input
                    id="school"
                    value={formData.school}
                    onChange={(e) => handleInputChange('school', e.target.value)}
                    placeholder="Your institution name"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="preferredStream">Preferred Stream</Label>
                  <Select value={formData.preferredStream} onValueChange={(value) => handleInputChange('preferredStream', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your preferred stream" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="commerce">Commerce</SelectItem>
                      <SelectItem value="arts">Arts/Humanities</SelectItem>
                      <SelectItem value="vocational">Vocational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interests">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Interests</CardTitle>
                <CardDescription>Select subjects and topics you're interested in</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {interests.map((interest) => (
                    <div key={interest} className="flex items-center space-x-2">
                      <Checkbox
                        id={`interest-${interest}`}
                        checked={formData.interests.includes(interest)}
                        onCheckedChange={() => handleArrayToggle('interests', interest)}
                      />
                      <Label htmlFor={`interest-${interest}`} className="text-sm">
                        {interest}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Strengths</CardTitle>
                <CardDescription>Select your key strengths and abilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {strengths.map((strength) => (
                    <div key={strength} className="flex items-center space-x-2">
                      <Checkbox
                        id={`strength-${strength}`}
                        checked={formData.strengths.includes(strength)}
                        onCheckedChange={() => handleArrayToggle('strengths', strength)}
                      />
                      <Label htmlFor={`strength-${strength}`} className="text-sm">
                        {strength}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5" />
                Preferences
              </CardTitle>
              <CardDescription>Your language and location preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Preferred Language</Label>
                <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </div>
  );
}