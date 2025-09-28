import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Lightbulb, 
  TrendingUp, 
  Award,
  RefreshCw,
  Target
} from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: 'streams' | 'colleges' | 'careers' | 'misconceptions';
}

interface QuizResult {
  score: number;
  totalQuestions: number;
  categoryScores: Record<string, { correct: number; total: number }>;
  recommendations: string[];
}

export function AwarenessQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  const questions: QuizQuestion[] = [
    {
      id: 'q1',
      question: 'Which stream has the highest number of government job opportunities?',
      options: ['Only Science', 'Only Commerce', 'Only Arts', 'All streams have significant opportunities'],
      correctAnswer: 3,
      explanation: 'All streams offer substantial government job opportunities. Arts leads in civil services, Commerce in banking/finance, and Science in technical roles.',
      category: 'streams'
    },
    {
      id: 'q2',
      question: 'What percentage of top-ranked colleges in India are government institutions?',
      options: ['30%', '50%', '70%', '90%'],
      correctAnswer: 2,
      explanation: '70% of top-ranked colleges in NIRF rankings are government institutions, offering quality education at affordable costs.',
      category: 'colleges'
    },
    {
      id: 'q3',
      question: 'Which career path is NOT possible with an Arts background?',
      options: ['IAS Officer', 'Journalist', 'HR Manager', 'None - all are possible'],
      correctAnswer: 3,
      explanation: 'Arts graduates can pursue all these careers. Many successful professionals in these fields have Arts backgrounds.',
      category: 'careers'
    },
    {
      id: 'q4',
      question: 'What is the primary advantage of graduation over short-term skill courses?',
      options: ['Higher immediate salary', 'Government job eligibility', 'Easier to complete', 'Less competition'],
      correctAnswer: 1,
      explanation: 'Graduation is mandatory for 90% of government jobs and provides foundational knowledge for long-term career growth.',
      category: 'misconceptions'
    },
    {
      id: 'q5',
      question: 'Which factor is MOST important for career success?',
      options: ['Stream chosen in 12th', 'College brand name', 'Skills and continuous learning', 'Family connections'],
      correctAnswer: 2,
      explanation: 'While stream and college matter, continuous skill development and learning are the biggest predictors of career success.',
      category: 'careers'
    },
    {
      id: 'q6',
      question: 'Government colleges typically offer:',
      options: ['Lower quality education', 'Limited career prospects', 'Affordable quality education', 'Only traditional subjects'],
      correctAnswer: 2,
      explanation: 'Government colleges offer high-quality education at affordable costs with excellent faculty and infrastructure.',
      category: 'colleges'
    },
    {
      id: 'q7',
      question: 'Commerce students can pursue careers in:',
      options: ['Only accounting and banking', 'Business and finance only', 'Traditional commerce fields', 'Technology, consulting, entrepreneurship and more'],
      correctAnswer: 3,
      explanation: 'Commerce background opens doors to diverse fields including tech consulting, digital marketing, fintech, and entrepreneurship.',
      category: 'streams'
    },
    {
      id: 'q8',
      question: 'The biggest barrier to student success in government colleges is:',
      options: ['Poor infrastructure', 'Lack of faculty', 'Student awareness and motivation', 'Limited resources'],
      correctAnswer: 2,
      explanation: 'Most government colleges have good infrastructure and faculty. Student awareness about opportunities and self-motivation are key success factors.',
      category: 'misconceptions'
    }
  ];

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowResults(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResults();
    }
  };

  const calculateResults = () => {
    const categoryScores: Record<string, { correct: number; total: number }> = {
      streams: { correct: 0, total: 0 },
      colleges: { correct: 0, total: 0 },
      careers: { correct: 0, total: 0 },
      misconceptions: { correct: 0, total: 0 }
    };

    let totalCorrect = 0;

    questions.forEach((question, index) => {
      const category = question.category;
      categoryScores[category].total++;
      
      if (selectedAnswers[index] === question.correctAnswer) {
        totalCorrect++;
        categoryScores[category].correct++;
      }
    });

    const recommendations = generateRecommendations(categoryScores, totalCorrect);
    setShowResults(true);
  };

  const generateRecommendations = (
    categoryScores: Record<string, { correct: number; total: number }>,
    totalScore: number
  ): string[] => {
    const recommendations: string[] = [];
    const percentage = (totalScore / questions.length) * 100;

    if (percentage >= 80) {
      recommendations.push("Excellent! You have a solid understanding of educational pathways.");
    } else if (percentage >= 60) {
      recommendations.push("Good knowledge! Review the areas where you missed questions.");
    } else {
      recommendations.push("Consider reviewing the Educational Awareness Center modules for better understanding.");
    }

    // Category-specific recommendations
    Object.entries(categoryScores).forEach(([category, scores]) => {
      const categoryPercentage = (scores.correct / scores.total) * 100;
      if (categoryPercentage < 60) {
        switch (category) {
          case 'streams':
            recommendations.push("Explore the Stream Pathways section to understand different academic options.");
            break;
          case 'colleges':
            recommendations.push("Learn more about government colleges and their quality in our College section.");
            break;
          case 'careers':
            recommendations.push("Check out Career Paths to discover opportunities in different fields.");
            break;
          case 'misconceptions':
            recommendations.push("Review the Myth Busters section to clear common misconceptions.");
            break;
        }
      }
    });

    return recommendations;
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowResults(false);
  };

  if (!quizStarted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Lightbulb className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Educational Awareness Quiz</CardTitle>
            <CardDescription className="text-lg">
              Test your knowledge about streams, colleges, and career opportunities. 
              Discover what you know and what you might need to learn!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="text-center p-4 border rounded-lg">
                <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
                <h4>8 Questions</h4>
                <p className="text-sm text-muted-foreground">Covering all key topics</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Award className="h-6 w-6 mx-auto mb-2 text-primary" />
                <h4>Personalized Results</h4>
                <p className="text-sm text-muted-foreground">Get custom recommendations</p>
              </div>
            </div>
            
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                This quiz will help identify gaps in your knowledge and guide you to the right resources 
                for making informed educational decisions.
              </AlertDescription>
            </Alert>
            
            <Button onClick={handleStartQuiz} size="lg" className="w-full">
              Start Quiz
              <Target className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults) {
    const totalCorrect = selectedAnswers.filter((answer, index) => answer === questions[index].correctAnswer).length;
    const categoryScores: Record<string, { correct: number; total: number }> = {
      streams: { correct: 0, total: 0 },
      colleges: { correct: 0, total: 0 },
      careers: { correct: 0, total: 0 },
      misconceptions: { correct: 0, total: 0 }
    };

    questions.forEach((question, index) => {
      const category = question.category;
      categoryScores[category].total++;
      if (selectedAnswers[index] === question.correctAnswer) {
        categoryScores[category].correct++;
      }
    });

    const recommendations = generateRecommendations(categoryScores, totalCorrect);

    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Quiz Results</CardTitle>
            <CardDescription>
              Here's how you performed and what you should focus on next
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                <span className={getScoreColor(totalCorrect, questions.length)}>
                  {totalCorrect}/{questions.length}
                </span>
              </div>
              <p className="text-lg text-muted-foreground">
                {Math.round((totalCorrect / questions.length) * 100)}% Correct
              </p>
              <Progress 
                value={(totalCorrect / questions.length) * 100} 
                className="w-full max-w-md mx-auto mt-4"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(categoryScores).map(([category, scores]) => (
                <div key={category} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="capitalize">{category.replace('misconceptions', 'myth-busting')}</h4>
                    <Badge variant={scores.correct / scores.total >= 0.6 ? 'default' : 'destructive'}>
                      {scores.correct}/{scores.total}
                    </Badge>
                  </div>
                  <Progress value={(scores.correct / scores.total) * 100} className="h-2" />
                </div>
              ))}
            </div>

            <div>
              <h3 className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5" />
                Personalized Recommendations
              </h3>
              <div className="space-y-3">
                {recommendations.map((rec, index) => (
                  <Alert key={index}>
                    <Lightbulb className="h-4 w-4" />
                    <AlertDescription>{rec}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={resetQuiz} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retake Quiz
              </Button>
              <Button onClick={() => window.location.href = '/awareness'}>
                Explore Learning Resources
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Review Your Answers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    {selectedAnswers[index] === question.correctAnswer ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <h4 className="mb-2">{question.question}</h4>
                      <div className="space-y-1 text-sm">
                        <div className="text-green-600">
                          ✓ Correct: {question.options[question.correctAnswer]}
                        </div>
                        {selectedAnswers[index] !== question.correctAnswer && (
                          <div className="text-red-600">
                            ✗ Your answer: {question.options[selectedAnswers[index]]}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Alert>
                    <Lightbulb className="h-4 w-4" />
                    <AlertDescription>{question.explanation}</AlertDescription>
                  </Alert>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline">
              Question {currentQuestion + 1} of {questions.length}
            </Badge>
            <Badge className="capitalize">{question.category}</Badge>
          </div>
          <Progress value={progress} className="mb-4" />
          <CardTitle className="text-xl">{question.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <Button
                key={index}
                variant={selectedAnswers[currentQuestion] === index ? 'default' : 'outline'}
                className="w-full justify-start text-left h-auto p-4"
                onClick={() => handleAnswerSelect(index)}
              >
                <span className="mr-3 w-6 h-6 rounded-full border flex items-center justify-center text-sm">
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
              </Button>
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <Button 
              variant="outline" 
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            <Button 
              onClick={handleNextQuestion}
              disabled={selectedAnswers[currentQuestion] === undefined}
            >
              {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}