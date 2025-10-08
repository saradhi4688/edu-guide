// QuizWeaver - Adaptive AI Quiz Generator with ML-based Logic
// This module implements machine learning-inspired algorithms for personalized quiz generation

export interface QuizWeaverProfile {
  name: string;
  age: number;
  interests: string[];
  goal: string;
  preferred_difficulty?: 'easy' | 'moderate' | 'hard';
}

export interface QuizWeaverQuestion {
  question: string;
  options: string[];
  correct_answer?: number;
  difficulty: 'easy' | 'moderate' | 'hard';
  hint: string;
  type: 'mcq' | 'scenario' | 'reasoning';
  category?: string;
}

export interface QuizWeaverOutput {
  user_name: string;
  quiz_title: string;
  questions: QuizWeaverQuestion[];
  metadata?: {
    clusters_used: string[];
    difficulty_progression: string[];
    ml_confidence: number;
  };
}

// Interest clustering based on K-Means inspired grouping
const INTEREST_CLUSTERS = {
  'STEM': {
    keywords: ['space', 'space exploration', 'astronomy', 'physics', 'chemistry', 'mathematics', 'AI', 'artificial intelligence', 
                'machine learning', 'robotics', 'programming', 'coding', 'data science', 'engineering', 'technology', 'computer'],
    topics: ['scientific method', 'problem solving', 'analytical thinking', 'innovation']
  },
  'Creative': {
    keywords: ['art', 'music', 'writing', 'design', 'photography', 'film', 'theater', 'dance', 'creative writing', 'painting'],
    topics: ['creative expression', 'imagination', 'aesthetic sense', 'storytelling']
  },
  'Humanities': {
    keywords: ['history', 'philosophy', 'literature', 'languages', 'culture', 'anthropology', 'sociology', 'psychology'],
    topics: ['critical thinking', 'cultural awareness', 'human behavior', 'social dynamics']
  },
  'Nature': {
    keywords: ['animals', 'environment', 'biology', 'ecology', 'conservation', 'wildlife', 'plants', 'nature', 'zoology'],
    topics: ['environmental awareness', 'life sciences', 'ecosystems', 'sustainability']
  },
  'Business': {
    keywords: ['business', 'entrepreneurship', 'finance', 'marketing', 'economics', 'management', 'leadership', 'startup'],
    topics: ['strategic thinking', 'decision making', 'resource management', 'innovation']
  },
  'Sports': {
    keywords: ['sports', 'fitness', 'athletics', 'games', 'physical education', 'health', 'exercise', 'competition'],
    topics: ['teamwork', 'discipline', 'physical wellness', 'competitive spirit']
  }
};

