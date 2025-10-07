import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { collegeDatabase, filterColleges, getCollegesByState, College } from '../utils/collegeDatabase';
import { dataStore } from '../utils/dataStore';
import { getLocationWithStatus, getLocationSafely, calculateDistance, isLocationAvailable, clearLocationCache } from '../utils/locationUtils';
import { useThemeAwareApi } from './useThemeAwareApi';
import { LocationHandler } from './LocationHandler';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { toast } from 'sonner@2.0.3';
import { 
  GraduationCap, 
  MapPin, 
  Search, 
  Filter, 
  Star, 
  Users, 
  IndianRupee,
  Wifi,
  Book,
  Home,
  Car,
  ExternalLink,
  Phone,
  Trophy,
  Navigation,
  Loader2,
  RefreshCw,
  AlertCircle,
  BarChart3,
  PieChart,
  TrendingUp,
  Award,
  Target,
  Building,
  Calendar,
  Clock,
  Zap,
  Shield,
  Briefcase,
  Globe,
  CheckCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

// Enhanced data for charts
const collegeTypeDistribution = [
  { name: 'Government', value: 45, count: 67, color: '#3b82f6' },
  { name: 'Private', value: 40, count: 60, color: '#8b5cf6' },
  { name: 'Deemed', value: 15, count: 23, color: '#06b6d4' }
];

const feeVsRatingData = collegeDatabase.slice(0, 20).map(college => ({
  name: college.name.split(' ').slice(0, 2).join(' '),
  fees: parseFloat(college.fees.replace(/[₹,LPA\s]/g, '')),
  rating: college.rating,
  type: college.type,
  placement: college.placementRate
}));

const stateWiseDistribution = [
  { state: 'Andhra Pradesh', count: 65, color: '#3b82f6' },
  { state: 'Telangana', count: 45, color: '#8b5cf6' },
  { state: 'Tamil Nadu', count: 25, color: '#06b6d4' },
  { state: 'Karnataka', count: 15, color: '#10b981' }
];

const placementTrends = [
  { year: '2020', avgPackage: 4.2, placementRate: 78 },
  { year: '2021', avgPackage: 4.8, placementRate: 82 },
  { year: '2022', avgPackage: 5.4, placementRate: 85 },
  { year: '2023', avgPackage: 6.1, placementRate: 88 },
  { year: '2024', avgPackage: 6.8, placementRate: 91 }
];

// Get unique states from the database for filtering
const getUniqueStates = () => {
  return Array.from(new Set(collegeDatabase.map(college => college.state))).sort();
};

const facilityIcons = {
  'Library': Book,
  'Digital Library': Book,
  'Central Library': Book,
  'WiFi': Wifi,
  'Hostels': Home,
  'Hostel': Home,
  'Sports Complex': Trophy,
  'Sports Facilities': Trophy,
  'Sports Ground': Trophy,
  'Sports': Trophy,
  'Parking': Car,
  'Transport': Car,
  'Labs': Zap,
  'Computer Labs': Zap,
  'Research Labs': Zap,
  'Workshop': Building,
  'Cafeteria': Users,
  'Medical Center': Shield,
  'Placement Cell': Briefcase,
  'International Programs': Globe
};

export function EnhancedColleges() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [filteredColleges, setFilteredColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [isLocating, setIsLocating] = useState(false);
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [maxDistance, setMaxDistance] = useState(50);
  const [viewMode, setViewMode] = useState<'grid' | 'analytics'>('grid');

  const { currentUser } = useThemeAwareApi();

  useEffect(() => {
    loadColleges();
    checkLocationPermission();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [colleges, searchTerm, selectedState, selectedType, selectedCourse, selectedCategory, userLocation, nearbyOnly, maxDistance]);

  const loadColleges = async () => {
    try {
      // Try to fetch from API first, fallback to local database
      const response = await api.getColleges().catch(() => null);
      const collegeData = response?.colleges || collegeDatabase;
      setColleges(collegeData);
    } catch (error) {
      console.error('Failed to load colleges:', error);
      setColleges(collegeDatabase);
    } finally {
      setLoading(false);
    }
  };

  const checkLocationPermission = () => {
    if (!isLocationAvailable()) {
      setLocationPermission('denied');
      return;
    }

    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' })
        .then(result => {
          setLocationPermission(result.state);
          result.addEventListener('change', () => {
            setLocationPermission(result.state);
          });
        })
        .catch(() => {
          setLocationPermission('prompt');
        });
    } else {
      setLocationPermission('prompt');
    }
  };

  const requestLocation = async () => {
    if (!isLocationAvailable()) {
      toast.error('Location services are not available in this environment');
      return;
    }

    setIsLocating(true);
    try {
      const result = await getLocationWithStatus();
      // normalize location object to {lat, lng}
      const loc = result.location;
      setUserLocation({ lat: (loc as any).latitude ?? (loc as any).lat, lng: (loc as any).longitude ?? (loc as any).lng });
      
      if (result.status === 'success') {
        setLocationPermission('granted');
        toast.success(result.message);
      } else {
        setLocationPermission('granted'); // Still set as granted since we have a location
        toast.info(result.message);
      }
    } catch (error) {
      console.debug('Location request failed, using fallback');
      setLocationPermission('denied');
      // set fallback coordinates (Hyderabad)
      setUserLocation({ lat: 17.3850, lng: 78.4867 });
      toast.info('Using default location. You can still browse all colleges.');
    } finally {
      setIsLocating(false);
    }
  };

  const applyFilters = () => {
    let filtered = colleges;

    // Text search
    if (searchTerm) {
      filtered = filtered.filter(college => 
        college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        college.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        college.courses.some(course => course.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // State filter
    if (selectedState && selectedState !== 'all') {
      filtered = filtered.filter(college => college.state === selectedState);
    }

    // Type filter
    if (selectedType && selectedType !== 'all') {
      filtered = filtered.filter(college => college.type === selectedType);
    }

    // Course filter
    if (selectedCourse) {
      filtered = filtered.filter(college => 
        college.courses.some(course => course.toLowerCase().includes(selectedCourse.toLowerCase()))
      );
    }

    // Category filter (IIT, NIT, Others)
    if (selectedCategory) {
      if (selectedCategory === 'IIT') {
        filtered = filtered.filter(college => 
          college.name.toLowerCase().includes('iit') || 
          college.name.toLowerCase().includes('indian institute of technology')
        );
      } else if (selectedCategory === 'NIT') {
        filtered = filtered.filter(college => 
          college.name.toLowerCase().includes('nit') || 
          college.name.toLowerCase().includes('national institute of technology')
        );
      } else if (selectedCategory === 'Others') {
        filtered = filtered.filter(college => 
          !college.name.toLowerCase().includes('iit') && 
          !college.name.toLowerCase().includes('indian institute of technology') &&
          !college.name.toLowerCase().includes('nit') && 
          !college.name.toLowerCase().includes('national institute of technology')
        );
      }
    }

    // Location-based filter
    if (nearbyOnly && userLocation) {
      filtered = filtered.filter(college => {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          college.latitude,
          college.longitude
        );
        return distance <= maxDistance;
      });
    }

    // Sort by relevance (distance if location available, otherwise by rating)
    if (userLocation) {
      filtered.sort((a, b) => {
        const distanceA = calculateDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude);
        const distanceB = calculateDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude);
        return distanceA - distanceB;
      });
    } else {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    setFilteredColleges(filtered);
  };

  const CollegeCard = ({ college }: { college: College }) => {
    const distance = userLocation 
      ? calculateDistance(userLocation.lat, userLocation.lng, college.latitude, college.longitude)
      : null;

    return (
      <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg leading-tight">{college.name}</CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {college.city}, {college.state}
              </CardDescription>
            </div>
            <Badge variant={
              college.type === 'Government' ? 'default' : 
              college.type === 'Private' ? 'secondary' : 'outline'
            }>
              {college.type}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{college.rating}</span>
              <span className="text-sm text-muted-foreground">({college.reviews})</span>
            </div>
            
            <div className="flex items-center gap-1">
              <IndianRupee className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-600">{college.fees}</span>
            </div>
            
            {distance && (
              <div className="flex items-center gap-1">
                <Navigation className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">{distance} km</span>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Placement Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Placement Rate</div>
              <div className="flex items-center gap-2">
                <Progress value={college.placementRate} className="flex-1 h-2" />
                <span className="text-sm font-medium">{college.placementRate}%</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Avg Package</div>
              <div className="font-medium text-green-600">{college.averagePackage}</div>
            </div>
          </div>

          {/* Courses */}
          <div>
            <div className="text-sm text-muted-foreground mb-2">Popular Courses</div>
            <div className="flex flex-wrap gap-1">
              {college.courses.slice(0, 3).map((course, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {course.length > 20 ? course.substring(0, 20) + '...' : course}
                </Badge>
              ))}
              {college.courses.length > 3 && (
                <Badge variant="outline" className="text-xs">+{college.courses.length - 3} more</Badge>
              )}
            </div>
          </div>

          {/* Facilities */}
          <div>
            <div className="text-sm text-muted-foreground mb-2">Key Facilities</div>
            <div className="flex flex-wrap gap-2">
              {college.facilities.slice(0, 4).map((facility, index) => {
                const IconComponent = facilityIcons[facility as keyof typeof facilityIcons] || Building;
                return (
                  <div key={index} className="flex items-center gap-1 text-xs bg-muted/50 px-2 py-1 rounded">
                    <IconComponent className="h-3 w-3" />
                    <span>{facility}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button size="sm" className="flex-1">
              <ExternalLink className="h-3 w-3 mr-1" />
              View Details
            </Button>
            <Button size="sm" variant="outline" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${college.latitude},${college.longitude}${userLocation ? `&origin=${userLocation.lat},${userLocation.lng}` : ''}`)}>
              <Navigation className="h-3 w-3 mr-1" />
              Get Directions
            </Button>
            <Button size="sm" variant="ghost" onClick={() => window.open(`tel:${college.phone}`)}>
              <Phone className="h-3 w-3 mr-1" />
              Contact
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const AnalyticsView = () => (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Colleges</p>
                <p className="text-2xl font-bold">{colleges.length}</p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">IITs</p>
                <p className="text-2xl font-bold">{colleges.filter(c => /\biit\b|indian institute of technology/i.test(c.name)).length}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">NITs</p>
                <p className="text-2xl font-bold">{colleges.filter(c => /\bnit\b|national institute of technology/i.test(c.name)).length}</p>
              </div>
              <Briefcase className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">States Covered</p>
                <p className="text-2xl font-bold">{Array.from(new Set(colleges.map(c => c.state))).length}</p>
              </div>
              <MapPin className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* College Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              College Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={collegeTypeDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {collegeTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* State-wise Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              State-wise Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stateWiseDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="state" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {stateWiseDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Fees vs Rating Scatter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Fees vs Rating Analysis
          </CardTitle>
          <CardDescription>
            Relationship between college fees and ratings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={feeVsRatingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fees" name="Fees (LPA)" />
              <YAxis dataKey="rating" name="Rating" />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">{data.name}</p>
                        <p className="text-sm">Rating: {data.rating}</p>
                        <p className="text-sm">Fees: ₹{data.fees} LPA</p>
                        <p className="text-sm">Placement: {data.placement}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter dataKey="rating" fill="#3b82f6" />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Placement Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Placement Trends (2020-2024)
          </CardTitle>
          <CardDescription>
            Average package and placement rate trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={placementTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="avgPackage" 
                stackId="1" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                name="Avg Package (LPA)"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="placementRate" 
                stroke="#10b981" 
                strokeWidth={3}
                name="Placement Rate (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading colleges...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Explore Colleges</h1>
          <p className="text-muted-foreground mt-1">
            Discover {colleges.length} colleges across India with detailed information
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Building className="h-4 w-4 mr-1" />
            Colleges
          </Button>
          <Button
            variant={viewMode === 'analytics' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('analytics')}
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Quick Category Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant={selectedCategory === '' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('')}
        >
          All Colleges ({colleges.length})
        </Button>
        <Button
          variant={selectedCategory === 'IIT' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('IIT')}
        >
          IIT Colleges ({colleges.filter(c => c.name.toLowerCase().includes('iit')).length})
        </Button>
        <Button
          variant={selectedCategory === 'NIT' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('NIT')}
        >
          NIT Colleges ({colleges.filter(c => c.name.toLowerCase().includes('nit')).length})
        </Button>
        <Button
          variant={selectedCategory === 'Others' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('Others')}
        >
          Other Colleges ({colleges.filter(c => !c.name.toLowerCase().includes('iit') && !c.name.toLowerCase().includes('nit')).length})
        </Button>
      </div>

      {viewMode === 'analytics' ? (
        <AnalyticsView />
      ) : (
        <>
          {/* Location Access */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Services
              </CardTitle>
              <CardDescription>
                Enable location access to find colleges near you
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userLocation ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Location detected successfully</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={requestLocation} 
                    disabled={isLocating}
                    variant="outline"
                  >
                    {isLocating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Getting Location...
                      </>
                    ) : (
                      <>
                        <Navigation className="h-4 w-4 mr-2" />
                        Enable Location
                      </>
                    )}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {locationPermission === 'denied' 
                      ? 'Location access disabled - using default location (Hyderabad)'
                      : 'Click to allow location access for nearby colleges'
                    }
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search & Filter Colleges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Bar */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search colleges, cities, or courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </div>

              {/* Filters */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label>State</Label>
                    <Select value={selectedState} onValueChange={setSelectedState}>
                      <SelectTrigger>
                        <SelectValue placeholder="All States" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All States</SelectItem>
                        {getUniqueStates().map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Type</Label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Government">Government</SelectItem>
                        <SelectItem value="Private">Private</SelectItem>
                        <SelectItem value="Deemed">Deemed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Course</Label>
                    <Input
                      placeholder="e.g. Computer Science"
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                    />
                  </div>

                  {userLocation && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="nearby"
                          checked={nearbyOnly}
                          onCheckedChange={setNearbyOnly}
                        />
                        <Label htmlFor="nearby">Nearby only</Label>
                      </div>
                      {nearbyOnly && (
                        <div>
                          <Label className="text-xs">Max Distance: {maxDistance} km</Label>
                          <Input
                            type="range"
                            min="5"
                            max="200"
                            value={maxDistance}
                            onChange={(e) => setMaxDistance(Number(e.target.value))}
                            className="mt-1"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Results Summary */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Showing {filteredColleges.length} of {colleges.length} colleges
                  {nearbyOnly && userLocation && ` within ${maxDistance} km`}
                </span>
                {(searchTerm || (selectedState && selectedState !== 'all') || (selectedType && selectedType !== 'all') || selectedCourse || selectedCategory || nearbyOnly) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedState('all');
                      setSelectedType('all');
                      setSelectedCourse('');
                      setSelectedCategory('');
                      setNearbyOnly(false);
                    }}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Colleges Grid */}
          {filteredColleges.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No colleges found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or filters
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedState('all');
                    setSelectedType('all');
                    setSelectedCourse('');
                    setNearbyOnly(false);
                  }}
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredColleges.map((college) => (
                <CollegeCard key={college.id} college={college} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
