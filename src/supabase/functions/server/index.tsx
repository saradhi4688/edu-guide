import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use('*', logger(console.log));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Authentication middleware
async function requireAuth(c: any, next: any) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Authorization required' }, 401);
  }

  const token = authHeader.split(' ')[1];
  
  // Handle demo token and temporary tokens
  if (token === 'demo_token_123') {
    c.set('user', { id: 'demo_user_123', email: 'demo@eduguide.in' });
    await next();
    return;
  }
  
  // Handle temporary tokens (for development)
  if (token.startsWith('temp_token_')) {
    const userId = token.replace('temp_token_', '');
    c.set('user', { id: userId, email: 'temp@example.com' });
    await next();
    return;
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }
    
    c.set('user', user);
    await next();
  } catch (error) {
    console.log('Auth error:', error);
    return c.json({ error: 'Authentication failed' }, 401);
  }
}

// Auth routes
app.post('/make-server-f040132c/auth/signup', async (c) => {
  try {
    const { email, password, displayName } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { displayName },
      email_confirm: true
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Store user profile
    await kv.set(`user:${data.user.id}`, {
      uid: data.user.id,
      email: data.user.email,
      displayName,
      role: 'student',
      profileCompleted: false,
      locale: 'en',
      createdAt: new Date().toISOString()
    });

    // Create a session for the user
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email: data.user.email!,
      password
    });

    return c.json({
      user: data.user,
      access_token: sessionData?.properties?.access_token || 'temp_token_' + data.user.id
    });
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: 'Signup failed' }, 500);
  }
});

app.get('/make-server-f040132c/auth/me', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    let userData = await kv.get(`user:${user.id}`);
    
    // If user doesn't exist in KV store, create default profile
    if (!userData) {
      userData = {
        uid: user.id,
        email: user.email,
        displayName: user.user_metadata?.displayName || user.email?.split('@')[0] || 'User',
        role: 'student',
        profileCompleted: false,
        locale: 'en',
        createdAt: new Date().toISOString()
      };
      
      // Save to KV store
      await kv.set(`user:${user.id}`, userData);
    }
    
    return c.json({ user: userData });
  } catch (error) {
    console.log('Get user error:', error);
    return c.json({ error: 'Failed to get user data' }, 500);
  }
});

// Profile routes
app.put('/make-server-f040132c/profile', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const profileData = await c.req.json();
    
    const existingUser = await kv.get(`user:${user.id}`) || {};
    const updatedUser = { ...existingUser, ...profileData, updatedAt: new Date().toISOString() };
    
    await kv.set(`user:${user.id}`, updatedUser);
    
    return c.json({ success: true, user: updatedUser });
  } catch (error) {
    console.log('Profile update error:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

app.get('/make-server-f040132c/profile', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    let userData = await kv.get(`user:${user.id}`);
    
    // If user doesn't exist, create default profile
    if (!userData) {
      userData = {
        uid: user.id,
        email: user.email,
        displayName: user.user_metadata?.displayName || user.email?.split('@')[0] || 'User',
        role: 'student',
        profileCompleted: false,
        locale: 'en',
        profileData: {},
        createdAt: new Date().toISOString()
      };
      
      await kv.set(`user:${user.id}`, userData);
    }
    
    return c.json({ 
      profileData: userData?.profileData || {},
      profileCompleted: userData?.profileCompleted || false
    });
  } catch (error) {
    console.log('Get profile error:', error);
    return c.json({ error: 'Failed to get profile' }, 500);
  }
});

// Quiz routes
app.post('/make-server-f040132c/quiz/submit', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const { answers } = await c.req.json();
    
    // Calculate results based on answers
    const categoryScores: Record<string, number> = {};
    const questionCategories = {
      1: 'logical', 2: 'creative', 3: 'communication', 4: 'scientific',
      5: 'leadership', 6: 'practical', 7: 'analytical', 8: 'humanities'
    };
    
    Object.entries(answers).forEach(([questionId, answer]) => {
      const category = questionCategories[parseInt(questionId) as keyof typeof questionCategories];
      if (category && answer) {
        const score = getAnswerScore(answer as string);
        categoryScores[category] = (categoryScores[category] || 0) + score;
      }
    });

    // Advanced ML-like analysis
    const aptitudeAnalysis = performAdvancedAnalysis(categoryScores, answers);
    const personalityInsights = generatePersonalityInsights(categoryScores);
    const courseRecommendations = generateAdvancedCourseRecommendations(categoryScores);
    const careerPaths = generateAdvancedCareerPaths(categoryScores);
    
    const results = {
      answers,
      categoryScores,
      aptitudeAnalysis,
      personalityInsights,
      courseRecommendations,
      careerPaths,
      completedAt: new Date().toISOString(),
      recommendations: generateRecommendations(categoryScores)
    };
    
    await kv.set(`quiz:${user.id}`, results);
    
    return c.json({ results });
  } catch (error) {
    console.log('Quiz submit error:', error);
    return c.json({ error: 'Failed to submit quiz' }, 500);
  }
});

