import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { collegeDatabase, filterColleges, getCollegesByState, College } from '../utils/collegeDatabase';
import { getCurrentLocation, reverseGeocode, calculateDistance, dataStore, isGeolocationAvailable } from '../utils/dataStore';
import { useThemeAwareApi } from './useThemeAwareApi';
import { LocationHandler } from './LocationHandler';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
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
  AlertCircle
} from 'lucide-react';

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
  'Research Labs': Users,
  'Modern Labs': Users,
  'Labs': Users,
  'Computer Labs': Users,
  'Computer Centers': Users,
  'Innovation Hub': Users,
  'Innovation Center': Users,
  'Innovation Cell': Users,
  'Research Centers': Users,
  'Hospital': Users,
  'Teaching Hospital': Users,
  'Super Specialty Hospital': Users,
  'Medical Center': Users,
  'Gymnasium': Users,
  'Auditorium': Users,
  'Design Studios': Users,
  'Workshops': Users,
  'Tech Parks': Users,
  'Research Parks': Users,
  'Guest Houses': Home,
  'International Programs': Users,
  'International Collaborations': Users,
  'Smart Campus': Users,
  'Modern Infrastructure': Users,
  'Multi-Campus': Users,
  'Multiple Campuses': Users,
  'Canteen': Users,
  'Cafeteria': Users,
  'Cultural Center': Users,
  'Chapel': Users,
  'Computer Lab': Users
};

interface CollegeWithDistance extends College {
  distance?: number;
}

