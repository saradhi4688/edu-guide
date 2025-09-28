import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { User, GraduationCap, Heart, MapPin, Calendar } from 'lucide-react';
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

interface UserProfileSetupProps {
  onProfileComplete: (profile: UserProfile) => void;
}

const interestCategories = [
  { id: 'technology', label: 'Technology & Programming', icon: '💻' },
  { id: 'science', label: 'Science & Research', icon: '🔬' },
  { id: 'arts', label: 'Arts & Design', icon: '🎨' },
  { id: 'business', label: 'Business & Finance', icon: '💼' },
  { id: 'healthcare', label: 'Healthcare & Medicine', icon: '🏥' },
  { id: 'education', label: 'Education & Teaching', icon: '📚' },
  { id: 'engineering', label: 'Engineering & Manufacturing', icon: '⚙️' },
  { id: 'media', label: 'Media & Communication', icon: '📺' },
  { id: 'sports', label: 'Sports & Fitness', icon: '⚽' },
  { id: 'environment', label: 'Environment & Sustainability', icon: '🌱' },
  { id: 'social', label: 'Social Work & Community Service', icon: '🤝' },
  { id: 'law', label: 'Law & Legal Studies', icon: '⚖️' }
];

const specificSubjects = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
  'English Literature', 'History', 'Geography', 'Economics', 'Psychology',
  'Philosophy', 'Political Science', 'Sociology', 'Art', 'Music',
  'Physical Education', 'Business Studies', 'Accounting', 'Statistics'
];

