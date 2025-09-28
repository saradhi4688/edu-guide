// Enhanced location utilities with better error handling
export interface LocationResult {
  latitude: number;
  longitude: number;
  accuracy?: number;
  source: 'gps' | 'fallback';
}

export interface LocationOptions {
  timeout?: number;
  enableHighAccuracy?: boolean;
  maximumAge?: number;
  fallbackLocation?: { latitude: number; longitude: number };
}

const DEFAULT_FALLBACK = {
  latitude: 17.3850, // Hyderabad, India
  longitude: 78.4867
};

// Cached location to avoid repeated requests
let cachedLocation: LocationResult | null = null;
let locationPromise: Promise<LocationResult> | null = null;

export const getLocationSafely = async (options: LocationOptions = {}): Promise<LocationResult> => {
  // Return cached location if available and not too old
  if (cachedLocation && Date.now() - (cachedLocation as any).timestamp < 300000) {
    return cachedLocation;
  }

  // Return existing promise if one is already in progress
  if (locationPromise) {
    return locationPromise;
  }

  const {
    timeout = 5000,
    enableHighAccuracy = false,
    maximumAge = 300000,
    fallbackLocation = DEFAULT_FALLBACK
  } = options;

  locationPromise = new Promise<LocationResult>((resolve) => {
    // Check basic requirements
    if (!navigator.geolocation) {
      resolve({
        ...fallbackLocation,
        source: 'fallback'
      });
      return;
    }

    // Check secure context (required for geolocation)
    if (!window.isSecureContext && location.hostname !== 'localhost') {
      resolve({
        ...fallbackLocation,
        source: 'fallback'
      });
      return;
    }

    let timeoutId: NodeJS.Timeout;
    let resolved = false;

    const resolveOnce = (result: LocationResult) => {
      if (!resolved) {
        resolved = true;
        cachedLocation = { ...result, timestamp: Date.now() } as any;
        clearTimeout(timeoutId);
        locationPromise = null;
        resolve(result);
      }
    };

    // Set timeout
    timeoutId = setTimeout(() => {
      resolveOnce({
        ...fallbackLocation,
        source: 'fallback'
      });
    }, timeout);

    // Check permissions first if available
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' })
        .then((permission) => {
          if (permission.state === 'denied') {
            resolveOnce({
              ...fallbackLocation,
              source: 'fallback'
            });
            return;
          }
          requestLocation();
        })
        .catch(() => {
          requestLocation();
        });
    } else {
      requestLocation();
    }

    function requestLocation() {
      if (resolved) return;

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolveOnce({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            source: 'gps'
          });
        },
        (error) => {
          // Don't log permission errors as they're expected
          if (error.code !== error.PERMISSION_DENIED) {
            console.debug('Location unavailable, using fallback');
          }
          
          resolveOnce({
            ...fallbackLocation,
            source: 'fallback'
          });
        },
        {
          enableHighAccuracy,
          timeout: timeout - 500, // Leave some buffer for our timeout
          maximumAge
        }
      );
    }
  });

  return locationPromise;
};

// Clear cached location (useful for manual refresh)
export const clearLocationCache = () => {
  cachedLocation = null;
  locationPromise = null;
};

// Check if location services are likely to work
export const isLocationAvailable = (): boolean => {
  return !!(
    navigator &&
    navigator.geolocation &&
    (window.isSecureContext || location.hostname === 'localhost')
  );
};

// Get location with user-friendly status
export const getLocationWithStatus = async (): Promise<{
  location: LocationResult;
  status: 'success' | 'permission_denied' | 'unavailable' | 'timeout' | 'fallback';
  message: string;
}> => {
  if (!isLocationAvailable()) {
    return {
      location: { ...DEFAULT_FALLBACK, source: 'fallback' },
      status: 'unavailable',
      message: 'Location services are not available'
    };
  }

  try {
    const location = await getLocationSafely();
    
    if (location.source === 'gps') {
      return {
        location,
        status: 'success',
        message: 'Location detected successfully'
      };
    } else {
      return {
        location,
        status: 'fallback',
        message: 'Using default location (Hyderabad, India)'
      };
    }
  } catch (error) {
    return {
      location: { ...DEFAULT_FALLBACK, source: 'fallback' },
      status: 'fallback',
      message: 'Location unavailable, using default location'
    };
  }
};

// Calculate distance between two points (Haversine formula)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

// Simple reverse geocoding (returns a simple location string)
export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      { signal: AbortSignal.timeout(5000) }
    );
    
    if (!response.ok) {
      throw new Error('Geocoding service unavailable');
    }
    
    const data = await response.json();
    const parts = [data.locality, data.principalSubdivision, data.countryName]
      .filter(Boolean);
    
    return parts.length > 0 ? parts.join(', ') : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (error) {
    console.debug('Reverse geocoding failed, using coordinates');
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
};