export function Colleges() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedState, setSelectedState] = useState('all');
  const [maxDistance, setMaxDistance] = useState('all');
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('rating');
  const [collegesData, setCollegesData] = useState<CollegeWithDistance[]>(collegeDatabase);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number, address: string} | null>(null);
  const [showLocationHandler, setShowLocationHandler] = useState(false);
  const [locationWatchId, setLocationWatchId] = useState<number | null>(null);
  const [hideLocationAlert, setHideLocationAlert] = useState(localStorage.getItem('hideLocationAlert') === 'true');
  const { colleges: collegeApi } = useThemeAwareApi();

  useEffect(() => {
    initializeLocation();
    return () => {
      // Cleanup location watch on unmount
      if (locationWatchId) {
        navigator.geolocation.clearWatch(locationWatchId);
      }
    };
  }, []);

  useEffect(() => {
    searchColleges();
  }, [searchTerm, selectedProgram, selectedType, selectedState, maxDistance, selectedFacilities, sortBy, userLocation]);

  const initializeLocation = async () => {
    setLocationLoading(true);
    
    try {
      // Check for saved location first
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        const savedLocation = dataStore.getUserLocation(user.uid);
        if (savedLocation) {
          setUserLocation({
            lat: savedLocation.latitude,
            lng: savedLocation.longitude,
            address: savedLocation.address
          });
          setLocationLoading(false);
          toast.success('Using saved location', {
            description: savedLocation.address
          });
          return;
        }
      }

      // Check if geolocation is available before trying
      const isAvailable = await isGeolocationAvailable();
      if (!isAvailable) {
        console.log('Geolocation not available, using manual location setup');
        setShowLocationHandler(true);
        setLocationLoading(false);
        return;
      }

      // Try to get current location
      await getCurrentLocationAndWatch();
    } catch (error) {
      console.log('Location initialization failed:', error);
      setShowLocationHandler(true);
    } finally {
      setLocationLoading(false);
    }
  };

  const getCurrentLocationAndWatch = async () => {
    try {
      // Get initial location with timeout handling
      const position = await getCurrentLocation();
      
      // Get address with fallback
      let address = 'Location detected';
      try {
        address = await reverseGeocode(position.latitude, position.longitude);
      } catch (geocodeError) {
        console.log('Reverse geocoding failed, using coordinates');
        address = `${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)}`;
      }
      
      const location = {
        lat: position.latitude,
        lng: position.longitude,
        address: address
      };
      
      setUserLocation(location);
      
      // Save location
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        dataStore.saveUserLocation(user.uid, {
          latitude: position.latitude,
          longitude: position.longitude,
          address: address
        });
      }
      
      toast.success('Location detected successfully!', {
        description: `Found you in ${address}`
      });

      // Only start watching if geolocation is fully supported and permitted
      if (navigator.geolocation && await isGeolocationAvailable()) {
        try {
          const watchId = navigator.geolocation.watchPosition(
            (position) => {
              const newLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                address: address // Keep the same address for small movements
              };
              
              // Only update if location has changed significantly (>1km)
              if (userLocation) {
                const distance = calculateDistance(
                  userLocation.lat, 
                  userLocation.lng, 
                  newLocation.lat, 
                  newLocation.lng
                );
                
                if (distance > 1) { // 1 kilometer
                  setUserLocation(newLocation);
                  toast.info('Location updated', {
                    description: 'Finding colleges near your new location'
                  });
                }
              }
            },
            (error) => {
              console.log('Location watch error (non-critical):', error);
              // Don't show error to user for watch failures
            },
            {
              enableHighAccuracy: false, // Use less battery
              timeout: 15000,
              maximumAge: 900000 // 15 minutes
            }
          );
          
          setLocationWatchId(watchId);
        } catch (watchError) {
          console.log('Could not start location watching:', watchError);
          // Continue without watching - not critical
        }
      }
      
    } catch (error) {
      throw error;
    }
  };

  const handleLocationSet = (location: {lat: number, lng: number, address: string}) => {
    setUserLocation(location);
    setShowLocationHandler(false);
    toast.success('Location set successfully!');
  };

  const refreshLocation = async () => {
    setLocationLoading(true);
    try {
      // Check if geolocation is available first
      const isAvailable = await isGeolocationAvailable();
      if (!isAvailable) {
        toast.info('Location not available', {
          description: 'Please set your location manually'
        });
        setShowLocationHandler(true);
        return;
      }

      await getCurrentLocationAndWatch();
    } catch (error) {
      console.log('Location refresh failed:', error);
      toast.info('Location access unavailable', {
        description: 'You can set your location manually for better results'
      });
      setShowLocationHandler(true);
    } finally {
      setLocationLoading(false);
    }
  };

  const searchColleges = async () => {
    setLoading(true);
    try {
      // Use local database with advanced filtering
      let filteredData: CollegeWithDistance[] = [...collegeDatabase];

      // Add distance calculation if user location is available
      if (userLocation) {
        filteredData = filteredData.map(college => ({
          ...college,
          distance: calculateDistance(
            userLocation.lat,
            userLocation.lng,
            college.latitude,
            college.longitude
          )
        }));
      }

      // Apply search filter
      if (searchTerm) {
        filteredData = filteredData.filter(college => 
          college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          college.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          college.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
          college.courses.some(course => course.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      // Apply filters
      const filters: any = {};
      
      if (selectedProgram !== 'all') {
        filters.courses = [selectedProgram];
      }
      
      if (selectedType !== 'all') {
        filters.type = [selectedType];
      }

      if (selectedState !== 'all') {
        filteredData = filteredData.filter(college => college.state === selectedState);
      }

      // Apply distance filter
      if (maxDistance !== 'all' && userLocation) {
        const maxDistanceNum = parseFloat(maxDistance);
        filteredData = filteredData.filter(college => 
          college.distance !== undefined && college.distance <= maxDistanceNum
        );
      }

      // Apply the filter function (excluding distance which we handle separately)
      if (Object.keys(filters).length > 0) {
        filteredData = filterColleges(filteredData, filters) as CollegeWithDistance[];
      }

      // Apply facility filter
      if (selectedFacilities.length > 0) {
        filteredData = filteredData.filter(college =>
          selectedFacilities.every(facility => 
            college.facilities.some(f => f.toLowerCase().includes(facility.toLowerCase()))
          )
        );
      }

      // Apply sorting
      filteredData = filteredData.sort((a, b) => {
        switch (sortBy) {
          case 'distance':
            if (!userLocation) return 0;
            return (a.distance || 0) - (b.distance || 0);
          case 'rating':
            return b.rating - a.rating;
          case 'fees':
            const aFee = parseFloat(a.fees.replace(/[₹,LPA\s]/g, ''));
            const bFee = parseFloat(b.fees.replace(/[₹,LPA\s]/g, ''));
            return aFee - bFee;
          case 'name':
            return a.name.localeCompare(b.name);
          case 'established':
            return b.establishedYear - a.establishedYear;
          default:
            return 0;
        }
      });

      setCollegesData(filteredData);
    } catch (error) {
      console.error('Failed to search colleges:', error);
      setCollegesData(collegeDatabase);
    } finally {
      setLoading(false);
    }
  };

  const allFacilities = Array.from(new Set(collegeDatabase.flatMap(college => college.facilities)));
  const allStates = getUniqueStates();
  const allCourses = Array.from(new Set(collegeDatabase.flatMap(college => college.courses)));

  const filteredColleges = collegesData;

  const handleFacilityToggle = (facility: string) => {
    setSelectedFacilities(prev => 
      prev.includes(facility) 
        ? prev.filter(f => f !== facility)
        : [...prev, facility]
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">College Finder</h1>
          <p className="text-muted-foreground">
            Find colleges near you with the programs and facilities you need
          </p>
          {userLocation ? (
            <div className="flex items-center gap-2 mt-2 text-sm text-green-600 dark:text-green-400">
              <MapPin className="h-4 w-4" />
              <span>Your location: {userLocation.address}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-2 text-sm text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-4 w-4" />
              <span>Location not set • Showing all colleges</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Location Controls */}
          <div className="flex items-center gap-2">
            {locationLoading ? (
              <Button variant="outline" size="sm" disabled>
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                Getting Location...
              </Button>
            ) : userLocation ? (
              <Button variant="outline" size="sm" onClick={refreshLocation}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Update Location
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setShowLocationHandler(true)}>
                <Navigation className="h-4 w-4 mr-1" />
                Set Location
              </Button>
            )}
          </div>
          
          <Badge variant="outline" className="text-lg px-3 py-1">
            {filteredColleges.length} colleges found
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search colleges by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Select value={selectedProgram} onValueChange={setSelectedProgram}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                <SelectItem value="Computer Science Engineering">Computer Science</SelectItem>
                <SelectItem value="Electronics Engineering">Electronics</SelectItem>
                <SelectItem value="Mechanical Engineering">Mechanical</SelectItem>
                <SelectItem value="Civil Engineering">Civil</SelectItem>
                <SelectItem value="MBBS">Medical (MBBS)</SelectItem>
                <SelectItem value="Master of Business Administration">MBA</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {allStates.map(state => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Government">Government</SelectItem>
                <SelectItem value="Private">Private</SelectItem>
                <SelectItem value="Deemed">Deemed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={maxDistance} onValueChange={setMaxDistance} disabled={!userLocation}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder={userLocation ? "Distance" : "Location needed"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Distance</SelectItem>
                <SelectItem value="5">Within 5km</SelectItem>
                <SelectItem value="10">Within 10km</SelectItem>
                <SelectItem value="25">Within 25km</SelectItem>
                <SelectItem value="50">Within 50km</SelectItem>
                <SelectItem value="100">Within 100km</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">By Rating</SelectItem>
                <SelectItem value="fees">By Fees</SelectItem>
                <SelectItem value="name">By Name</SelectItem>
                <SelectItem value="established">By Year</SelectItem>
                {userLocation && (
                  <SelectItem value="distance">By Distance</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Facilities Filter */}
        <Card className="p-4">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter by Facilities
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {allFacilities.map(facility => (
              <div key={facility} className="flex items-center space-x-2">
                <Checkbox
                  id={facility}
                  checked={selectedFacilities.includes(facility)}
                  onCheckedChange={() => handleFacilityToggle(facility)}
                />
                <Label htmlFor={facility} className="text-sm cursor-pointer">
                  {facility}
                </Label>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* College Results */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-pulse">Searching colleges...</div>
        </div>
      )}
      
      <div className="space-y-4">
        {filteredColleges.map(college => (
          <Card key={college.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* College Image */}
                <div className="w-full lg:w-48 h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    <GraduationCap className="h-12 w-12 text-muted-foreground" />
                  </div>
                </div>

                {/* College Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{college.name}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {college.city}, {college.state}
                          {college.distance && (
                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                              • {college.distance.toFixed(1)}km away
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 stroke-yellow-400" />
                          {college.rating} ({college.reviews} reviews)
                        </div>
                        <Badge variant={college.type === 'Government' ? 'default' : 'secondary'}>
                          {college.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-primary">{college.fees}</div>
                      <div className="text-xs text-muted-foreground">Annual fees</div>
                    </div>
                  </div>

                  {/* Programs */}
                  <div>
                    <h4 className="font-medium mb-2">Courses Offered:</h4>
                    <div className="flex flex-wrap gap-2">
                      {college.courses.slice(0, 5).map(course => (
                        <Badge key={course} variant="outline">
                          {course}
                        </Badge>
                      ))}
                      {college.courses.length > 5 && (
                        <Badge variant="secondary">
                          +{college.courses.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Facilities */}
                  <div>
                    <h4 className="font-medium mb-2">Facilities:</h4>
                    <div className="flex flex-wrap gap-2">
                      {college.facilities.map(facility => {
                        const Icon = facilityIcons[facility as keyof typeof facilityIcons] || Users;
                        return (
                          <div key={facility} className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                            <Icon className="h-3 w-3" />
                            {facility}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-muted/50 rounded-lg text-sm">
                    <div>
                      <div className="font-medium">Established</div>
                      <div className="text-muted-foreground">{college.establishedYear}</div>
                    </div>
                    <div>
                      <div className="font-medium">Affiliation</div>
                      <div className="text-muted-foreground">{college.affiliation}</div>
                    </div>
                    <div>
                      <div className="font-medium">Placement Rate</div>
                      <div className="text-muted-foreground">{college.placementRate}%</div>
                    </div>
                    <div>
                      <div className="font-medium">Avg Package</div>
                      <div className="text-muted-foreground">{college.averagePackage}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {userLocation && college.distance && (
                      <Button size="sm" variant="outline" 
                        onClick={() => {
                          const directionsUrl = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${college.latitude},${college.longitude}`;
                          window.open(directionsUrl, '_blank');
                        }}
                      >
                        <Navigation className="h-3 w-3 mr-1" />
                        Directions
                      </Button>
                    )}
                    <Button size="sm" onClick={() => window.open(college.website, '_blank')}>
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Visit Website
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => window.open(`tel:${college.phone}`, '_self')}>
                      <Phone className="h-3 w-3 mr-1" />
                      Call
                    </Button>
                    <Button variant="outline" size="sm">
                      Save College
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredColleges.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No colleges found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or filters
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setSelectedProgram('all');
                setSelectedType('all');
                setSelectedState('all');
                setMaxDistance('all');
                setSelectedFacilities([]);
                setSortBy('rating');
              }}
            >
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Location Handler Modal */}
      {showLocationHandler && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-md w-full">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Set Your Location</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowLocationHandler(false)}>
                  <span className="sr-only">Close</span>
                  ✕
                </Button>
              </div>
            </div>
            <div className="p-4">
              <LocationHandler 
                onLocationSet={handleLocationSet}
                showManualEntry={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Location Permission Alert */}
      {!userLocation && !showLocationHandler && !locationLoading && !hideLocationAlert && (
        <div className="fixed bottom-4 right-4 z-40 max-w-sm">
          <Card className="w-full shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">Set Your Location</h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    Find colleges near you and see accurate distances. You can browse all colleges without location.
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={refreshLocation}>
                      <Navigation className="h-3 w-3 mr-1" />
                      Try GPS
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowLocationHandler(true)}>
                      Set Manually
                    </Button>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-2 text-xs h-auto py-1"
                    onClick={() => {
                      localStorage.setItem('hideLocationAlert', 'true');
                      setHideLocationAlert(true);
                      toast.info('You can set your location anytime using the "Set Location" button');
                    }}
                  >
                    Continue without location
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}