// Question bank with adaptive content
const QUESTION_BANK = {
  'space exploration': {
    easy: [
      {
        question: "Which planet is known as the Red Planet?",
        options: ["Earth", "Mars", "Venus", "Jupiter"],
        correct_answer: 1,
        hint: "It's the planet with dusty red soil!",
        type: 'mcq' as const
      },
      {
        question: "What do astronauts wear in space?",
        options: ["Regular clothes", "Space suits", "Swimming suits", "Winter coats"],
        correct_answer: 1,
        hint: "They need special protection from space!",
        type: 'mcq' as const
      }
    ],
    moderate: [
      {
        question: "What causes Mars to appear red from Earth?",
        options: ["Red gases in atmosphere", "Iron oxide on surface", "Distance from sun", "Reflection from moons"],
        correct_answer: 1,
        hint: "Think about rust and iron!",
        type: 'mcq' as const
      },
      {
        question: "If you were designing a space station, what would be your top priority?",
        options: ["Entertainment systems", "Life support systems", "Communication devices", "Navigation tools"],
        correct_answer: 1,
        hint: "What do humans need to survive?",
        type: 'scenario' as const
      }
    ],
    hard: [
      {
        question: "How does orbital mechanics affect spacecraft trajectory planning?",
        options: ["Gravity assists save fuel", "Random paths work best", "Straight lines are optimal", "Speed doesn't matter"],
        correct_answer: 0,
        hint: "Consider how planets' gravity can help spacecraft",
        type: 'reasoning' as const
      }
    ]
  },
  'AI': {
    easy: [
      {
        question: "What helps a computer learn from examples?",
        options: ["Random guessing", "Training data", "Sleeping mode", "Screen brightness"],
        correct_answer: 1,
        hint: "Think about how you learn with a teacher's help",
        type: 'mcq' as const
      }
    ],
    moderate: [
      {
        question: "What does supervised learning require?",
        options: ["Unlabeled data", "Labeled data", "Random data", "No data"],
        correct_answer: 1,
        hint: "Think of how a teacher provides examples with answers",
        type: 'reasoning' as const
      },
      {
        question: "You're training an AI to recognize cats. What's most important?",
        options: ["Computer speed", "Many cat pictures with labels", "Expensive hardware", "Complex algorithms only"],
        correct_answer: 1,
        hint: "AI learns from examples!",
        type: 'scenario' as const
      }
    ],
    hard: [
      {
        question: "How do neural networks optimize their weights during backpropagation?",
        options: ["Gradient descent", "Random updates", "Fixed values", "User input"],
        correct_answer: 0,
        hint: "Think about minimizing error systematically",
        type: 'reasoning' as const
      }
    ]
  },
  'history': {
    easy: [
      {
        question: "Why do we study events from the past?",
        options: ["To memorize dates", "To learn from mistakes and successes", "Just for tests", "No real reason"],
        correct_answer: 1,
        hint: "Think about learning from experiences",
        type: 'reasoning' as const
      }
    ],
    moderate: [
      {
        question: "How does understanding historical patterns help predict future trends?",
        options: ["History repeats exactly", "Patterns show recurring themes", "It doesn't help", "Only dates matter"],
        correct_answer: 1,
        hint: "Consider how similar situations often have similar outcomes",
        type: 'reasoning' as const
      }
    ],
    hard: [
      {
        question: "How did the Industrial Revolution's technological changes mirror today's digital transformation?",
        options: ["Both disrupted traditional jobs", "No similarities exist", "Only affected cities", "Changes were slower then"],
        correct_answer: 0,
        hint: "Think about societal transformation through technology",
        type: 'reasoning' as const
      }
    ]
  },
  'animals': {
    easy: [
      {
        question: "Which animal is the largest mammal on Earth?",
        options: ["Elephant", "Blue Whale", "Giraffe", "Dinosaur"],
        correct_answer: 1,
        hint: "It lives in the ocean!",
        type: 'mcq' as const
      },
      {
        question: "What do pandas mainly eat?",
        options: ["Fish", "Bamboo", "Meat", "Fruits"],
        correct_answer: 1,
        hint: "It's a type of grass that grows tall!",
        type: 'mcq' as const
      }
    ],
    moderate: [
      {
        question: "How do dolphins use echolocation?",
        options: ["To see colors", "To navigate and hunt", "To stay warm", "To communicate only"],
        correct_answer: 1,
        hint: "Think about sound waves bouncing back",
        type: 'reasoning' as const
      }
    ],
    hard: [
      {
        question: "How does convergent evolution explain similar traits in unrelated species?",
        options: ["Similar environments create similar adaptations", "All animals are related", "Random chance", "Human intervention"],
        correct_answer: 0,
        hint: "Environment shapes evolution similarly",
        type: 'reasoning' as const
      }
    ]
  },
  'data science': {
    moderate: [
      {
        question: "What's the main purpose of data cleaning?",
        options: ["Make data look nice", "Remove errors and inconsistencies", "Delete all data", "Add more data"],
        correct_answer: 1,
        hint: "Quality matters more than quantity",
        type: 'mcq' as const
      }
    ],
    hard: [
      {
        question: "When would you use regularization in machine learning?",
        options: ["To prevent overfitting", "To speed up training", "To add more features", "To remove all features"],
        correct_answer: 0,
        hint: "Think about model generalization",
        type: 'reasoning' as const
      }
    ]
  }
};

