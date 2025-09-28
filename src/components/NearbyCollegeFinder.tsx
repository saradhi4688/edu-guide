import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  Globe, 
  Star, 
  Clock,
  Car,
  Train,
  Search,
  Filter,
  ExternalLink,
  DollarSign,
  Heart,
  BookOpen,
  Users,
  TrendingUp,
  MapPinIcon
} from 'lucide-react';
import { collegeDatabase, filterColleges, College } from '../utils/collegeDatabase';
import { getCurrentLocation, reverseGeocode, calculateDistance, dataStore, isGeolocationAvailable } from '../utils/dataStore';
import { toast } from 'sonner@2.0.3';

interface PersonalizedCourse {
  title: string;
  field: string;
  matchPercentage: number;
}

interface NearbyCollegeFinderProps {
  course: PersonalizedCourse;
  userLocation: string;
  onClose: () => void;
}

export function NearbyCollegeFinder({ course, userLocation, onClose }: NearbyCollegeFinderProps) {
  const [colleges, setColleges] = useState<College[]>([]);
  const [allColleges, setAllColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchRadius, setSearchRadius] = useState(25);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [userCoordinates, setUserCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [filters, setFilters] = useState({
    type: 'all',
    minRating: 0,
    maxFees: '',
    sortBy: 'distance'
  });
  const [savedColleges, setSavedColleges] = useState<string[]>([]);

  useEffect(() => {
    initializeAndFindColleges();
    loadSavedColleges();
  }, [course, searchRadius]);

  const loadSavedColleges = () => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      const saved = dataStore.getSavedColleges(user.uid);
      setSavedColleges(saved);
    }
  };

  const initializeAndFindColleges = async () => {
    setLoading(true);
    
    try {
      // Get user's current location
      let userLat, userLng;
      
      try {
        // Check if geolocation is available
        const isAvailable = await isGeolocationAvailable();
        if (!isAvailable) {
          throw new Error('Geolocation not available');
        }

        const position = await getCurrentLocation();
        userLat = position.latitude;
        userLng = position.longitude;
        setUserCoordinates({ lat: userLat, lng: userLng });
        
        // Get readable address with fallback
        let address = 'Location detected';
        try {
          address = await reverseGeocode(userLat, userLng);
        } catch (geocodeError) {
          console.log('Reverse geocoding failed');
          address = `${userLat.toFixed(4)}, ${userLng.toFixed(4)}`;
        }
        setCurrentLocation(address);
        
        // Save location for future use
        const userData = localStorage.getItem('user_data');
        if (userData) {
          const user = JSON.parse(userData);
          dataStore.saveUserLocation(user.uid, {
            latitude: userLat,
            longitude: userLng,
            address: address
          });
        }
        
        toast.success('Location detected successfully!');
      } catch (locationError) {
        console.log('Location detection failed:', locationError instanceof Error ? locationError.message : 'Unknown error');
        // Fallback to default coordinates (Delhi - more central for India)
        userLat = 28.6139;
        userLng = 77.2090;
        setUserCoordinates({ lat: userLat, lng: userLng });
        setCurrentLocation('Delhi, India (Default Location)');
        toast.info('Using default location', {
          description: 'Location access not available. Showing colleges nationwide.'
        });
      }

      // Filter colleges based on course and location
      const relevantColleges = filterColleges(collegeDatabase, {
        courses: [course.title],
        location: { lat: userLat, lng: userLng, radius: searchRadius }
      });

      // Add distance to each college
      const collegesWithDistance = relevantColleges.map(college => ({
        ...college,
        distance: calculateDistance(userLat, userLng, college.latitude, college.longitude)
      }));

      // Sort by distance initially
      const sortedColleges = collegesWithDistance.sort((a, b) => a.distance - b.distance);
      
      setAllColleges(sortedColleges);
      setColleges(sortedColleges);
      
    } catch (error) {
      console.error('Failed to find colleges:', error);
      toast.error('Failed to load colleges');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filteredColleges = [...allColleges];

    // Type filter
    if (filters.type && filters.type !== 'all') {
      filteredColleges = filteredColleges.filter(college => college.type === filters.type);
    }

    // Rating filter
    if (filters.minRating > 0) {
      filteredColleges = filteredColleges.filter(college => college.rating >= filters.minRating);
    }

    // Fees filter
    if (filters.maxFees) {
      const maxFee = parseFloat(filters.maxFees);
      filteredColleges = filteredColleges.filter(college => {
        const collegeFee = parseFloat(college.fees.replace(/[₹,LPA\s]/g, ''));
        return collegeFee <= maxFee;
      });
    }

    // Sort
    switch (filters.sortBy) {
      case 'rating':
        filteredColleges.sort((a, b) => b.rating - a.rating);
        break;
      case 'fees':
        filteredColleges.sort((a, b) => {
          const feeA = parseFloat(a.fees.replace(/[₹,LPA\s]/g, ''));
          const feeB = parseFloat(b.fees.replace(/[₹,LPA\s]/g, ''));
          return feeA - feeB;
        });
        break;
      case 'placement':
        filteredColleges.sort((a, b) => b.placementRate - a.placementRate);
        break;
      default: // distance
        filteredColleges.sort((a, b) => a.distance - b.distance);
    }

    setColleges(filteredColleges);
  };

  useEffect(() => {
    applyFilters();
  }, [filters, allColleges]);

  const getDirections = (college: College) => {
    if (userCoordinates) {
      const directionsUrl = `https://www.google.com/maps/dir/${userCoordinates.lat},${userCoordinates.lng}/${college.latitude},${college.longitude}`;
      window.open(directionsUrl, '_blank');
    } else {
      const directionsUrl = `https://www.google.com/maps/search/${encodeURIComponent(college.address)}`;
      window.open(directionsUrl, '_blank');
    }
  };

  const handleCallCollege = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleVisitWebsite = (website: string) => {
    window.open(website, '_blank');
  };

  const toggleSaveCollege = (collegeId: string) => {
    const userData = localStorage.getItem('user_data');
    if (!userData) return;
    
    const user = JSON.parse(userData);
    
    if (savedColleges.includes(collegeId)) {
      dataStore.removeSavedCollege(user.uid, collegeId);
      setSavedColleges(prev => prev.filter(id => id !== collegeId));
      toast.success('College removed from saved list');
    } else {
      dataStore.saveCollege(user.uid, collegeId);
      setSavedColleges(prev => [...prev, collegeId]);
      toast.success('College saved to your list');
    }
  };

  const getEstimatedTravelTime = (distance: number) => {
    // Rough estimates based on Indian traffic conditions
    const drivingTime = Math.round(distance * 2.5); // minutes (considering traffic)
    const transitTime = Math.round(distance * 4); // minutes (public transport)
    
    return {
      driving: drivingTime > 60 ? `${Math.round(drivingTime/60)} hr ${drivingTime%60} min` : `${drivingTime} min`,
      transit: transitTime > 60 ? `${Math.round(transitTime/60)} hr ${transitTime%60} min` : `${transitTime} min`
    };
  };

  const renderMap = () => {
    // In real implementation, this would render Google Maps
    return (
      <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center relative">
        {currentLocation && (
          <div className="absolute top-2 left-2 bg-white dark:bg-gray-800 rounded px-2 py-1 text-xs flex items-center gap-1">
            <MapPinIcon className="h-3 w-3 text-green-500" />
            <span>{currentLocation}</span>
          </div>
        )}
        <div className="text-center">
          <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-500" />
          <p className="text-gray-600 dark:text-gray-300">Interactive Map</p>
          <p className="text-sm text-gray-500">
            {colleges.length} colleges found within {searchRadius}km
          </p>
        </div>
      </div>
    );
  };

  const renderFilters = () => (
    <div className="space-y-3 mb-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Government">Government</SelectItem>
            <SelectItem value="Private">Private</SelectItem>
            <SelectItem value="Deemed">Deemed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.minRating.toString()} onValueChange={(value) => setFilters(prev => ({ ...prev, minRating: parseFloat(value) }))}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Min Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Any Rating</SelectItem>
            <SelectItem value="3">3+ Stars</SelectItem>
            <SelectItem value="4">4+ Stars</SelectItem>
            <SelectItem value="4.5">4.5+ Stars</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Max Fees (LPA)"
          value={filters.maxFees}
          onChange={(e) => setFilters(prev => ({ ...prev, maxFees: e.target.value }))}
          type="number"
        />

        <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="distance">Distance</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
            <SelectItem value="fees">Fees (Low to High)</SelectItem>
            <SelectItem value="placement">Placement Rate</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Finding Colleges Near You</h3>
            <p className="text-muted-foreground">
              Detecting your location and searching for {course.title} programs...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold">Colleges Near You</h2>
              <p className="text-muted-foreground flex items-center gap-2">
                <MapPinIcon className="h-4 w-4" />
                {currentLocation || userLocation} • {course.title} programs
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(parseInt(e.target.value) || 25)}
                  className="w-20"
                  min="5"
                  max="200"
                />
                <span className="text-sm text-muted-foreground">km</span>
              </div>
              <Button variant="outline" size="sm" onClick={onClose}>
                ✕
              </Button>
            </div>
          </div>
          {renderFilters()}
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* College List */}
          <div className="w-1/2 overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {colleges.length} Colleges Found
              </h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => initializeAndFindColleges()}
              >
                <Search className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>

            {colleges.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No Colleges Found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try increasing the search radius or adjusting your filters.
                  </p>
                  <Button onClick={() => setSearchRadius(100)}>
                    Expand Search to 100km
                  </Button>
                </CardContent>
              </Card>
            ) : (
              colleges.map((college) => {
                const travelTime = getEstimatedTravelTime(college.distance);
                const isSaved = savedColleges.includes(college.id);
                
                return (
                  <Card 
                    key={college.id} 
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedCollege?.id === college.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedCollege(college)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">{college.name}</CardTitle>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSaveCollege(college.id);
                              }}
                              className="p-1"
                            >
                              <Heart 
                                className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                              />
                            </Button>
                          </div>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {college.distance}km away • {college.city}, {college.state}
                          </CardDescription>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {college.type}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Est. {college.establishedYear}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium">{college.rating}</span>
                            <span className="text-sm text-muted-foreground">
                              ({college.reviews})
                            </span>
                          </div>
                          <Badge 
                            variant={
                              college.admissionStatus === 'Open' ? 'default' : 
                              college.admissionStatus === 'Soon' ? 'secondary' : 'outline'
                            }
                            className="mt-1"
                          >
                            {college.admissionStatus}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span>Fees: {college.fees}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>{college.placementRate}% placement</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Car className="h-3 w-3" />
                            <span>{travelTime.driving}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Train className="h-3 w-3" />
                            <span>{travelTime.transit}</span>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">Average Package:</span> {college.averagePackage}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            getDirections(college);
                          }}
                        >
                          <Navigation className="h-3 w-3 mr-1" />
                          Directions
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCallCollege(college.phone);
                          }}
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          Call
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVisitWebsite(college.website);
                          }}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Website
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Map and Details */}
          <div className="w-1/2 border-l border-gray-200 dark:border-gray-700 p-6">
            {renderMap()}
            
            {selectedCollege && (
              <Card className="mt-4">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedCollege.name}</CardTitle>
                      <CardDescription>{selectedCollege.address}</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSaveCollege(selectedCollege.id)}
                    >
                      <Heart 
                        className={`h-5 w-5 ${savedColleges.includes(selectedCollege.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                      />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Distance:</span> {selectedCollege.distance}km
                    </div>
                    <div>
                      <span className="font-medium">Rating:</span> {selectedCollege.rating}/5
                    </div>
                    <div>
                      <span className="font-medium">Fees:</span> {selectedCollege.fees}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> {selectedCollege.admissionStatus}
                    </div>
                    <div>
                      <span className="font-medium">Placement:</span> {selectedCollege.placementRate}%
                    </div>
                    <div>
                      <span className="font-medium">Package:</span> {selectedCollege.averagePackage}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Available Courses</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedCollege.courses.map((course, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {course}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Specializations</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedCollege.specializations.map((spec, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Facilities</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedCollege.facilities.map((facility, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {facility}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Travel Time</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        <span>By car: {getEstimatedTravelTime(selectedCollege.distance).driving}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Train className="h-4 w-4" />
                        <span>By transit: {getEstimatedTravelTime(selectedCollege.distance).transit}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1"
                      onClick={() => getDirections(selectedCollege)}
                    >
                      <Navigation className="h-4 w-4 mr-1" />
                      Get Directions
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleCallCollege(selectedCollege.phone)}
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleVisitWebsite(selectedCollege.website)}
                    >
                      <Globe className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}