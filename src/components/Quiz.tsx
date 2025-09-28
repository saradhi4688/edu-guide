import React, { useState } from 'react';
import { UserProfileSetup } from './UserProfileSetup';
import { AIQuizGenerator } from './AIQuizGenerator';
import { PersonalizedResults } from './PersonalizedResults';
import { NearbyCollegeFinder } from './NearbyCollegeFinder';
import { dataStore, getCurrentLocation, reverseGeocode } from '../utils/dataStore';
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

export function Quiz() {
  const [currentStep, setCurrentStep] = useState<'profile' | 'quiz' | 'results'>('profile');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [quizResults, setQuizResults] = useState<AptitudeResults | null>(null);
  const [showCollegeFinder, setShowCollegeFinder] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<PersonalizedCourse | null>(null);

  const handleProfileComplete = async (profile: UserProfile) => {
    setUserProfile(profile);
    
    // Save profile data
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      user.profileData = profile;
      localStorage.setItem('user_data', JSON.stringify(user));
    }
    
    // Try to get user location for better recommendations
    try {
      const position = await getCurrentLocation();
      const address = await reverseGeocode(position.latitude, position.longitude);
      profile.location = address;
    } catch (error) {
      console.log('Location access not available, using provided location');
    }
    
    setCurrentStep('quiz');
    toast.success('Profile created! Generating your personalized quiz...');
  };

  const handleQuizComplete = async (results: AptitudeResults) => {
    setQuizResults(results);
    
    // Save quiz results to data store
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      
      try {
        // Get current location for saving with results
        const position = await getCurrentLocation();
        const address = await reverseGeocode(position.latitude, position.longitude);
        
        const quizResult = {
          id: Date.now().toString(),
          userId: user.uid,
          userProfile: results.userProfile,
          categoryScores: results.categoryScores,
          personalizedInsights: results.personalizedInsights,
          recommendedPaths: results.recommendedPaths,
          confidenceScore: results.confidenceScore,
          timestamp: Date.now(),
          location: {
            latitude: position.latitude,
            longitude: position.longitude,
            address: address
          }
        };
        
        dataStore.saveQuizResult(quizResult);
        toast.success('Quiz results saved successfully!');
        
      } catch (locationError) {
        // Save without location if geo access denied
        const quizResult = {
          id: Date.now().toString(),
          userId: user.uid,
          userProfile: results.userProfile,
          categoryScores: results.categoryScores,
          personalizedInsights: results.personalizedInsights,
          recommendedPaths: results.recommendedPaths,
          confidenceScore: results.confidenceScore,
          timestamp: Date.now()
        };
        
        dataStore.saveQuizResult(quizResult);
        toast.success('Quiz results saved!');
      }
    }
    
    setCurrentStep('results');
    toast.success('Quiz completed! Here are your personalized recommendations.');
  };

  const handleFindNearbyColleges = (course: PersonalizedCourse) => {
    if (!userProfile?.location) {
      toast.error('Please add your location in the profile to find nearby colleges.');
      return;
    }
    
    // Add to search history
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      dataStore.addSearchHistory(user.uid, course.title, 'college');
    }
    
    setSelectedCourse(course);
    setShowCollegeFinder(true);
    toast.info('Finding colleges near you...', {
      description: `Searching for ${course.title} programs in your area`
    });
  };

  const handleRetakeQuiz = () => {
    setCurrentStep('profile');
    setUserProfile(null);
    setQuizResults(null);
    setShowCollegeFinder(false);
    setSelectedCourse(null);
    toast.info('Starting fresh! You can update your profile.');
  };

  const handleViewSavedColleges = () => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      const savedColleges = dataStore.getSavedColleges(user.uid);
      if (savedColleges.length > 0) {
        toast.success(`You have ${savedColleges.length} saved colleges`);
        // Here you could open a saved colleges view
      } else {
        toast.info('No saved colleges yet');
      }
    }
  };

  const handleBookCounseling = () => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      // In a real app, this would integrate with a booking system
      toast.success('Counseling session request sent! We will contact you soon.');
      
      // Save this action for follow-up
      dataStore.addSearchHistory(user.uid, 'Career Counseling', 'career');
    }
  };

  // College Finder Modal
  if (showCollegeFinder && selectedCourse && userProfile) {
    return (
      <NearbyCollegeFinder
        course={selectedCourse}
        userLocation={userProfile.location}
        onClose={() => {
          setShowCollegeFinder(false);
          setSelectedCourse(null);
        }}
      />
    );
  }

  if (currentStep === 'profile') {
    return <UserProfileSetup onProfileComplete={handleProfileComplete} />;
  }

  if (currentStep === 'quiz' && userProfile) {
    return (
      <AIQuizGenerator 
        userProfile={userProfile} 
        onQuizComplete={handleQuizComplete}
      />
    );
  }

  if (currentStep === 'results' && quizResults) {
    return (
      <div className="space-y-6">
        <PersonalizedResults 
          results={quizResults}
          onFindNearbyColleges={handleFindNearbyColleges}
        />
        
        {/* Enhanced Action Panel */}
        <div className="p-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={handleRetakeQuiz}
              className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mb-2">
                🔄
              </div>
              <span className="font-medium text-sm">Update Profile & Retake</span>
            </button>
            
            <button
              onClick={handleBookCounseling}
              className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-950 rounded-lg hover:bg-green-100 dark:hover:bg-green-900 transition-colors"
            >
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mb-2">
                📞
              </div>
              <span className="font-medium text-sm">Book Career Counseling</span>
            </button>
            
            <button
              onClick={handleViewSavedColleges}
              className="flex flex-col items-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
            >
              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center mb-2">
                ❤️
              </div>
              <span className="font-medium text-sm">View Saved Colleges</span>
            </button>
            
            <button
              onClick={() => {
                const userData = localStorage.getItem('user_data');
                if (userData) {
                  const user = JSON.parse(userData);
                  const results = dataStore.getLatestQuizResult(user.uid);
                  if (results) {
                    navigator.share?.({
                      title: 'My Career Assessment Results',
                      text: `I scored ${results.confidenceScore}% confidence in my career assessment!`,
                      url: window.location.href
                    }) || toast.success('Results saved to your profile!');
                  }
                }
              }}
              className="flex flex-col items-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors"
            >
              <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center mb-2">
                📤
              </div>
              <span className="font-medium text-sm">Share Results</span>
            </button>
          </div>
          
          {/* Quick Stats */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium mb-2">Your Journey So Far</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Confidence Score:</span>
                <div className="font-semibold text-lg">{quizResults.confidenceScore}%</div>
              </div>
              <div>
                <span className="text-muted-foreground">Interests Analyzed:</span>
                <div className="font-semibold text-lg">{quizResults.userProfile.interests.length}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Career Paths:</span>
                <div className="font-semibold text-lg">{quizResults.recommendedPaths.length}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Assessment Date:</span>
                <div className="font-semibold text-lg">{new Date().toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}