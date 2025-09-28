// Local data store for user quiz results and preferences
export interface QuizResult {
  id: string;
  userId: string;
  userProfile: any;
  categoryScores: Record<string, number>;
  personalizedInsights: any[];
  recommendedPaths: string[];
  confidenceScore: number;
  timestamp: number;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

export interface UserPreferences {
  userId: string;
  savedColleges: string[];
  savedCareers: string[];
  alertPreferences: {
    admissionDeadlines: boolean;
    scholarships: boolean;
    careerUpdates: boolean;
    nearbyEvents: boolean;
  };
  searchHistory: Array<{
    query: string;
    type: 'college' | 'career' | 'stream';
    timestamp: number;
  }>;
}

class DataStore {
  private static instance: DataStore;
  
  static getInstance(): DataStore {
    if (!DataStore.instance) {
      DataStore.instance = new DataStore();
    }
    return DataStore.instance;
  }

  // Quiz Results
  saveQuizResult(result: QuizResult): void {
    const existingResults = this.getQuizResults(result.userId);
    const updatedResults = [result, ...existingResults.filter(r => r.id !== result.id)];
    localStorage.setItem(`quiz_results_${result.userId}`, JSON.stringify(updatedResults));
  }

  getQuizResults(userId: string): QuizResult[] {
    const data = localStorage.getItem(`quiz_results_${userId}`);
    return data ? JSON.parse(data) : [];
  }

  getLatestQuizResult(userId: string): QuizResult | null {
    const results = this.getQuizResults(userId);
    return results.length > 0 ? results[0] : null;
  }

  // User Preferences
  saveUserPreferences(preferences: UserPreferences): void {
    localStorage.setItem(`user_preferences_${preferences.userId}`, JSON.stringify(preferences));
  }

  getUserPreferences(userId: string): UserPreferences {
    const data = localStorage.getItem(`user_preferences_${userId}`);
    return data ? JSON.parse(data) : {
      userId,
      savedColleges: [],
      savedCareers: [],
      alertPreferences: {
        admissionDeadlines: true,
        scholarships: true,
        careerUpdates: true,
        nearbyEvents: true,
      },
      searchHistory: []
    };
  }

  // Saved Colleges
  saveCollege(userId: string, collegeId: string): void {
    const preferences = this.getUserPreferences(userId);
    if (!preferences.savedColleges.includes(collegeId)) {
      preferences.savedColleges.push(collegeId);
      this.saveUserPreferences(preferences);
    }
  }

  removeSavedCollege(userId: string, collegeId: string): void {
    const preferences = this.getUserPreferences(userId);
    preferences.savedColleges = preferences.savedColleges.filter(id => id !== collegeId);
    this.saveUserPreferences(preferences);
  }

  getSavedColleges(userId: string): string[] {
    return this.getUserPreferences(userId).savedColleges;
  }

  // Search History
  addSearchHistory(userId: string, query: string, type: 'college' | 'career' | 'stream'): void {
    const preferences = this.getUserPreferences(userId);
    preferences.searchHistory.unshift({
      query,
      type,
      timestamp: Date.now()
    });
    
    // Keep only last 50 searches
    preferences.searchHistory = preferences.searchHistory.slice(0, 50);
    this.saveUserPreferences(preferences);
  }

  getSearchHistory(userId: string): Array<{query: string, type: string, timestamp: number}> {
    return this.getUserPreferences(userId).searchHistory;
  }

  // Location Data
  saveUserLocation(userId: string, location: {latitude: number, longitude: number, address: string}): void {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      user.lastKnownLocation = location;
      localStorage.setItem('user_data', JSON.stringify(user));
    }
  }

  getUserLocation(userId: string): {latitude: number, longitude: number, address: string} | null {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      return user.lastKnownLocation || null;
    }
    return null;
  }
}

export const dataStore = DataStore.getInstance();

// Geolocation utilities with improved error handling
export const getCurrentLocation = (): Promise<{latitude: number, longitude: number}> => {
  return new Promise((resolve, reject) => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported, using fallback location');
      // Provide fallback location (Hyderabad, India)
      resolve({
        latitude: 17.3850,
        longitude: 78.4867
      });
      return;
    }

    // Check if in a secure context (HTTPS or localhost)
    if (!window.isSecureContext && location.hostname !== 'localhost') {
      console.warn('Geolocation requires HTTPS, using fallback location');
      resolve({
        latitude: 17.3850,
        longitude: 78.4867
      });
      return;
    }

    function requestLocation() {
      const timeoutId = setTimeout(() => {
        console.warn('Location request timed out, using fallback');
        resolve({
          latitude: 17.3850,
          longitude: 78.4867
        });
      }, 5000);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          clearTimeout(timeoutId);
          let errorMessage = 'Unknown geolocation error';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user, using Delhi as fallback location';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable, using fallback location';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out, using fallback location';
              break;
            default:
              errorMessage = `Geolocation error (${error.code}): ${error.message}`;
          }
          
          console.log(errorMessage);
          
          // Always provide fallback instead of rejecting
          resolve({
            latitude: 17.3850,
            longitude: 78.4867
          });
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 300000 // 5 minutes
        }
      );
    }

    // Check permissions if available
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((permission) => {
        if (permission.state === 'denied') {
          console.warn('Geolocation permission denied, using fallback');
          resolve({
            latitude: 17.3850,
            longitude: 78.4867
          });
          return;
        }
        requestLocation();
      }).catch(() => {
        requestLocation();
      });
    } else {
      requestLocation();
    }
  });
};

// Check if geolocation is available
export const isGeolocationAvailable = (): boolean => {
  return !!(navigator && navigator.geolocation && window.isSecureContext);
};

export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    // Using a free geocoding service for demo
    const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
    const data = await response.json();
    
    return `${data.locality || ''}, ${data.principalSubdivision || ''}, ${data.countryName || ''}`.replace(/^,\s*|,\s*$/g, '');
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
};

// Calculate distance between two points
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in km
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};