app.get('/make-server-f040132c/quiz/results', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const results = await kv.get(`quiz:${user.id}`);
    
    return c.json({ results: results || null });
  } catch (error) {
    console.log('Get quiz results error:', error);
    return c.json({ error: 'Failed to get quiz results' }, 500);
  }
});

// Recommendations route
app.get('/make-server-f040132c/recommendations', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const quizResults = await kv.get(`quiz:${user.id}`);
    const userProfile = await kv.get(`user:${user.id}`);
    
    let recommendations = [];
    
    if (quizResults?.recommendations) {
      recommendations = quizResults.recommendations;
    } else {
      // Default recommendations
      recommendations = [
        {
          title: 'Complete Aptitude Quiz',
          type: 'action',
          match: 100,
          reason: 'Take our quiz to get personalized recommendations'
        }
      ];
    }
    
    return c.json({ recommendations });
  } catch (error) {
    console.log('Get recommendations error:', error);
    return c.json({ error: 'Failed to get recommendations' }, 500);
  }
});

// Advanced recommendations route
app.get('/make-server-f040132c/recommendations/detailed', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const quizResults = await kv.get(`quiz:${user.id}`);
    
    if (!quizResults || !quizResults.categoryScores) {
      return c.json({ 
        error: 'No quiz results found. Please complete the aptitude assessment first.' 
      }, 400);
    }

    const detailedRecommendations = {
      personalityInsights: quizResults.personalityInsights || [],
      courseRecommendations: quizResults.courseRecommendations || [],
      careerPaths: quizResults.careerPaths || [],
      aptitudeAnalysis: quizResults.aptitudeAnalysis || {},
      suggestedActions: generateSuggestedActions(quizResults.categoryScores),
      nextSteps: generateNextSteps(quizResults.categoryScores)
    };
    
    return c.json({ recommendations: detailedRecommendations });
  } catch (error) {
    console.log('Get detailed recommendations error:', error);
    return c.json({ error: 'Failed to get detailed recommendations' }, 500);
  }
});

// Course suggestions route
app.get('/make-server-f040132c/courses/suggestions', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const quizResults = await kv.get(`quiz:${user.id}`);
    
    if (!quizResults?.categoryScores) {
      return c.json({ courses: [] });
    }

    const courseSuggestions = generateAdvancedCourseRecommendations(quizResults.categoryScores);
    
    return c.json({ courses: courseSuggestions });
  } catch (error) {
    console.log('Get course suggestions error:', error);
    return c.json({ error: 'Failed to get course suggestions' }, 500);
  }
});

// Career paths route  
app.get('/make-server-f040132c/career-paths/suggestions', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const quizResults = await kv.get(`quiz:${user.id}`);
    
    if (!quizResults?.categoryScores) {
      return c.json({ careerPaths: [] });
    }

    const careerSuggestions = generateAdvancedCareerPaths(quizResults.categoryScores);
    
    return c.json({ careerPaths: careerSuggestions });
  } catch (error) {
    console.log('Get career path suggestions error:', error);
    return c.json({ error: 'Failed to get career path suggestions' }, 500);
  }
});

// Colleges routes
app.post('/make-server-f040132c/colleges/search', async (c) => {
  try {
    const filters = await c.req.json();
    
    // Mock college data for now
    const mockColleges = [
      {
        id: 1,
        name: 'Delhi University (North Campus)',
        type: 'Public',
        location: 'Delhi',
        distance: '2.5 km',
        rating: 4.5,
        fees: '₹15,000 - ₹50,000',
        programs: ['Science', 'Commerce', 'Arts'],
        medium: ['English', 'Hindi'],
        facilities: ['Library', 'WiFi', 'Hostel', 'Sports', 'Canteen'],
        cutoff: '95%+',
        established: 1922,
        students: 45000
      }
    ];
    
    return c.json({ colleges: mockColleges });
  } catch (error) {
    console.log('College search error:', error);
    return c.json({ error: 'Failed to search colleges' }, 500);
  }
});

// Alerts routes
app.get('/make-server-f040132c/alerts', async (c) => {
  try {
    // Mock alerts data
    const alerts = [
      {
        id: 1,
        title: 'JEE Main 2025 Registration',
        description: 'Last date to register for JEE Main 2025. Don\'t miss this important deadline!',
        type: 'exam',
        category: 'Engineering',
        priority: 'high',
        date: '2025-03-15',
        daysLeft: 3,
        status: 'active',
        source: 'NTA'
      }
    ];
    
    return c.json({ alerts });
  } catch (error) {
    console.log('Get alerts error:', error);
    return c.json({ error: 'Failed to get alerts' }, 500);
  }
});

