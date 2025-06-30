import { supabase } from './supabase';
import { LocationData, LocationCoordinates } from './geolocation';

export interface UserLocation extends LocationData {
  id: string;
  userId: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SellerLocation {
  id: string;
  sellerId: string;
  businessName: string;
  latitude: number;
  longitude: number;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  businessHours?: any;
  deliveryRadiusKm: number;
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
  serviceAreas: string[];
  timezone?: string;
  isPrimary: boolean;
  isActive: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryZone {
  id: string;
  sellerLocationId: string;
  zoneName: string;
  zoneType: 'radius' | 'polygon' | 'postal_codes';
  radiusKm?: number;
  postalCodes?: string[];
  deliveryFee: number;
  minimumOrder: number;
  estimatedDeliveryTime?: string;
  isActive: boolean;
  priorityOrder: number;
}

export interface LocationPreferences {
  id: string;
  userId: string;
  preferredCurrency: string;
  preferredLanguage: string;
  preferredTimezone?: string;
  preferredUnits: 'metric' | 'imperial';
  maxDeliveryDistanceKm: number;
  autoDetectLocation: boolean;
  shareLocation: boolean;
  locationAccuracyPreference: 'exact' | 'neighborhood' | 'city' | 'region';
  notificationRadiusKm: number;
}

export interface NearbySellerResult {
  sellerId: string;
  businessName: string;
  distanceKm: number;
  latitude: number;
  longitude: number;
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  sellerLocation: SellerLocation;
}

class LocationDatabaseService {
  // User Location Management
  async saveUserLocation(userId: string, locationData: LocationData): Promise<UserLocation> {
    const { data, error } = await supabase
      .from('user_locations')
      .insert([{
        user_id: userId,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy,
        address_line1: locationData.addressLine1,
        address_line2: locationData.addressLine2,
        city: locationData.city,
        state: locationData.state,
        country: locationData.country,
        postal_code: locationData.postalCode,
        timezone: locationData.timezone,
        is_primary: locationData.isPrimary || false,
        is_current: locationData.isCurrent || false,
        location_type: locationData.type || 'home',
        expires_at: locationData.type === 'temporary' ? 
          new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null
      }])
      .select()
      .single();

    if (error) throw error;
    return this.mapUserLocationFromDB(data);
  }

  async updateUserLocation(locationId: string, locationData: Partial<LocationData>): Promise<UserLocation> {
    const updateData: any = {};
    
    if (locationData.latitude !== undefined) updateData.latitude = locationData.latitude;
    if (locationData.longitude !== undefined) updateData.longitude = locationData.longitude;
    if (locationData.accuracy !== undefined) updateData.accuracy = locationData.accuracy;
    if (locationData.addressLine1 !== undefined) updateData.address_line1 = locationData.addressLine1;
    if (locationData.addressLine2 !== undefined) updateData.address_line2 = locationData.addressLine2;
    if (locationData.city !== undefined) updateData.city = locationData.city;
    if (locationData.state !== undefined) updateData.state = locationData.state;
    if (locationData.country !== undefined) updateData.country = locationData.country;
    if (locationData.postalCode !== undefined) updateData.postal_code = locationData.postalCode;
    if (locationData.timezone !== undefined) updateData.timezone = locationData.timezone;
    if (locationData.isPrimary !== undefined) updateData.is_primary = locationData.isPrimary;
    if (locationData.isCurrent !== undefined) updateData.is_current = locationData.isCurrent;
    if (locationData.type !== undefined) updateData.location_type = locationData.type;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('user_locations')
      .update(updateData)
      .eq('id', locationId)
      .select()
      .single();

    if (error) throw error;
    return this.mapUserLocationFromDB(data);
  }

  async getUserLocations(userId: string): Promise<UserLocation[]> {
    const { data, error } = await supabase
      .from('user_locations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(this.mapUserLocationFromDB);
  }

  async getCurrentUserLocation(userId: string): Promise<UserLocation | null> {
    const { data, error } = await supabase
      .from('user_locations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_current', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.mapUserLocationFromDB(data) : null;
  }

  async setCurrentUserLocation(userId: string, locationId: string): Promise<void> {
    // First, unset all current locations for the user
    await supabase
      .from('user_locations')
      .update({ is_current: false })
      .eq('user_id', userId);

    // Then set the specified location as current
    const { error } = await supabase
      .from('user_locations')
      .update({ is_current: true })
      .eq('id', locationId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  // Seller Location Management
  async saveSellerLocation(sellerLocation: Omit<SellerLocation, 'id' | 'createdAt' | 'updatedAt'>): Promise<SellerLocation> {
    const { data, error } = await supabase
      .from('seller_locations')
      .insert([{
        seller_id: sellerLocation.sellerId,
        business_name: sellerLocation.businessName,
        latitude: sellerLocation.latitude,
        longitude: sellerLocation.longitude,
        address_line1: sellerLocation.addressLine1,
        address_line2: sellerLocation.addressLine2,
        city: sellerLocation.city,
        state: sellerLocation.state,
        country: sellerLocation.country,
        postal_code: sellerLocation.postalCode,
        phone: sellerLocation.phone,
        email: sellerLocation.email,
        website: sellerLocation.website,
        business_hours: sellerLocation.businessHours,
        delivery_radius_km: sellerLocation.deliveryRadiusKm,
        pickup_available: sellerLocation.pickupAvailable,
        delivery_available: sellerLocation.deliveryAvailable,
        service_areas: sellerLocation.serviceAreas,
        timezone: sellerLocation.timezone,
        is_primary: sellerLocation.isPrimary,
        is_active: sellerLocation.isActive,
        verification_status: sellerLocation.verificationStatus
      }])
      .select()
      .single();

    if (error) throw error;
    return this.mapSellerLocationFromDB(data);
  }

  async getSellerLocations(sellerId: string): Promise<SellerLocation[]> {
    const { data, error } = await supabase
      .from('seller_locations')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(this.mapSellerLocationFromDB);
  }

  async getActiveSellerLocations(sellerId: string): Promise<SellerLocation[]> {
    const { data, error } = await supabase
      .from('seller_locations')
      .select('*')
      .eq('seller_id', sellerId)
      .eq('is_active', true)
      .eq('verification_status', 'verified')
      .order('is_primary', { ascending: false });

    if (error) throw error;
    return data.map(this.mapSellerLocationFromDB);
  }

  // Find nearby sellers using database function
  async findNearbySellers(
    userLatitude: number,
    userLongitude: number,
    radiusKm: number = 25
  ): Promise<NearbySellerResult[]> {
    const { data, error } = await supabase
      .rpc('find_nearby_sellers', {
        user_lat: userLatitude,
        user_lng: userLongitude,
        radius_km: radiusKm
      });

    if (error) throw error;

    // Get full seller location details
    const sellerIds = data.map((item: any) => item.seller_id);
    const { data: sellerLocations, error: locationError } = await supabase
      .from('seller_locations')
      .select('*')
      .in('seller_id', sellerIds);

    if (locationError) throw locationError;

    return data.map((item: any) => {
      const sellerLocation = sellerLocations.find(loc => loc.seller_id === item.seller_id);
      return {
        sellerId: item.seller_id,
        businessName: item.business_name,
        distanceKm: parseFloat(item.distance_km),
        latitude: parseFloat(item.latitude),
        longitude: parseFloat(item.longitude),
        deliveryAvailable: item.delivery_available,
        pickupAvailable: item.pickup_available,
        sellerLocation: sellerLocation ? this.mapSellerLocationFromDB(sellerLocation) : null
      };
    }).filter(item => item.sellerLocation);
  }

  // Delivery Zone Management
  async createDeliveryZone(deliveryZone: Omit<DeliveryZone, 'id'>): Promise<DeliveryZone> {
    const { data, error } = await supabase
      .from('delivery_zones')
      .insert([{
        seller_location_id: deliveryZone.sellerLocationId,
        zone_name: deliveryZone.zoneName,
        zone_type: deliveryZone.zoneType,
        radius_km: deliveryZone.radiusKm,
        postal_codes: deliveryZone.postalCodes,
        delivery_fee: deliveryZone.deliveryFee,
        minimum_order: deliveryZone.minimumOrder,
        estimated_delivery_time: deliveryZone.estimatedDeliveryTime,
        is_active: deliveryZone.isActive,
        priority_order: deliveryZone.priorityOrder
      }])
      .select()
      .single();

    if (error) throw error;
    return this.mapDeliveryZoneFromDB(data);
  }

  async getDeliveryZones(sellerLocationId: string): Promise<DeliveryZone[]> {
    const { data, error } = await supabase
      .from('delivery_zones')
      .select('*')
      .eq('seller_location_id', sellerLocationId)
      .eq('is_active', true)
      .order('priority_order');

    if (error) throw error;
    return data.map(this.mapDeliveryZoneFromDB);
  }

  // Location Preferences Management
  async saveLocationPreferences(preferences: Omit<LocationPreferences, 'id'>): Promise<LocationPreferences> {
    const { data, error } = await supabase
      .from('location_preferences')
      .upsert([{
        user_id: preferences.userId,
        preferred_currency: preferences.preferredCurrency,
        preferred_language: preferences.preferredLanguage,
        preferred_timezone: preferences.preferredTimezone,
        preferred_units: preferences.preferredUnits,
        max_delivery_distance_km: preferences.maxDeliveryDistanceKm,
        auto_detect_location: preferences.autoDetectLocation,
        share_location: preferences.shareLocation,
        location_accuracy_preference: preferences.locationAccuracyPreference,
        notification_radius_km: preferences.notificationRadiusKm
      }], { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;
    return this.mapLocationPreferencesFromDB(data);
  }

  async getLocationPreferences(userId: string): Promise<LocationPreferences | null> {
    const { data, error } = await supabase
      .from('location_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.mapLocationPreferencesFromDB(data) : null;
  }

  // Utility methods for mapping database records
  private mapUserLocationFromDB(data: any): UserLocation {
    return {
      id: data.id,
      userId: data.user_id,
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      accuracy: data.accuracy,
      addressLine1: data.address_line1,
      addressLine2: data.address_line2,
      city: data.city,
      state: data.state,
      country: data.country,
      postalCode: data.postal_code,
      timezone: data.timezone,
      isPrimary: data.is_primary,
      isCurrent: data.is_current,
      type: data.location_type,
      expiresAt: data.expires_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  private mapSellerLocationFromDB(data: any): SellerLocation {
    return {
      id: data.id,
      sellerId: data.seller_id,
      businessName: data.business_name,
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      addressLine1: data.address_line1,
      addressLine2: data.address_line2,
      city: data.city,
      state: data.state,
      country: data.country,
      postalCode: data.postal_code,
      phone: data.phone,
      email: data.email,
      website: data.website,
      businessHours: data.business_hours,
      deliveryRadiusKm: parseFloat(data.delivery_radius_km),
      pickupAvailable: data.pickup_available,
      deliveryAvailable: data.delivery_available,
      serviceAreas: data.service_areas || [],
      timezone: data.timezone,
      isPrimary: data.is_primary,
      isActive: data.is_active,
      verificationStatus: data.verification_status,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  private mapDeliveryZoneFromDB(data: any): DeliveryZone {
    return {
      id: data.id,
      sellerLocationId: data.seller_location_id,
      zoneName: data.zone_name,
      zoneType: data.zone_type,
      radiusKm: data.radius_km ? parseFloat(data.radius_km) : undefined,
      postalCodes: data.postal_codes,
      deliveryFee: parseFloat(data.delivery_fee),
      minimumOrder: parseFloat(data.minimum_order),
      estimatedDeliveryTime: data.estimated_delivery_time,
      isActive: data.is_active,
      priorityOrder: data.priority_order
    };
  }

  private mapLocationPreferencesFromDB(data: any): LocationPreferences {
    return {
      id: data.id,
      userId: data.user_id,
      preferredCurrency: data.preferred_currency,
      preferredLanguage: data.preferred_language,
      preferredTimezone: data.preferred_timezone,
      preferredUnits: data.preferred_units,
      maxDeliveryDistanceKm: parseFloat(data.max_delivery_distance_km),
      autoDetectLocation: data.auto_detect_location,
      shareLocation: data.share_location,
      locationAccuracyPreference: data.location_accuracy_preference,
      notificationRadiusKm: parseFloat(data.notification_radius_km)
    };
  }
}

export const locationDB = new LocationDatabaseService();