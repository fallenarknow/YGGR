import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Shield, Truck, Headphones, Leaf, Users, BookOpen, Search, Heart, ShoppingCart, TrendingUp, Award, Globe, Zap, CheckCircle, Play, MapPin, Clock, Sparkles, Target, Lightbulb, Camera, Navigation, Sun, Droplets } from 'lucide-react';
import { mockPlants } from '../data/mockData';
import { PlantCard } from '../components/PlantCard';
import { Plant } from '../types';
import PlantPersonalityQuiz from '../components/PlantPersonalityQuiz';

interface HomeProps {
  onAddToCart: (plant: Plant) => void;
  onViewPlantDetails: (plantId: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onAddToCart, onViewPlantDetails }) => {
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizResults, setQuizResults] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState({
    hero: false,
    localFocus: false,
    features: false,
    stats: false,
    howItWorks: false,
    plants: false,
    interactive: false,
    sellers: false,
    testimonials: false,
    cta: false
  });

  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const particleContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionName = entry.target.getAttribute('data-section');
          if (sectionName) {
            setIsVisible(prev => ({ ...prev, [sectionName]: true }));
          }
        }
      });
    }, observerOptions);

    document.querySelectorAll('[data-section]').forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  // Create floating particles
  useEffect(() => {
    if (particleContainerRef.current) {
      const container = particleContainerRef.current;
      const particleCount = window.innerWidth < 768 ? 8 : 15; // Fewer particles on mobile
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 15}s`;
        particle.style.animationDuration = `${12 + Math.random() * 6}s`;
        container.appendChild(particle);
      }

      return () => {
        container.innerHTML = '';
      };
    }
  }, []);

  const featuredPlants = mockPlants.slice(0, 3);
  const parallaxOffset = window.innerWidth >= 768 ? scrollY * 0.5 : 0; // Disable parallax on mobile
  const heroOpacity = Math.max(0, 1 - scrollY / 800);

  const handleQuizComplete = (results: any[]) => {
    setQuizResults(results);
    setShowQuiz(false);
  };

  const handleBuyPlant = (plantName: string) => {
    // Navigate to marketplace with plant filter
    navigate(`/marketplace?plant=${encodeURIComponent(plantName)}`);
  };

  // Show quiz modal
  if (showQuiz) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setShowQuiz(false)}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-secondary-600 hover:text-secondary-900 transition-colors shadow-lg"
          >
            ✕
          </button>
        </div>
        <PlantPersonalityQuiz onComplete={handleQuizComplete} />
      </div>
    );
  }

  // Show quiz results with buy buttons
  if (quizResults.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full mb-4">
              <Sparkles className="h-4 w-4" />
              <span className="font-medium">Your Plant Matches</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-4">
              We Found Your Perfect Plant Companions!
            </h1>
            <p className="text-lg text-secondary-600 max-w-3xl mx-auto">
              Based on your lifestyle and preferences, here are the plants that would thrive in your care
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {quizResults.map((plant, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 transition-all duration-300 hover:shadow-2xl hover:scale-105">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{plant.image}</div>
                  <h2 className="text-xl font-bold text-secondary-900">{plant.name}</h2>
                  <p className="text-sm text-secondary-600">{plant.subtitle}</p>
                  <div className="mt-2 inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 rounded-full">
                    <span className="font-medium">{plant.matchPercentage}% Match</span>
                  </div>
                </div>
                
                <p className="text-secondary-700 mb-4 text-sm">{plant.description}</p>
                
                <div className="bg-secondary-50 rounded-xl p-4 mb-4">
                  <h3 className="font-medium text-secondary-900 mb-2 text-sm">Care Level</h3>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < plant.difficulty ? 'text-yellow-500 fill-current' : 'text-secondary-300'}`} 
                      />
                    ))}
                    <span className="text-xs text-secondary-600 ml-2">
                      {plant.difficulty === 1 ? 'Very Easy' : 
                       plant.difficulty === 2 ? 'Easy' :
                       plant.difficulty === 3 ? 'Moderate' :
                       plant.difficulty === 4 ? 'Challenging' : 'Expert'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-secondary-700">
                    <Sun className="h-4 w-4 mr-2 text-yellow-500" />
                    <span>{plant.care.split(',')[1]?.trim() || 'Varies'}</span>
                  </div>
                  <div className="flex items-center text-sm text-secondary-700">
                    <Droplets className="h-4 w-4 mr-2 text-blue-500" />
                    <span>{plant.care.split(',')[0]?.trim() || 'Varies'}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleBuyPlant(plant.name)}
                    className="flex-1 bg-primary-600 text-white py-2 rounded-xl font-medium hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Find This Plant</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <button
              onClick={() => setQuizResults([])}
              className="bg-white border-2 border-primary-500 text-primary-600 px-6 py-3 rounded-xl font-medium hover:bg-primary-50 transition-colors"
            >
              Take Quiz Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Bolt Badge */}
      <a 
        href="https://bolt.new/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="fixed bottom-4 right-4 z-50 transition-transform hover:scale-110 shadow-lg rounded-full"
        title="Powered by Bolt"
      >
        <img 
          src="/black_circle_360x360.png" 
          alt="Powered by Bolt" 
          className="w-12 h-12 sm:w-16 sm:h-16"
        />
      </a>

      {/* Floating Particles */}
      <div ref={particleContainerRef} className="fixed inset-0 pointer-events-none z-0" />

      {/* Hero Section with Advanced Parallax */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50"
        data-section="hero"
        style={{ transform: `translateY(${parallaxOffset}px)` }}
      >
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute top-20 left-10 w-32 h-32 sm:w-64 sm:h-64 bg-gradient-to-r from-primary-200 to-primary-300 rounded-full opacity-20 blob"
            style={{ 
              transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px) translateY(${scrollY * 0.3}px)` 
            }}
          />
          <div 
            className="absolute top-40 right-20 w-24 h-24 sm:w-48 sm:h-48 bg-gradient-to-r from-secondary-200 to-accent-200 rounded-full opacity-30 blob"
            style={{ 
              transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * -0.015}px) translateY(${scrollY * 0.4}px)`,
              animationDelay: '2s'
            }}
          />
          <div 
            className="absolute bottom-40 left-1/4 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-r from-accent-200 to-primary-200 rounded-full opacity-15 blob"
            style={{ 
              transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px) translateY(${scrollY * 0.2}px)`,
              animationDelay: '4s'
            }}
          />
        </div>

        <div 
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10"
          style={{ opacity: heroOpacity }}
        >
          <div className={`transition-all duration-1000 ${isVisible.hero ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            {/* Logo with Magnetic Effect */}
            <div 
              className="flex items-center justify-center space-x-3 sm:space-x-4 mb-6 sm:mb-8 magnetic"
              style={{
                transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`
              }}
            >
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-2xl animate-bounce-subtle glow">
                <Leaf className="h-10 w-10 sm:h-16 sm:w-16 text-white animate-wiggle" />
              </div>
              <div className="text-left">
                <span className="text-3xl sm:text-5xl font-bold gradient-text tracking-tight">YGGR</span>
                <div className="text-sm sm:text-lg text-primary-600 font-medium">Local</div>
              </div>
            </div>
            
            {/* Typewriter Effect Title */}
            <h1 className="text-3xl sm:text-5xl md:text-8xl font-bold text-secondary-900 mb-6 sm:mb-8 leading-tight">
              Your City's
              <span className="block gradient-text typewriter">
                the plant Hub
              </span>
            </h1>
            
            <p className="text-base sm:text-xl md:text-2xl text-secondary-600 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed px-4">
              Discover premium plants from verified local sellers. Same-day delivery, expert care guides, 
              and a thriving community of plant enthusiasts in your city.
            </p>
            
            {/* Interactive CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12 sm:mb-16 px-4">
              <button
                onClick={() => setShowQuiz(true)}
                className="group interactive-button ripple w-full sm:w-auto inline-flex items-center px-8 sm:px-12 py-4 sm:py-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold rounded-2xl sm:rounded-3xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 transform hover:scale-105 shadow-2xl text-base sm:text-lg"
              >
                <Target className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                Find My Perfect Plant
                <ArrowRight className="ml-2 sm:ml-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-2 transition-transform" />
              </button>
              <Link
                to="/seller/signup"
                className="group interactive-button glass-effect w-full sm:w-auto inline-flex items-center px-8 sm:px-12 py-4 sm:py-6 border-2 border-primary-600 text-primary-600 font-bold rounded-2xl sm:rounded-3xl hover:bg-primary-50 transition-all duration-300 transform hover:scale-105 text-base sm:text-lg"
              >
                <Users className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                Join as Seller
              </Link>
            </div>

            {/* Floating City Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 max-w-5xl mx-auto px-4">
              {[
                { number: '2-4hrs', label: 'Same Day Delivery', icon: Clock, delay: '0ms' },
                { number: '15km', label: 'Delivery Radius', icon: MapPin, delay: '200ms' },
                { number: '50+', label: 'Local Sellers', icon: Users, delay: '400ms' },
                { number: '99%', label: 'Plant Survival', icon: Heart, delay: '600ms' }
              ].map((stat, index) => (
                <div 
                  key={index}
                  className="glass-effect rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl transform hover:scale-110 transition-all duration-300 plant-card-hover glow"
                  style={{ animationDelay: stat.delay }}
                >
                  <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600 mx-auto mb-2 sm:mb-3 animate-float" />
                  <div className="text-lg sm:text-2xl font-bold text-primary-600 mb-1 sm:mb-2">{stat.number}</div>
                  <div className="text-xs sm:text-sm text-secondary-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Scroll Indicator */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 sm:w-8 sm:h-12 border-2 border-primary-600 rounded-full flex justify-center glow">
            <div className="w-1.5 h-3 sm:w-2 sm:h-4 bg-primary-600 rounded-full mt-2 animate-pulse-slow"></div>
          </div>
          <p className="text-primary-600 text-xs sm:text-sm mt-2 font-medium">Scroll to explore</p>
        </div>
      </section>

      {/* Local Focus Section */}
      <section className="py-16 sm:py-32 bg-gradient-to-b from-white to-primary-50 relative overflow-hidden" data-section="localFocus">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-l from-primary-100 to-transparent rounded-full opacity-50 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-r from-accent-100 to-transparent rounded-full opacity-50 blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-12 sm:mb-20 transition-all duration-1000 ${isVisible.localFocus ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-4 sm:mb-6">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="font-semibold text-sm sm:text-base">Hyper-Local Marketplace</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-secondary-900 mb-4 sm:mb-6">
              Quality Through
              <span className="block gradient-text">Proximity</span>
            </h2>
            <p className="text-lg sm:text-xl text-secondary-600 max-w-3xl mx-auto leading-relaxed">
              We focus on one city at a time, ensuring the highest quality plants with same-day delivery 
              and local expert support.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-16 items-center">
            {/* Interactive Map Visualization */}
            <div className={`transition-all duration-1000 ${isVisible.localFocus ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              <div className="relative">
                <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl">
                  <div className="aspect-square bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl sm:rounded-2xl relative overflow-hidden">
                    {/* Animated City Map */}
                    <div className="absolute inset-3 sm:inset-4">
                      <div className="w-full h-full bg-white rounded-lg sm:rounded-xl relative">
                        {/* City Center */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary-600 rounded-full animate-pulse glow"></div>
                          <div className="absolute inset-0 w-6 h-6 sm:w-8 sm:h-8 bg-primary-600 rounded-full animate-ping opacity-30"></div>
                        </div>
                        
                        {/* Delivery Radius */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="w-24 h-24 sm:w-32 sm:h-32 border-2 border-primary-400 border-dashed rounded-full opacity-60 animate-pulse-slow"></div>
                        </div>
                        
                        {/* Seller Locations */}
                        {[
                          { top: '20%', left: '30%' },
                          { top: '70%', left: '20%' },
                          { top: '30%', left: '70%' },
                          { top: '80%', left: '60%' },
                          { top: '15%', left: '80%' }
                        ].map((position, index) => (
                          <div 
                            key={index}
                            className="absolute w-2 h-2 sm:w-3 sm:h-3 bg-accent-500 rounded-full animate-bounce"
                            style={{ 
                              top: position.top, 
                              left: position.left,
                              animationDelay: `${index * 0.5}s`
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-6 text-center">
                    <h3 className="text-lg sm:text-xl font-bold text-secondary-900 mb-2">15km Delivery Radius</h3>
                    <p className="text-sm sm:text-base text-secondary-600">Maximum 4-hour delivery time</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits List */}
            <div className={`space-y-6 sm:space-y-8 transition-all duration-1000 ${isVisible.localFocus ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
              {[
                {
                  icon: Clock,
                  title: 'Same-Day Delivery',
                  description: 'Plants reach you within hours, not days. Fresh from local nurseries to your doorstep with minimal transport stress.',
                  color: 'from-blue-500 to-blue-600'
                },
                {
                  icon: Shield,
                  title: 'Local Quality Assurance',
                  description: 'Our local team physically inspects every plant and verifies seller credentials for guaranteed quality.',
                  color: 'from-green-500 to-green-600'
                },
                {
                  icon: Users,
                  title: 'Community Network',
                  description: 'Connect with local plant enthusiasts, get advice from neighborhood experts, and join plant swaps.',
                  color: 'from-purple-500 to-purple-600'
                },
                {
                  icon: Target,
                  title: 'Climate Adapted',
                  description: 'Plants are already acclimatized to your local weather conditions, ensuring better survival rates.',
                  color: 'from-orange-500 to-orange-600'
                }
              ].map((benefit, index) => (
                <div 
                  key={index}
                  className="flex items-start space-x-3 sm:space-x-4 group"
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${benefit.color} rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg flex-shrink-0`}>
                    <benefit.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {benefit.title}
                    </h3>
                    <p className="text-sm sm:text-base text-secondary-600 leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Features Showcase */}
      <section className="py-16 sm:py-32 bg-white relative" data-section="interactive">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-12 sm:mb-20 transition-all duration-1000 ${isVisible.interactive ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="inline-flex items-center space-x-2 bg-accent-100 text-accent-700 px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-4 sm:mb-6">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="font-semibold text-sm sm:text-base">Interactive Experience</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-secondary-900 mb-4 sm:mb-6">
              Modern Plant
              <span className="block gradient-text">Discovery</span>
            </h2>
            <p className="text-lg sm:text-xl text-secondary-600 max-w-3xl mx-auto">
              Experience plant shopping like never before with our cutting-edge interactive features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: Target,
                title: 'Plant Personality Match',
                description: 'Interactive quiz to find plants that match your lifestyle and personality',
                demo: 'Take Quiz',
                color: 'from-red-500 to-pink-500',
                delay: '0ms',
                action: () => setShowQuiz(true)
              },
              {
                icon: Navigation,
                title: 'Local Inventory Search',
                description: 'Real-time inventory from local shops with same-day pickup options',
                demo: 'Find Plants',
                color: 'from-blue-500 to-blue-600',
                delay: '200ms',
                action: () => navigate('/marketplace')
              },
              {
                icon: Camera,
                title: 'AR Plant Preview',
                description: 'See how plants look in your space before buying with augmented reality',
                demo: 'Try AR',
                color: 'from-pink-500 to-rose-500',
                delay: '400ms',
                action: () => alert('AR feature coming soon!')
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className={`group bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 plant-card-hover ${isVisible.interactive ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                style={{ transitionDelay: feature.delay }}
              >
                <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r ${feature.color} rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4 sm:mb-6 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg glow`}>
                  <feature.icon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-secondary-900 mb-3 sm:mb-4 text-center group-hover:text-primary-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-secondary-600 text-center mb-4 sm:mb-6 leading-relaxed">
                  {feature.description}
                </p>
                <button 
                  onClick={feature.action}
                  className="w-full interactive-button ripple bg-gradient-to-r from-primary-600 to-primary-700 text-white py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-300 text-sm sm:text-base"
                >
                  {feature.demo}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works with Scroll Animations */}
      <section className="py-16 sm:py-32 bg-gradient-to-b from-secondary-50 to-white" data-section="howItWorks">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-12 sm:mb-20 transition-all duration-1000 ${isVisible.howItWorks ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-secondary-900 mb-4 sm:mb-6">
              How It Works
            </h2>
            <p className="text-lg sm:text-xl text-secondary-600 max-w-3xl mx-auto">
              From discovery to delivery, we make local plant shopping simple and delightful
            </p>
          </div>

          <div className="relative">
            {/* Connection Line - Hidden on mobile */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200 transform -translate-y-1/2 z-0"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 relative z-10">
              {[
                {
                  step: '01',
                  icon: Target,
                  title: 'Take Personality Quiz',
                  description: 'Answer questions about your lifestyle to get personalized plant recommendations',
                  color: 'from-blue-500 to-blue-600',
                  delay: '0ms'
                },
                {
                  step: '02',
                  icon: Search,
                  title: 'Find Local Inventory',
                  description: 'See real-time availability at verified local shops within your delivery radius',
                  color: 'from-green-500 to-green-600',
                  delay: '200ms'
                },
                {
                  step: '03',
                  icon: CheckCircle,
                  title: 'Reserve & Pickup',
                  description: 'Reserve your plant and pick it up the same day or get it delivered quickly',
                  color: 'from-purple-500 to-purple-600',
                  delay: '400ms'
                }
              ].map((step, index) => (
                <div 
                  key={index}
                  className={`group text-center transition-all duration-1000 ${isVisible.howItWorks ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                  style={{ transitionDelay: step.delay }}
                >
                  <div className="relative mb-6 sm:mb-8">
                    <div className={`w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-2xl glow`}>
                      <step.icon className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                    </div>
                    <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-primary-200">
                      <span className="text-xs sm:text-sm font-bold text-primary-600">{step.step}</span>
                    </div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-secondary-900 mb-3 sm:mb-4 group-hover:text-primary-600 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base text-secondary-600 leading-relaxed max-w-sm mx-auto">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Animated Stats Counter */}
      <section className="py-16 sm:py-32 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden" data-section="stats">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          {/* Enhanced Particle System */}
          {[...Array(window.innerWidth < 768 ? 15 : 30)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            >
              <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                i % 3 === 0 ? 'bg-white' : i % 3 === 1 ? 'bg-primary-200' : 'bg-accent-300'
              } opacity-30`} />
            </div>
          ))}
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center transition-all duration-1000 ${isVisible.stats ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            {[
              { number: '2-4hrs', label: 'Delivery Time', icon: Clock },
              { number: '50+', label: 'Local Sellers', icon: Users },
              { number: '1000+', label: 'Happy Plants', icon: Leaf },
              { number: '99%', label: 'Survival Rate', icon: TrendingUp }
            ].map((stat, index) => (
              <div key={index} className="group">
                <div className="glass-effect rounded-2xl sm:rounded-3xl p-4 sm:p-8 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 glow">
                  <stat.icon className="h-8 w-8 sm:h-12 sm:w-12 text-white mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform animate-float" />
                  <div className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-1 sm:mb-2">{stat.number}</div>
                  <div className="text-primary-100 text-sm sm:text-lg">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Plants with Enhanced Animations */}
      <section className="py-16 sm:py-32 bg-secondary-50" data-section="plants">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-12 sm:mb-20 transition-all duration-1000 ${isVisible.plants ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-secondary-900 mb-4 sm:mb-6">
              Featured Local
              <span className="block gradient-text">Plants</span>
            </h2>
            <p className="text-lg sm:text-xl text-secondary-600 max-w-2xl mx-auto">
              Discover the most popular plants in your city, available for same-day delivery
            </p>
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16 transition-all duration-1000 ${isVisible.plants ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            {featuredPlants.map((plant, index) => (
              <div 
                key={plant.id}
                className="plant-card-hover plant-grow"
                style={{ 
                  animationDelay: `${index * 200}ms`,
                  transitionDelay: `${index * 100}ms` 
                }}
              >
                <PlantCard
                  plant={plant}
                  onAddToCart={onAddToCart}
                  onViewDetails={onViewPlantDetails}
                />
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => setShowQuiz(true)}
              className="group interactive-button ripple inline-flex items-center px-8 sm:px-12 py-4 sm:py-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold rounded-2xl sm:rounded-3xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 transform hover:scale-105 shadow-2xl text-base sm:text-lg"
            >
              Find My Perfect Plant
              <ArrowRight className="ml-2 sm:ml-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA with Particle Effects */}
      <section className="py-16 sm:py-32 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden" data-section="cta">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          {/* Enhanced Particle System */}
          {[...Array(window.innerWidth < 768 ? 15 : 30)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            >
              <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                i % 3 === 0 ? 'bg-white' : i % 3 === 1 ? 'bg-primary-200' : 'bg-accent-300'
              } opacity-30`} />
            </div>
          ))}
        </div>
        
        <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className={`transition-all duration-1000 ${isVisible.cta ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h2 className="text-3xl sm:text-4xl md:text-7xl font-bold text-white mb-6 sm:mb-8 leading-tight">
              Ready to Transform
              <span className="block text-primary-200 gradient-text">Your Space?</span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-primary-100 mb-8 sm:mb-12 leading-relaxed max-w-3xl mx-auto">
              Join your local plant community and discover the joy of same-day plant delivery
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button
                onClick={() => setShowQuiz(true)}
                className="group interactive-button ripple w-full sm:w-auto inline-flex items-center px-8 sm:px-12 py-4 sm:py-6 bg-white text-primary-600 font-bold rounded-2xl sm:rounded-3xl hover:bg-primary-50 transition-all duration-300 transform hover:scale-105 shadow-2xl text-base sm:text-lg"
              >
                <Target className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                Start Plant Matching
                <ArrowRight className="ml-2 sm:ml-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-2 transition-transform" />
              </button>
              <Link
                to="/seller/signup"
                className="group interactive-button glass-effect w-full sm:w-auto inline-flex items-center px-8 sm:px-12 py-4 sm:py-6 border-2 border-white text-white font-bold rounded-2xl sm:rounded-3xl hover:bg-white hover:text-primary-600 transition-all duration-300 transform hover:scale-105 text-base sm:text-lg"
              >
                <Users className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                Become a Local Seller
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};