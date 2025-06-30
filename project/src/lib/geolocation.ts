// Global Geolocation Service
export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface LocationAddress {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  timezone?: string;
}

export interface LocationData extends LocationCoordinates, LocationAddress {
  id?: string;
  type?: 'home' | 'work' | 'temporary' | 'delivery';
  isPrimary?: boolean;
  isCurrent?: boolean;
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  fallbackToIP?: boolean;
}

export interface IPLocationData {
  latitude: number;
  longitude: number;
  city: string;
  region: string;
  country: string;
  timezone: string;
  currency: string;
  language: string;
}

class GeolocationService {
  private static instance: GeolocationService;
  private watchId: number | null = null;
  private lastKnownLocation: LocationData | null = null;
  private locationCache = new Map<string, { data: any; expires: number }>();

  static getInstance(): GeolocationService {
    if (!GeolocationService.instance) {
      GeolocationService.instance = new GeolocationService();
    }
    return GeolocationService.instance;
  }

  // Get current position using GPS
  async getCurrentPosition(options: GeolocationOptions = {}): Promise<LocationData> {
    const defaultOptions: GeolocationOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutes
      fallbackToIP: true,
      ...options
    };

    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: defaultOptions.enableHighAccuracy,
            timeout: defaultOptions.timeout,
            maximumAge: defaultOptions.maximumAge
          }
        );
      });

      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
        isCurrent: true
      };

      // Reverse geocode to get address
      try {
        const address = await this.reverseGeocode(locationData.latitude, locationData.longitude);
        Object.assign(locationData, address);
      } catch (error) {
        console.warn('Reverse geocoding failed:', error);
      }

      this.lastKnownLocation = locationData;
      return locationData;

    } catch (error) {
      console.warn('GPS location failed:', error);
      
      if (defaultOptions.fallbackToIP) {
        try {
          return await this.getLocationFromIP();
        } catch (ipError) {
          console.error('IP location fallback failed:', ipError);
          throw new Error('Unable to determine location');
        }
      }
      
      throw error;
    }
  }

  // Get location from IP address
  async getLocationFromIP(): Promise<LocationData> {
    try {
      // Try multiple IP geolocation services for reliability
      const services = [
        'https://ipapi.co/json/',
        'https://ip-api.com/json/',
        'https://ipinfo.io/json'
      ];

      for (const service of services) {
        try {
          const response = await fetch(service);
          if (!response.ok) continue;
          
          const data = await response.json();
          
          // Normalize response based on service
          let locationData: LocationData;
          
          if (service.includes('ipapi.co')) {
            locationData = {
              latitude: data.latitude,
              longitude: data.longitude,
              city: data.city,
              state: data.region,
              country: data.country_name,
              postalCode: data.postal,
              timezone: data.timezone,
              isCurrent: true
            };
          } else if (service.includes('ip-api.com')) {
            locationData = {
              latitude: data.lat,
              longitude: data.lon,
              city: data.city,
              state: data.regionName,
              country: data.country,
              postalCode: data.zip,
              timezone: data.timezone,
              isCurrent: true
            };
          } else { // ipinfo.io
            const [lat, lng] = data.loc.split(',').map(Number);
            locationData = {
              latitude: lat,
              longitude: lng,
              city: data.city,
              state: data.region,
              country: data.country,
              postalCode: data.postal,
              timezone: data.timezone,
              isCurrent: true
            };
          }

          this.lastKnownLocation = locationData;
          return locationData;
          
        } catch (serviceError) {
          console.warn(`Service ${service} failed:`, serviceError);
          continue;
        }
      }
      
      throw new Error('All IP geolocation services failed');
      
    } catch (error) {
      console.error('IP geolocation failed:', error);
      throw error;
    }
  }

  // Reverse geocode coordinates to address
  async reverseGeocode(latitude: number, longitude: number): Promise<LocationAddress> {
    const cacheKey = `reverse_${latitude}_${longitude}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Using OpenStreetMap Nominatim (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'YggrPlantHub/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }

      const data = await response.json();
      const address = data.address || {};

      const locationAddress: LocationAddress = {
        addressLine1: [
          address.house_number,
          address.road || address.street
        ].filter(Boolean).join(' '),
        city: address.city || address.town || address.village,
        state: address.state || address.region,
        country: address.country,
        postalCode: address.postcode,
        timezone: await this.getTimezoneFromCoordinates(latitude, longitude)
      };

      this.setCachedData(cacheKey, locationAddress, 24 * 60 * 60 * 1000); // Cache for 24 hours
      return locationAddress;

    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return {};
    }
  }

  // Forward geocode address to coordinates
  async forwardGeocode(address: string): Promise<LocationData[]> {
    const cacheKey = `forward_${address}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=5&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'YggrPlantHub/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Forward geocoding failed');
      }

      const data = await response.json();
      
      const results: LocationData[] = data.map((item: any) => ({
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        addressLine1: item.display_name.split(',')[0],
        city: item.address?.city || item.address?.town || item.address?.village,
        state: item.address?.state || item.address?.region,
        country: item.address?.country,
        postalCode: item.address?.postcode
      }));

      this.setCachedData(cacheKey, results, 24 * 60 * 60 * 1000); // Cache for 24 hours
      return results;

    } catch (error) {
      console.error('Forward geocoding failed:', error);
      return [];
    }
  }

  // Get timezone from coordinates
  async getTimezoneFromCoordinates(latitude: number, longitude: number): Promise<string> {
    try {
      // Use a free timezone API
      const response = await fetch(
        `https://api.timezonedb.com/v2.1/get-time-zone?key=demo&format=json&by=position&lat=${latitude}&lng=${longitude}`
      );

      if (response.ok) {
        const data = await response.json();
        return data.zoneName || Intl.DateTimeFormat().resolvedOptions().timeZone;
      }
    } catch (error) {
      console.warn('Timezone lookup failed:', error);
    }

    // Fallback to browser timezone
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  // Calculate distance between two points
  calculateDistance(
    lat1: number, lng1: number,
    lat2: number, lng2: number,
    unit: 'km' | 'miles' = 'km'
  ): number {
    const R = unit === 'km' ? 6371 : 3959; // Earth's radius
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Start watching position changes
  startWatching(
    callback: (location: LocationData) => void,
    errorCallback?: (error: GeolocationPositionError) => void,
    options: GeolocationOptions = {}
  ): number | null {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported');
      return null;
    }

    this.watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          isCurrent: true
        };

        try {
          const address = await this.reverseGeocode(locationData.latitude, locationData.longitude);
          Object.assign(locationData, address);
        } catch (error) {
          console.warn('Reverse geocoding failed during watch:', error);
        }

        this.lastKnownLocation = locationData;
        callback(locationData);
      },
      errorCallback,
      {
        enableHighAccuracy: options.enableHighAccuracy ?? true,
        timeout: options.timeout ?? 10000,
        maximumAge: options.maximumAge ?? 60000
      }
    );

    return this.watchId;
  }

  // Stop watching position changes
  stopWatching(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  // Get last known location
  getLastKnownLocation(): LocationData | null {
    return this.lastKnownLocation;
  }

  // Check if location services are available
  isGeolocationAvailable(): boolean {
    return 'geolocation' in navigator;
  }

  // Request permission for location access
  async requestLocationPermission(): Promise<PermissionState> {
    if ('permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        return permission.state;
      } catch (error) {
        console.warn('Permission query failed:', error);
      }
    }
    return 'prompt';
  }

  // Utility methods
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private getCachedData(key: string): any {
    const cached = this.locationCache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }
    this.locationCache.delete(key);
    return null;
  }

  private setCachedData(key: string, data: any, ttl: number): void {
    this.locationCache.set(key, {
      data,
      expires: Date.now() + ttl
    });
  }
}

export const geolocationService = GeolocationService.getInstance();

// Utility functions for common operations
export const getCurrentLocation = (options?: GeolocationOptions) => 
  geolocationService.getCurrentPosition(options);

export const getLocationFromIP = () => 
  geolocationService.getLocationFromIP();

export const calculateDistance = (
  lat1: number, lng1: number,
  lat2: number, lng2: number,
  unit: 'km' | 'miles' = 'km'
) => geolocationService.calculateDistance(lat1, lng1, lat2, lng2, unit);

export const reverseGeocode = (latitude: number, longitude: number) =>
  geolocationService.reverseGeocode(latitude, longitude);

export const forwardGeocode = (address: string) =>
  geolocationService.forwardGeocode(address);