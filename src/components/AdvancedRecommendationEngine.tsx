import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { MapPin, Star, Users, DollarSign, Clock, TrendingUp, BookOpen, Building2, Bookmark, Heart, ThumbsUp } from 'lucide-react';
import { useAuth } from './AuthContext';
import { getApiUrl } from '../utils/api';

// Types (kept same as before)
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
  metadata: any;
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
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'loading' | 'granted' | 'denied' | 'unavailable' | 'fallback'>('loading');
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 0, hasNext: false });
  const [metadata, setMetadata] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);

  // Filters state
  const [maxDistance, setMaxDistance] = useState<number>(500);
  const [maxFees, setMaxFees] = useState<number>(500000);
  const [minRating, setMinRating] = useState<number>(0);
  const [medium, setMedium] = useState<'any' | 'english' | 'hindi'>('any');
  const [sortBy, setSortBy] = useState<'match' | 'distance' | 'fees'>('match');

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('unavailable');
      setLocation({ lat: 28.6139, lon: 77.2090 });
      return;
    }

    setLocationStatus('loading');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ lat: position.coords.latitude, lon: position.coords.longitude });
        setLocationStatus('granted');
      },
      () => {
        setLocationStatus('fallback');
        setLocation({ lat: 28.6139, lon: 77.2090 });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const retryLocation = () => getCurrentLocation();

  // Cache helpers
  const CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes

  function getCacheKey(lat: number, lon: number, filters: any, userId?: string) {
    return `rec_cache:${userId || 'anon'}:${lat.toFixed(4)}:${lon.toFixed(4)}:${JSON.stringify(filters)}`;
  }

  function getCachedResults(key: string) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (Date.now() - (parsed.ts || 0) > CACHE_TTL_MS) {
        localStorage.removeItem(key);
        return null;
      }
      return parsed.data as RecommendationResponse;
    } catch {
      return null;
    }
  }

  function setCachedResults(key: string, data: RecommendationResponse) {
    try {
      localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
    } catch {}
  }

  // Saved & feedback helpers
  const getSavedKey = (userId?: string) => `saved_recs_${userId || 'anon'}`;
  const getFeedbackKey = (userId?: string) => `rec_feedback_${userId || 'anon'}`;

  function isSaved(rec: RecommendationResult) {
    try {
      const saved = JSON.parse(localStorage.getItem(getSavedKey(user?.id)) || '[]') as string[];
      const key = `${rec.college.id}::${rec.course.id}`;
      return saved.includes(key);
    } catch {
      return false;
    }
  }

  function toggleSave(rec: RecommendationResult) {
    try {
      const key = `${rec.college.id}::${rec.course.id}`;
      const savedKey = getSavedKey(user?.id);
      const saved = JSON.parse(localStorage.getItem(savedKey) || '[]') as string[];
      if (saved.includes(key)) {
        const updated = saved.filter(s => s !== key);
        localStorage.setItem(savedKey, JSON.stringify(updated));
      } else {
        saved.push(key);
        localStorage.setItem(savedKey, JSON.stringify(saved));
      }
      // force re-render by updating state reference
      setRecommendations(prev => [...prev]);
    } catch {}
  }

  function getFeedback(rec: RecommendationResult): 'up' | 'down' | null {
    try {
      const key = getFeedbackKey(user?.id);
      const map = JSON.parse(localStorage.getItem(key) || '{}') as Record<string, 'up' | 'down'>;
      return map[`${rec.college.id}::${rec.course.id}`] || null;
    } catch { return null; }
  }

  function setFeedback(rec: RecommendationResult, value: 'up' | 'down') {
    try {
      const key = getFeedbackKey(user?.id);
      const map = JSON.parse(localStorage.getItem(key) || '{}') as Record<string, 'up' | 'down'>;
      map[`${rec.college.id}::${rec.course.id}`] = value;
      localStorage.setItem(key, JSON.stringify(map));
      setRecommendations(prev => [...prev]);
    } catch {}
  }

  // Filter object memoized
  const filters = useMemo(() => ({ maxDistance, maxFees, minRating, medium }), [maxDistance, maxFees, minRating, medium]);

  // Local college database (fallback) - expanded sample dataset across India
  function getLocalCollegeDatabase() {
    return [
      // Delhi / NCR
      {
        id: 'iit-delhi',
        name: 'IIT Delhi',
        type: 'Public',
        city: 'Delhi',
        state: 'Delhi',
        location: { lat: 28.5459, lon: 77.1927 },
        rating: 4.8,
        courses: [
          { id: 'iit-cse', name: 'Computer Science Engineering', description: 'Elite computer science program with cutting-edge research', degree: 'B.Tech', fees: 250000, seats: 60, tags: ['technology', 'programming', 'ai', 'english'] },
          { id: 'iit-me', name: 'Mechanical Engineering', description: 'Mechanical engineering with modern labs', degree: 'B.Tech', fees: 220000, seats: 80, tags: ['engineering', 'mechanical', 'english'] }
        ]
      },
      {
        id: 'du-north',
        name: 'Delhi University (North Campus)',
        type: 'Public',
        city: 'Delhi',
        state: 'Delhi',
        location: { lat: 28.6895, lon: 77.2123 },
        rating: 4.3,
        courses: [
          { id: 'du-cs', name: 'Computer Science', description: 'Strong undergraduate CS with practical labs', degree: 'B.Sc', fees: 45000, seats: 200, tags: ['computer science', 'mathematics', 'english'] }
        ]
      },
      {
        id: 'jnu',
        name: 'Jawaharlal Nehru University',
        type: 'Public',
        city: 'Delhi',
        state: 'Delhi',
        location: { lat: 28.5385, lon: 77.1667 },
        rating: 4.4,
        courses: [
          { id: 'jnu-ir', name: 'International Relations', description: 'Premier IR program with global perspective', degree: 'M.A', fees: 30000, seats: 50, tags: ['politics', 'international', 'english'] }
        ]
      },

      // Maharashtra
      {
        id: 'iit-bombay',
        name: 'IIT Bombay',
        type: 'Public',
        city: 'Mumbai',
        state: 'Maharashtra',
        location: { lat: 19.1326, lon: 72.9133 },
        rating: 4.9,
        courses: [
          { id: 'iitb-cse', name: 'Computer Science Engineering', description: 'Top-tier CSE program with strong industry links', degree: 'B.Tech', fees: 260000, seats: 70, tags: ['technology', 'programming', 'ai', 'english'] },
          { id: 'iitb-ee', name: 'Electrical Engineering', description: 'Strong EE department with research focus', degree: 'B.Tech', fees: 240000, seats: 60, tags: ['engineering', 'electronics', 'english'] }
        ]
      },
      {
        id: 'mumbai-univ',
        name: 'University of Mumbai',
        type: 'Public',
        city: 'Mumbai',
        state: 'Maharashtra',
        location: { lat: 19.075983, lon: 72.877655 },
        rating: 4.0,
        courses: [
          { id: 'mu-commerce', name: 'B.Com', description: 'Commerce program with practical accounting skills', degree: 'B.Com', fees: 30000, seats: 300, tags: ['commerce', 'business', 'english'] }
        ]
      },

      // Karnataka
      {
        id: 'iisc',
        name: 'IISc Bangalore',
        type: 'Public',
        city: 'Bengaluru',
        state: 'Karnataka',
        location: { lat: 13.0219, lon: 77.5676 },
        rating: 4.8,
        courses: [
          { id: 'iisc-research', name: 'Research Sciences', description: 'Research-focused graduate programs', degree: 'M.Tech/PhD', fees: 200000, seats: 40, tags: ['research', 'science', 'english'] }
        ]
      },
      {
        id: 'pesu',
        name: 'PES University',
        type: 'Private',
        city: 'Bengaluru',
        state: 'Karnataka',
        location: { lat: 12.9078, lon: 77.5009 },
        rating: 4.1,
        courses: [
          { id: 'pesu-cse', name: 'Computer Science', description: 'Industry-focused CS program', degree: 'B.Tech', fees: 150000, seats: 120, tags: ['computer', 'programming', 'english'] }
        ]
      },

      // Telangana / Hyderabad
      {
        id: 'iit-hyderabad',
        name: 'IIT Hyderabad',
        type: 'Public',
        city: 'Hyderabad',
        state: 'Telangana',
        location: { lat: 17.4448, lon: 78.3498 },
        rating: 4.7,
        courses: [
          { id: 'iith-cse', name: 'Computer Science Engineering', description: 'Modern curriculum with research', degree: 'B.Tech', fees: 220000, seats: 60, tags: ['technology', 'programming', 'english'] }
        ]
      },
      {
        id: 'osmania',
        name: 'Osmania University',
        type: 'Public',
        city: 'Hyderabad',
        state: 'Telangana',
        location: { lat: 17.4126, lon: 78.4329 },
        rating: 4.0,
        courses: [
          { id: 'osmania-mbbs', name: 'Medicine', description: 'MBBS program with strong clinical training', degree: 'MBBS', fees: 80000, seats: 200, tags: ['medicine', 'healthcare', 'english'] }
        ]
      },

      // Andhra Pradesh
      {
        id: 'jntua',
        name: 'JNTU Anantapur',
        type: 'Public',
        city: 'Anantapur',
        state: 'Andhra Pradesh',
        location: { lat: 14.6818, lon: 77.6002 },
        rating: 3.8,
        courses: [
          { id: 'jntu-cse', name: 'Computer Science', description: 'Regional engineering program', degree: 'B.Tech', fees: 45000, seats: 120, tags: ['engineering', 'computer', 'english'] }
        ]
      },
      {
        id: 'aditya',
        name: 'Aditya Engineering College',
        type: 'Private',
        city: 'Surampalem',
        state: 'Andhra Pradesh',
        location: { lat: 17.0529, lon: 82.1195 },
        rating: 3.6,
        courses: [
          { id: 'aditya-cse', name: 'Computer Science', description: 'Local engineering college', degree: 'B.Tech', fees: 60000, seats: 180, tags: ['computer', 'engineering', 'english'] }
        ]
      },

      // Tamil Nadu
      {
        id: 'iit-madras',
        name: 'IIT Madras',
        type: 'Public',
        city: 'Chennai',
        state: 'Tamil Nadu',
        location: { lat: 12.9916, lon: 80.2330 },
        rating: 4.9,
        courses: [
          { id: 'iitm-cse', name: 'Computer Science Engineering', description: 'Research-driven CSE', degree: 'B.Tech', fees: 260000, seats: 70, tags: ['technology', 'programming', 'english'] }
        ]
      },
      {
        id: 'anna-univ',
        name: 'Anna University',
        type: 'Public',
        city: 'Chennai',
        state: 'Tamil Nadu',
        location: { lat: 13.0000, lon: 80.2500 },
        rating: 4.1,
        courses: [
          { id: 'anna-eng', name: 'Engineering', description: 'Large engineering university with multiple branches', degree: 'B.Tech', fees: 50000, seats: 300, tags: ['engineering', 'technical', 'english'] }
        ]
      },

      // Gujarat
      {
        id: 'iit-gandhinagar',
        name: 'IIT Gandhinagar',
        type: 'Public',
        city: 'Gandhinagar',
        state: 'Gujarat',
        location: { lat: 23.2156, lon: 72.6369 },
        rating: 4.4,
        courses: [
          { id: 'iitgn-cse', name: 'Computer Science', description: 'Strong CS program', degree: 'B.Tech', fees: 200000, seats: 50, tags: ['computer', 'programming', 'english'] }
        ]
      },

      // West Bengal
      {
        id: 'iit-kharagpur',
        name: 'IIT Kharagpur',
        type: 'Public',
        city: 'Kharagpur',
        state: 'West Bengal',
        location: { lat: 22.3149, lon: 87.3105 },
        rating: 4.7,
        courses: [
          { id: 'iitkgp-cse', name: 'Computer Science', description: 'One of the oldest IITs with strong alumni', degree: 'B.Tech', fees: 240000, seats: 70, tags: ['technology', 'programming', 'english'] }
        ]
      },

      // Punjab
      {
        id: 'iit-rup',
        name: 'IIT Ropar',
        type: 'Public',
        city: 'Rupnagar',
        state: 'Punjab',
        location: { lat: 30.9668, lon: 76.5336 },
        rating: 4.2,
        courses: [
          { id: 'iitr-cse', name: 'Computer Science', description: 'Emerging research-focused campus', degree: 'B.Tech', fees: 180000, seats: 60, tags: ['computer', 'engineering', 'english'] }
        ]
      }
    ];
  }

  function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c * 10) / 10;
  }

  function localSearch(lat: number, lon: number, filters: any, page = 1, pageSize = 10): RecommendationResponse {
    const colleges = getLocalCollegeDatabase();
    const candidates: RecommendationResult[] = [];

    colleges.forEach(college => {
      college.courses.forEach((course: any) => {
        const distance_km = haversineDistance(lat, lon, college.location.lat, college.location.lon);
        // medium filter: check tags
        const tagsLower = (course.tags || []).map((t: string) => t.toLowerCase());
        if (filters.maxDistance && distance_km > filters.maxDistance) return;
        if (filters.maxFees && course.fees > filters.maxFees) return;
        if (filters.minRating && college.rating < filters.minRating) return;
        if (filters.medium && filters.medium !== 'any') {
          const desired = filters.medium === 'english' ? 'english' : 'hindi';
          if (!tagsLower.some((t: string) => t.includes(desired))) return;
        }

        // Simple scoring
        const distanceScore = 1 / (1 + distance_km / 10);
        const ratingScore = (college.rating || 3) / 5;
        const availabilityScore = Math.min(course.seats / 100, 1);

        // Text score: match some keywords
        const keywords = ['computer', 'engineering', 'data', 'science', 'design', 'medicine'];
        let textScore = 0;
        const hay = (course.name + ' ' + (course.description || '') + ' ' + (college.name || '')).toLowerCase();
        keywords.forEach((k) => { if (hay.includes(k)) textScore += 1; });
        textScore = Math.min(textScore / 3, 1);

        const semanticScore = textScore; // approximate

        const final_score = (
          0.35 * semanticScore +
          0.25 * textScore +
          0.2 * distanceScore +
          0.1 * ratingScore +
          0.05 * availabilityScore
        );

        const rationale = `${college.name} - ${course.name}: ${Math.round(final_score * 100)}% match. ${college.rating}/5 rating, ${distance_km} km away.`;

        candidates.push({
          college: {
            id: college.id,
            name: college.name,
            location: college.location,
            city: college.city,
            state: college.state,
            rating: college.rating,
            type: college.type
          },
          course: {
            id: course.id,
            name: course.name,
            description: course.description,
            degree: course.degree,
            fees: course.fees,
            seats: course.seats,
            tags: course.tags || []
          },
          distance_km,
          score_breakdown: {
            final_score,
            semantic_score: semanticScore,
            text_score: textScore,
            distance_score: distanceScore,
            rating_score: ratingScore,
            availability_score: availabilityScore
          },
          sources: ['local_search'],
          rationale
        });
      });
    });

    // sort and paginate
    candidates.sort((a, b) => b.score_breakdown.final_score - a.score_breakdown.final_score);
    const total = candidates.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const start = (page - 1) * pageSize;
    const results = candidates.slice(start, start + pageSize);

    return {
      results,
      pagination: { page, pageSize, total, totalPages, hasNext: page < totalPages },
      metadata: { candidateSources: { geo: candidates.length, text: 0, semantic: 0, merged: candidates.length }, searchParams: { lat, lon, filters } }
    };
  }

  const generateRecommendations = async (page = 1) => {
    if (!location) {
      setError('Location not available. Please enable location services.');
      return;
    }

    setLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      const token = getAuthToken();
      const cacheKey = getCacheKey(location.lat, location.lon, filters, user?.id);

      // Check cache first
      const cached = getCachedResults(cacheKey);
      if (cached && page === 1) {
        setRecommendations(cached.results);
        setPagination(cached.pagination);
        setMetadata(cached.metadata);
        setLoading(false);
        return;
      }

      // Try server request
      try {
        const response = await fetch(`${getApiUrl()}/api/recommend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ lat: location.lat, lon: location.lon, page, pageSize: 10, filters: { maxDistance, maxFees, minRating, medium } })
        });

        if (response.ok) {
          const data: RecommendationResponse = await response.json();
          if (page === 1) setRecommendations(data.results); else setRecommendations(prev => [...prev, ...data.results]);
          setPagination(data.pagination);
          setMetadata(data.metadata);
          if (page === 1) setCachedResults(cacheKey, data as RecommendationResponse);
          setLoading(false);
          return;
        }

        // fall through to localSearch if server returns error
      } catch (e) {
        // network/server error - fallback to local search
        console.warn('Server recommend failed, falling back to local search.', e);
      }

      // Local search fallback
      const local = localSearch(location.lat, location.lon, { maxDistance, maxFees, minRating, medium }, page, 10);
      // If no local results found, try relaxed search (nationwide radius) so user sees options
      if (local.results.length === 0) {
        const relaxed = localSearch(location.lat, location.lon, { ...{ maxDistance, maxFees, minRating, medium }, maxDistance: 5000 }, page, 10);
        if (relaxed.results.length > 0) {
          setRecommendations(relaxed.results);
          setPagination(relaxed.pagination);
          setMetadata({ ...relaxed.metadata, relaxed: true });
          if (page === 1) setCachedResults(cacheKey, relaxed as RecommendationResponse);
          setInfoMessage('No nearby colleges matched your filters — showing expanded results across a larger radius. You can increase Max Distance to refine.');
          setLoading(false);
          return;
        }
      }

      setRecommendations(local.results);
      setPagination(local.pagination);
      setMetadata(local.metadata);
      // cache local results
      if (page === 1) setCachedResults(cacheKey, local as RecommendationResponse);
    } catch (err) {
      console.error('Error generating recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  };

  const loadDebugInfo = async () => {
    if (!location) return;
    try {
      const token = getAuthToken();
      if (token === 'demo_token_123' || token?.startsWith('temp_token_') || token?.startsWith('token_')) {
        // keep existing mock behavior from original file by calling original endpoint elsewhere
        setDebugInfo(null);
        return;
      }
      const response = await fetch(`${getApiUrl()}/api/recommend/debug?lat=${location.lat}&lon=${location.lon}`, { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) {
        const data = await response.json();
        setDebugInfo(data.debug);
      }
    } catch (err) {
      console.error('Error loading debug info:', err);
    }
  };

  const loadMore = () => {
    if (pagination.hasNext && !loading) generateRecommendations(pagination.page + 1);
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  const getScoreColor = (score: number) => score >= 0.8 ? 'text-green-600' : score >= 0.6 ? 'text-yellow-600' : 'text-red-600';
  const getSourceBadgeColor = (source: string) => source === 'geographic' ? 'bg-blue-100 text-blue-800' : source === 'text_search' ? 'bg-green-100 text-green-800' : source === 'semantic_search' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800';

  // Apply client-side filters & sorting to recommendations for immediate UX feedback
  const filteredRecommendations = useMemo(() => {
    if (!recommendations) return [] as RecommendationResult[];
    let items = [...recommendations];
    items = items.filter(r => r.distance_km <= maxDistance && r.course.fees <= maxFees && r.college.rating >= minRating);
    if (medium !== 'any') {
      const mediumTerm = medium === 'english' ? 'English' : 'Hindi';
      items = items.filter(r => r.course.tags.some(t => t.toLowerCase().includes(mediumTerm.toLowerCase())));
    }
    if (sortBy === 'match') items.sort((a, b) => b.score_breakdown.final_score - a.score_breakdown.final_score);
    if (sortBy === 'distance') items.sort((a, b) => a.distance_km - b.distance_km);
    if (sortBy === 'fees') items.sort((a, b) => a.course.fees - b.course.fees);
    return items;
  }, [recommendations, maxDistance, maxFees, minRating, medium, sortBy]);

  if (!user) return (<Alert><AlertDescription>Please log in to access the advanced recommendation system.</AlertDescription></Alert>);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">AI-Powered College & Course Recommendations</h1>
        <p className="text-muted-foreground mb-6">Get personalized recommendations based on your location, aptitude, and preferences</p>

        <div className="flex justify-center gap-4 mb-6">
          <Button onClick={() => generateRecommendations(1)} disabled={loading || !location} size="lg">{loading ? 'Generating...' : 'Generate Smart Recommendations'}</Button>
          <Button variant="outline" onClick={() => { setShowDebug(!showDebug); if (!showDebug && location) loadDebugInfo(); }}>{showDebug ? 'Hide Debug' : 'Show Debug Info'}</Button>
        </div>

        {/* Location indicators */}
        {locationStatus === 'loading' && <div className="flex items-center justify-center gap-2 mb-4"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div><span className="text-sm text-muted-foreground">Getting your location...</span></div>}
        {location && locationStatus === 'granted' && <div className="flex items-center justify-center gap-2 mb-4"><MapPin className="h-4 w-4 text-green-600" /><span className="text-sm text-muted-foreground">📍 Location: {location.lat.toFixed(4)}, {location.lon.toFixed(4)}</span></div>}
        {location && (locationStatus === 'denied' || locationStatus === 'unavailable' || locationStatus === 'fallback') && <div className="flex items-center justify-center gap-2 mb-4"><MapPin className="h-4 w-4 text-orange-600" /><span className="text-sm text-muted-foreground">📍 Using fallback location: Delhi, India ({location.lat.toFixed(4)}, {location.lon.toFixed(4)})</span></div>}
      </div>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      {infoMessage && <Alert><AlertDescription>{infoMessage}</AlertDescription></Alert>}

      {/* Filter panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Filters & Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm">Max Distance (km)</label>
              <input type="range" min={5} max={500} value={maxDistance} onChange={(e) => setMaxDistance(Number(e.target.value))} className="w-full" />
              <div className="text-xs text-muted-foreground mt-1">{maxDistance} km</div>
            </div>

            <div>
              <label className="text-sm">Max Fees (INR)</label>
              <input type="number" min={0} value={maxFees} onChange={(e) => setMaxFees(Number(e.target.value || 0))} className="w-full rounded-md border px-2 py-1" />
            </div>

            <div>
              <label className="text-sm">Minimum College Rating</label>
              <input type="number" min={0} max={5} step={0.1} value={minRating} onChange={(e) => setMinRating(Number(e.target.value || 0))} className="w-full rounded-md border px-2 py-1" />
            </div>

            <div>
              <label className="text-sm">Medium</label>
              <select value={medium} onChange={(e) => setMedium(e.target.value as any)} className="w-full rounded-md border px-2 py-1">
                <option value="any">Any</option>
                <option value="english">English</option>
                <option value="hindi">हिंदी</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm">Sort By</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="w-full rounded-md border px-2 py-1">
                <option value="match">Best Match</option>
                <option value="distance">Distance (nearest)</option>
                <option value="fees">Fees (low to high)</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={() => generateRecommendations(1)} disabled={loading || !location}>{loading ? 'Generating...' : 'Apply & Generate'}</Button>
              <Button variant="outline" onClick={() => { setMaxDistance(100); setMaxFees(500000); setMinRating(0); setMedium('any'); setSortBy('match'); }}>Reset</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="results" value={showDebug ? 'debug' : 'results'}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="results">Recommendations</TabsTrigger>
          <TabsTrigger value="debug">Debug Info</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-6">
          {metadata && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Search Results Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center"><div className="text-2xl font-bold text-blue-600">{metadata.candidateSources?.geo ?? 0}</div><div className="text-sm text-muted-foreground">Geographic Matches</div></div>
                  <div className="text-center"><div className="text-2xl font-bold text-green-600">{metadata.candidateSources?.text ?? 0}</div><div className="text-sm text-muted-foreground">Text Matches</div></div>
                  <div className="text-center"><div className="text-2xl font-bold text-purple-600">{metadata.candidateSources?.semantic ?? 0}</div><div className="text-sm text-muted-foreground">Semantic Matches</div></div>
                  <div className="text-center"><div className="text-2xl font-bold text-orange-600">{metadata.candidateSources?.merged ?? 0}</div><div className="text-sm text-muted-foreground">Total Candidates</div></div>
                </div>
              </CardContent>
            </Card>
          )}

          {loading && recommendations.length === 0 && (
            <div className="space-y-4">{[...Array(3)].map((_, i) => (<Card key={i}><CardHeader><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/2" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>))}</div>
          )}

          {filteredRecommendations.length > 0 && (
            <div className="space-y-4">
              {filteredRecommendations.map((recommendation, index) => {
                const saved = isSaved(recommendation);
                const feedback = getFeedback(recommendation);
                return (
                  <Card key={`${recommendation.college.id}-${recommendation.course.id}-${index}`} className="overflow-hidden">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" />{recommendation.course.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1"><MapPin className="h-4 w-4" />{recommendation.college.name} • {recommendation.college.city}, {recommendation.college.state}</CardDescription>
                        </div>

                        <div className="text-right flex flex-col items-end gap-2">
                          <div className={`text-2xl font-bold ${getScoreColor(recommendation.score_breakdown.final_score)}`}>{Math.round(recommendation.score_breakdown.final_score * 100)}%</div>
                          <div className="text-sm text-muted-foreground">Match Score</div>

                          <div className="flex items-center gap-2 mt-2">
                            <button aria-pressed={saved} onClick={() => toggleSave(recommendation)} title={saved ? 'Remove bookmark' : 'Save'} className="p-2 rounded-md hover:bg-accent">
                              <Bookmark className="h-4 w-4" />
                            </button>

                            <button aria-pressed={feedback === 'up'} onClick={() => setFeedback(recommendation, feedback === 'up' ? null as any : 'up')} title="Thumbs up" className="p-2 rounded-md hover:bg-accent">
                              <ThumbsUp className={`h-4 w-4 ${feedback === 'up' ? 'text-green-600' : ''}`} />
                            </button>

                            <button aria-pressed={feedback === 'down'} onClick={() => setFeedback(recommendation, feedback === 'down' ? null as any : 'down')} title="Thumbs down" className="p-2 rounded-md hover:bg-accent">
                              <Heart className={`h-4 w-4 ${feedback === 'down' ? 'text-red-600' : ''}`} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">{recommendation.course.description}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{recommendation.distance_km} km away</span></div>
                        <div className="flex items-center gap-2"><Star className="h-4 w-4 text-yellow-500" /><span className="text-sm">{recommendation.college.rating}/5</span></div>
                        <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-green-600" /><span className="text-sm">{formatCurrency(recommendation.course.fees)}</span></div>
                        <div className="flex items-center gap-2"><Users className="h-4 w-4 text-blue-600" /><span className="text-sm">{recommendation.course.seats} seats</span></div>
                      </div>

                      <div className="space-y-2"><div className="flex justify-between text-sm"><span>Semantic Match</span><span className={getScoreColor(recommendation.score_breakdown.semantic_score)}>{Math.round(recommendation.score_breakdown.semantic_score * 100)}%</span></div><Progress value={recommendation.score_breakdown.semantic_score * 100} className="h-2" /></div>

                      <div className="flex flex-wrap gap-2">{recommendation.course.tags.map((tag, i) => (<Badge key={i} variant="outline">{tag}</Badge>))}</div>

                      <div className="flex flex-wrap gap-1">{recommendation.sources.map((source, i) => (<Badge key={i} className={getSourceBadgeColor(source)}>{source.replace('_', ' ')}</Badge>))}</div>

                      <p className="text-sm text-muted-foreground italic">💡 {recommendation.rationale}</p>

                      <details className="mt-4"><summary className="cursor-pointer text-sm font-medium">Score Breakdown</summary><div className="mt-2 grid grid-cols-2 gap-2 text-sm"><div>Semantic: {Math.round(recommendation.score_breakdown.semantic_score * 100)}%</div><div>Text: {Math.round(recommendation.score_breakdown.text_score * 100)}%</div><div>Distance: {Math.round(recommendation.score_breakdown.distance_score * 100)}%</div><div>Rating: {Math.round(recommendation.score_breakdown.rating_score * 100)}%</div></div></details>
                    </CardContent>
                  </Card>
                );
              })}

              {pagination.hasNext && (<div className="text-center"><Button onClick={loadMore} disabled={loading} variant="outline">{loading ? 'Loading...' : `Load More (${pagination.total - recommendations.length} remaining)`}</Button></div>)}
            </div>
          )}

          {filteredRecommendations.length === 0 && !loading && (<div className="text-center p-6 text-muted-foreground">No recommendations found. Try expanding filters or generate recommendations.</div>)}
        </TabsContent>

        <TabsContent value="debug" className="space-y-6">
          {debugInfo && (<div className="space-y-4"><Card><CardHeader><CardTitle>User Profile</CardTitle></CardHeader><CardContent><div className="space-y-2"><p><strong>Dominant Aptitude:</strong> {debugInfo.userProfile.dominantAptitude}</p><div className="grid grid-cols-2 gap-2">{Object.entries(debugInfo.userProfile.categoryScores).map(([category, score]) => (<div key={category} className="flex justify-between"><span>{category}:</span><span>{score}</span></div>))}</div></div></CardContent></Card><Card><CardHeader><CardTitle>Candidate Generation</CardTitle></CardHeader><CardContent><div className="grid grid-cols-3 gap-4"><div><h4 className="font-medium">Geographic ({debugInfo.candidateSets.geo.count})</h4><pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">{JSON.stringify(debugInfo.candidateSets.geo.samples, null, 2)}</pre></div><div><h4 className="font-medium">Text Search ({debugInfo.candidateSets.text.count})</h4><pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">{JSON.stringify(debugInfo.candidateSets.text.samples, null, 2)}</pre></div><div><h4 className="font-medium">Semantic ({debugInfo.candidateSets.semantic.count})</h4><pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">{JSON.stringify(debugInfo.candidateSets.semantic.samples, null, 2)}</pre></div></div></CardContent></Card><Card><CardHeader><CardTitle>Scoring Weights</CardTitle></CardHeader><CardContent><div className="grid grid-cols-2 gap-2">{Object.entries(debugInfo.scoringWeights.weights).map(([weight, value]) => (<div key={weight} className="flex justify-between"><span>{weight}:</span><span>{value}</span></div>))}</div></CardContent></Card></div>)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
