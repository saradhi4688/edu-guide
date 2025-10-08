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
import { collegeDatabase } from '../utils/collegeDatabase';
import { toast } from 'sonner@2.0.3';
import React, { useEffect, useState, useMemo } from 'react';

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
  const { user, getAuthToken, updateProfile } = useAuth();
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
  const [placeName, setPlaceName] = useState<string | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [manualLocationInput, setManualLocationInput] = useState('');
  const [savingLocation, setSavingLocation] = useState(false);

  // Filters state
  const [maxDistance, setMaxDistance] = useState<number>(500);
  const [maxFees, setMaxFees] = useState<number>(500000);
  const [minRating, setMinRating] = useState<number>(0);
  const [medium, setMedium] = useState<'any' | 'english' | 'hindi'>('any');
  const [sortBy, setSortBy] = useState<'match' | 'distance' | 'fees'>('match');

  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Whenever location changes, try to reverse geocode to a human-readable place name
  useEffect(() => {
    let mounted = true;
    async function reverse() {
      if (!location) return;
      try {
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const id = controller ? setTimeout(() => controller.abort(), 5000) : null;
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${location.lat}&lon=${location.lon}` , { signal: controller ? controller.signal : undefined });
        if (id) clearTimeout(id);
        if (res && res.ok) {
          const j = await res.json();
          const name = j.display_name || (j.address && (j.address.city || j.address.town || j.address.village || j.address.state || j.address.country));
          if (mounted) setPlaceName(name || null);
        }
      } catch (e) {
        // ignore
      }
    }
    reverse();
    return () => { mounted = false; };
  }, [location]);

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
      async () => {
        // Attempt IP-based geolocation as a better fallback than a fixed city
        try {
          setLocationStatus('loading');
          const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
          const id = controller ? setTimeout(() => controller.abort(), 5000) : null;
          const res = await fetch('https://ipapi.co/json/', { signal: controller ? controller.signal : undefined });
          if (id) clearTimeout(id);
                if (res && res.ok) {
            const j = await res.json();
            const lat = parseFloat(j.latitude) || parseFloat(j.lat) || 0;
            const lon = parseFloat(j.longitude) || parseFloat(j.lon) || 0;
            if (lat && lon) {
              setLocation({ lat, lon });
              setLocationStatus('fallback');
              return;
            }
          }
        } catch (e) {
          // ignore and fall through to hardcoded fallback
        }
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

  // Map the comprehensive collegeDatabase (src/utils/collegeDatabase.ts) to the local shape used by this component.
  function parseFeesString(feesStr?: string) {
    if (!feesStr) return 100000;
    try {
      // try to extract a numeric value in lakhs or rupees
      const cleaned = feesStr.replace(/[^0-9\.lpaLPA₹]/g, '').toLowerCase();
      if (cleaned.includes('lpa')) {
        const num = parseFloat(cleaned.replace('lpa', ''));
        if (!isNaN(num)) return Math.round(num * 100000);
      }
      const num = parseFloat(cleaned);
      if (!isNaN(num)) return Math.round(num);
    } catch {}
    return 100000;
  }

  function inferDegreeFromCourse(courseName: string) {
    const lower = courseName.toLowerCase();
    if (lower.includes('btech') || lower.includes('engineering') || lower.includes('b.tech')) return 'B.Tech';
    if (lower.includes('mba') || lower.includes('management')) return 'MBA';
    if (lower.includes('mbbs') || lower.includes('medicine')) return 'MBBS';
    if (lower.includes('mtech') || lower.includes('phd') || lower.includes('research')) return 'M.Tech/PhD';
    if (lower.includes('b.sc') || lower.includes('bsc') || lower.includes('science')) return 'B.Sc';
    if (lower.includes('commerce') || lower.includes('b.com')) return 'B.Com';
    return 'Diploma';
  }

  function getLocalCollegeDatabase() {
    const mapped = collegeDatabase.map((col) => {
      const location = { lat: Number(col.latitude) || 0, lon: Number(col.longitude) || 0 };
      const courses = (col.courses || []).map((c: string, idx: number) => {
        const fees = parseFeesString(col.fees as any);
        const degree = inferDegreeFromCourse(c);
        const tags = Array.from(new Set(((c + ' ' + (col.specializations || []).join(' ') + ' ' + (col.type || '')).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean))));
        if (!tags.includes('english')) tags.push('english');
        return { id: `${col.id}-${idx}`, name: c, description: `${c} program at ${col.name}`, degree, fees, seats: 100, tags };
      });

      return {
        id: col.id,
        name: col.name,
        type: col.type === 'Government' || col.type === 'Deemed' ? 'Public' : col.type,
        city: col.city,
        state: col.state,
        location,
        rating: col.rating || 4,
        courses
      } as any;
    });

    // runtime extension point: if a global variable __EXTRA_COLLEGES__ is injected (for admin/testing), merge it
    try {
      const win = window as any;
      if (Array.isArray(win.__EXTRA_COLLEGES__)) {
        mapped.push(...win.__EXTRA_COLLEGES__);
      }
    } catch {}

    return mapped;
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
        // call public colleges search endpoint (doesn't require auth) on the Edge Function
        const response = await fetch(`${getApiUrl()}/colleges/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
          body: JSON.stringify({ lat: location.lat, lon: location.lon, page, pageSize: 10, filters: { maxDistance, maxFees, minRating, medium } })
        });

        if (response.ok) {
          const data = await response.json();
          // If function returned a structured RecommendationResponse, use it. Otherwise map colleges -> RecommendationResult
          if (data && Array.isArray(data.results)) {
            const recResp: RecommendationResponse = data as RecommendationResponse;
            if (page === 1) setRecommendations(recResp.results); else setRecommendations(prev => [...prev, ...recResp.results]);
            setPagination(recResp.pagination);
            setMetadata(recResp.metadata);
            if (page === 1) setCachedResults(cacheKey, recResp as RecommendationResponse);
            setLoading(false);
            return;
          }

          if (data && Array.isArray(data.colleges)) {
            // Map server colleges to RecommendationResult minimal shape
            const mapped: RecommendationResult[] = data.colleges.map((c: any, idx: number) => {
              const courseName = (c.programs && c.programs[0]) || (c.courses && c.courses[0]) || 'Course';
              const collegeLoc = (c.latitude !== undefined && c.longitude !== undefined) ? { lat: Number(c.latitude), lon: Number(c.longitude) } : (c.location && typeof c.location === 'object' ? { lat: Number(c.location.lat) || location.lat, lon: Number(c.location.lon) || location.lon } : { lat: location.lat, lon: location.lon });
              const distance_km = haversineDistance(location.lat, location.lon, collegeLoc.lat, collegeLoc.lon);
              const final_score = ((c.rating || 4) / 5) * 0.7 + (1 / (1 + distance_km / 10)) * 0.3;
              return {
                college: { id: c.id || `srv_${idx}`, name: c.name || c.college || '', location: collegeLoc, city: c.city || '', state: c.state || '', rating: c.rating || 4, type: c.type || 'Private' },
                course: { id: `${c.id || 'srv'}-0`, name: courseName, description: c.description || '', degree: c.degree || 'B.Tech', fees: parseInt((c.fees || '0').toString().replace(/[^0-9]/g, '')) || 0, seats: c.seats || 0, tags: c.medium || c.tags || [] },
                distance_km,
                score_breakdown: { final_score, semantic_score: final_score, text_score: final_score, distance_score: 1 / (1 + distance_km / 10), rating_score: (c.rating || 4) / 5, availability_score: 0 },
                sources: ['server'],
                rationale: `${c.name || 'College'} - ${courseName}: ${Math.round(final_score * 100)}% match.`
              } as RecommendationResult;
            });

            // If server provided pagination/total info, use it, otherwise assume single page
            const serverTotal = Number(data.total || data.totalCount || (data.pagination && data.pagination.total) || mapped.length) || mapped.length;
            const serverPageSize = Number((data.pagination && data.pagination.pageSize) || 10) || 10;
            const serverTotalPages = Math.max(1, Math.ceil(serverTotal / serverPageSize));
            const serverHasNext = page < serverTotalPages;

            if (page === 1) setRecommendations(mapped); else setRecommendations(prev => [...prev, ...mapped]);
            setPagination({ page, pageSize: serverPageSize, total: serverTotal, totalPages: serverTotalPages, hasNext: serverHasNext });

            setMetadata({ candidateSources: data.metadata?.candidateSources || { geo: mapped.length, text: 0, semantic: 0, merged: mapped.length }, searchParams: { lat: location.lat, lon: location.lon, filters } });

            if (page === 1) setCachedResults(cacheKey, { results: mapped, pagination: { page, pageSize: serverPageSize, total: serverTotal, totalPages: serverTotalPages, hasNext: serverHasNext }, metadata: data.metadata || { candidateSources: { geo: mapped.length, text: 0, semantic: 0, merged: mapped.length }, searchParams: { lat: location.lat, lon: location.lon, filters } } } as RecommendationResponse);
            setLoading(false);
            return;
          }
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
          {location && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin className={`h-4 w-4 ${locationStatus === 'granted' ? 'text-green-600' : 'text-orange-600'}`} />
            <div className="text-sm text-muted-foreground">
              {placeName ? (
                <span>📍 Location: <strong>{placeName}</strong>{locationStatus !== 'granted' ? ' (approx.)' : ''}</span>
              ) : (
                <span>📍 Location: {location.lat.toFixed(4)}, {location.lon.toFixed(4)}</span>
              )}
            </div>
            <div className="ml-3">
              <Button variant="ghost" size="sm" onClick={() => setShowLocationModal(true)}>Correct location</Button>
            </div>
          </div>
        )}
      </div>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      {infoMessage && <Alert><AlertDescription>{infoMessage}</AlertDescription></Alert>}

      {/* Location correction modal */}
      {showLocationModal && location && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-card rounded-lg p-6 max-w-xl w-full">
            <h3 className="text-lg font-medium mb-2">Confirm or correct your location</h3>
            <p className="text-sm text-muted-foreground mb-4">If this location is inaccurate, you can drop a pin in Google Maps and paste coordinates here, or paste an address. We'll use that precise location for recommendations.</p>
            <div className="mb-3">
              <a href={`https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lon}`} target="_blank" rel="noreferrer" className="text-primary underline">Open Google Maps to drop a pin</a>
            </div>
            <div className="mb-3">
              <label className="text-sm block mb-1">Paste coordinates (lat,lon) or address</label>
              <input value={manualLocationInput} onChange={(e) => setManualLocationInput(e.target.value)} placeholder="e.g. 12.9716,77.5946 or MG Road, Bengaluru" className="w-full rounded-md border px-2 py-1" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowLocationModal(false)}>Cancel</Button>
              <Button onClick={async () => {
                // Try to parse coordinates
                const v = manualLocationInput.trim();
                let parsedLat: number | null = null;
                let parsedLon: number | null = null;
                if (v.includes(',')) {
                  const parts = v.split(',').map(p => p.trim());
                  const a = parseFloat(parts[0]);
                  const b = parseFloat(parts[1]);
                  if (!Number.isNaN(a) && !Number.isNaN(b)) {
                    parsedLat = a; parsedLon = b;
                  }
                }
                try {
                  if (parsedLat !== null && parsedLon !== null) {
                    setLocation({ lat: parsedLat, lon: parsedLon });
                    setLocationStatus('granted');
                    setShowLocationModal(false);
                  } else {
                    // Use Nominatim to geocode address to coords
                    const q = encodeURIComponent(v);
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&q=${q}`);
                    if (res.ok) {
                      const arr = await res.json();
                      if (Array.isArray(arr) && arr.length > 0) {
                        const first = arr[0];
                        const lat = parseFloat(first.lat); const lon = parseFloat(first.lon);
                        if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
                          setLocation({ lat, lon });
                          setLocationStatus('granted');
                          setShowLocationModal(false);
                        } else {
                          throw new Error('Unable to parse location');
                        }
                      } else {
                        throw new Error('No results found');
                      }
                    } else {
                      throw new Error('Geocoding failed');
                    }
                  }
                } catch (err) {
                  console.error('Failed to use manual location:', err);
                  // Show brief alert
                  setInfoMessage('Failed to parse location. Please paste coordinates like: 12.9716,77.5946');
                }
              }}>Use these coordinates</Button>
              <Button variant="secondary" onClick={async () => {
                // Save current location to user's profile
                if (!location) return;
                setSavingLocation(true);
                try {
                  const place = placeName || `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`;
                  await updateProfile({ profileData: { savedLocation: { lat: location.lat, lon: location.lon, place } } });
                  toast.success('Saved location to your profile');
                  setShowLocationModal(false);
                } catch (err) {
                  console.error('Failed to save location:', err);
                  toast.error('Failed to save location');
                } finally { setSavingLocation(false); }
              }}>{savingLocation ? 'Saving...' : 'Save to my account'}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Filter panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Filters & Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm">Max Distance (km)</label>
              <input type="range" min={5} max={5000} value={maxDistance} onChange={(e) => setMaxDistance(Number(e.target.value))} className="w-full" />
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
              <Button variant="outline" onClick={() => { setMaxDistance(500); setMaxFees(500000); setMinRating(0); setMedium('any'); setSortBy('match'); }}>Reset</Button>
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
                {/* Pagination summary */}
                {pagination && typeof pagination.total === 'number' && pagination.total > 0 && (
                  <div className="mt-4 text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <div>Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong></div>
                    <div>•</div>
                    <div><strong>{pagination.total}</strong> colleges</div>
                  </div>
                )}
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

              {pagination.hasNext && (
                <div className="text-center">
                  <Button onClick={loadMore} disabled={loading} variant="outline">
                    {loading ? 'Loading...' : `Load More (Page ${pagination.page + 1} of ${pagination.totalPages})`}
                  </Button>
                  {typeof pagination.total === 'number' && (
                    <div className="text-xs text-muted-foreground mt-2">{Math.max(0, pagination.total - (pagination.page * pagination.pageSize))} remaining</div>
                  )}
                </div>
              )}
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