// ML-inspired clustering function
function clusterInterests(interests: string[]): Map<string, string[]> {
  const clusters = new Map<string, string[]>();
  
  interests.forEach(interest => {
    const interestLower = interest.toLowerCase();
    let assigned = false;
    
    for (const [clusterName, clusterData] of Object.entries(INTEREST_CLUSTERS)) {
      if (clusterData.keywords.some(keyword => 
        interestLower.includes(keyword.toLowerCase()) || 
        keyword.toLowerCase().includes(interestLower)
      )) {
        if (!clusters.has(clusterName)) {
          clusters.set(clusterName, []);
        }
        clusters.get(clusterName)!.push(interest);
        assigned = true;
        break;
      }
    }
    
    // If not clustered, create individual cluster
    if (!assigned) {
      clusters.set(interest, [interest]);
    }
  });
  
  return clusters;
}

// Calculate semantic similarity (simplified cosine similarity)
function calculateSimilarity(q1: QuizWeaverQuestion, q2: QuizWeaverQuestion): number {
  const words1 = new Set(q1.question.toLowerCase().split(/\s+/));
  const words2 = new Set(q2.question.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

// Apply diversity filter
function applyDiversityFilter(questions: QuizWeaverQuestion[], threshold: number = 0.75): QuizWeaverQuestion[] {
  const filtered: QuizWeaverQuestion[] = [];
  
  questions.forEach(q => {
    const isTooSimilar = filtered.some(f => calculateSimilarity(q, f) > threshold);
    if (!isTooSimilar) {
      filtered.push(q);
    }
  });
  
  return filtered;
}

// Difficulty regression based on age and goal
function adjustDifficulty(baseLevel: string, age: number, goal: string): 'easy' | 'moderate' | 'hard' {
  // Regression formula: difficulty = base + age_factor + goal_factor
  let score = baseLevel === 'easy' ? 0 : baseLevel === 'moderate' ? 1 : 2;
  
  // Age factor
  if (age < 10) score -= 0.5;
  else if (age < 14) score -= 0.3;
  else if (age > 18 && age < 25) score += 0.2;
  else if (age >= 25) score += 0.3;
  
  // Goal factor
  if (goal.includes('fun') || goal.includes('basic')) score -= 0.3;
  if (goal.includes('career') || goal.includes('advanced')) score += 0.3;
  
  // Clamp to valid range
  score = Math.max(0, Math.min(2, Math.round(score)));
  
  return score === 0 ? 'easy' : score === 1 ? 'moderate' : 'hard';
}

// NLP-inspired simplification
function simplifyQuestion(question: string, age: number): string {
  if (age >= 18) return question;
  
  let simplified = question
    .replace(/utilize/gi, 'use')
    .replace(/implement/gi, 'make')
    .replace(/optimize/gi, 'improve')
    .replace(/analyze/gi, 'look at')
    .replace(/evaluate/gi, 'check')
    .replace(/demonstrate/gi, 'show')
    .replace(/significant/gi, 'important')
    .replace(/approximately/gi, 'about')
    .replace(/contribute to/gi, 'help')
    .replace(/effectively/gi, '')
    .replace(/distinctive/gi, 'special')
    .replace(/atmospheric/gi, 'air')
    .replace(/psychological/gi, 'mental')
    .replace(/efficiency/gi, 'working well')
    .replace(/oxidation/gi, 'rusting');
  
  return simplified;
}

// Main quiz generation function
export function generateQuizWeaver(profile: QuizWeaverProfile): QuizWeaverOutput {
  const questions: QuizWeaverQuestion[] = [];
  const clusters = clusterInterests(profile.interests);
  const difficultyProgression: string[] = [];
  
  // Step 1: Generate questions for each cluster
  clusters.forEach((interests, clusterName) => {
    interests.forEach(interest => {
      const interestKey = interest.toLowerCase().replace(/\s+/g, ' ');
      
      // Find matching questions in bank
      for (const [topic, questionSet] of Object.entries(QUESTION_BANK)) {
        if (interestKey.includes(topic.toLowerCase()) || topic.toLowerCase().includes(interestKey)) {
          // Determine target difficulty
          const targetDifficulty = profile.preferred_difficulty || 
            (profile.age < 14 ? 'easy' : profile.age < 20 ? 'moderate' : 'hard');
          
          // Get questions from appropriate difficulty level
          const availableQuestions = (questionSet as any)[targetDifficulty] || (questionSet as any).moderate || (questionSet as any).easy || [];
          
          availableQuestions.forEach(q => {
            const adjustedDifficulty = adjustDifficulty(
              targetDifficulty,
              profile.age,
              profile.goal
            );
            
            questions.push({
              ...q,
              question: simplifyQuestion(q.question, profile.age),
              difficulty: adjustedDifficulty,
              category: topic
            });
          });
          
          break; // Found matching topic, move to next interest
        }
      }
    });
  });
  
  // Step 2: Apply diversity filter
  const diverseQuestions = applyDiversityFilter(questions, 0.75);
  
  // Step 3: Arrange by progressive difficulty
  const easyQuestions = diverseQuestions.filter(q => q.difficulty === 'easy');
  const moderateQuestions = diverseQuestions.filter(q => q.difficulty === 'moderate');
  const hardQuestions = diverseQuestions.filter(q => q.difficulty === 'hard');
  
  const finalQuestions: QuizWeaverQuestion[] = [];
  
  // Progressive difficulty: start easy, build up
  if (easyQuestions.length > 0) {
    finalQuestions.push(easyQuestions[0]);
    difficultyProgression.push('easy');
  }
  
  if (easyQuestions.length > 1) {
    finalQuestions.push(easyQuestions[1]);
    difficultyProgression.push('easy');
  }
  
  if (moderateQuestions.length > 0) {
    finalQuestions.push(moderateQuestions[0]);
    difficultyProgression.push('moderate');
  }
  
  if (moderateQuestions.length > 1) {
    finalQuestions.push(moderateQuestions[1]);
    difficultyProgression.push('moderate');
  }
  
  if (hardQuestions.length > 0) {
    finalQuestions.push(hardQuestions[0]);
    difficultyProgression.push('hard');
  }
  
  // Ensure we have exactly 5 questions
  while (finalQuestions.length < 5) {
    const remaining = [...easyQuestions, ...moderateQuestions, ...hardQuestions]
      .filter(q => !finalQuestions.includes(q));
    
    if (remaining.length > 0) {
      const nextQuestion = remaining[0];
      finalQuestions.push(nextQuestion);
      difficultyProgression.push(nextQuestion.difficulty);
    } else {
      // Generate a fallback question if needed
      finalQuestions.push({
        question: profile.age < 14 
          ? "What subject do you enjoy learning about most?"
          : "How do you prefer to learn new concepts?",
        options: profile.age < 14
          ? ["Reading books", "Watching videos", "Doing experiments", "Group discussions"]
          : ["Self-study", "Structured courses", "Practical application", "Peer learning"],
        correct_answer: 0,
        difficulty: 'easy',
        hint: "Think about your learning style!",
        type: 'mcq',
        category: 'general'
      });
      difficultyProgression.push('easy');
    }
  }
  
  // Limit to 5 questions as per requirements
  const quiz = finalQuestions.slice(0, 5);
  
  // Generate quiz title
  const title = `Exploring ${profile.interests.slice(0, 2).join(', ')}${profile.interests.length > 2 ? ' and more' : ''}!`;
  
  return {
    user_name: profile.name,
    quiz_title: title,
    questions: quiz,
    metadata: {
      clusters_used: Array.from(clusters.keys()),
      difficulty_progression: difficultyProgression.slice(0, 5),
      ml_confidence: 0.85 + Math.random() * 0.15 // Simulated confidence score
    }
  };
}

// Export additional utilities for integration
export function formatQuizForDisplay(quiz: QuizWeaverOutput): string {
  let output = `Quiz for ${quiz.user_name}: ${quiz.quiz_title}\n\n`;
  
  quiz.questions.forEach((q, index) => {
    output += `Question ${index + 1} (${q.difficulty}):\n`;
    output += `${q.question}\n`;
    q.options.forEach((opt, i) => {
      output += `  ${String.fromCharCode(65 + i)}) ${opt}\n`;
    });
    output += `Hint: ${q.hint}\n\n`;
  });
  
  return output;
}

// Example usage function
export function createExampleQuiz(): QuizWeaverOutput {
  const exampleProfile: QuizWeaverProfile = {
    name: "Aarav",
    age: 16,
    interests: ["space exploration", "AI", "history"],
    goal: "learn new concepts",
    preferred_difficulty: "moderate"
  };
  
  return generateQuizWeaver(exampleProfile);
}
