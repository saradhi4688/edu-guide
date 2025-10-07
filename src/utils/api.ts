import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-f040132c`;

// Export the API URL getter function
export function getApiUrl(): string {
  return API_BASE_URL;
}

class ApiClient {
  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    const headers: Record<string,string> = { 'Content-Type': 'application/json' };
    // Only send Authorization header when we have a real user access token (not demo/token placeholders)
    if (token && token !== 'demo_token_123' && !token.startsWith('temp_token_') && !token.startsWith('token_')) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('access_token');

    // Handle demo mode and temporary tokens with mock data
    if (token === 'demo_token_123' || token?.startsWith('temp_token_') || token?.startsWith('token_')) {
      return this.handleDemoRequest(endpoint, options);
    }

    const url = `${API_BASE_URL}${endpoint}`;

    // If navigator is offline, immediately fall back to demo data
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      console.debug('Offline detected — using demo data for', endpoint);
      return this.handleDemoRequest(endpoint, options);
    }

    // Small timeout wrapper to avoid hung fetches and noisy errors
    const safeFetch = async (input: RequestInfo, init?: RequestInit, timeout = 7000) => {
      if (typeof AbortController === 'undefined') {
        // Environment doesn't support AbortController; just do a normal fetch
        return fetch(input, init);
      }
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      try {
        const response = await fetch(input, { signal: controller.signal, ...init });
        return response;
      } finally {
        clearTimeout(id);
      }
    };

    try {
      const response = await safeFetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
        // ensure CORS mode where applicable
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response || !(response instanceof Response)) {
        throw new Error('No response from server');
      }

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          try { errorMessage = await response.text() || errorMessage; } catch {}
        }
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      // Fall back to demo mode for any network or server errors.
      // Avoid noisy console stack traces by logging succinctly.
      const message = error instanceof Error ? error.message : String(error);
      const isAuthError = message.includes('Invalid JWT') || message.includes('401') || message.includes('403') || message.includes('Unauthorized');

      if (!isAuthError) {
        console.debug('Backend unavailable — using demo data for', endpoint, '-', message);
      }

      return this.handleDemoRequest(endpoint, options);
    }
  }

  private handleDemoRequest(endpoint: string, options: RequestInit = {}) {
    // Return mock data for demo mode
    return new Promise(resolve => {
      setTimeout(() => {
        if (endpoint === '/profile') {
          resolve({ 
            profileData: {
              age: '17',
              class: '12',
              school: 'Demo High School',
              city: 'Delhi',
              state: 'delhi',
              preferredStream: 'science',
              interests: ['Mathematics', 'Computer Science', 'Physics'],
              strengths: ['Logical Reasoning', 'Problem Solving', 'Analytical Skills']
            },
            profileCompleted: true 
          });
        } else if (endpoint === '/recommendations') {
          resolve({
            recommendations: [
              {
                title: 'Computer Science Engineering',
                type: 'course',
                match: 92,
                reason: 'Based on your math and logical reasoning scores'
              },
              {
                title: 'IIT Delhi',
                type: 'college',
                match: 88,
                reason: 'Matches your preferred location and course'
              }
            ]
          });
        } else if (endpoint === '/alerts') {
          resolve({
            alerts: [
              {
                id: 1,
                title: 'JEE Main 2025 Registration',
                description: 'Last date to register for JEE Main 2025',
                type: 'exam',
                category: 'Engineering',
                priority: 'high',
                date: '2025-03-15',
                daysLeft: 3,
                status: 'active',
                source: 'NTA'
              }
            ]
          });
        } else if (endpoint === '/colleges/search') {
          resolve({
            colleges: [
              {
                id: 'iit_tirupati_demo',
                name: 'IIT Tirupati (Demo)',
                city: 'Tirupati',
                state: 'Andhra Pradesh',
                rating: 4.6,
                reviews: 876,
                fees: '₹2.5 LPA',
                courses: ['Computer Science Engineering', 'Electrical Engineering'],
                type: 'Government',
                establishedYear: 2015,
                affiliation: 'Autonomous',
                facilities: ['Modern Labs', 'Digital Library', 'Hostels'],
                placementRate: 91,
                averagePackage: '₹14.5 LPA',
                website: 'https://www.iittp.ac.in',
                phone: '+91-877-250-3000'
              }
            ]
          });
        } else {
          resolve({ success: true });
        }
      }, 500); // Simulate network delay
    });
  }

  // Profile APIs
  async updateProfile(data: any) {
    return this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getProfile() {
    return this.request('/profile');
  }

  // Quiz APIs
  async submitQuiz(answers: any) {
    return this.request('/quiz/submit', {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }

  async getQuizResults() {
    return this.request('/quiz/results');
  }

  async getDetailedRecommendations() {
    return this.request('/recommendations/detailed');
  }

  async getCourseSuggestions() {
    return this.request('/courses/suggestions');
  }

  async getCareerPathSuggestions() {
    return this.request('/career-paths/suggestions');
  }

  // Recommendations APIs
  async getRecommendations() {
    try {
      return await this.request('/recommendations');
    } catch (error) {
      console.warn('Failed to get recommendations, returning fallback data:', error);
      // Return fallback recommendations
      return {
        recommendations: [
          {
            title: 'Computer Science Engineering',
            type: 'course',
            match: 92,
            reason: 'Based on your math and logical reasoning scores'
          },
          {
            title: 'IIT Delhi',
            type: 'college',
            match: 88,
            reason: 'Matches your preferred location and course'
          },
          {
            title: 'Software Developer',
            type: 'career',
            match: 95,
            reason: 'Aligns with your technical interests'
          }
        ]
      };
    }
  }

  // Colleges APIs
  async getColleges() {
    try {
      return await this.request('/colleges');
    } catch (error) {
      console.warn('Failed to get colleges, using local database');
      // This will be handled by the calling component with fallback
      throw error;
    }
  }

  async searchColleges(filters: any) {
    return this.request('/colleges/search', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  }

  async getCollegeDetails(collegeId: string) {
    return this.request(`/colleges/${collegeId}`);
  }

  // Alerts APIs
  async getAlerts() {
    try {
      return await this.request('/alerts');
    } catch (error) {
      console.warn('Failed to get alerts, returning fallback data');
      return {
        alerts: [
          {
            title: 'JEE Main Registration',
            description: 'Last date: March 15, 2025',
            type: 'exam',
            urgent: true
          },
          {
            title: 'Delhi University Admissions',
            description: 'Applications open: April 1, 2025',
            type: 'admission',
            urgent: false
          },
          {
            title: 'Merit Scholarship',
            description: 'Apply by: March 30, 2025',
            type: 'scholarship',
            urgent: true
          }
        ]
      };
    }
  }

  async subscribeToAlert(alertId: string) {
    return this.request(`/alerts/${alertId}/subscribe`, {
      method: 'POST',
    });
  }

  // Career paths APIs
  async getCareerPaths() {
    return this.request('/careers');
  }

  async getCareerDetails(careerId: string) {
    return this.request(`/careers/${careerId}`);
  }

  // Dashboard-specific APIs
  async getUserQuizData() {
    try {
      return await this.request('/dashboard/quiz-data');
    } catch (error) {
      // Return mock data for users who haven't taken quiz
      return {
        quizData: {
          overallScore: 85,
          completedQuizzes: 3,
          subjectScores: {
            'Mathematics': 92,
            'Physics': 85,
            'Chemistry': 78,
            'English': 88,
            'Logical Reasoning': 95
          },
          interests: ['Engineering', 'Technology', 'Problem Solving', 'Mathematics'],
          lastTaken: new Date().toISOString()
        }
      };
    }
  }

  async getUserAchievements() {
    try {
      return await this.request('/dashboard/achievements');
    } catch (error) {
      return {
        achievements: []
      };
    }
  }
}

// Export the auth token getter function  
export function getAuthToken(): string | null {
  return localStorage.getItem('access_token');
}

export const api = new ApiClient();
