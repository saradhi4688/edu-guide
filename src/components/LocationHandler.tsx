import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MapPin, Navigation, AlertCircle, Check, Loader2 } from 'lucide-react';
import { getCurrentLocation, reverseGeocode, dataStore, isGeolocationAvailable } from '../utils/dataStore';
import { toast } from 'sonner@2.0.3';

interface LocationHandlerProps {
  onLocationSet: (location: { lat: number, lng: number, address: string }) => void;
  showManualEntry?: boolean;
  defaultLocation?: string;
}

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
  'Uttarakhand', 'West Bengal', 'Delhi'
];

const majorCities = {
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'],
  'Delhi': ['New Delhi', 'Central Delhi', 'South Delhi', 'North Delhi'],
  'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi'],
  'Punjab': ['Chandigarh', 'Amritsar', 'Ludhiana', 'Jalandhar'],
  'Haryana': ['Gurgaon', 'Faridabad', 'Panipat'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Tirupati', 'Kadapa', 'Kakinada', 'Anantapur'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela']
};

export function LocationHandler({ onLocationSet, showManualEntry = true, defaultLocation }: LocationHandlerProps) {
  const [locationStatus, setLocationStatus] = useState<'idle' | 'detecting' | 'success' | 'manual'>('idle');
  const [manualLocation, setManualLocation] = useState({
    state: '',
    city: '',
    area: ''
  });

  useEffect(() => {
    // Check if we have a saved location
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      const savedLocation = dataStore.getUserLocation(user.uid);
      if (savedLocation) {
        setLocationStatus('success');
        onLocationSet(savedLocation);
      }
    }
  }, []);

  const handleGetCurrentLocation = async () => {
    setLocationStatus('detecting');
    
    try {
      // Check if geolocation is available first
      const isAvailable = await isGeolocationAvailable();
      if (!isAvailable) {
        toast.info('Location not available', {
          description: 'Geolocation is disabled. Please enter your location manually.'
        });
        setLocationStatus('manual');
        return;
      }

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
      
      // Save location for future use
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        dataStore.saveUserLocation(user.uid, {
          latitude: position.latitude,
          longitude: position.longitude,
          address: address
        });
      }
      
      setLocationStatus('success');
      onLocationSet(location);
      toast.success('Location detected successfully!', {
        description: `We found you in ${address}`
      });
      
    } catch (error) {
      console.log('Location detection failed:', error);
      toast.info('Location access unavailable', {
        description: 'You can manually enter your location below for better recommendations.'
      });
      setLocationStatus('manual');
    }
  };

  const handleManualLocationSubmit = () => {
    if (!manualLocation.state || !manualLocation.city) {
      toast.error('Please select both state and city');
      return;
    }

    const address = `${manualLocation.area ? manualLocation.area + ', ' : ''}${manualLocation.city}, ${manualLocation.state}, India`;
    
    // Use approximate coordinates for the city (in real app, would use geocoding API)
    const cityCoordinates = getCityCoordinates(manualLocation.city, manualLocation.state);
    
    const location = {
      lat: cityCoordinates.lat,
      lng: cityCoordinates.lng,
      address: address
    };
    
    // Save manual location
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      dataStore.saveUserLocation(user.uid, {
        latitude: cityCoordinates.lat,
        longitude: cityCoordinates.lng,
        address: address
      });
    }
    
    setLocationStatus('success');
    onLocationSet(location);
    toast.success('Location set successfully!', {
      description: `Using ${address} for recommendations`
    });
  };

  const getCityCoordinates = (city: string, state: string) => {
    // Approximate coordinates for major Indian cities
    const coordinates: Record<string, {lat: number, lng: number}> = {
      'Mumbai': { lat: 19.0760, lng: 72.8777 },
      'Delhi': { lat: 28.6139, lng: 77.2090 },
      'Bangalore': { lat: 12.9716, lng: 77.5946 },
      'Hyderabad': { lat: 17.3850, lng: 78.4867 },
      'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
      'Chennai': { lat: 13.0827, lng: 80.2707 },
      'Kolkata': { lat: 22.5726, lng: 88.3639 },
      'Surat': { lat: 21.1702, lng: 72.8311 },
      'Pune': { lat: 18.5204, lng: 73.8567 },
      'Jaipur': { lat: 26.9124, lng: 75.7873 },
      'Lucknow': { lat: 26.8467, lng: 80.9462 },
      'Kanpur': { lat: 26.4499, lng: 80.3319 },
      'Nagpur': { lat: 21.1458, lng: 79.0882 },
      'Indore': { lat: 22.7196, lng: 75.8577 },
      'Thane': { lat: 19.2183, lng: 72.9781 },
      'Bhopal': { lat: 23.2599, lng: 77.4126 },
      'Visakhapatnam': { lat: 17.6868, lng: 83.2185 },
      'Vijayawada': { lat: 16.5062, lng: 80.6480 },
      'Guntur': { lat: 16.3067, lng: 80.4365 },
      'Nellore': { lat: 14.4426, lng: 79.9865 },
      'Kurnool': { lat: 15.8281, lng: 78.0373 },
      'Rajahmundry': { lat: 17.0005, lng: 81.8040 },
      'Tirupati': { lat: 13.6288, lng: 79.4192 },
      'Kadapa': { lat: 14.4673, lng: 78.8241 },
      'Kakinada': { lat: 16.9891, lng: 82.2475 },
      'Anantapur': { lat: 14.6819, lng: 77.5985 },
      'Pimpri-Chinchwad': { lat: 18.6298, lng: 73.7997 },
      'Patna': { lat: 25.5941, lng: 85.1376 },
      'Vadodara': { lat: 22.3072, lng: 73.1812 },
      'Ghaziabad': { lat: 28.6692, lng: 77.4538 },
      'Ludhiana': { lat: 30.9010, lng: 75.8573 },
      'Agra': { lat: 27.1767, lng: 78.0081 },
      'Nashik': { lat: 19.9975, lng: 73.7898 },
      'Faridabad': { lat: 28.4089, lng: 77.3178 },
      'Meerut': { lat: 28.9845, lng: 77.7064 },
      'Rajkot': { lat: 22.3039, lng: 70.8022 },
      'Kalyan-Dombivali': { lat: 19.2403, lng: 73.1305 },
      'Vasai-Virar': { lat: 19.4912, lng: 72.8054 },
      'Varanasi': { lat: 25.3176, lng: 82.9739 }
    };
    
    return coordinates[city] || coordinates['Mumbai']; // Default to Mumbai if city not found
  };

  if (locationStatus === 'success') {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
        <Check className="h-4 w-4" />
        <span>Location set successfully</span>
      </div>
    );
  }

  if (locationStatus === 'detecting') {
    return (
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin" />
          <div>
            <h4 className="font-medium">Detecting your location...</h4>
            <p className="text-sm text-muted-foreground">
              This helps us find colleges near you. You can deny and enter manually.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Set Your Location
        </CardTitle>
        <CardDescription>
          Help us find the best colleges and opportunities near you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Auto-detect option */}
        <div className="space-y-3">
          <Button 
            onClick={handleGetCurrentLocation}
            className="w-full"
            disabled={locationStatus === 'detecting'}
          >
            <Navigation className="h-4 w-4 mr-2" />
            {locationStatus === 'detecting' ? 'Detecting...' : 'Use My Current Location'}
          </Button>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>We use location only to find nearby colleges and never share your data</span>
          </div>
        </div>

        {/* Manual entry */}
        {(showManualEntry || locationStatus === 'manual') && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or enter manually
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">State</label>
                  <Select 
                    value={manualLocation.state} 
                    onValueChange={(value) => setManualLocation(prev => ({ ...prev, state: value, city: '' }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                      {indianStates.map(state => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">City</label>
                  <Select 
                    value={manualLocation.city}
                    onValueChange={(value) => setManualLocation(prev => ({ ...prev, city: value }))}
                    disabled={!manualLocation.state}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                    <SelectContent>
                      {manualLocation.state && majorCities[manualLocation.state as keyof typeof majorCities]?.map(city => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      )) || (
                        <SelectItem value="other">Other</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Area/Locality (Optional)</label>
                <Input
                  placeholder="e.g., Andheri West, Connaught Place"
                  value={manualLocation.area}
                  onChange={(e) => setManualLocation(prev => ({ ...prev, area: e.target.value }))}
                />
              </div>

              <Button 
                onClick={handleManualLocationSubmit}
                className="w-full"
                disabled={!manualLocation.state || !manualLocation.city}
              >
                Set Location
              </Button>
            </div>
          </>
        )}

        {/* Benefits explanation */}
        <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <h5 className="font-medium text-sm mb-1">Why we need your location:</h5>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Find colleges and universities near you</li>
            <li>• Calculate accurate travel times and distances</li>
            <li>• Show regional admission alerts and deadlines</li>
            <li>• Recommend local career opportunities</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}