app.post('/make-server-f040132c/alerts/:alertId/subscribe', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const alertId = c.req.param('alertId');
    
    // Store subscription
    await kv.set(`alert_subscription:${user.id}:${alertId}`, {
      userId: user.id,
      alertId,
      subscribedAt: new Date().toISOString()
    });
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Alert subscribe error:', error);
    return c.json({ error: 'Failed to subscribe to alert' }, 500);
  }
});

// Career paths routes
app.get('/make-server-f040132c/careers', async (c) => {
  try {
    // Mock career paths data
    const careerPaths = [
      {
        id: 'software-engineer',
        title: 'Software Engineer/Developer',
        field: 'Technology',
        salary: '₹4-25 LPA',
        demand: 'Very High'
      }
    ];
    
    return c.json({ careerPaths });
  } catch (error) {
    console.log('Get career paths error:', error);
    return c.json({ error: 'Failed to get career paths' }, 500);
  }
});

// Helper functions
function getAnswerScore(answer: string): number {
  const scoreMap: Record<string, number> = {
    'strongly_agree': 5,
    'agree': 4,
    'neutral': 3,
    'disagree': 2,
    'strongly_disagree': 1
  };
  return scoreMap[answer] || 3;
}

function generateRecommendations(categoryScores: Record<string, number>) {
  const sortedCategories = Object.entries(categoryScores)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);
    
  return sortedCategories.map(([category, score], index) => ({
    title: getCategoryRecommendation(category),
    type: 'course',
    match: Math.round((score / 40) * 100),
    reason: `Based on your ${category} aptitude score`
  }));
}

function getCategoryRecommendation(category: string): string {
  const recommendations: Record<string, string> = {
    logical: 'Computer Science Engineering',
    creative: 'Fine Arts & Design',
    communication: 'Mass Communication',
    scientific: 'Biotechnology',
    leadership: 'Business Administration',
    practical: 'Mechanical Engineering',
    analytical: 'Data Science',
    humanities: 'Liberal Arts'
  };
  return recommendations[category] || 'General Studies';
}

// Advanced ML-like analysis functions
function performAdvancedAnalysis(categoryScores: Record<string, number>, answers: any) {
  // Calculate composite scores using weighted algorithms
  const cognitiveScore = (categoryScores.logical || 0) + (categoryScores.analytical || 0);
  const creativeScore = (categoryScores.creative || 0) + (categoryScores.humanities || 0);
  const socialScore = (categoryScores.communication || 0) + (categoryScores.leadership || 0);
  const practicalScore = (categoryScores.practical || 0) + (categoryScores.scientific || 0);

  // Apply machine learning-like weightings
  const aptitudeProfile = {
    cognitive: Math.min((cognitiveScore / 80) * 100, 100),
    creative: Math.min((creativeScore / 80) * 100, 100),
    social: Math.min((socialScore / 80) * 100, 100),
    practical: Math.min((practicalScore / 80) * 100, 100)
  };

  // Determine dominant aptitude cluster
  const dominantAptitude = Object.entries(aptitudeProfile)
    .sort(([,a], [,b]) => b - a)[0][0];

  return {
    aptitudeProfile,
    dominantAptitude,
    confidenceScore: calculateConfidenceScore(categoryScores),
    learningStyle: determineLearningStyle(categoryScores),
    careerFitness: calculateCareerFitness(categoryScores)
  };
}

function generatePersonalityInsights(categoryScores: Record<string, number>) {
  const insights = [];
  
  const totalScore = Object.values(categoryScores).reduce((sum, score) => sum + score, 0);
  
  // Analytical thinking insight
  const analyticalStrength = ((categoryScores.logical || 0) + (categoryScores.analytical || 0)) / totalScore * 100;
  if (analyticalStrength > 25) {
    insights.push({
      trait: 'Analytical Thinker',
      strength: Math.min(analyticalStrength * 2, 100),
      description: 'Strong logical reasoning and problem-solving abilities',
      careerAlignment: ['Data Science', 'Engineering', 'Research', 'Finance']
    });
  }

  // Creative insight
  const creativeStrength = ((categoryScores.creative || 0) + (categoryScores.humanities || 0)) / totalScore * 100;
  if (creativeStrength > 25) {
    insights.push({
      trait: 'Creative Innovator',
      strength: Math.min(creativeStrength * 2, 100),
      description: 'Natural ability for creative problem-solving and innovation',
      careerAlignment: ['Design', 'Arts', 'Marketing', 'Entertainment']
    });
  }

  // Leadership insight
  const leadershipStrength = ((categoryScores.leadership || 0) + (categoryScores.communication || 0)) / totalScore * 100;
  if (leadershipStrength > 25) {
    insights.push({
      trait: 'Natural Leader',
      strength: Math.min(leadershipStrength * 2, 100),
      description: 'Strong interpersonal skills and leadership potential',
      careerAlignment: ['Management', 'Consulting', 'Politics', 'Education']
    });
  }

  return insights;
}

