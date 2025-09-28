# Advanced Recommendation System

## Overview

The Educational Guidance App now features a sophisticated AI-powered recommendation system that provides personalized college and course suggestions based on multiple factors including location, aptitude test results, and user preferences.

## System Architecture

### Three-Tier Architecture
```
Frontend (React) → Backend (Supabase + Hono) → Database (KV Store)
```

### Core Components

1. **Candidate Generation**: Multi-source candidate discovery
2. **Scoring & Ranking**: Composite scoring algorithm
3. **Real-time Location**: GPS-based proximity matching
4. **Semantic Analysis**: AI-powered content matching

## API Endpoints

### Primary Recommendation Endpoint
```
POST /api/recommend
```

**Request Body:**
```json
{
  "lat": 28.6139,
  "lon": 77.2090,
  "quizResults": {}, // Optional, fetched from user profile if not provided
  "filters": {
    "maxDistance": 50 // km radius
  },
  "page": 1,
  "pageSize": 20
}
```

**Response:**
```json
{
  "results": [
    {
      "college": {
        "id": "iit-delhi",
        "name": "IIT Delhi",
        "location": { "lat": 28.5449, "lon": 77.1926 },
        "city": "Delhi",
        "state": "Delhi",
        "rating": 4.8,
        "type": "Public"
      },
      "course": {
        "id": "iit-cse",
        "name": "Computer Science Engineering",
        "description": "Elite computer science program with cutting-edge research",
        "degree": "B.Tech",
        "fees": 250000,
        "seats": 60,
        "tags": ["technology", "engineering", "research", "AI"]
      },
      "distance_km": 12.4,
      "score_breakdown": {
        "final_score": 0.89,
        "semantic_score": 0.92,
        "text_score": 0.85,
        "distance_score": 0.88,
        "rating_score": 0.96,
        "availability_score": 0.60
      },
      "sources": ["geographic", "semantic_search"],
      "rationale": "Strong alignment with your aptitude profile, Recommended for logical strengths"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 45,
    "totalPages": 3,
    "hasNext": true
  },
  "metadata": {
    "candidateSources": {
      "geo": 25,
      "text": 18,
      "semantic": 22,
      "merged": 45
    }
  }
}
```

### Debug Endpoint
```
GET /api/recommend/debug?lat=28.6139&lon=77.2090
```

Returns detailed information about the recommendation process for debugging and tuning.

## Recommendation Algorithm

### 1. Candidate Generation (Parallel Processing)

#### Geographic Candidates
- Calculates distance using Haversine formula
- Filters by proximity (default 50km radius)
- Sorts by distance
- Expands to include all courses from nearby colleges

#### Text Search Candidates
- Extracts search terms from user's aptitude profile
- Matches against course names, descriptions, and tags
- Weighted scoring: course name (2x), description (1x), tags (1.5x)

#### Semantic Candidates
- Uses semantic similarity scoring between user aptitude and course content
- Course category mapping for domain alignment
- Tag-based bonus scoring

### 2. Merging & Deduplication
- Combines all candidate sources
- Eliminates duplicates using college_id + course_id keys
- Preserves source attribution for transparency

### 3. Composite Scoring Algorithm

```javascript
final_score = 
  0.35 * semantic_score +
  0.25 * text_score +
  0.20 * distance_score +
  0.15 * rating_score +
  0.05 * availability_score
```

#### Score Components:
- **Semantic Score**: Aptitude-course alignment (0-1)
- **Text Score**: Keyword matching strength (0-1)
- **Distance Score**: `1 / (1 + distance_km / 10)` (0-1)
- **Rating Score**: College rating normalized (0-1)
- **Availability Score**: Seat availability factor (0-1)

### 4. Ranking & Pagination
- Sorts by final composite score (descending)
- Implements cursor-based pagination
- Returns detailed score breakdown for transparency

## College Database

The system includes a comprehensive database of real colleges with:

### Sample Colleges:
1. **IIT Delhi** - Premier engineering institution
2. **Delhi University** - Comprehensive university
3. **NIFT Delhi** - Design and fashion institute
4. **Aligarh Muslim University** - Multi-disciplinary university
5. **JNU Delhi** - Research-focused university

