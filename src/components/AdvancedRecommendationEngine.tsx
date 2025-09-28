import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { MapPin, Star, Users, DollarSign, Clock, TrendingUp, BookOpen, Building2 } from 'lucide-react';
import { useAuth } from './AuthContext';
import { getApiUrl } from '../utils/api';

interface RecommendationResult {
  college: {
    id: string;
    name: string;
    location: { lat: number; lon: number };
    city: string;
    state: string;
    rating: number;
    type: string;
  };
  course: {
    id: string;
    name: string;
    description: string;
    degree: string;
    fees: number;
    seats: number;
    tags: string[];
  };
  distance_km: number;
  score_breakdown: {
    final_score: number;
    semantic_score: number;
    text_score: number;
    distance_score: number;
    rating_score: number;
    availability_score: number;
  };
  sources: string[];
  rationale: string;
}

interface RecommendationResponse {
  results: RecommendationResult[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
  };
  metadata: {
    candidateSources: {
      geo: number;
      text: number;
      semantic: number;
      merged: number;
    };
    searchParams: any;
  };
}

interface DebugInfo {
  userProfile: {
    categoryScores: Record<string, number>;
    dominantAptitude: string;
  };
  candidateSets: {
    geo: { count: number; samples: any[] };
    text: { count: number; samples: any[] };
    semantic: { count: number; samples: any[] };
  };
  scoringWeights: {
    weights: Record<string, number>;
  };
}