function generateAdvancedCourseRecommendations(categoryScores: Record<string, number>) {
  const courses = [];
  
  // Sort categories by score
  const sortedCategories = Object.entries(categoryScores)
    .sort(([,a], [,b]) => b - a);

  // Generate recommendations based on top categories
  sortedCategories.forEach(([category, score], index) => {
    const matchPercentage = Math.min((score / 40) * 100 + (index === 0 ? 10 : index === 1 ? 5 : 0), 100);
    
    const courseMap = getCourseRecommendations(category, matchPercentage);
    courses.push(...courseMap);
  });

  return courses.slice(0, 8);
}

function generateAdvancedCareerPaths(categoryScores: Record<string, number>) {
  const careers = [];
  
  // Multi-dimensional career matching
  const topCategories = Object.entries(categoryScores)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  topCategories.forEach(([category, score]) => {
    const matchPercentage = Math.min((score / 40) * 100 + 15, 100);
    const careerMap = getCareerRecommendations(category, matchPercentage);
    careers.push(...careerMap);
  });

  return careers.slice(0, 6);
}

function calculateConfidenceScore(categoryScores: Record<string, number>): number {
  const scores = Object.values(categoryScores);
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);
  const variance = maxScore - minScore;
  
  // Higher variance indicates clearer preferences
  return Math.min((variance / 20) * 100, 100);
}

function determineLearningStyle(categoryScores: Record<string, number>): string {
  const visual = (categoryScores.creative || 0) + (categoryScores.practical || 0);
  const auditory = (categoryScores.communication || 0) + (categoryScores.humanities || 0);
  const kinesthetic = (categoryScores.practical || 0) + (categoryScores.scientific || 0);
  const reading = (categoryScores.logical || 0) + (categoryScores.analytical || 0);

  const styles = { visual, auditory, kinesthetic, reading };
  return Object.entries(styles).sort(([,a], [,b]) => b - a)[0][0];
}

function calculateCareerFitness(categoryScores: Record<string, number>) {
  const fitness: Record<string, number> = {};
  
  // Technology sector fitness
  fitness.technology = ((categoryScores.logical || 0) + (categoryScores.analytical || 0)) / 2;
  
  // Creative sector fitness
  fitness.creative = ((categoryScores.creative || 0) + (categoryScores.humanities || 0)) / 2;
  
  // Business sector fitness
  fitness.business = ((categoryScores.leadership || 0) + (categoryScores.communication || 0)) / 2;
  
  // Science sector fitness
  fitness.science = ((categoryScores.scientific || 0) + (categoryScores.analytical || 0)) / 2;

  return fitness;
}

function getCourseRecommendations(category: string, matchPercentage: number) {
  const courseDatabase: Record<string, any[]> = {
    logical: [
      {
        title: 'Computer Science Engineering',
        field: 'Technology',
        matchPercentage,
        duration: '4 years',
        difficulty: 'High',
        averageSalary: '₹8-40 LPA',
        description: 'Perfect for logical thinkers who enjoy problem-solving'
      }
    ],
    creative: [
      {
        title: 'Design & Innovation',
        field: 'Creative Arts',
        matchPercentage,
        duration: '3-4 years',
        difficulty: 'Medium',
        averageSalary: '₹5-25 LPA',
        description: 'Ideal for creative minds who think differently'
      }
    ],
    analytical: [
      {
        title: 'Data Science & Analytics',
        field: 'Technology',
        matchPercentage: matchPercentage + 5,
        duration: '3-4 years',
        difficulty: 'High',
        averageSalary: '₹8-35 LPA',
        description: 'Perfect for analytical minds who love patterns'
      }
    ]
  };

  return courseDatabase[category] || [];
}

function getCareerRecommendations(category: string, matchPercentage: number) {
  const careerDatabase: Record<string, any[]> = {
    logical: [
      {
        title: 'Software Engineer',
        field: 'Technology',
        matchPercentage,
        salaryRange: '₹8-40 LPA',
        demandLevel: 'Very High',
        growthProjection: '22%'
      }
    ],
    analytical: [
      {
        title: 'Data Scientist',
        field: 'Technology',
        matchPercentage: matchPercentage + 8,
        salaryRange: '₹10-45 LPA',
        demandLevel: 'Very High',
        growthProjection: '25%'
      }
    ],
    creative: [
      {
        title: 'UX/UI Designer',
        field: 'Design',
        matchPercentage,
        salaryRange: '₹5-25 LPA',
        demandLevel: 'High',
        growthProjection: '15%'
      }
    ]
  };

  return careerDatabase[category] || [];
}

