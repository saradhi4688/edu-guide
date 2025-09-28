import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Brain, Clock, Sparkles, Zap, Target, ChevronRight } from 'lucide-react';
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

interface QuizQuestion {
  id: number;
  question: string;
  category: string;
  relevantInterests: string[];
  options: {
    value: string;
    label: string;
    score: number;
  }[];
  adaptiveLevel: 'basic' | 'intermediate' | 'advanced';
  contextualWeight: number;
}

interface AIQuizGeneratorProps {
  userProfile: UserProfile;
  onQuizComplete: (results: AptitudeResults) => void;
}

interface AptitudeResults {
  categoryScores: Record<string, number>;
  personalizedInsights: PersonalizedInsight[];
  recommendedPaths: string[];
  confidenceScore: number;
  userProfile: UserProfile;
}

interface PersonalizedInsight {
  category: string;
  strength: number;
  description: string;
  careerAlignment: number;
  nextSteps: string[];
}

export function AIQuizGenerator({ userProfile, onQuizComplete }: AIQuizGeneratorProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isGenerating, setIsGenerating] = useState(true);
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes for personalized quiz
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    generatePersonalizedQuiz();
  }, [userProfile]);

  useEffect(() => {
    if (quizStarted && timeLeft > 0 && currentQuestion < questions.length) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, quizStarted, currentQuestion, questions.length]);

  const generatePersonalizedQuiz = async () => {
    setIsGenerating(true);
    
    // Simulate AI quiz generation based on user profile
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const personalizedQuestions = createPersonalizedQuestions(userProfile);
    setQuestions(personalizedQuestions);
    setIsGenerating(false);
    toast.success('Your personalized quiz has been generated!');
  };

  const createPersonalizedQuestions = (profile: UserProfile): QuizQuestion[] => {
    const baseQuestions: Omit<QuizQuestion, 'id'>[] = [];
    
    // Generate questions based on user interests
    profile.interests.forEach((interest, index) => {
      baseQuestions.push(...generateQuestionsForInterest(interest, profile));
    });

    // Add adaptive questions based on education level
    baseQuestions.push(...generateEducationLevelQuestions(profile));
    
    // Add age-appropriate questions
    baseQuestions.push(...generateAgeAppropriateQuestions(profile));
    
    // Add learning style specific questions
    baseQuestions.push(...generateLearningStyleQuestions(profile));

    // Shuffle and select optimal number of questions (15-20 based on complexity)
    const shuffled = baseQuestions.sort(() => Math.random() - 0.5);
    const optimalCount = profile.age < 18 ? 15 : 18;
    
    return shuffled.slice(0, optimalCount).map((q, index) => ({
      ...q,
      id: index + 1
    }));
  };

  const generateQuestionsForInterest = (interest: string, profile: UserProfile): Omit<QuizQuestion, 'id'>[] => {
    const interestQuestions: Record<string, Omit<QuizQuestion, 'id'>[]> = {
      technology: [
        {
          question: "I feel excited when learning about new programming languages or software tools",
          category: "logical-tech",
          relevantInterests: ["technology"],
          adaptiveLevel: profile.age > 20 ? "advanced" : "intermediate",
          contextualWeight: 1.3,
          options: [
            { value: "strongly_agree", label: "Absolutely! I love exploring new tech", score: 5 },
            { value: "agree", label: "Yes, it's interesting", score: 4 },
            { value: "neutral", label: "Sometimes", score: 3 },
            { value: "disagree", label: "Not really", score: 2 },
            { value: "strongly_disagree", label: "It feels overwhelming", score: 1 }
          ]
        },
        {
          question: "When facing a technical problem, I prefer to debug it step-by-step rather than ask for help immediately",
          category: "analytical-tech",
          relevantInterests: ["technology"],
          adaptiveLevel: "intermediate",
          contextualWeight: 1.2,
          options: [
            { value: "strongly_agree", label: "Always try myself first", score: 5 },
            { value: "agree", label: "Usually prefer self-solving", score: 4 },
            { value: "neutral", label: "Depends on the complexity", score: 3 },
            { value: "disagree", label: "Often seek help quickly", score: 2 },
            { value: "strongly_disagree", label: "Immediately ask for assistance", score: 1 }
          ]
        }
      ],
      science: [
        {
          question: "I enjoy conducting experiments and observing how variables affect outcomes",
          category: "scientific-research",
          relevantInterests: ["science"],
          adaptiveLevel: profile.educationLevel === "postgraduate" ? "advanced" : "intermediate",
          contextualWeight: 1.4,
          options: [
            { value: "strongly_agree", label: "Love experimental work", score: 5 },
            { value: "agree", label: "Enjoy it when I can", score: 4 },
            { value: "neutral", label: "It's okay", score: 3 },
            { value: "disagree", label: "Prefer theoretical work", score: 2 },
            { value: "strongly_disagree", label: "Don't enjoy experiments", score: 1 }
          ]
        }
      ],
      arts: [
        {
          question: "I often think of creative solutions that others might not consider",
          category: "creative-innovation",
          relevantInterests: ["arts"],
          adaptiveLevel: "intermediate",
          contextualWeight: 1.3,
          options: [
            { value: "strongly_agree", label: "I'm known for unique ideas", score: 5 },
            { value: "agree", label: "Often think differently", score: 4 },
            { value: "neutral", label: "Sometimes", score: 3 },
            { value: "disagree", label: "Prefer conventional approaches", score: 2 },
            { value: "strongly_disagree", label: "Stick to proven methods", score: 1 }
          ]
        }
      ],
      business: [
        {
          question: "I feel confident leading a team project and making strategic decisions",
          category: "leadership-business",
          relevantInterests: ["business"],
          adaptiveLevel: profile.age > 22 ? "advanced" : "intermediate",
          contextualWeight: 1.3,
          options: [
            { value: "strongly_agree", label: "Very confident in leadership", score: 5 },
            { value: "agree", label: "Comfortable leading", score: 4 },
            { value: "neutral", label: "Can lead when needed", score: 3 },
            { value: "disagree", label: "Prefer to follow", score: 2 },
            { value: "strongly_disagree", label: "Avoid leadership roles", score: 1 }
          ]
        }
      ],
      healthcare: [
        {
          question: "I feel fulfilled when helping others solve their problems or improve their well-being",
          category: "empathy-service",
          relevantInterests: ["healthcare"],
          adaptiveLevel: "intermediate",
          contextualWeight: 1.4,
          options: [
            { value: "strongly_agree", label: "It's deeply fulfilling", score: 5 },
            { value: "agree", label: "Yes, I enjoy helping", score: 4 },
            { value: "neutral", label: "It's fine", score: 3 },
            { value: "disagree", label: "Not particularly motivated", score: 2 },
            { value: "strongly_disagree", label: "Prefer other activities", score: 1 }
          ]
        }
      ],
      // Add more interest-based questions...
    };

    return interestQuestions[interest] || [];
  };

  const generateEducationLevelQuestions = (profile: UserProfile): Omit<QuizQuestion, 'id'>[] => {
    if (profile.educationLevel === 'class-10' || profile.educationLevel === 'class-12') {
      return [
        {
          question: "I'm excited about choosing subjects that will shape my future career",
          category: "future-planning",
          relevantInterests: profile.interests,
          adaptiveLevel: "basic",
          contextualWeight: 1.5,
          options: [
            { value: "strongly_agree", label: "Very excited about the future", score: 5 },
            { value: "agree", label: "Looking forward to it", score: 4 },
            { value: "neutral", label: "It's okay", score: 3 },
            { value: "disagree", label: "Feeling uncertain", score: 2 },
            { value: "strongly_disagree", label: "Worried about choices", score: 1 }
          ]
        }
      ];
    }
    
    return [
      {
        question: "I prefer working on long-term projects that require sustained focus and research",
        category: "project-management",
        relevantInterests: profile.interests,
        adaptiveLevel: "advanced",
        contextualWeight: 1.2,
        options: [
          { value: "strongly_agree", label: "Love deep, long-term work", score: 5 },
          { value: "agree", label: "Prefer substantial projects", score: 4 },
          { value: "neutral", label: "Both short and long work fine", score: 3 },
          { value: "disagree", label: "Prefer shorter tasks", score: 2 },
          { value: "strongly_disagree", label: "Avoid long commitments", score: 1 }
        ]
      }
    ];
  };

  const generateAgeAppropriateQuestions = (profile: UserProfile): Omit<QuizQuestion, 'id'>[] => {
    if (profile.age < 18) {
      return [
        {
          question: "I enjoy participating in group activities and collaborating with peers",
          category: "social-collaboration",
          relevantInterests: profile.interests,
          adaptiveLevel: "basic",
          contextualWeight: 1.1,
          options: [
            { value: "strongly_agree", label: "Love working with others", score: 5 },
            { value: "agree", label: "Enjoy group work", score: 4 },
            { value: "neutral", label: "It's fine", score: 3 },
            { value: "disagree", label: "Prefer working alone", score: 2 },
            { value: "strongly_disagree", label: "Avoid group activities", score: 1 }
          ]
        }
      ];
    }
    
    return [
      {
        question: "I can effectively balance multiple responsibilities and prioritize tasks",
        category: "time-management",
        relevantInterests: profile.interests,
        adaptiveLevel: "advanced",
        contextualWeight: 1.3,
        options: [
          { value: "strongly_agree", label: "Excellent at juggling tasks", score: 5 },
          { value: "agree", label: "Good at prioritizing", score: 4 },
          { value: "neutral", label: "Managing okay", score: 3 },
          { value: "disagree", label: "Sometimes struggle", score: 2 },
          { value: "strongly_disagree", label: "Often overwhelmed", score: 1 }
        ]
      }
    ];
  };

  const generateLearningStyleQuestions = (profile: UserProfile): Omit<QuizQuestion, 'id'>[] => {
    const styleQuestions: Record<string, Omit<QuizQuestion, 'id'>> = {
      visual: {
        question: "I understand concepts better when I can see diagrams, charts, or visual representations",
        category: "learning-visual",
        relevantInterests: profile.interests,
        adaptiveLevel: "intermediate",
        contextualWeight: 1.2,
        options: [
          { value: "strongly_agree", label: "Visual aids are essential", score: 5 },
          { value: "agree", label: "Very helpful", score: 4 },
          { value: "neutral", label: "Sometimes useful", score: 3 },
          { value: "disagree", label: "Not particularly helpful", score: 2 },
          { value: "strongly_disagree", label: "Prefer other methods", score: 1 }
        ]
      },
      kinesthetic: {
        question: "I learn best when I can practice hands-on activities and experiments",
        category: "learning-practical",
        relevantInterests: profile.interests,
        adaptiveLevel: "intermediate",
        contextualWeight: 1.2,
        options: [
          { value: "strongly_agree", label: "Must have hands-on experience", score: 5 },
          { value: "agree", label: "Very important", score: 4 },
          { value: "neutral", label: "Sometimes helpful", score: 3 },
          { value: "disagree", label: "Not necessary", score: 2 },
          { value: "strongly_disagree", label: "Prefer theoretical learning", score: 1 }
        ]
      }
    };

    return profile.preferredLearningStyle && styleQuestions[profile.preferredLearningStyle] 
      ? [styleQuestions[profile.preferredLearningStyle]]
      : [];
  };

  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    const results = calculatePersonalizedResults();
    onQuizComplete(results);
    toast.success('Quiz completed! Generating your personalized recommendations...');
  };

  const calculatePersonalizedResults = (): AptitudeResults => {
    const categoryScores: Record<string, number> = {};
    const categoryWeights: Record<string, number> = {};
    
    questions.forEach(question => {
      const answer = answers[question.id];
      if (answer) {
        const option = question.options.find(opt => opt.value === answer);
        if (option) {
          const score = option.score * question.contextualWeight;
          categoryScores[question.category] = (categoryScores[question.category] || 0) + score;
          categoryWeights[question.category] = (categoryWeights[question.category] || 0) + question.contextualWeight;
        }
      }
    });

    // Normalize scores
    Object.keys(categoryScores).forEach(category => {
      categoryScores[category] = Math.round((categoryScores[category] / categoryWeights[category]) * 20);
    });

    const personalizedInsights = generatePersonalizedInsights(categoryScores, userProfile);
    const recommendedPaths = generateRecommendedPaths(categoryScores, userProfile);
    const confidenceScore = calculateConfidenceScore(categoryScores, userProfile);

    return {
      categoryScores,
      personalizedInsights,
      recommendedPaths,
      confidenceScore,
      userProfile
    };
  };

  const generatePersonalizedInsights = (scores: Record<string, number>, profile: UserProfile): PersonalizedInsight[] => {
    // This would use AI/ML algorithms to generate personalized insights
    const insights: PersonalizedInsight[] = [];
    
    Object.entries(scores).forEach(([category, score]) => {
      const strength = Math.min(score * 5, 100);
      const careerAlignment = calculateCareerAlignment(category, profile);
      
      insights.push({
        category,
        strength,
        description: generateInsightDescription(category, strength, profile),
        careerAlignment,
        nextSteps: generateNextSteps(category, profile)
      });
    });

    return insights.sort((a, b) => b.strength - a.strength);
  };

  const generateRecommendedPaths = (scores: Record<string, number>, profile: UserProfile): string[] => {
    // AI-powered path recommendation based on scores and profile
    const paths: string[] = [];
    
    // Logic to recommend paths based on combined scores, interests, and goals
    const topCategories = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    topCategories.forEach(category => {
      paths.push(...getCategoryPaths(category, profile));
    });

    return [...new Set(paths)]; // Remove duplicates
  };

  const calculateConfidenceScore = (scores: Record<string, number>, profile: UserProfile): number => {
    const totalAnswered = Object.keys(answers).length;
    const completionRate = totalAnswered / questions.length;
    const scoreVariance = calculateScoreVariance(scores);
    const profileCompleteness = calculateProfileCompleteness(profile);
    
    return Math.round((completionRate * 0.4 + scoreVariance * 0.3 + profileCompleteness * 0.3) * 100);
  };

  // Helper functions
  const generateInsightDescription = (category: string, strength: number, profile: UserProfile): string => {
    // AI-generated descriptions based on category and user profile
    const descriptions: Record<string, string> = {
      'logical-tech': `Your logical-technical thinking shows ${strength}% strength, indicating strong problem-solving abilities in technology.`,
      'creative-innovation': `Your creative innovation score of ${strength}% suggests you excel at thinking outside the box.`,
      'leadership-business': `With ${strength}% in leadership-business, you show strong potential for management roles.`,
    };
    
    return descriptions[category] || `Your ${category} abilities show ${strength}% strength.`;
  };

  const generateNextSteps = (category: string, profile: UserProfile): string[] => {
    // AI-generated next steps based on category and profile
    return [
      `Explore advanced courses in ${category}`,
      `Connect with professionals in this field`,
      `Take on projects to build practical experience`
    ];
  };

  const calculateCareerAlignment = (category: string, profile: UserProfile): number => {
    // Calculate how well this category aligns with user's career goals
    return Math.round(Math.random() * 40 + 60); // Placeholder - would use ML
  };

  const getCategoryPaths = (category: string, profile: UserProfile): string[] => {
    // Get recommended paths for a category
    const pathMapping: Record<string, string[]> = {
      'logical-tech': ['Computer Science', 'Software Engineering', 'Data Science'],
      'creative-innovation': ['Design', 'Media Arts', 'Innovation Management'],
      'leadership-business': ['Business Administration', 'Management', 'Entrepreneurship'],
    };
    
    return pathMapping[category] || [];
  };

  const calculateScoreVariance = (scores: Record<string, number>): number => {
    const values = Object.values(scores);
    const max = Math.max(...values);
    const min = Math.min(...values);
    return (max - min) / 100;
  };

  const calculateProfileCompleteness = (profile: UserProfile): number => {
    let completeness = 0;
    if (profile.age) completeness += 0.2;
    if (profile.educationLevel) completeness += 0.2;
    if (profile.interests.length > 0) completeness += 0.3;
    if (profile.careerGoals) completeness += 0.15;
    if (profile.preferredLearningStyle) completeness += 0.15;
    
    return completeness;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isGenerating) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="text-center">
          <CardContent className="pt-8 pb-8">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Generating Your Personalized Quiz</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Our AI is analyzing your profile and creating questions tailored specifically for you...
              </p>
              <div className="flex items-center justify-center space-x-2">
                <Sparkles className="h-4 w-4 text-blue-500 animate-pulse" />
                <span className="text-sm">Analyzing interests...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
              <Target className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-2xl">Your Personalized Quiz is Ready!</CardTitle>
            <CardDescription className="text-lg">
              We've created {questions.length} custom questions based on your interests and goals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                <Zap className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="font-semibold">AI-Powered</div>
                <div className="text-sm text-muted-foreground">Questions tailored to you</div>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                <Clock className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <div className="font-semibold">{formatTime(timeLeft)}</div>
                <div className="text-sm text-muted-foreground">Time to complete</div>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                <Brain className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <div className="font-semibold">{questions.length} Questions</div>
                <div className="text-sm text-muted-foreground">Adaptive difficulty</div>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Your Quiz Includes:</h4>
              <ul className="text-sm space-y-1">
                <li>• Questions based on your interests: {userProfile.interests.slice(0, 3).join(', ')}</li>
                <li>• Adaptive difficulty for your education level</li>
                <li>• Learning style specific scenarios</li>
                <li>• Career goal alignment questions</li>
              </ul>
            </div>

            <Button onClick={() => setQuizStarted(true)} className="w-full" size="lg">
              Start Your Personalized Quiz
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI-Powered Aptitude Assessment
              </CardTitle>
              <CardDescription>
                Question {currentQuestion + 1} of {questions.length} • 
                Tailored for {userProfile.interests.slice(0, 2).join(' & ')}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {formatTime(timeLeft)}
            </div>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
      </Card>

      {/* Question */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="text-xs">
              {question.category} • {question.adaptiveLevel}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Weight: {question.contextualWeight}x
            </Badge>
          </div>
          <CardTitle className="text-xl">
            {question.question}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={answers[question.id] || ""}
            onValueChange={(value) => handleAnswer(question.id, value)}
            className="space-y-3"
          >
            {question.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevQuestion}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>
        
        <div className="flex gap-2">
          <Button
            onClick={nextQuestion}
            disabled={!answers[question.id]}
          >
            {currentQuestion === questions.length - 1 ? 'Complete Quiz' : 'Next'}
          </Button>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="flex justify-center space-x-2">
        {questions.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full ${
              index === currentQuestion
                ? 'bg-primary'
                : answers[questions[index].id]
                ? 'bg-green-500'
                : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
}