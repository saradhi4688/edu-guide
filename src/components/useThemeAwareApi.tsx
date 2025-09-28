import { useTheme } from './ThemeContext';
import { api } from '../utils/api';

/**
 * Custom hook that provides theme-aware API functionality
 * This ensures all API calls are aware of the current theme state
 * and can provide theme-specific responses or styling hints
 */
export function useThemeAwareApi() {
  const { theme } = useTheme();
  
  // Wrapper function that adds theme context to API requests
  const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const enhancedOptions = {
      ...options,
      headers: {
        ...options.headers,
        'X-Theme': theme, // Add theme to request headers
      },
    };
    
    try {
      const response = await api.request(endpoint, enhancedOptions);
      
      // Add theme context to response if it's an object
      if (typeof response === 'object' && response !== null) {
        return {
          ...response,
          _themeContext: theme,
        };
      }
      
      return response;
    } catch (error) {
      // Log theme context with errors for better debugging
      console.warn(`API error in ${theme} theme:`, error);
      throw error;
    }
  };

  // Theme-aware profile operations
  const profileApi = {
    async updateProfile(data: any) {
      return apiRequest('/profile', {
        method: 'PUT',
        body: JSON.stringify({ ...data, themePreference: theme }),
      });
    },
    
    async getProfile() {
      return apiRequest('/profile');
    },
  };

  // Theme-aware recommendation operations
  const recommendationApi = {
    async getRecommendations() {
      return apiRequest('/recommendations');
    },
    
    async getDetailedRecommendations() {
      return apiRequest('/recommendations/detailed');
    },
  };

  // Theme-aware college operations
  const collegeApi = {
    async searchColleges(filters: any) {
      return apiRequest('/colleges/search', {
        method: 'POST',
        body: JSON.stringify({ ...filters, themeContext: theme }),
      });
    },
    
    async getCollegeDetails(collegeId: string) {
      return apiRequest(`/colleges/${collegeId}`);
    },
  };

  // Theme-aware alert operations
  const alertApi = {
    async getAlerts() {
      return apiRequest('/alerts');
    },
    
    async subscribeToAlert(alertId: string) {
      return apiRequest(`/alerts/${alertId}/subscribe`, {
        method: 'POST',
      });
    },
  };

  // Theme-aware quiz operations
  const quizApi = {
    async submitQuiz(answers: any) {
      return apiRequest('/quiz/submit', {
        method: 'POST',
        body: JSON.stringify({ answers, themeContext: theme }),
      });
    },
    
    async getQuizResults() {
      return apiRequest('/quiz/results');
    },
  };

  // Theme-aware career operations
  const careerApi = {
    async getCareerPaths() {
      return apiRequest('/careers');
    },
    
    async getCareerDetails(careerId: string) {
      return apiRequest(`/careers/${careerId}`);
    },
    
    async getCareerPathSuggestions() {
      return apiRequest('/career-paths/suggestions');
    },
  };

  return {
    theme,
    apiRequest,
    profile: profileApi,
    recommendations: recommendationApi,
    colleges: collegeApi,
    alerts: alertApi,
    quiz: quizApi,
    careers: careerApi,
  };
}