function generateSuggestedActions(categoryScores: Record<string, number>) {
  const actions = [];
  const topCategory = Object.entries(categoryScores)
    .sort(([,a], [,b]) => b - a)[0];

  if (topCategory) {
    const [category, score] = topCategory;
    
    if (category === 'logical' || category === 'analytical') {
      actions.push({
        title: 'Strengthen Programming Skills',
        description: 'Start with Python or JavaScript to build coding fundamentals',
        priority: 'high',
        timeframe: '3-6 months'
      });
    }
    
    if (category === 'creative') {
      actions.push({
        title: 'Build Design Portfolio',
        description: 'Create projects showcasing your creative abilities',
        priority: 'high',
        timeframe: '2-4 months'
      });
    }
    
    if (category === 'leadership' || category === 'communication') {
      actions.push({
        title: 'Develop Leadership Experience',
        description: 'Join clubs, lead projects, or volunteer in community organizations',
        priority: 'medium',
        timeframe: '6-12 months'
      });
    }
  }

  return actions;
}

function generateNextSteps(categoryScores: Record<string, number>) {
  const steps = [];
  const topCategories = Object.entries(categoryScores)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2);

  steps.push({
    step: 1,
    title: 'Research Target Programs',
    description: 'Explore colleges and courses that align with your top aptitude areas',
    timeline: 'Next 2 weeks'
  });

  steps.push({
    step: 2,
    title: 'Skill Development',
    description: 'Start building relevant skills in your strongest aptitude areas',
    timeline: 'Next 1-3 months'
  });

  steps.push({
    step: 3,
    title: 'Gain Practical Experience',
    description: 'Seek internships, projects, or volunteer opportunities in your field of interest',
    timeline: 'Next 3-6 months'
  });

  return steps;
}

// Health check
app.get('/make-server-f040132c/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Advanced Recommendation System API
app.post('/make-server-f040132c/api/recommend', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const { lat, lon, quizResults, filters = {}, page = 1, pageSize = 20 } = await c.req.json();
    
    // Validate inputs
    if (!lat || !lon) {
      return c.json({ error: 'Location coordinates (lat, lon) are required' }, 400);
    }

    // Get user quiz results if not provided
    let userQuizResults = quizResults;
    if (!userQuizResults) {
      userQuizResults = await kv.get(`quiz:${user.id}`);
    }

    if (!userQuizResults?.categoryScores) {
      return c.json({ 
        error: 'Quiz results not found. Please complete the aptitude assessment first.',
        code: 'NO_QUIZ_RESULTS'
      }, 400);
    }

    // Start parallel candidate generation
    const candidatePromises = await Promise.allSettled([
      generateGeoCandidates(lat, lon, filters),
      generateTextSearchCandidates(userQuizResults, filters),
      generateSemanticCandidates(userQuizResults, filters)
    ]);

    // Extract successful results
    const [geoResults, textResults, semanticResults] = candidatePromises.map(result => 
      result.status === 'fulfilled' ? result.value : []
    );

    // Merge and deduplicate candidates
    const mergedCandidates = mergeAndDeduplicateCandidates(
      geoResults,
      textResults, 
      semanticResults
    );

    // Score and rank candidates
    const scoredCandidates = await scoreAndRankCandidates(
      mergedCandidates,
      lat,
      lon,
      userQuizResults.categoryScores,
      filters
    );

    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const paginatedResults = scoredCandidates.slice(startIndex, startIndex + pageSize);

    // Format response
    const response = {
      results: paginatedResults,
      pagination: {
        page,
        pageSize,
        total: scoredCandidates.length,
        totalPages: Math.ceil(scoredCandidates.length / pageSize),
        hasNext: startIndex + pageSize < scoredCandidates.length
      },
      metadata: {
        candidateSources: {
          geo: geoResults.length,
          text: textResults.length,
          semantic: semanticResults.length,
          merged: mergedCandidates.length
        },
        searchParams: { lat, lon, filters, page, pageSize }
      }
    };

    return c.json(response);
  } catch (error) {
    console.log('Recommendation API error:', error);
    return c.json({ 
      error: 'Failed to generate recommendations',
      details: error.message 
    }, 500);
  }
});