### Data Structure:
```javascript
{
  id: 'college-id',
  name: 'College Name',
  type: 'Public/Private',
  city: 'City',
  state: 'State',
  location: { lat: 28.xxxx, lon: 77.xxxx },
  rating: 4.5,
  established: 1961,
  courses: [
    {
      id: 'course-id',
      name: 'Course Name',
      description: 'Detailed description',
      degree: 'B.Tech/B.Sc/M.A',
      fees: 250000,
      seats: 60,
      tags: ['technology', 'engineering']
    }
  ]
}
```

## Semantic Similarity

### Course Category Mapping
Maps courses to aptitude categories with relevance weights:

```javascript
'Computer Science': { 
  logical: 0.9, 
  analytical: 0.8, 
  practical: 0.6 
},
'Data Science': { 
  analytical: 0.9, 
  logical: 0.8, 
  scientific: 0.7 
}
```

### Aptitude Term Extraction
Converts user aptitude scores to search terms:
- **Logical**: ['computer', 'programming', 'software', 'logic']
- **Creative**: ['design', 'art', 'creative', 'innovation']
- **Analytical**: ['data', 'analysis', 'statistics', 'research']

## Real-time Features

### GPS Integration
- Automatic location detection via `navigator.geolocation`
- Fallback to default coordinates (Delhi: 28.6139, 77.2090)
- Real-time distance calculations

### Live Filtering
- Dynamic radius adjustment
- Course type filtering
- Degree level filtering

## Performance Optimizations

### Candidate Limits
- Geographic: 500 candidates max
- Text search: 200 candidates max  
- Semantic: 200 candidates max
- Final results: Paginated (20 per page)

### Parallel Processing
- All candidate generation runs in parallel
- Promise.allSettled for error resilience
- Graceful fallbacks if individual sources fail

## Authentication & Security

### Protected Endpoints
All recommendation endpoints require authentication:
```javascript
Authorization: Bearer <token>
```

### Demo Mode Support
- Handles demo tokens gracefully
- Falls back to sample data when services unavailable
- Maintains functionality for development/testing

## Frontend Integration

### React Component: AdvancedRecommendationEngine
Located at `/components/AdvancedRecommendationEngine.tsx`

#### Features:
- Real-time location detection
- Interactive recommendation cards
- Detailed score breakdowns
- Debug information panel
- Pagination support
- Loading states and error handling

#### UI Components:
- Score visualization with color coding
- Source attribution badges
- Distance and rating indicators
- Tag-based filtering
- Responsive grid layout

## Configuration

### Scoring Weights (Tunable)
```javascript
{
  weights: {
    semantic: 0.35,    // Aptitude alignment
    text: 0.25,        // Keyword matching
    distance: 0.20,    // Geographic proximity
    rating: 0.15,      // College reputation
    availability: 0.05 // Seat availability
  }
}
```

### Distance Parameters
- Default search radius: 50km
- Maximum search radius: 100km
- Distance scoring factor: 10km normalization

## Testing & Debugging

### Debug Mode
Access via the debug tab in the frontend or direct API call:
- Shows candidate generation statistics
- Displays scoring weight configuration
- Provides sample data from each source
- User aptitude profile analysis

### Sample Test Request
```bash
curl -X POST "${API_URL}/api/recommend" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "lat": 28.6139,
    "lon": 77.2090,
    "filters": {
      "maxDistance": 25
    },
    "page": 1,
    "pageSize": 10
  }'
```

## Future Enhancements

### Planned Features:
1. **Advanced Filters**: Fee range, course duration, entrance exams
2. **Machine Learning**: Collaborative filtering based on similar users
3. **External APIs**: Integration with college admission APIs
4. **Caching**: Redis integration for performance
5. **Analytics**: User interaction tracking and recommendation effectiveness

### Scalability Considerations:
- Database indexing for large college datasets
- Search result caching
- Elasticsearch integration for advanced text search
- Vector database for semantic search
- CDN for static college data

## Monitoring & Analytics

### Key Metrics:
- Recommendation response time
- User interaction rates
- Score distribution analysis
- Geographic coverage
- Quiz completion to recommendation conversion

### Error Handling:
- Graceful degradation when services are unavailable
- Detailed error logging
- User-friendly error messages
- Fallback to cached/default data

---

This recommendation system provides a solid foundation for intelligent educational guidance, combining multiple data sources and advanced algorithms to deliver personalized, location-aware suggestions to students.