export function AdvancedRecommendationEngine() {
  const { user, getAuthToken } = useAuth();
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'loading' | 'granted' | 'denied' | 'unavailable' | 'fallback'>('loading');
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
    hasNext: false
  });
  const [metadata, setMetadata] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser');
      setLocationStatus('unavailable');
      // Fallback to Delhi coordinates
      setLocation({ lat: 28.6139, lon: 77.2090 });
      return;
    }

    setLocationStatus('loading');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Location obtained successfully:', {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
        setLocationStatus('granted');
      },
      (error) => {
        console.error('Geolocation error:', {
          code: error.code,
          message: error.message
        });
        
        let errorMessage = 'Location access failed';
        let status: 'denied' | 'unavailable' | 'fallback' = 'fallback';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            status = 'denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            status = 'unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            status = 'fallback';
            break;
          default:
            errorMessage = `Location error: ${error.message}`;
            status = 'fallback';
            break;
        }
        
        console.warn(errorMessage + ', using Delhi as fallback location');
        setLocationStatus(status);
        // Always fallback to Delhi coordinates
        setLocation({ lat: 28.6139, lon: 77.2090 });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes cache
      }
    );
  };

  const retryLocation = () => {
    getCurrentLocation();
  };

  const generateRecommendations = async (page = 1) => {
    if (!location) {
      setError('Location not available. Please enable location services.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      
      // Handle demo mode and temporary tokens with mock data
      if (token === 'demo_token_123' || token?.startsWith('temp_token_') || token?.startsWith('token_')) {
        // Return mock recommendations for demo mode
        const mockData: RecommendationResponse = {
          results: [
            {
              college: {
                id: 'iit_delhi_demo',
                name: 'IIT Delhi',
                location: { lat: 28.5459, lon: 77.1927 },
                city: 'New Delhi',
                state: 'Delhi',
                rating: 4.8,
                type: 'Government'
              },
              course: {
                id: 'cs_eng_demo',
                name: 'Computer Science Engineering',
                description: 'Comprehensive program covering algorithms, data structures, software engineering, and modern technologies.',
                degree: 'B.Tech',
                fees: 250000,
                seats: 120,
                tags: ['Programming', 'Algorithms', 'Software Engineering', 'AI/ML']
              },
              distance_km: 15.2,
              score_breakdown: {
                final_score: 0.92,
                semantic_score: 0.88,
                text_score: 0.85,
                distance_score: 0.95,
                rating_score: 0.96,
                availability_score: 0.90
              },
              sources: ['semantic_search', 'geographic'],
              rationale: 'Excellent match based on your technical aptitude and proximity to Delhi. Strong placement record and modern curriculum.'
            },
            {
              college: {
                id: 'nit_delhi_demo',
                name: 'NIT Delhi',
                location: { lat: 28.6139, lon: 77.2090 },
                city: 'New Delhi',
                state: 'Delhi',
                rating: 4.5,
                type: 'Government'
              },
              course: {
                id: 'it_eng_demo',
                name: 'Information Technology',
                description: 'Focus on software development, database systems, and emerging technologies.',
                degree: 'B.Tech',
                fees: 180000,
                seats: 80,
                tags: ['Software Development', 'Database Systems', 'Web Technologies', 'Mobile Apps']
              },
              distance_km: 8.5,
              score_breakdown: {
                final_score: 0.87,
                semantic_score: 0.82,
                text_score: 0.80,
                distance_score: 0.98,
                rating_score: 0.90,
                availability_score: 0.85
              },
              sources: ['text_search', 'geographic'],
              rationale: 'Great option with strong industry connections and practical curriculum. Close to your location with good placement opportunities.'
            },
            {
              college: {
                id: 'du_delhi_demo',
                name: 'Delhi University',
                location: { lat: 28.6895, lon: 77.2123 },
                city: 'New Delhi',
                state: 'Delhi',
                rating: 4.3,
                type: 'Government'
              },
              course: {
                id: 'cs_bsc_demo',
                name: 'Computer Science',
                description: 'Theoretical foundation in computer science with practical applications.',
                degree: 'B.Sc',
                fees: 45000,
                seats: 200,
                tags: ['Computer Science', 'Mathematics', 'Programming', 'Theory']
              },
              distance_km: 12.3,
              score_breakdown: {
                final_score: 0.78,
                semantic_score: 0.75,
                text_score: 0.70,
                distance_score: 0.92,
                rating_score: 0.86,
                availability_score: 0.95
              },
              sources: ['semantic_search', 'text_search'],
              rationale: 'Affordable option with strong academic reputation. Good foundation for further studies or career in technology.'
            }
          ],
          pagination: {
            page: 1,
            pageSize: 10,
            total: 3,
            totalPages: 1,
            hasNext: false
          },
          metadata: {
            candidateSources: {
              geo: 15,
              text: 12,
              semantic: 8,
              merged: 3
            },
            searchParams: {
              lat: location.lat,
              lon: location.lon,
              maxDistance: 100
            }
          }
        };
        
        if (page === 1) {
          setRecommendations(mockData.results);
        } else {
          setRecommendations(prev => [...prev, ...mockData.results]);
        }
        
        setPagination(mockData.pagination);
        setMetadata(mockData.metadata);
        return;
      }

      const response = await fetch(`${getApiUrl()}/api/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          lat: location.lat,
          lon: location.lon,
          page,
          pageSize: 10,
          filters: {
            maxDistance: 100 // 100km radius
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate recommendations');
      }

      const data: RecommendationResponse = await response.json();
      
      if (page === 1) {
        setRecommendations(data.results);
      } else {
        setRecommendations(prev => [...prev, ...data.results]);
      }
      
      setPagination(data.pagination);
      setMetadata(data.metadata);
    } catch (error) {
      // Only log non-auth related errors to avoid console spam
      const isAuthError = error instanceof Error && (
        error.message.includes('401') ||
        error.message.includes('403') ||
        error.message.includes('Unauthorized') ||
        error.message.includes('Forbidden')
      );
      
      if (!isAuthError) {
        console.error('Error generating recommendations:', error);
      }
      
      setError(error instanceof Error ? error.message : 'Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  };

  const loadDebugInfo = async () => {
    if (!location) return;

    try {
      const token = getAuthToken();
      
      // Handle demo mode and temporary tokens with mock data
      if (token === 'demo_token_123' || token?.startsWith('temp_token_') || token?.startsWith('token_')) {
        const mockDebugInfo: DebugInfo = {
          userProfile: {
            categoryScores: {
              'Mathematics': 92,
              'Physics': 85,
              'Chemistry': 78,
              'English': 88,
              'Logical Reasoning': 95,
              'Computer Science': 90
            },
            dominantAptitude: 'Technical/Logical'
          },
          candidateSets: {
            geo: { 
              count: 15, 
              samples: [
                { name: 'IIT Delhi', distance: 15.2, rating: 4.8 },
                { name: 'NIT Delhi', distance: 8.5, rating: 4.5 },
                { name: 'Delhi University', distance: 12.3, rating: 4.3 }
              ]
            },
            text: { 
              count: 12, 
              samples: [
                { name: 'Computer Science Engineering', match: 0.85 },
                { name: 'Information Technology', match: 0.82 },
                { name: 'Software Engineering', match: 0.80 }
              ]
            },
            semantic: { 
              count: 8, 
              samples: [
                { name: 'AI/ML Programs', similarity: 0.88 },
                { name: 'Data Science', similarity: 0.85 },
                { name: 'Cybersecurity', similarity: 0.82 }
              ]
            }
          },
          scoringWeights: {
            weights: {
              'semantic_score': 0.4,
              'text_score': 0.3,
              'distance_score': 0.15,
              'rating_score': 0.1,
              'availability_score': 0.05
            }
          }
        };
        setDebugInfo(mockDebugInfo);
        return;
      }

      const response = await fetch(`${getApiUrl()}/api/recommend/debug?lat=${location.lat}&lon=${location.lon}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDebugInfo(data.debug);
      }
    } catch (error) {
      // Only log non-auth related errors to avoid console spam
      const isAuthError = error instanceof Error && (
        error.message.includes('401') ||
        error.message.includes('403') ||
        error.message.includes('Unauthorized') ||
        error.message.includes('Forbidden')
      );
      
      if (!isAuthError) {
        console.error('Error loading debug info:', error);
      }
    }
  };

  const loadMore = () => {
    if (pagination.hasNext && !loading) {
      generateRecommendations(pagination.page + 1);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'geographic': return 'bg-blue-100 text-blue-800';
      case 'text_search': return 'bg-green-100 text-green-800';
      case 'semantic_search': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <Alert>
        <AlertDescription>
          Please log in to access the advanced recommendation system.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">AI-Powered College & Course Recommendations</h1>
        <p className="text-muted-foreground mb-6">
          Get personalized recommendations based on your location, aptitude, and preferences
        </p>
        
        <div className="flex justify-center gap-4 mb-6">
          <Button 
            onClick={() => generateRecommendations(1)}
            disabled={loading || !location}
            size="lg"
          >
            {loading ? 'Generating...' : 'Generate Smart Recommendations'}
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => {
              setShowDebug(!showDebug);
              if (!showDebug && location) loadDebugInfo();
            }}
          >
            {showDebug ? 'Hide Debug' : 'Show Debug Info'}
          </Button>
        </div>

        {/* Location Status Indicator */}
        {locationStatus === 'loading' && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-muted-foreground">Getting your location...</span>
          </div>
        )}

        {locationStatus === 'denied' && (
          <Alert className="mb-6">
            <MapPin className="h-4 w-4" />
            <AlertDescription>
              Location access was denied. Using Delhi, India as default location for recommendations.
              <Button 
                variant="link" 
                className="ml-2 p-0 h-auto" 
                onClick={retryLocation}
              >
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {locationStatus === 'unavailable' && (
          <Alert className="mb-6">
            <MapPin className="h-4 w-4" />
            <AlertDescription>
              Location services are not available on this device. Using Delhi, India as default location.
            </AlertDescription>
          </Alert>
        )}

        {locationStatus === 'fallback' && (
          <Alert className="mb-6">
            <MapPin className="h-4 w-4" />
            <AlertDescription>
              Could not determine your exact location. Using Delhi, India as fallback.
              <Button 
                variant="link" 
                className="ml-2 p-0 h-auto" 
                onClick={retryLocation}
              >
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {location && locationStatus === 'granted' && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin className="h-4 w-4 text-green-600" />
            <span className="text-sm text-muted-foreground">
              📍 Location: {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
            </span>
          </div>
        )}

        {location && (locationStatus === 'denied' || locationStatus === 'unavailable' || locationStatus === 'fallback') && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin className="h-4 w-4 text-orange-600" />
            <span className="text-sm text-muted-foreground">
              📍 Using fallback location: Delhi, India ({location.lat.toFixed(4)}, {location.lon.toFixed(4)})
            </span>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="results" value={showDebug ? "debug" : "results"}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="results">Recommendations</TabsTrigger>
          <TabsTrigger value="debug">Debug Info</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-6">
          {metadata && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Search Results Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{metadata.candidateSources.geo}</div>
                    <div className="text-sm text-muted-foreground">Geographic Matches</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{metadata.candidateSources.text}</div>
                    <div className="text-sm text-muted-foreground">Text Matches</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{metadata.candidateSources.semantic}</div>
                    <div className="text-sm text-muted-foreground">Semantic Matches</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{metadata.candidateSources.merged}</div>
                    <div className="text-sm text-muted-foreground">Total Candidates</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {loading && recommendations.length === 0 && (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {recommendations.length > 0 && (
            <div className="space-y-4">
              {recommendations.map((recommendation, index) => (
                <Card key={`${recommendation.college.id}-${recommendation.course.id}-${index}`} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="h-5 w-5" />
                          {recommendation.course.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="h-4 w-4" />
                          {recommendation.college.name} • {recommendation.college.city}, {recommendation.college.state}
                        </CardDescription>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor(recommendation.score_breakdown.final_score)}`}>
                          {Math.round(recommendation.score_breakdown.final_score * 100)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Match Score</div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{recommendation.course.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{recommendation.distance_km} km away</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">{recommendation.college.rating}/5</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{formatCurrency(recommendation.course.fees)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">{recommendation.course.seats} seats</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Semantic Match</span>
                        <span className={getScoreColor(recommendation.score_breakdown.semantic_score)}>
                          {Math.round(recommendation.score_breakdown.semantic_score * 100)}%
                        </span>
                      </div>
                      <Progress value={recommendation.score_breakdown.semantic_score * 100} className="h-2" />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {recommendation.course.tags.map((tag, i) => (
                        <Badge key={i} variant="outline">{tag}</Badge>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {recommendation.sources.map((source, i) => (
                        <Badge key={i} className={getSourceBadgeColor(source)}>
                          {source.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>

                    <p className="text-sm text-muted-foreground italic">
                      💡 {recommendation.rationale}
                    </p>

                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm font-medium">Score Breakdown</summary>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div>Semantic: {Math.round(recommendation.score_breakdown.semantic_score * 100)}%</div>
                        <div>Text: {Math.round(recommendation.score_breakdown.text_score * 100)}%</div>
                        <div>Distance: {Math.round(recommendation.score_breakdown.distance_score * 100)}%</div>
                        <div>Rating: {Math.round(recommendation.score_breakdown.rating_score * 100)}%</div>
                      </div>
                    </details>
                  </CardContent>
                </Card>
              ))}

              {pagination.hasNext && (
                <div className="text-center">
                  <Button 
                    onClick={loadMore}
                    disabled={loading}
                    variant="outline"
                  >
                    {loading ? 'Loading...' : `Load More (${pagination.total - recommendations.length} remaining)`}
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="debug" className="space-y-6">
          {debugInfo && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>Dominant Aptitude:</strong> {debugInfo.userProfile.dominantAptitude}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(debugInfo.userProfile.categoryScores).map(([category, score]) => (
                        <div key={category} className="flex justify-between">
                          <span>{category}:</span>
                          <span>{score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Candidate Generation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium">Geographic ({debugInfo.candidateSets.geo.count})</h4>
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                        {JSON.stringify(debugInfo.candidateSets.geo.samples, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <h4 className="font-medium">Text Search ({debugInfo.candidateSets.text.count})</h4>
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                        {JSON.stringify(debugInfo.candidateSets.text.samples, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <h4 className="font-medium">Semantic ({debugInfo.candidateSets.semantic.count})</h4>
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                        {JSON.stringify(debugInfo.candidateSets.semantic.samples, null, 2)}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Scoring Weights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(debugInfo.scoringWeights.weights).map(([weight, value]) => (
                      <div key={weight} className="flex justify-between">
                        <span>{weight}:</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}