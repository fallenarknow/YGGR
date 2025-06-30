import { Plant, Seller, PlantCareGuide, DesignInspiration } from '../types';

export const mockPlants: Plant[] = [
  {
    id: '1',
    name: 'Monstera Deliciosa',
    botanicalName: 'Monstera deliciosa',
    price: 45.99,
    originalPrice: 59.99,
    images: [
      'https://images.pexels.com/photos/6912796/pexels-photo-6912796.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/7084308/pexels-photo-7084308.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    description: 'The iconic Swiss Cheese Plant with beautiful split leaves. Perfect for creating a tropical indoor jungle.',
    category: 'Indoor Plants',
    size: 'medium',
    careLevel: 2,
    lightRequirement: 'bright',
    wateringFrequency: 'medium',
    petSafe: false,
    indoorOutdoor: 'indoor',
    stock: 15,
    sellerId: 'seller1',
    sellerName: 'Green Paradise Nursery',
    rating: 4.8,
    reviewCount: 127,
    tags: ['trendy', 'air-purifying', 'low-maintenance'],
    features: ['Fast Growing', 'Large Leaves', 'Easy Propagation']
  },
  {
    id: '2',
    name: 'Snake Plant',
    botanicalName: 'Sansevieria trifasciata',
    price: 28.99,
    images: [
      'https://images.unsplash.com/photo-1593482892290-f54927ae1bb6?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    ],
    description: 'Virtually indestructible and perfect for beginners. Tolerates low light and infrequent watering.',
    category: 'Indoor Plants',
    size: 'medium',
    careLevel: 1,
    lightRequirement: 'low',
    wateringFrequency: 'low',
    petSafe: false,
    indoorOutdoor: 'indoor',
    stock: 23,
    sellerId: 'seller1',
    sellerName: 'Green Paradise Nursery',
    rating: 4.9,
    reviewCount: 89,
    tags: ['beginner-friendly', 'air-purifying', 'drought-tolerant'],
    features: ['Air Purifying', 'Low Maintenance', 'Drought Resistant']
  },
  {
    id: '3',
    name: 'Fiddle Leaf Fig',
    botanicalName: 'Ficus lyrata',
    price: 89.99,
    images: [
      'https://images.pexels.com/photos/6208086/pexels-photo-6208086.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    description: 'Statement plant with large, violin-shaped leaves. A stunning centerpiece for any modern home.',
    category: 'Indoor Plants',
    size: 'large',
    careLevel: 4,
    lightRequirement: 'bright',
    wateringFrequency: 'medium',
    petSafe: false,
    indoorOutdoor: 'indoor',
    stock: 8,
    sellerId: 'seller2',
    sellerName: 'Urban Jungle Co.',
    rating: 4.6,
    reviewCount: 156,
    tags: ['statement-plant', 'instagram-worthy', 'architectural'],
    features: ['Large Statement Leaves', 'Architectural Form', 'Instagram Famous']
  },
  {
    id: '4',
    name: 'Peace Lily',
    botanicalName: 'Spathiphyllum wallisii',
    price: 32.99,
    images: [
      'https://tse4.mm.bing.net/th/id/OIP._hC8gcUF8Ym8b0gPgAAmxgHaE8?pid=Api&P=0&h=180?auto=compress&cs=tinysrgb&w=800'
    ],
    description: 'Elegant flowering plant that thrives in low light. Beautiful white blooms and glossy green leaves.',
    category: 'Flowering Plants',
    size: 'medium',
    careLevel: 2,
    lightRequirement: 'low',
    wateringFrequency: 'medium',
    petSafe: false,
    indoorOutdoor: 'indoor',
    stock: 19,
    sellerId: 'seller3',
    sellerName: 'Bloom & Grow',
    rating: 4.7,
    reviewCount: 73,
    tags: ['flowering', 'air-purifying', 'low-light'],
    features: ['Beautiful Flowers', 'Air Purifying', 'Low Light Tolerant']
  },
  {
    id: '5',
    name: 'Rubber Plant',
    botanicalName: 'Ficus elastica',
    price: 42.99,
    images: [
      'https://media.istockphoto.com/id/1294242954/photo/sunshine-on-the-potted-ficus-elastica-interior-ornamental-plant-rubber-fig.jpg?s=1024x1024&w=is&k=20&c=ALdp855wCtmFiejBAU5VSYjSBcCGc8C6KoLCGGGjeE8='
    ],
    description: 'Classic houseplant with glossy, dark green leaves. Grows into an impressive tree-like specimen.',
    category: 'Indoor Plants',
    size: 'large',
    careLevel: 2,
    lightRequirement: 'bright',
    wateringFrequency: 'medium',
    petSafe: false,
    indoorOutdoor: 'indoor',
    stock: 12,
    sellerId: 'seller1',
    sellerName: 'Green Paradise Nursery',
    rating: 4.8,
    reviewCount: 94,
    tags: ['classic', 'easy-care', 'glossy-leaves'],
    features: ['Glossy Leaves', 'Fast Growing', 'Classic Houseplant']
  },
  {
    id: '6',
    name: 'Pothos Golden',
    botanicalName: 'Epipremnum aureum',
    price: 18.99,
    images: [
      'https://media.istockphoto.com/id/830130880/photo/close-up-of-golden-pothos-in-a-tree-vase-on-wooden-table-white-and-green-leaves-texture.jpg?s=1024x1024&w=is&k=20&c=XO9-_x9bG2J1L9kHyYrjt8sa3AUculgktOtE9Uy-mdY='
    ],
    description: 'Perfect trailing plant for hanging baskets or shelves. Golden variegated leaves add brightness to any space.',
    category: 'Trailing Plants',
    size: 'small',
    careLevel: 1,
    lightRequirement: 'medium',
    wateringFrequency: 'medium',
    petSafe: false,
    indoorOutdoor: 'indoor',
    stock: 35,
    sellerId: 'seller2',
    sellerName: 'Urban Jungle Co.',
    rating: 4.9,
    reviewCount: 201,
    tags: ['trailing', 'beginner-friendly', 'variegated'],
    features: ['Trailing Growth', 'Golden Variegation', 'Super Easy Care']
  },
  // Kerala Plants
  {
    id: '7',
    name: 'Areca Palm',
    botanicalName: 'Dypsis lutescens',
    price: 1299,
    originalPrice: 1599,
    images: [
      'https://images.pexels.com/photos/1084199/pexels-photo-1084199.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    description: 'Popular indoor palm with feathery, arching fronds. Excellent air purifier and natural humidifier.',
    category: 'Indoor Plants',
    size: 'large',
    careLevel: 2,
    lightRequirement: 'bright',
    wateringFrequency: 'medium',
    petSafe: true,
    indoorOutdoor: 'both',
    stock: 18,
    sellerId: 'kerala1',
    sellerName: 'Kerala Green Haven',
    rating: 4.7,
    reviewCount: 83,
    tags: ['air-purifying', 'tropical', 'humidity-loving'],
    features: ['Natural Humidifier', 'Air Purifier', 'Tropical Vibes']
  },
  {
    id: '8',
    name: 'Anthurium',
    botanicalName: 'Anthurium andraeanum',
    price: 899,
    images: [
      'https://images.unsplash.com/photo-1688481156464-4285423c8b39?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    ],
    description: 'Stunning flowering plant with glossy, heart-shaped blooms in vibrant red. Perfect for adding color to your home.',
    category: 'Flowering Plants',
    size: 'medium',
    careLevel: 3,
    lightRequirement: 'bright',
    wateringFrequency: 'medium',
    petSafe: false,
    indoorOutdoor: 'indoor',
    stock: 12,
    sellerId: 'kerala1',
    sellerName: 'Kerala Green Haven',
    rating: 4.8,
    reviewCount: 56,
    tags: ['flowering', 'tropical', 'colorful'],
    features: ['Long-lasting Blooms', 'Vibrant Colors', 'Air Purifying']
  },
  {
    id: '9',
    name: 'Malabar Spinach',
    botanicalName: 'Basella alba',
    price: 249,
    images: [
      'https://media.istockphoto.com/id/2168722166/photo/basella-alba.jpg?s=1024x1024&w=is&k=20&c=DfbvvGdPL6I3JLkc84bPRs9NVyqLx9rooV3ZG7PuSDI='
    ],
    description: 'Fast-growing edible vine with nutritious, spinach-like leaves. Perfect for kitchen gardens in Kerala\'s climate.',
    category: 'Edible Plants',
    size: 'medium',
    careLevel: 1,
    lightRequirement: 'bright',
    wateringFrequency: 'medium',
    petSafe: true,
    indoorOutdoor: 'outdoor',
    stock: 30,
    sellerId: 'kerala2',
    sellerName: 'Kochi Plant Studio',
    rating: 4.9,
    reviewCount: 42,
    tags: ['edible', 'local', 'fast-growing'],
    features: ['Edible Leaves', 'Heat Tolerant', 'Nutritious']
  },
  {
    id: '10',
    name: 'Curry Leaf Plant',
    botanicalName: 'Murraya koenigii',
    price: 399,
    images: [
      'https://media.istockphoto.com/id/956693940/photo/fresh-curry-leaves-in-coconut-bowl-on-wooden-background.jpg?s=1024x1024&w=is&k=20&c=HS4oIpO5YUaAKqmHIVNIxfpKD0nDCdnAw53V_-HPzPI='
    ],
    description: 'Essential herb for authentic Kerala cuisine. Aromatic leaves add distinctive flavor to curries and dishes.',
    category: 'Herbs',
    size: 'medium',
    careLevel: 2,
    lightRequirement: 'bright',
    wateringFrequency: 'medium',
    petSafe: true,
    indoorOutdoor: 'both',
    stock: 25,
    sellerId: 'kerala2',
    sellerName: 'Kochi Plant Studio',
    rating: 4.8,
    reviewCount: 67,
    tags: ['culinary', 'aromatic', 'medicinal'],
    features: ['Culinary Herb', 'Medicinal Properties', 'Aromatic Leaves']
  },
  {
    id: '11',
    name: 'Banana Plant',
    botanicalName: 'Musa acuminata',
    price: 599,
    images: [
      'https://images.unsplash.com/photo-1551551313-fe7031e26248?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    ],
    description: 'Fast-growing tropical plant with large, paddle-shaped leaves. Can produce fruit in optimal conditions.',
    category: 'Fruit Plants',
    size: 'large',
    careLevel: 2,
    lightRequirement: 'bright',
    wateringFrequency: 'high',
    petSafe: true,
    indoorOutdoor: 'outdoor',
    stock: 15,
    sellerId: 'kerala3',
    sellerName: 'Trivandrum Plant Paradise',
    rating: 4.6,
    reviewCount: 38,
    tags: ['tropical', 'fruit-bearing', 'fast-growing'],
    features: ['Edible Fruit', 'Tropical Look', 'Fast Growing']
  },
  {
    id: '12',
    name: 'Jasmine',
    botanicalName: 'Jasminum sambac',
    price: 349,
    images: [
      'https://images.unsplash.com/photo-1623171404570-1d196759fe20?q=80&w=689&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    ],
    description: 'Fragrant flowering vine popular in Kerala. White star-shaped flowers emit a sweet, intoxicating scent.',
    category: 'Flowering Plants',
    size: 'medium',
    careLevel: 2,
    lightRequirement: 'bright',
    wateringFrequency: 'medium',
    petSafe: true,
    indoorOutdoor: 'both',
    stock: 22,
    sellerId: 'kerala3',
    sellerName: 'Trivandrum Plant Paradise',
    rating: 4.9,
    reviewCount: 75,
    tags: ['fragrant', 'flowering', 'traditional'],
    features: ['Fragrant Flowers', 'Traditional Plant', 'Ornamental Value']
  },
  {
    id: '13',
    name: 'Coconut Palm Seedling',
    botanicalName: 'Cocos nucifera',
    price: 799,
    images: [
      'https://images.pexels.com/photos/2138922/pexels-photo-2138922.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    description: 'Young coconut palm, Kerala\'s iconic tree. Perfect for large gardens with space for this majestic palm to grow.',
    category: 'Outdoor Plants',
    size: 'medium',
    careLevel: 2,
    lightRequirement: 'direct',
    wateringFrequency: 'medium',
    petSafe: true,
    indoorOutdoor: 'outdoor',
    stock: 10,
    sellerId: 'kerala4',
    sellerName: 'Calicut Garden Center',
    rating: 4.7,
    reviewCount: 29,
    tags: ['native', 'palm', 'iconic'],
    features: ['Kerala\'s Iconic Tree', 'Fruit Bearing', 'Ornamental Value']
  },
  {
    id: '14',
    name: 'Holy Basil (Tulsi)',
    botanicalName: 'Ocimum tenuiflorum',
    price: 199,
    images: [
      'https://images.pexels.com/photos/6157229/pexels-photo-6157229.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    description: 'Sacred plant in Indian households with medicinal properties. Aromatic leaves used in teas and Ayurvedic remedies.',
    category: 'Herbs',
    size: 'small',
    careLevel: 1,
    lightRequirement: 'bright',
    wateringFrequency: 'medium',
    petSafe: true,
    indoorOutdoor: 'both',
    stock: 40,
    sellerId: 'kerala4',
    sellerName: 'Calicut Garden Center',
    rating: 4.9,
    reviewCount: 88,
    tags: ['medicinal', 'aromatic', 'sacred'],
    features: ['Medicinal Properties', 'Aromatic Leaves', 'Air Purifying']
  },
  {
    id: '15',
    name: 'Elephant Ear Plant',
    botanicalName: 'Alocasia macrorrhiza',
    price: 899,
    originalPrice: 1099,
    images: [
      'https://images.pexels.com/photos/6208087/pexels-photo-6208087.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    description: 'Dramatic tropical plant with enormous, arrow-shaped leaves. Creates an instant jungle feel in any space.',
    category: 'Indoor Plants',
    size: 'large',
    careLevel: 3,
    lightRequirement: 'bright',
    wateringFrequency: 'high',
    petSafe: false,
    indoorOutdoor: 'both',
    stock: 8,
    sellerId: 'kerala5',
    sellerName: 'Munnar Exotic Plants',
    rating: 4.7,
    reviewCount: 45,
    tags: ['tropical', 'statement', 'large-leaves'],
    features: ['Dramatic Foliage', 'Tropical Look', 'Statement Plant']
  },
  {
    id: '16',
    name: 'Cardamom Plant',
    botanicalName: 'Elettaria cardamomum',
    price: 649,
    images: [
      'https://images.pexels.com/photos/4750270/pexels-photo-4750270.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    description: 'Aromatic spice plant native to Kerala\'s Western Ghats. Glossy green leaves and fragrant seed pods used in cooking.',
    category: 'Spice Plants',
    size: 'medium',
    careLevel: 3,
    lightRequirement: 'medium',
    wateringFrequency: 'medium',
    petSafe: true,
    indoorOutdoor: 'both',
    stock: 15,
    sellerId: 'kerala5',
    sellerName: 'Munnar Exotic Plants',
    rating: 4.8,
    reviewCount: 36,
    tags: ['spice', 'native', 'aromatic'],
    features: ['Culinary Spice', 'Aromatic', 'Kerala Native']
  }
];

export const mockSellers: Seller[] = [
  {
    id: 'seller1',
    name: 'Green Paradise Nursery',
    type: 'nursery',
    location: 'Portland, Oregon',
    rating: 4.8,
    reviewCount: 1247,
    verified: true,
    joinedDate: '2021-03-15',
    description: 'Family-owned nursery specializing in tropical houseplants and expert plant care advice.',
    avatar: 'https://images.pexels.com/photos/6208086/pexels-photo-6208086.jpeg?auto=compress&cs=tinysrgb&w=200',
    specialties: ['Tropical Plants', 'Rare Varieties', 'Plant Care Consultation']
  },
  {
    id: 'seller2',
    name: 'Urban Jungle Co.',
    type: 'nursery',
    location: 'Brooklyn, New York',
    rating: 4.7,
    reviewCount: 892,
    verified: true,
    joinedDate: '2020-08-22',
    description: 'Modern plant boutique bringing the jungle to urban spaces with curated plant collections.',
    avatar: 'https://images.pexels.com/photos/7081624/pexels-photo-7081624.jpeg?auto=compress&cs=tinysrgb&w=200',
    specialties: ['Indoor Plants', 'Modern Planters', 'Plant Styling']
  },
  {
    id: 'seller3',
    name: 'Bloom & Grow',
    type: 'grower',
    location: 'Austin, Texas',
    rating: 4.9,
    reviewCount: 634,
    verified: true,
    joinedDate: '2022-01-10',
    description: 'Passionate plant grower focused on flowering plants and creating beautiful garden spaces.',
    avatar: 'https://images.pexels.com/photos/6912796/pexels-photo-6912796.jpeg?auto=compress&cs=tinysrgb&w=200',
    specialties: ['Flowering Plants', 'Garden Design', 'Seasonal Plants']
  },
  // Kerala Sellers
  {
    id: 'kerala1',
    name: 'Kerala Green Haven',
    type: 'nursery',
    location: 'Kochi, Kerala',
    rating: 4.9,
    reviewCount: 342,
    verified: true,
    joinedDate: '2022-05-18',
    description: 'Specializing in tropical plants native to Kerala. We offer a wide variety of indoor and outdoor plants suited to Kerala\'s climate.',
    avatar: 'https://images.pexels.com/photos/4503273/pexels-photo-4503273.jpeg?auto=compress&cs=tinysrgb&w=200',
    specialties: ['Native Plants', 'Tropical Species', 'Medicinal Plants']
  },
  {
    id: 'kerala2',
    name: 'Kochi Plant Studio',
    type: 'nursery',
    location: 'Ernakulam, Kerala',
    rating: 4.8,
    reviewCount: 218,
    verified: true,
    joinedDate: '2021-11-05',
    description: 'Urban plant boutique in the heart of Kochi. We focus on easy-care indoor plants and edible herbs for apartment dwellers.',
    avatar: 'https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg?auto=compress&cs=tinysrgb&w=200',
    specialties: ['Indoor Plants', 'Edible Gardens', 'Apartment Gardening']
  },
  {
    id: 'kerala3',
    name: 'Trivandrum Plant Paradise',
    type: 'grower',
    location: 'Thiruvananthapuram, Kerala',
    rating: 4.7,
    reviewCount: 176,
    verified: true,
    joinedDate: '2022-02-14',
    description: 'Family-run plant nursery specializing in flowering plants and traditional Kerala garden varieties.',
    avatar: 'https://images.pexels.com/photos/2123482/pexels-photo-2123482.jpeg?auto=compress&cs=tinysrgb&w=200',
    specialties: ['Flowering Plants', 'Traditional Gardens', 'Ornamental Plants']
  },
  {
    id: 'kerala4',
    name: 'Calicut Garden Center',
    type: 'nursery',
    location: 'Kozhikode, Kerala',
    rating: 4.8,
    reviewCount: 203,
    verified: true,
    joinedDate: '2021-08-30',
    description: 'Comprehensive garden center offering everything from seeds to mature plants. Experts in Kerala native species.',
    avatar: 'https://images.pexels.com/photos/1105019/pexels-photo-1105019.jpeg?auto=compress&cs=tinysrgb&w=200',
    specialties: ['Native Trees', 'Fruit Plants', 'Garden Supplies']
  },
  {
    id: 'kerala5',
    name: 'Munnar Exotic Plants',
    type: 'grower',
    location: 'Munnar, Kerala',
    rating: 4.9,
    reviewCount: 156,
    verified: true,
    joinedDate: '2022-04-22',
    description: 'Specializing in rare and exotic plants that thrive in Kerala\'s highland climate. Located in the beautiful hills of Munnar.',
    avatar: 'https://images.pexels.com/photos/2382325/pexels-photo-2382325.jpeg?auto=compress&cs=tinysrgb&w=200',
    specialties: ['Exotic Species', 'Highland Plants', 'Spice Plants']
  }
];

export const mockCareGuides: PlantCareGuide[] = [
  {
    plantId: '1',
    lightNeeds: {
      type: 'Bright, indirect light',
      hoursPerDay: '6-8 hours',
      description: 'Place near a bright window but avoid direct sunlight which can burn the leaves.'
    },
    watering: {
      frequency: 'Weekly',
      amount: 'Moderate',
      drainage: 'Essential - ensure good drainage',
      description: 'Water when top 1-2 inches of soil are dry. Reduce frequency in winter.'
    },
    climate: {
      temperature: '65-80°F (18-27°C)',
      humidity: '60-70%',
      seasonalAdjustments: 'Reduce watering in winter, increase humidity with dry indoor air.'
    },
    soil: {
      type: 'Well-draining potting mix',
      ph: '6.0-7.0',
      repotting: 'Every 2-3 years or when rootbound'
    },
    fertilization: {
      type: 'Balanced liquid fertilizer',
      frequency: 'Monthly',
      season: 'Spring through early fall'
    },
    commonIssues: [
      'Yellow leaves (overwatering)',
      'Brown leaf tips (low humidity)',
      'Pest issues (spider mites, mealybugs)'
    ],
    toxicity: {
      petSafe: false,
      warnings: ['Toxic to cats and dogs if ingested', 'Keep away from curious pets']
    },
    significance: {
      cultural: 'Native to Central America, popular since the 1970s as a houseplant.',
      symbolic: 'Represents longevity and prosperity in feng shui practices.',
      airPurifying: true,
      fengShui: 'Place in living room or office for positive energy and growth.'
    }
  }
];

export const mockDesignInspirations: DesignInspiration[] = [
  {
  id: 'design-8',
  title: 'Scandinavian Entryway Green Welcome',
  description: 'Welcome guests with a fresh, calming entryway design using Scandinavian decor principles and easy-care plants that thrive in indirect light.',
  images: [
    'https://images.pexels.com/photos/5997992/pexels-photo-5997992.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/6207800/pexels-photo-6207800.jpeg?auto=compress&cs=tinysrgb&w=600'
  ],
  categories: {
    room: ['Entryway', 'Hallway'],
    style: ['Scandinavian', 'Minimalist'],
    plantType: ['Floor Plants', 'Air Purifying'],
    difficulty: ['Beginner-Friendly']
  },
  plantDetails: [
    {
      plantId: '11',
      name: 'Fiddle Leaf Fig',
      botanicalName: 'Ficus lyrata',
      careLevel: 2,
      lightRequirement: 'bright',
      wateringFrequency: 'medium',
      petSafe: false,
      benefits: ['Statement Plant', 'Air Purifying', 'Modern Look']
    },
    {
      plantId: '9',
      name: 'ZZ Plant',
      botanicalName: 'Zamioculcas zamiifolia',
      careLevel: 1,
      lightRequirement: 'low',
      wateringFrequency: 'low',
      petSafe: false,
      benefits: ['Low Maintenance', 'Air Purifying', 'Glossy Texture']
    }
  ],
  designTips: [
    'Use light wooden textures and white walls for a bright look',
    'Place a tall plant near the door and a shorter one on a bench or console',
    'Use minimal accessories like black metal hooks or shelves for storage',
    'Select sculptural plants for visual impact'
  ],
  potRecommendations: [
    'Matte white ceramic pots',
    'Textured grey concrete planters',
    'Natural wood plant stands for elevation'
  ],
  complementaryPlants: [
    'Rubber Plant for additional texture',
    'Snake Plant for easy care',
    'Monstera for a pop of drama'
  ],
  estimatedCost: {
    min: 200,
    max: 400
  },
  likes: 978,
  comments: 47,
  userGenerated: false,
  featured: true,
  createdAt: '2024-03-02T10:45:00Z'
},

  {
    id: 'design-3',
    title: 'Modern Kitchen Herb Garden',
    description: 'Bring fresh flavors to your cooking with a stylish kitchen herb garden. Perfect for small spaces and provides fresh ingredients year-round.',
    images: [
      'https://images.pexels.com/photos/6207738/pexels-photo-6207738.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    categories: {
      room: ['Kitchen'],
      style: ['Modern'],
      plantType: ['Herbs', 'Desktop Plants'],
      difficulty: ['Moderate Care']
    },
    plantDetails: [
      {
        plantId: '7',
        name: 'Basil',
        botanicalName: 'Ocimum basilicum',
        careLevel: 2,
        lightRequirement: 'bright',
        wateringFrequency: 'medium',
        petSafe: true,
        benefits: ['Culinary Use', 'Aromatic', 'Fast Growing']
      },
      {
        plantId: '8',
        name: 'Rosemary',
        botanicalName: 'Rosmarinus officinalis',
        careLevel: 2,
        lightRequirement: 'bright',
        wateringFrequency: 'low',
        petSafe: true,
        benefits: ['Culinary Use', 'Aromatic', 'Drought Tolerant']
      }
    ],
    designTips: [
      'Use matching pots for a cohesive look',
      'Place near a sunny window for optimal growth',
      'Harvest regularly to encourage new growth',
      'Label each herb for easy identification'
    ],
    potRecommendations: [
      'White ceramic pots with drainage',
      'Stainless steel planters for modern look',
      'Wall-mounted herb garden system'
    ],
    complementaryPlants: [
      'Mint for refreshing drinks',
      'Thyme for Mediterranean cooking',
      'Cilantro for fresh garnishes'
    ],
    estimatedCost: {
      min: 80,
      max: 180
    },
    likes: 634,
    comments: 45,
    userGenerated: false,
    featured: false,
    createdAt: '2024-01-10T09:15:00Z'
  },
  {
    id: 'design-4',
    title: 'Bathroom Spa Retreat',
    description: 'Create a spa-like atmosphere in your bathroom with humidity-loving plants that thrive in steamy conditions while purifying the air.',
    images: [
      'https://plus.unsplash.com/premium_photo-1670360413874-12d477f97e34?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    ],
    categories: {
      room: ['Bathroom'],
      style: ['Spa', 'Modern'],
      plantType: ['Humidity-Loving'],
      difficulty: ['Beginner-Friendly']
    },
    plantDetails: [
      {
        plantId: '4',
        name: 'Peace Lily',
        botanicalName: 'Spathiphyllum wallisii',
        careLevel: 2,
        lightRequirement: 'low',
        wateringFrequency: 'medium',
        petSafe: false,
        benefits: ['Humidity Loving', 'Air Purifying', 'Beautiful Flowers']
      },
      {
        plantId: '6',
        name: 'Pothos Golden',
        botanicalName: 'Epipremnum aureum',
        careLevel: 1,
        lightRequirement: 'low',
        wateringFrequency: 'medium',
        petSafe: false,
        benefits: ['Humidity Tolerant', 'Low Light', 'Trailing Growth']
      }
    ],
    designTips: [
      'Choose plants that love humidity and low light',
      'Use waterproof saucers to protect surfaces',
      'Position plants away from direct water spray',
      'Consider hanging plants to save counter space'
    ],
    potRecommendations: [
      'Ceramic pots with waterproof saucers',
      'Hanging planters for shower area',
      'Bamboo plant stands for natural look'
    ],
    complementaryPlants: [
      'Boston Fern for lush greenery',
      'Air Plants for unique texture',
      'Orchids for elegant blooms'
    ],
    estimatedCost: {
      min: 100,
      max: 200
    },
    likes: 756,
    comments: 52,
    userGenerated: false,
    featured: false,
    createdAt: '2024-01-08T16:45:00Z'
  },
  {
    id: 'design-5',
    title: 'Home Office Productivity Corner',
    description: 'Boost your productivity and air quality with carefully selected office plants that reduce stress and improve focus during work hours.',
    images: [
      'https://images.unsplash.com/photo-1700168333952-3d44a3f427af?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    ],
    categories: {
      room: ['Office'],
      style: ['Modern', 'Minimalist'],
      plantType: ['Desktop Plants', 'Air Purifying'],
      difficulty: ['Low Maintenance']
    },
    plantDetails: [
      {
        plantId: '2',
        name: 'Snake Plant',
        botanicalName: 'Sansevieria trifasciata',
        careLevel: 1,
        lightRequirement: 'low',
        wateringFrequency: 'low',
        petSafe: false,
        benefits: ['Air Purifying', 'Low Maintenance', 'Stress Reducing']
      },
      {
        plantId: '9',
        name: 'ZZ Plant',
        botanicalName: 'Zamioculcas zamiifolia',
        careLevel: 1,
        lightRequirement: 'low',
        wateringFrequency: 'low',
        petSafe: false,
        benefits: ['Extremely Low Maintenance', 'Air Purifying', 'Glossy Foliage']
      }
    ],
    designTips: [
      'Choose low-maintenance plants for busy work schedules',
      'Position plants to reduce screen glare',
      'Use plants to create natural room dividers',
      'Select plants known for stress-reducing properties'
    ],
    potRecommendations: [
      'Modern geometric planters',
      'Self-watering pots for convenience',
      'Desk-sized ceramic containers'
    ],
    complementaryPlants: [
      'Rubber Plant for larger statement',
      'Pothos for trailing desk edge',
      'Succulents for minimal care'
    ],
    estimatedCost: {
      min: 90,
      max: 220
    },
    likes: 543,
    comments: 38,
    userGenerated: true,
    featured: false,
    createdAt: '2024-01-05T11:20:00Z'
  },
  {
    id: 'design-6',
    title: 'Vertical Garden Wall Statement',
    description: 'Make a bold statement with a living wall that maximizes vertical space while creating a stunning focal point in any room.',
    images: [
      'https://images.unsplash.com/photo-1536260454352-a931acd0c989?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    ],
    categories: {
      room: ['Living Room', 'Dining Room'],
      style: ['Modern', 'Statement'],
      plantType: ['Vertical Gardens', 'Air Purifying'],
      difficulty: ['High Maintenance']
    },
    plantDetails: [
      {
        plantId: '6',
        name: 'Pothos Golden',
        botanicalName: 'Epipremnum aureum',
        careLevel: 1,
        lightRequirement: 'medium',
        wateringFrequency: 'medium',
        petSafe: false,
        benefits: ['Fast Growing', 'Trailing', 'Air Purifying']
      },
      {
        plantId: '10',
        name: 'Philodendron',
        botanicalName: 'Philodendron hederaceum',
        careLevel: 2,
        lightRequirement: 'medium',
        wateringFrequency: 'medium',
        petSafe: false,
        benefits: ['Heart-Shaped Leaves', 'Trailing', 'Fast Growing']
      }
    ],
    designTips: [
      'Install proper irrigation system for even watering',
      'Choose plants with similar light and water requirements',
      'Plan for regular maintenance access',
      'Consider weight load on wall structure'
    ],
    potRecommendations: [
      'Modular wall planting system',
      'Felt pocket planters',
      'Hydroponic wall units'
    ],
    complementaryPlants: [
      'Ferns for texture variety',
      'Air Plants for unique elements',
      'Trailing Succulents for drought tolerance'
    ],
    estimatedCost: {
      min: 300,
      max: 800
    },
    likes: 1156,
    comments: 94,
    userGenerated: false,
    featured: true,
    createdAt: '2024-01-03T13:10:00Z'
  },
  // Kerala-inspired design
  {
    id: 'design-7',
    title: 'Kerala Tropical Courtyard',
    description: 'Create a lush tropical courtyard inspired by traditional Kerala homes. This design combines ornamental and functional plants for a beautiful outdoor living space.',
    images: [
      'https://images.unsplash.com/photo-1698466632950-2d9ee9f056bd?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    ],
    categories: {
      room: ['Courtyard', 'Garden'],
      style: ['Tropical', 'Traditional'],
      plantType: ['Tropical Plants', 'Edible Plants'],
      difficulty: ['Moderate Care']
    },
    plantDetails: [
      {
        plantId: '7',
        name: 'Areca Palm',
        botanicalName: 'Dypsis lutescens',
        careLevel: 2,
        lightRequirement: 'bright',
        wateringFrequency: 'medium',
        petSafe: true,
        benefits: ['Natural Shade', 'Air Purifying', 'Tropical Aesthetic']
      },
      {
        plantId: '10',
        name: 'Curry Leaf Plant',
        botanicalName: 'Murraya koenigii',
        careLevel: 2,
        lightRequirement: 'bright',
        wateringFrequency: 'medium',
        petSafe: true,
        benefits: ['Culinary Use', 'Aromatic', 'Medicinal']
      }
    ],
    designTips: [
      'Create a central water feature for cooling effect',
      'Use terracotta pots for authentic Kerala feel',
      'Combine ornamental and edible plants',
      'Incorporate traditional elements like stone lanterns'
    ],
    potRecommendations: [
      'Traditional terracotta planters',
      'Brass urns for statement plants',
      'Stone planters for permanent installations'
    ],
    complementaryPlants: [
      'Jasmine for fragrance',
      'Banana Plant for tropical feel',
      'Heliconia for colorful blooms'
    ],
    estimatedCost: {
      min: 5000,
      max: 15000
    },
    likes: 876,
    comments: 62,
    userGenerated: false,
    featured: true,
    createdAt: '2024-02-15T08:30:00Z'
  }
];