// Debug endpoint for recommendation system
app.get('/make-server-f040132c/api/recommend/debug', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const { lat, lon } = c.req.query();
    
    if (!lat || !lon) {
      return c.json({ error: 'lat and lon query parameters required' }, 400);
    }

    const userQuizResults = await kv.get(`quiz:${user.id}`);
    if (!userQuizResults?.categoryScores) {
      return c.json({ error: 'No quiz results found' }, 400);
    }

    // Generate debug information
    const [geoCandidates, textCandidates, semanticCandidates] = await Promise.all([
      generateGeoCandidates(parseFloat(lat), parseFloat(lon), {}),
      generateTextSearchCandidates(userQuizResults, {}),
      generateSemanticCandidates(userQuizResults, {})
    ]);

    const debug = {
      userProfile: {
        categoryScores: userQuizResults.categoryScores,
        dominantAptitude: userQuizResults.aptitudeAnalysis?.dominantAptitude
      },
      candidateSets: {
        geo: {
          count: geoCandidates.length,
          samples: geoCandidates.slice(0, 3)
        },
        text: {
          count: textCandidates.length,
          samples: textCandidates.slice(0, 3)
        },
        semantic: {
          count: semanticCandidates.length,
          samples: semanticCandidates.slice(0, 3)
        }
      },
      scoringWeights: getRelevanceConfig()
    };

    return c.json({ debug });
  } catch (error) {
    console.log('Debug API error:', error);
    return c.json({ error: 'Debug failed', details: error.message }, 500);
  }
});

// College database with real location data
async function generateGeoCandidates(lat: number, lon: number, filters: any) {
  const colleges = getCollegeDatabase();
  
  // Calculate distances and filter by proximity
  const nearby = colleges
    .map(college => ({
      ...college,
      distance_km: calculateDistance(lat, lon, college.location.lat, college.location.lon)
    }))
    .filter(college => college.distance_km <= (filters.maxDistance || 50))
    .sort((a, b) => a.distance_km - b.distance_km)
    .slice(0, 500);

  // Expand to include courses from nearby colleges
  const geoCandidates = [];
  nearby.forEach(college => {
    college.courses.forEach(course => {
      geoCandidates.push({
        type: 'geo',
        college,
        course,
        distance_km: college.distance_km,
        source: 'geographic'
      });
    });
  });

  return geoCandidates.slice(0, 500);
}

async function generateTextSearchCandidates(quizResults: any, filters: any) {
  const { categoryScores } = quizResults;
  const colleges = getCollegeDatabase();
  
  // Extract search terms from dominant aptitudes
  const searchTerms = extractSearchTermsFromAptitude(categoryScores);
  const textCandidates = [];

  colleges.forEach(college => {
    college.courses.forEach(course => {
      let textScore = 0;
      
      // Score based on course name and description matching
      searchTerms.forEach(term => {
        if (course.name.toLowerCase().includes(term.toLowerCase())) {
          textScore += 2;
        }
        if (course.description.toLowerCase().includes(term.toLowerCase())) {
          textScore += 1;
        }
        if (course.tags.some(tag => tag.toLowerCase().includes(term.toLowerCase()))) {
          textScore += 1.5;
        }
      });

      if (textScore > 0) {
        textCandidates.push({
          type: 'text',
          college,
          course,
          textScore,
          source: 'text_search'
        });
      }
    });
  });

  return textCandidates
    .sort((a, b) => b.textScore - a.textScore)
    .slice(0, 200);
}

async function generateSemanticCandidates(quizResults: any, filters: any) {
  const { categoryScores } = quizResults;
  const colleges = getCollegeDatabase();
  
  // Simulate semantic similarity scoring
  const semanticCandidates = [];
  
  colleges.forEach(college => {
    college.courses.forEach(course => {
      const semanticScore = calculateSemanticSimilarity(categoryScores, course);
      
      if (semanticScore > 0.3) {
        semanticCandidates.push({
          type: 'semantic',
          college,
          course,
          semanticScore,
          source: 'semantic_search'
        });
      }
    });
  });

  return semanticCandidates
    .sort((a, b) => b.semanticScore - a.semanticScore)
    .slice(0, 200);
}

function mergeAndDeduplicateCandidates(geoCandidates: any[], textCandidates: any[], semanticCandidates: any[]) {
  const candidateMap = new Map();
  
  // Merge all candidates, avoiding duplicates
  [...geoCandidates, ...textCandidates, ...semanticCandidates].forEach(candidate => {
    const key = `${candidate.college.id}_${candidate.course.id}`;
    
    if (!candidateMap.has(key)) {
      candidateMap.set(key, {
        ...candidate,
        sources: [candidate.source],
        scores: {
          [candidate.source]: candidate.textScore || candidate.semanticScore || 1
        }
      });
    } else {
      const existing = candidateMap.get(key);
      existing.sources.push(candidate.source);
      existing.scores[candidate.source] = candidate.textScore || candidate.semanticScore || 1;
      
      // Merge distance if available
      if (candidate.distance_km !== undefined) {
        existing.distance_km = candidate.distance_km;
      }
    }
  });

  return Array.from(candidateMap.values());
}

