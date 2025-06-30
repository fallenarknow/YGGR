import React, { useState, useEffect } from 'react';
import { Search, MapPin, Clock, Star, Filter, Truck, Phone, Navigation, Heart, ShoppingCart, Package, Calendar } from 'lucide-react';
import { Plant } from '../types';
import { PlantCatalog } from './PlantCatalog';
import { PlantSellerDetails } from './PlantSellerDetails';
import { ReservationSystem } from './ReservationSystem';

interface Shop {
  id: string;
  name: string;
  address: string;
  distance: number;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  phone: string;
  image: string;
  specialties: string[];
  verified: boolean;
}

interface InventoryItem {
  plantId: string;
  plant: Plant;
  shop: Shop;
  stock: number;
  price: number;
  size: string;
  lastUpdated: string;
  reserved?: number;
}

interface LocalInventorySearchProps {
  recommendedPlant?: Plant;
  userLocation?: any;
  onReserve: (item: InventoryItem) => void;
  onDelivery?: (item: InventoryItem) => void;
}

export const LocalInventorySearch: React.FC<LocalInventorySearchProps> = ({
  recommendedPlant,
  userLocation,
  onReserve,
  onDelivery
}) => {
  const [currentView, setCurrentView] = useState<'catalog' | 'details' | 'reservation'>('catalog');
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState(recommendedPlant?.name || '');
  const [plants, setPlantsData] = useState<Plant[]>([]);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [reservationActionType, setReservationActionType] = useState<'pickup' | 'delivery'>('pickup');

  // Mock shops data with varying distances
  const mockShops: Shop[] = [
    {
      id: 'shop1',
      name: 'Green Paradise Nursery',
      address: 'Koramangala, Bangalore',
      distance: 2.3,
      rating: 4.8,
      reviewCount: 127,
      deliveryTime: '2-3 hours',
      phone: '+91 98765 43210',
      image: 'https://images.pexels.com/photos/6208086/pexels-photo-6208086.jpeg?auto=compress&cs=tinysrgb&w=200',
      specialties: ['Indoor Plants', 'Succulents', 'Air Purifying'],
      verified: true
    },
    {
      id: 'shop2',
      name: 'Urban Jungle Co.',
      address: 'Indiranagar, Bangalore',
      distance: 12.1,
      rating: 4.6,
      reviewCount: 89,
      deliveryTime: '3-4 hours',
      phone: '+91 98765 43211',
      image: 'https://images.pexels.com/photos/7081624/pexels-photo-7081624.jpeg?auto=compress&cs=tinysrgb&w=200',
      specialties: ['Rare Plants', 'Planters', 'Plant Care'],
      verified: true
    },
    {
      id: 'shop3',
      name: 'Bloom & Grow',
      address: 'HSR Layout, Bangalore',
      distance: 18.8,
      rating: 4.7,
      reviewCount: 156,
      deliveryTime: 'Pickup only',
      phone: '+91 98765 43212',
      image: 'https://images.pexels.com/photos/6912796/pexels-photo-6912796.jpeg?auto=compress&cs=tinysrgb&w=200',
      specialties: ['Flowering Plants', 'Garden Design', 'Organic'],
      verified: false
    },
    {
      id: 'shop4',
      name: 'Plant Paradise',
      address: 'Whitefield, Bangalore',
      distance: 22.5,
      rating: 4.5,
      reviewCount: 98,
      deliveryTime: 'Pickup only',
      phone: '+91 98765 43213',
      image: 'https://images.pexels.com/photos/7689734/pexels-photo-7689734.jpeg?auto=compress&cs=tinysrgb&w=200',
      specialties: ['Succulents', 'Cacti', 'Desert Plants'],
      verified: true
    }
  ];

  // Generate mock plant data with shop information
  useEffect(() => {
    // Import mock plants data
    import('../data/mockData').then(({ mockPlants }) => {
      const plantsWithShops = mockPlants.map((plant, index) => {
        const shop = mockShops[index % mockShops.length];
        return {
          ...plant,
          sellerName: shop.name,
          sellerDistance: shop.distance,
          sellerRating: shop.rating,
          sellerReviewCount: shop.reviewCount,
          sellerPhone: shop.phone,
          sellerAddress: shop.address,
          sellerVerified: shop.verified,
          deliveryTime: shop.deliveryTime
        };
      });
      setPlantsData(plantsWithShops);
    });
  }, []);

  const handlePlantSelect = (plant: Plant) => {
    setSelectedPlant(plant);
    setCurrentView('details');
  };

  const handleBackToCatalog = () => {
    setCurrentView('catalog');
    setSelectedPlant(null);
  };

  const handleReservation = (seller: any) => {
    if (!selectedPlant) return;
    
    const item = {
      plantId: selectedPlant.id,
      plant: selectedPlant,
      shop: {
        id: seller.id,
        name: seller.name,
        address: seller.address,
        distance: seller.distance,
        rating: seller.rating,
        reviewCount: seller.reviewCount,
        deliveryTime: seller.deliveryTime,
        phone: seller.phone,
        verified: seller.verified
      },
      stock: seller.stock,
      price: seller.price,
      size: seller.size,
      lastUpdated: new Date().toISOString()
    };
    
    setSelectedSeller(item);
    setReservationActionType('pickup');
    setShowReservationModal(true);
  };

  const handleDelivery = (seller: any) => {
    if (!selectedPlant) return;

    // Check if within delivery range (15km)
    if (seller.distance && seller.distance > 15) {
      alert('This seller is outside the delivery range. Pickup only available.');
      return;
    }

    // Show delivery warning
    const confirmed = window.confirm(
      'Delivery Disclaimer: By choosing delivery, you acknowledge that it is your responsibility to trust the seller. Any problems faced during delivery should be discussed directly with the seller. Do you want to proceed?'
    );

    if (!confirmed) return;

    const item = {
      plantId: selectedPlant.id,
      plant: selectedPlant,
      shop: {
        id: seller.id,
        name: seller.name,
        address: seller.address,
        distance: seller.distance,
        rating: seller.rating,
        reviewCount: seller.reviewCount,
        deliveryTime: seller.deliveryTime,
        phone: seller.phone,
        verified: seller.verified
      },
      stock: seller.stock,
      price: seller.price,
      size: seller.size,
      lastUpdated: new Date().toISOString()
    };
    
    setSelectedSeller(item);
    setReservationActionType('delivery');
    setShowReservationModal(true);
  };

  const handleReservationConfirm = (reservationData: any) => {
    console.log('Reservation confirmed:', reservationData);
    
    if (reservationActionType === 'pickup') {
      alert('Pickup reservation confirmed! You will receive SMS confirmation shortly.');
    } else {
      alert('Delivery order confirmed! Your plant will be delivered within the estimated time.');
    }
    
    setShowReservationModal(false);
    setSelectedSeller(null);
  };

  const handleReservationCancel = () => {
    setShowReservationModal(false);
    setSelectedSeller(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {currentView === 'catalog' && (
        <PlantCatalog
          plants={plants}
          onPlantSelect={handlePlantSelect}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          userLocation={userLocation}
        />
      )}

      {currentView === 'details' && selectedPlant && (
        <PlantSellerDetails
          plant={selectedPlant}
          onBack={handleBackToCatalog}
          onReserve={handleReservation}
          onDelivery={handleDelivery}
          userLocation={userLocation}
        />
      )}

      {/* Reservation System Modal */}
      {showReservationModal && selectedSeller && (
        <ReservationSystem
          item={selectedSeller}
          onConfirm={handleReservationConfirm}
          onCancel={handleReservationCancel}
        />
      )}
    </div>
  );
};