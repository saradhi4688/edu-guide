import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Brain, Sparkles, TrendingUp, Lightbulb, Code, FileJson, Play, RefreshCw } from 'lucide-react';
import { generateQuizWeaver, QuizWeaverProfile, QuizWeaverOutput, formatQuizForDisplay } from '../utils/quizWeaver';
import { toast } from 'sonner';

export function QuizWeaverDemo() {
  const [profile, setProfile] = useState<QuizWeaverProfile>({
    name: 'Aarav',
    age: 16,
    interests: ['space exploration', 'AI', 'history'],
    goal: 'learn new concepts',
    preferred_difficulty: 'moderate'
  });
  
  const [quizOutput, setQuizOutput] = useState<QuizWeaverOutput | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [interestsInput, setInterestsInput] = useState('space exploration, AI, history');

  const handleGenerateQuiz = async () => {
    setIsGenerating(true);
    
    // Parse interests from comma-separated input
    const interests = interestsInput.split(',').map(i => i.trim()).filter(Boolean);
    const updatedProfile = { ...profile, interests };
    
    // Simulate async generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const output = generateQuizWeaver(updatedProfile);
    setQuizOutput(output);
    setIsGenerating(false);
    
    toast.success(`Quiz generated for ${output.user_name} with ${output.questions.length} questions!`);
  };

  const exampleProfiles = [
    {
      name: 'Young Explorer',
      profile: {
        name: 'Riya',
        age: 10,
        interests: ['animals', 'space'],
        goal: 'fun learning',
        preferred_difficulty: 'easy' as const
      }
    },
    {
      name: 'Teen Innovator',
      profile: {
        name: 'Aarav',
        age: 16,
        interests: ['space exploration', 'AI', 'history'],
        goal: 'learn new concepts',
        preferred_difficulty: 'moderate' as const
      }
    },
    {
      name: 'Career Focused',
      profile: {
        name: 'Priya',
        age: 25,
        interests: ['AI', 'data science'],
        goal: 'career prep',
        preferred_difficulty: 'hard' as const
      }
    }
  ];

  const loadExample = (example: typeof exampleProfiles[0]) => {
    setProfile(example.profile);
    setInterestsInput(example.profile.interests.join(', '));
    toast.info(`Loaded ${example.name} profile`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
          <Brain className="h-10 w-10 text-purple-600" />
          QuizWeaver Demo
        </h1>
        <p className="text-lg text-muted-foreground">
          Adaptive AI Quiz Generator with ML-based Reasoning
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>User Profile Configuration</CardTitle>
            <CardDescription>
              Configure the user profile to generate personalized quizzes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Enter name"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Age</label>
              <Input
                type="number"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
                placeholder="Enter age"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Interests (comma-separated)</label>
              <Input
                value={interestsInput}
                onChange={(e) => setInterestsInput(e.target.value)}
                placeholder="e.g., space exploration, AI, history"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Learning Goal</label>
              <Input
                value={profile.goal}
                onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
                placeholder="e.g., learn new concepts, career prep"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Preferred Difficulty</label>
              <Select
                value={profile.preferred_difficulty}
                onValueChange={(value: 'easy' | 'moderate' | 'hard') => 
                  setProfile({ ...profile, preferred_difficulty: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2">
              <p className="text-sm font-medium mb-2">Quick Examples:</p>
              <div className="flex flex-wrap gap-2">
                {exampleProfiles.map((example, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => loadExample(example)}
                  >
                    {example.name}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerateQuiz}
              disabled={isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating Quiz...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Generate Quiz
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* ML Process Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>ML-Based Processing</CardTitle>
            <CardDescription>
              How QuizWeaver generates adaptive quizzes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium">K-Means Clustering</p>
                  <p className="text-sm text-muted-foreground">
                    Groups related interests to avoid repetitive questions
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium">Difficulty Regression</p>
                  <p className="text-sm text-muted-foreground">
                    Adjusts question difficulty based on age and experience
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium">Collaborative Filtering</p>
                  <p className="text-sm text-muted-foreground">
                    Prioritizes relevant topics with occasional new concepts
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold">4</span>
                </div>
                <div>
                  <p className="font-medium">NLP Simplification</p>
                  <p className="text-sm text-muted-foreground">
                    Rephrases complex questions for younger users
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold">5</span>
                </div>
                <div>
                  <p className="font-medium">Diversity Filter</p>
                  <p className="text-sm text-muted-foreground">
                    Ensures variety (cosine similarity {'<'} 0.75)
                  </p>
                </div>
              </div>
            </div>

            {quizOutput?.metadata && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium mb-2">Generation Metadata:</p>
                <div className="space-y-1 text-xs">
                  <p>Clusters: {quizOutput.metadata.clusters_used.join(', ')}</p>
                  <p>Difficulty: {quizOutput.metadata.difficulty_progression.join(' → ')}</p>
                  <p>ML Confidence: {(quizOutput.metadata.ml_confidence * 100).toFixed(1)}%</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Output Section */}
      {quizOutput && (
        <Card>
          <CardHeader>
            <CardTitle>{quizOutput.quiz_title}</CardTitle>
            <CardDescription>
              Generated quiz for {quizOutput.user_name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="visual" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="visual">Visual</TabsTrigger>
                <TabsTrigger value="json">JSON</TabsTrigger>
                <TabsTrigger value="text">Text</TabsTrigger>
              </TabsList>

              <TabsContent value="visual" className="space-y-4">
                {quizOutput.questions.map((q, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex gap-2">
                          <Badge variant="outline">Question {index + 1}</Badge>
                          <Badge 
                            variant={q.difficulty === 'easy' ? 'default' : 
                                    q.difficulty === 'hard' ? 'destructive' : 'secondary'}
                          >
                            {q.difficulty}
                          </Badge>
                          <Badge variant="outline">
                            {q.type === 'mcq' ? '📝 MCQ' : 
                             q.type === 'scenario' ? '🎭 Scenario' : '🤔 Reasoning'}
                          </Badge>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{q.question}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {q.options.map((option, i) => (
                          <div
                            key={i}
                            className={`p-2 rounded border ${
                              q.correct_answer === i 
                                ? 'border-green-500 bg-green-50 dark:bg-green-950' 
                                : 'border-gray-200'
                            }`}
                          >
                            <span className="font-medium">{String.fromCharCode(65 + i)})</span> {option}
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950 rounded flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5" />
                        <p className="text-sm">
                          <span className="font-medium">Hint:</span> {q.hint}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="json">
                <pre className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-x-auto text-xs">
                  {JSON.stringify(quizOutput, null, 2)}
                </pre>
              </TabsContent>

              <TabsContent value="text">
                <pre className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg whitespace-pre-wrap text-sm">
                  {formatQuizForDisplay(quizOutput)}
                </pre>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
