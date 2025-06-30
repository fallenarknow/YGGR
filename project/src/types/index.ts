export interface Plant {
  id: string;
  seller_id: string;
  name: string;
  botanical_name: string;
  price: number;
  original_price?: number;
  description: string;
  category: string;
  size: 'small' | 'medium' | 'large';
  care_level: 1 | 2 | 3 | 4 | 5;
  light_requirement: 'low' | 'medium' | 'bright' | 'direct';
  watering_frequency: 'low' | 'medium' | 'high';
  pet_safe: boolean;
  indoor_outdoor: 'indoor' | 'outdoor' | 'both';
  stock: number;
  images: string[];
  alt_texts?: string[];
  origin_info?: string;
  pot_details?: string;
  mature_size_expectations?: string;
  growth_rate?: string;
  special_features?: string[];
  status: 'draft' | 'active' | 'inactive' | 'out_of_stock';
  views: number;
  inquiries: number;
  sold_count: number;
  created_at: string;
  updated_at: string;
  
  // Computed fields for display
  sellerName?: string;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
  features?: string[];
}

export interface Seller {
  id: string;
  name: string;
  type: 'nursery' | 'individual' | 'grower';
  location: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  joinedDate: string;
  description: string;
  avatar: string;
  specialties: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  type: 'buyer' | 'seller';
  location?: string;
  preferences?: {
    lightConditions: string[];
    careLevel: number[];
    petSafe: boolean;
  };
}

export interface CartItem {
  plantId: string;
  plant: Plant;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  orderDate: string;
  shippingAddress: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PlantCareGuide {
  plantId: string;
  lightNeeds: {
    type: string;
    hoursPerDay: string;
    description: string;
  };
  watering: {
    frequency: string;
    amount: string;
    drainage: string;
    description: string;
  };
  climate: {
    temperature: string;
    humidity: string;
    seasonalAdjustments: string;
  };
  soil: {
    type: string;
    ph: string;
    repotting: string;
  };
  fertilization: {
    type: string;
    frequency: string;
    season: string;
  };
  commonIssues: string[];
  toxicity: {
    petSafe: boolean;
    warnings: string[];
  };
  significance: {
    cultural: string;
    symbolic: string;
    airPurifying: boolean;
    fengShui: string;
  };
}

export interface DesignPlantDetail {
  plantId: string;
  name: string;
  botanicalName: string;
  careLevel: 1 | 2 | 3 | 4 | 5;
  lightRequirement: 'low' | 'medium' | 'bright' | 'direct';
  wateringFrequency: 'low' | 'medium' | 'high';
  petSafe: boolean;
  benefits: string[];
}

export interface DesignInspiration {
  id: string;
  title: string;
  description: string;
  images: string[];
  categories: {
    room: string[];
    style: string[];
    plantType: string[];
    difficulty: string[];
  };
  plantDetails: DesignPlantDetail[];
  designTips: string[];
  potRecommendations: string[];
  complementaryPlants: string[];
  estimatedCost: {
    min: number;
    max: number;
  };
  likes: number;
  comments: number;
  userId?: string;
  userGenerated: boolean;
  featured: boolean;
  createdAt: string;
}

export interface InventoryItem {
  plantId: string;
  plant: Plant;
  shop: {
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
  };
  stock: number;
  price: number;
  size: string;
  lastUpdated: string;
  reserved?: number;
}