export function UserProfileSetup({ onProfileComplete }: UserProfileSetupProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    interests: [],
    specificSubjects: []
  });

  const totalSteps = 4;

  const handleInterestToggle = (interestId: string) => {
    const currentInterests = profile.interests || [];
    const newInterests = currentInterests.includes(interestId)
      ? currentInterests.filter(id => id !== interestId)
      : [...currentInterests, interestId];
    
    setProfile(prev => ({ ...prev, interests: newInterests }));
  };

  const handleSubjectToggle = (subject: string) => {
    const currentSubjects = profile.specificSubjects || [];
    const newSubjects = currentSubjects.includes(subject)
      ? currentSubjects.filter(s => s !== subject)
      : [...currentSubjects, subject];
    
    setProfile(prev => ({ ...prev, specificSubjects: newSubjects }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (!profile.age || !profile.educationLevel || !profile.interests?.length) {
      toast.error('Please fill in all required fields');
      return;
    }

    const completeProfile: UserProfile = {
      age: profile.age!,
      educationLevel: profile.educationLevel!,
      location: profile.location || '',
      interests: profile.interests!,
      careerGoals: profile.careerGoals || '',
      preferredLearningStyle: profile.preferredLearningStyle || 'mixed',
      timeCommitment: profile.timeCommitment || 'moderate',
      budgetRange: profile.budgetRange || 'moderate',
      specificSubjects: profile.specificSubjects || []
    };

    onProfileComplete(completeProfile);
    toast.success('Profile setup completed! Generating your personalized quiz...');
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <User className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h3 className="text-xl font-semibold mb-2">Basic Information</h3>
        <p className="text-muted-foreground">Tell us about yourself to personalize your experience</p>
      </div>

      <div className="grid gap-4">
        <div>
          <Label htmlFor="age">Age *</Label>
          <Input
            id="age"
            type="number"
            min="13"
            max="50"
            value={profile.age || ''}
            onChange={(e) => setProfile(prev => ({ ...prev, age: parseInt(e.target.value) }))}
            placeholder="Enter your age"
          />
        </div>

        <div>
          <Label htmlFor="education">Current Education Level *</Label>
          <Select 
            value={profile.educationLevel || ''} 
            onValueChange={(value) => setProfile(prev => ({ ...prev, educationLevel: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your education level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="class-10">Class 10 (Secondary)</SelectItem>
              <SelectItem value="class-12">Class 12 (Senior Secondary)</SelectItem>
              <SelectItem value="undergraduate">Undergraduate</SelectItem>
              <SelectItem value="postgraduate">Postgraduate</SelectItem>
              <SelectItem value="working-professional">Working Professional</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="location">Location (City, State)</Label>
          <Input
            id="location"
            value={profile.location || ''}
            onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
            placeholder="e.g., Mumbai, Maharashtra"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Heart className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h3 className="text-xl font-semibold mb-2">Your Interests</h3>
        <p className="text-muted-foreground">Select areas that excite you (minimum 3)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {interestCategories.map((interest) => (
          <div
            key={interest.id}
            className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
              profile.interests?.includes(interest.id)
                ? 'border-primary bg-primary/10'
                : 'border-border hover:bg-muted/50'
            }`}
            onClick={() => handleInterestToggle(interest.id)}
          >
            <span className="text-2xl">{interest.icon}</span>
            <span className="flex-1">{interest.label}</span>
            <Checkbox 
              checked={profile.interests?.includes(interest.id)} 
              onChange={() => {}} // Handled by parent onClick
            />
          </div>
        ))}
      </div>

      <div className="text-sm text-muted-foreground">
        Selected: {profile.interests?.length || 0} interests
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <GraduationCap className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h3 className="text-xl font-semibold mb-2">Academic Preferences</h3>
        <p className="text-muted-foreground">Help us understand your learning style and goals</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Preferred Learning Style</Label>
          <Select 
            value={profile.preferredLearningStyle || ''} 
            onValueChange={(value) => setProfile(prev => ({ ...prev, preferredLearningStyle: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="How do you learn best?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="visual">Visual (diagrams, charts, videos)</SelectItem>
              <SelectItem value="auditory">Auditory (lectures, discussions)</SelectItem>
              <SelectItem value="kinesthetic">Hands-on (practical, experiments)</SelectItem>
              <SelectItem value="reading">Reading/Writing</SelectItem>
              <SelectItem value="mixed">Mixed approach</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Time Commitment for Studies</Label>
          <Select 
            value={profile.timeCommitment || ''} 
            onValueChange={(value) => setProfile(prev => ({ ...prev, timeCommitment: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="How much time can you dedicate?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light (1-2 hours/day)</SelectItem>
              <SelectItem value="moderate">Moderate (3-5 hours/day)</SelectItem>
              <SelectItem value="intensive">Intensive (6+ hours/day)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Budget Range for Education</Label>
          <Select 
            value={profile.budgetRange || ''} 
            onValueChange={(value) => setProfile(prev => ({ ...prev, budgetRange: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="What's your budget range?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Budget-friendly (Under ₹2 LPA)</SelectItem>
              <SelectItem value="moderate">Moderate (₹2-8 LPA)</SelectItem>
              <SelectItem value="premium">Premium (₹8+ LPA)</SelectItem>
              <SelectItem value="no-constraint">No specific constraint</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Calendar className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h3 className="text-xl font-semibold mb-2">Goals & Subjects</h3>
        <p className="text-muted-foreground">Share your aspirations and favorite subjects</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="career-goals">Career Goals or Aspirations</Label>
          <Textarea
            id="career-goals"
            value={profile.careerGoals || ''}
            onChange={(e) => setProfile(prev => ({ ...prev, careerGoals: e.target.value }))}
            placeholder="Describe your dream career or what you want to achieve..."
            rows={3}
          />
        </div>

        <div>
          <Label>Favorite Subjects (Optional)</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {specificSubjects.map((subject) => (
              <div
                key={subject}
                className={`flex items-center justify-between p-2 rounded border cursor-pointer text-sm ${
                  profile.specificSubjects?.includes(subject)
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:bg-muted/50'
                }`}
                onClick={() => handleSubjectToggle(subject)}
              >
                <span>{subject}</span>
                <Checkbox 
                  checked={profile.specificSubjects?.includes(subject)} 
                  onChange={() => {}}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Profile Setup</span>
          <span className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personalize Your Learning Journey</CardTitle>
          <CardDescription>
            Help us create the perfect aptitude quiz and recommendations tailored just for you
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            {currentStep < totalSteps ? (
              <Button onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit}>
                Complete Setup
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}