async function scoreAndRankCandidates(
  candidates: any[], 
  lat: number, 
  lon: number, 
  categoryScores: Record<string, number>,
  filters: any
) {
  const config = getRelevanceConfig();
  
  return candidates.map(candidate => {
    // Calculate individual scores
    const semanticScore = candidate.scores.semantic_search || 
      calculateSemanticSimilarity(categoryScores, candidate.course);
    
    const textScore = candidate.scores.text_search || 0;
    
    const distance = candidate.distance_km || 
      calculateDistance(lat, lon, candidate.college.location.lat, candidate.college.location.lon);
    
    const distanceScore = 1 / (1 + distance / 10);
    
    const ratingScore = (candidate.college.rating || 3) / 5;
    
    const availabilityScore = Math.min(candidate.course.seats / 100, 1);
    
    // Calculate composite score
    const finalScore = 
      config.weights.semantic * semanticScore +
      config.weights.text * textScore +
      config.weights.distance * distanceScore +
      config.weights.rating * ratingScore +
      config.weights.availability * availabilityScore;

    return {
      college: {
        id: candidate.college.id,
        name: candidate.college.name,
        location: candidate.college.location,
        city: candidate.college.city,
        state: candidate.college.state,
        rating: candidate.college.rating,
        type: candidate.college.type
      },
      course: {
        id: candidate.course.id,
        name: candidate.course.name,
        description: candidate.course.description,
        degree: candidate.course.degree,
        fees: candidate.course.fees,
        seats: candidate.course.seats,
        tags: candidate.course.tags
      },
      distance_km: Math.round(distance * 10) / 10,
      score_breakdown: {
        final_score: Math.round(finalScore * 100) / 100,
        semantic_score: Math.round(semanticScore * 100) / 100,
        text_score: Math.round(textScore * 100) / 100,
        distance_score: Math.round(distanceScore * 100) / 100,
        rating_score: Math.round(ratingScore * 100) / 100,
        availability_score: Math.round(availabilityScore * 100) / 100
      },
      sources: candidate.sources,
      rationale: generateRationale(semanticScore, textScore, distanceScore, categoryScores)
    };
  }).sort((a, b) => b.score_breakdown.final_score - a.score_breakdown.final_score);
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function extractSearchTermsFromAptitude(categoryScores: Record<string, number>): string[] {
  const aptitudeTerms: Record<string, string[]> = {
    logical: ['computer', 'programming', 'software', 'logic', 'algorithm'],
    creative: ['design', 'art', 'creative', 'innovation', 'visual'],
    analytical: ['data', 'analysis', 'statistics', 'research', 'science'],
    communication: ['media', 'journalism', 'marketing', 'public relations'],
    leadership: ['management', 'business', 'administration', 'entrepreneurship'],
    practical: ['engineering', 'mechanical', 'technical', 'hands-on'],
    scientific: ['biology', 'chemistry', 'physics', 'research', 'laboratory'],
    humanities: ['literature', 'history', 'philosophy', 'social']
  };

  const terms = [];
  const sortedCategories = Object.entries(categoryScores)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  sortedCategories.forEach(([category]) => {
    if (aptitudeTerms[category]) {
      terms.push(...aptitudeTerms[category]);
    }
  });

  return [...new Set(terms)];
}

function calculateSemanticSimilarity(categoryScores: Record<string, number>, course: any): number {
  // Course category mapping for semantic similarity
  const courseCategoryMapping: Record<string, Record<string, number>> = {
    'Computer Science': { logical: 0.9, analytical: 0.8, practical: 0.6 },
    'Data Science': { analytical: 0.9, logical: 0.8, scientific: 0.7 },
    'Mechanical Engineering': { practical: 0.9, logical: 0.7, scientific: 0.6 },
    'Business Administration': { leadership: 0.9, communication: 0.8, analytical: 0.6 },
    'Fine Arts': { creative: 0.9, humanities: 0.7 },
    'Psychology': { humanities: 0.9, communication: 0.7, analytical: 0.6 },
    'Media Studies': { creative: 0.8, communication: 0.9, humanities: 0.6 }
  };

  let similarity = 0;
  const courseMapping = courseCategoryMapping[course.name] || {};
  
  Object.entries(categoryScores).forEach(([category, score]) => {
    const courseRelevance = courseMapping[category] || 0;
    similarity += (score / 40) * courseRelevance;
  });

  // Also check tags for additional matching
  const tagBonus = course.tags.reduce((bonus: number, tag: string) => {
    const terms = extractSearchTermsFromAptitude(categoryScores);
    if (terms.some(term => tag.toLowerCase().includes(term))) {
      return bonus + 0.1;
    }
    return bonus;
  }, 0);

  return Math.min(similarity + tagBonus, 1);
}

function getRelevanceConfig() {
  return {
    weights: {
      semantic: 0.35,
      text: 0.25,
      distance: 0.20,
      rating: 0.15,
      availability: 0.05
    }
  };
}

function generateRationale(
  semanticScore: number, 
  textScore: number, 
  distanceScore: number, 
  categoryScores: Record<string, number>
): string {
  const reasons = [];
  
  if (semanticScore > 0.7) {
    reasons.push('Strong alignment with your aptitude profile');
  }
  
  if (textScore > 2) {
    reasons.push('Matches your interest keywords');
  }
  
  if (distanceScore > 0.8) {
    reasons.push('Conveniently located nearby');
  }

  const topAptitude = Object.entries(categoryScores)
    .sort(([,a], [,b]) => b - a)[0][0];
  
  reasons.push(`Recommended for ${topAptitude} strengths`);
  
  return reasons.join(', ');
}

function getCollegeDatabase() {
  return [
    {
      id: 'du-north',
      name: 'Delhi University (North Campus)',
      type: 'Public',
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      location: { lat: 28.6857, lon: 77.2093 },
      rating: 4.5,
      established: 1922,
      courses: [
        {
          id: 'du-cs',
          name: 'Computer Science',
          description: 'Comprehensive computer science program with modern curriculum',
          degree: 'B.Tech',
          fees: 50000,
          seats: 120,
          tags: ['technology', 'programming', 'software']
        },
        {
          id: 'du-physics',
          name: 'Physics Honors',
          description: 'Advanced physics program with research opportunities',
          degree: 'B.Sc',
          fees: 25000,
          seats: 80,
          tags: ['science', 'research', 'theoretical']
        }
      ]
    },
    {
      id: 'iit-delhi',
      name: 'IIT Delhi',
      type: 'Public',
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      location: { lat: 28.5449, lon: 77.1926 },
      rating: 4.8,
      established: 1961,
      courses: [
        {
          id: 'iit-cse',
          name: 'Computer Science Engineering',
          description: 'Elite computer science program with cutting-edge research',
          degree: 'B.Tech',
          fees: 250000,
          seats: 60,
          tags: ['technology', 'engineering', 'research', 'AI']
        },
        {
          id: 'iit-me',
          name: 'Mechanical Engineering',
          description: 'Comprehensive mechanical engineering with modern labs',
          degree: 'B.Tech',
          fees: 250000,
          seats: 80,
          tags: ['engineering', 'mechanical', 'manufacturing']
        }
      ]
    },
    {
      id: 'nift-delhi',
      name: 'NIFT Delhi',
      type: 'Public',
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      location: { lat: 28.5562, lon: 77.1999 },
      rating: 4.3,
      established: 1986,
      courses: [
        {
          id: 'nift-fashion',
          name: 'Fashion Design',
          description: 'Creative fashion design program with industry exposure',
          degree: 'B.Des',
          fees: 150000,
          seats: 40,
          tags: ['design', 'fashion', 'creative', 'art']
        }
      ]
    },
    {
      id: 'amu-aligarh',
      name: 'Aligarh Muslim University',
      type: 'Public',
      city: 'Aligarh',
      state: 'Uttar Pradesh',
      country: 'India',
      location: { lat: 27.8974, lon: 78.0880 },
      rating: 4.2,
      established: 1875,
      courses: [
        {
          id: 'amu-medicine',
          name: 'Medicine',
          description: 'Comprehensive medical program with excellent clinical training',
          degree: 'MBBS',
          fees: 75000,
          seats: 150,
          tags: ['medicine', 'healthcare', 'clinical']
        },
        {
          id: 'amu-engineering',
          name: 'Electrical Engineering',
          description: 'Strong electrical engineering program with research focus',
          degree: 'B.Tech',
          fees: 45000,
          seats: 100,
          tags: ['engineering', 'electrical', 'power']
        }
      ]
    },
    {
      id: 'jnu-delhi',
      name: 'Jawaharlal Nehru University',
      type: 'Public',
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      location: { lat: 28.5385, lon: 77.1667 },
      rating: 4.4,
      established: 1969,
      courses: [
        {
          id: 'jnu-ir',
          name: 'International Relations',
          description: 'Premier international relations program with global perspective',
          degree: 'M.A',
          fees: 30000,
          seats: 50,
          tags: ['politics', 'international', 'diplomacy']
        },
        {
          id: 'jnu-economics',
          name: 'Economics',
          description: 'Advanced economics program with research opportunities',
          degree: 'M.A',
          fees: 25000,
          seats: 60,
          tags: ['economics', 'policy', 'analysis']
        }
      ]
    }
  ];
}

// Start server
Deno.serve(app.fetch);