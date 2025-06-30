import React, { useState, useEffect } from 'react';
import { Leaf, Sun, Droplets, Home, Clock, Heart, Sparkles, ArrowRight, RotateCw, Star, Zap, Target, Award } from 'lucide-react';

interface PlantPersonalityQuizProps {
  onComplete?: (results: any[]) => void;
}

const PlantPersonalityQuiz: React.FC<PlantPersonalityQuizProps> = ({ onComplete = () => {} }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedOption, setSelectedOption] = useState<any>(null);

  const questions = [
    {
      id: 'lifestyle',
      question: 'How would you describe your lifestyle?',
      icon: <Clock className="w-6 w-6 sm:w-8 sm:h-8" />,
      emoji: '⏰',
      options: [
        { 
          value: 'busy', 
          text: 'Always on the go - I need low maintenance everything', 
          emoji: '🏃‍♀️',
          points: { succulent: 3, snake: 3, pothos: 1 } 
        },
        { 
          value: 'routine', 
          text: 'I love routines and daily care rituals', 
          emoji: '📅',
          points: { fiddle: 2, monstera: 2, orchid: 3, herb: 2 } 
        },
        { 
          value: 'flexible', 
          text: 'Somewhere in between - I can adapt', 
          emoji: '🤸‍♀️',
          points: { pothos: 3, rubber: 2, spider: 2 } 
        },
        { 
          value: 'nurturing', 
          text: 'I love taking care of living things', 
          emoji: '🤗',
          points: { orchid: 3, herb: 3, fiddle: 2, bonsai: 3 } 
        }
      ]
    },
    {
      id: 'space',
      question: 'What kind of space do you have?',
      icon: <Home className="w-6 w-6 sm:w-8 sm:h-8" />,
      emoji: '🏠',
      options: [
        { 
          value: 'small', 
          text: 'Tiny apartment or limited space', 
          emoji: '🏢',
          points: { succulent: 3, herb: 2, spider: 1 } 
        },
        { 
          value: 'medium', 
          text: 'Decent space with some room to grow', 
          emoji: '🏡',
          points: { pothos: 2, rubber: 2, snake: 2, orchid: 1 } 
        },
        { 
          value: 'large', 
          text: 'Spacious with room for statement plants', 
          emoji: '🏰',
          points: { fiddle: 3, monstera: 3, rubber: 2 } 
        },
        { 
          value: 'outdoor', 
          text: 'I have outdoor space too', 
          emoji: '🌳',
          points: { herb: 3, succulent: 2, bonsai: 2 } 
        }
      ]
    },
    {
      id: 'light',
      question: 'How much natural light does your space get?',
      icon: <Sun className="w-6 w-6 sm:w-8 sm:h-8" />,
      emoji: '☀️',
      options: [
        { 
          value: 'low', 
          text: 'Pretty dim - north-facing or few windows', 
          emoji: '🌙',
          points: { snake: 3, pothos: 2, spider: 1 } 
        },
        { 
          value: 'medium', 
          text: 'Decent light but not direct sun', 
          emoji: '⛅',
          points: { pothos: 3, rubber: 2, orchid: 2 } 
        },
        { 
          value: 'bright', 
          text: 'Lots of bright, indirect light', 
          emoji: '🌤️',
          points: { fiddle: 3, monstera: 2, spider: 3 } 
        },
        { 
          value: 'direct', 
          text: 'Direct sunlight for several hours', 
          emoji: '🔥',
          points: { succulent: 3, herb: 3, bonsai: 2 } 
        }
      ]
    },
    {
      id: 'experience',
      question: 'What\'s your plant parenting experience?',
      icon: <Leaf className="w-6 w-6 sm:w-8 sm:h-8" />,
      emoji: '🌱',
      options: [
        { 
          value: 'beginner', 
          text: 'Total beginner - I\'ve killed cacti', 
          emoji: '😅',
          points: { snake: 3, pothos: 3, succulent: 2 } 
        },
        { 
          value: 'some', 
          text: 'I\'ve kept a few plants alive', 
          emoji: '🌿',
          points: { rubber: 2, spider: 3, herb: 2 } 
        },
        { 
          value: 'intermediate', 
          text: 'Pretty confident with most plants', 
          emoji: '🌳',
          points: { monstera: 2, fiddle: 2, orchid: 1, bonsai: 1 } 
        },
        { 
          value: 'expert', 
          text: 'Green thumb - bring on the challenge!', 
          emoji: '🧙‍♀️',
          points: { orchid: 3, bonsai: 3, fiddle: 2 } 
        }
      ]
    },
    {
      id: 'watering',
      question: 'How do you feel about watering schedules?',
      icon: <Droplets className="w-6 w-6 sm:w-8 sm:h-8" />,
      emoji: '💧',
      options: [
        { 
          value: 'forget', 
          text: 'I often forget to water things', 
          emoji: '🤦‍♀️',
          points: { succulent: 3, snake: 3 } 
        },
        { 
          value: 'reminder', 
          text: 'I need reminders but can stick to them', 
          emoji: '📱',
          points: { pothos: 2, rubber: 2, spider: 2 } 
        },
        { 
          value: 'regular', 
          text: 'I can maintain a regular schedule', 
          emoji: '⏰',
          points: { monstera: 2, fiddle: 2, herb: 2 } 
        },
        { 
          value: 'attentive', 
          text: 'I love checking soil and adjusting care', 
          emoji: '🔍',
          points: { orchid: 3, bonsai: 3, herb: 2 } 
        }
      ]
    },
    {
      id: 'purpose',
      question: 'What do you want from your plant?',
      icon: <Heart className="w-6 w-6 sm:w-8 sm:h-8" />,
      emoji: '💖',
      options: [
        { 
          value: 'decoration', 
          text: 'Beautiful decoration for my space', 
          emoji: '✨',
          points: { fiddle: 2, monstera: 2, orchid: 2 } 
        },
        { 
          value: 'air', 
          text: 'Clean air and wellness benefits', 
          emoji: '🌬️',
          points: { snake: 2, spider: 3, pothos: 2, rubber: 2 } 
        },
        { 
          value: 'food', 
          text: 'Something I can use in cooking', 
          emoji: '🍃',
          points: { herb: 3 } 
        },
        { 
          value: 'meditation', 
          text: 'A calming, mindful hobby', 
          emoji: '🧘‍♀️',
          points: { bonsai: 3, orchid: 2, succulent: 1 } 
        },
        { 
          value: 'easy', 
          text: 'Just something green that won\'t die', 
          emoji: '😌',
          points: { snake: 3, pothos: 3, succulent: 2 } 
        }
      ]
    }
  ];

  const plantProfiles = {
    snake: {
      name: 'Snake Plant (Sansevieria)',
      subtitle: 'The Indestructible Survivor',
      description: 'Perfect for busy lifestyles and low-light spaces. This plant thrives on neglect and purifies air while you sleep.',
      care: 'Water every 2-3 weeks, tolerates low light, very low maintenance',
      personality: 'Independent, resilient, and reliable - just like you!',
      image: '🐍',
      plantEmoji: '🌿',
      tips: ['Place anywhere with minimal light', 'Water only when soil is completely dry', 'Great for bedrooms'],
      matchPercentage: 95,
      difficulty: 1,
      price: '₹799'
    },
    pothos: {
      name: 'Golden Pothos',
      subtitle: 'The Adaptable Friend',
      description: 'A versatile trailing plant that adapts to various conditions and grows quickly to fill your space with green.',
      care: 'Water weekly, bright indirect light preferred, very forgiving',
      personality: 'Flexible, easy-going, and always growing!',
      image: '💚',
      plantEmoji: '🌿',
      tips: ['Trails beautifully from shelves', 'Can grow in water or soil', 'Trim to encourage bushier growth'],
      matchPercentage: 92,
      difficulty: 2,
      price: '₹599'
    },
    succulent: {
      name: 'Succulent Collection',
      subtitle: 'The Minimalist\'s Dream',
      description: 'Beautiful, sculptural plants that store water in their leaves. Perfect for bright spaces and busy schedules.',
      care: 'Water every 2-4 weeks, needs bright light, drought tolerant',
      personality: 'Self-sufficient, unique, and beautifully low-key!',
      image: '🌵',
      plantEmoji: '✨',
      tips: ['Use well-draining soil', 'Perfect for sunny windowsills', 'Many varieties to collect'],
      matchPercentage: 88,
      difficulty: 1,
      price: '₹399'
    },
    fiddle: {
      name: 'Fiddle Leaf Fig',
      subtitle: 'The Statement Maker',
      description: 'A stunning tree-like plant with large, violin-shaped leaves that creates a dramatic focal point in any room.',
      care: 'Water when top soil is dry, bright indirect light, needs consistency',
      personality: 'Bold, elegant, and definitely Instagram-worthy!',
      image: '🎻',
      plantEmoji: '🌳',
      tips: ['Keep away from drafts', 'Wipe leaves regularly', 'Rotate for even growth'],
      matchPercentage: 85,
      difficulty: 4,
      price: '₹1299'
    },
    monstera: {
      name: 'Monstera Deliciosa',
      subtitle: 'The Trendy Giant',
      description: 'Famous for its split leaves and impressive size. A fast-growing conversation starter that loves to climb.',
      care: 'Water weekly, bright indirect light, provide support for climbing',
      personality: 'Social, dramatic, and always making a statement!',
      image: '🕳️',
      plantEmoji: '🌿',
      tips: ['Provide a moss pole for climbing', 'Mist occasionally for humidity', 'Prune to control size'],
      matchPercentage: 90,
      difficulty: 3,
      price: '₹999'
    },
    spider: {
      name: 'Spider Plant',
      subtitle: 'The Generous Parent',
      description: 'A classic houseplant that produces adorable baby plants you can share with friends. Great for hanging baskets.',
      care: 'Water regularly, bright indirect light, produces plantlets',
      personality: 'Nurturing, prolific, and loves to share the joy!',
      image: '🕷️',
      plantEmoji: '🌱',
      tips: ['Hang for cascading effect', 'Baby plants can be propagated', 'Great air purifier'],
      matchPercentage: 87,
      difficulty: 2,
      price: '₹699'
    },
    rubber: {
      name: 'Rubber Plant',
      subtitle: 'The Steady Companion',
      description: 'A robust plant with glossy, dark green leaves that grows into an impressive indoor tree with proper care.',
      care: 'Water when soil is dry, bright indirect light, wipe leaves clean',
      personality: 'Reliable, sturdy, and grows with you over time!',
      image: '🌳',
      plantEmoji: '💚',
      tips: ['Can grow quite tall', 'Prune to maintain shape', 'Glossy leaves love humidity'],
      matchPercentage: 89,
      difficulty: 2,
      price: '₹899'
    },
    orchid: {
      name: 'Orchid',
      subtitle: 'The Elegant Challenge',
      description: 'Sophisticated and beautiful flowering plant. Requires specific care but rewards you with stunning, long-lasting blooms.',
      care: 'Water with ice cubes weekly, bright indirect light, high humidity',
      personality: 'Refined, particular, and absolutely stunning when happy!',
      image: '🌺',
      plantEmoji: '✨',
      tips: ['Use ice cubes for gradual watering', 'Needs good air circulation', 'Blooms can last months'],
      matchPercentage: 82,
      difficulty: 5,
      price: '₹1599'
    },
    herb: {
      name: 'Herb Garden',
      subtitle: 'The Practical Gardener\'s Choice',
      description: 'Fresh basil, mint, rosemary, or cilantro at your fingertips. Functional, fragrant, and delicious!',
      care: 'Water frequently, needs direct sunlight, harvest regularly',
      personality: 'Practical, nurturing, and loves to be useful!',
      image: '🌿',
      plantEmoji: '🍃',
      tips: ['Pinch flowers to keep leaves tender', 'Harvest often for best growth', 'Start with easy herbs like basil'],
      matchPercentage: 91,
      difficulty: 3,
      price: '₹499'
    },
    bonsai: {
      name: 'Bonsai Tree',
      subtitle: 'The Meditation Master',
      description: 'A living art form that requires patience, skill, and mindfulness. Perfect for those seeking a meditative hobby.',
      care: 'Daily attention, specific watering needs, pruning and shaping required',
      personality: 'Patient, artistic, and deeply contemplative!',
      image: '🌳',
      plantEmoji: '🧘',
      tips: ['Start with hardy species like Ficus', 'Requires daily monitoring', 'Pruning is an art form'],
      matchPercentage: 78,
      difficulty: 5,
      price: '₹2499'
    }
  };

  const handleAnswer = (questionId, option) => {
    setSelectedOption(option);
    setIsAnimating(true);
    
    setTimeout(() => {
      const newAnswers = { ...answers, [questionId]: option };
      setAnswers(newAnswers);

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption(null);
      } else {
        calculateResult(newAnswers);
      }
      setIsAnimating(false);
    }, 800);
  };

  const calculateResult = (finalAnswers) => {
    const scores = {};
    
    // Initialize scores
    Object.keys(plantProfiles).forEach(plant => {
      scores[plant] = 0;
    });

    // Calculate scores based on answers
    Object.values(finalAnswers).forEach(answer => {
      Object.entries(answer.points).forEach(([plant, points]) => {
        scores[plant] = (scores[plant] || 0) + points;
      });
    });

    // Check if user is an expert
    const isExpert = finalAnswers.experience?.value === 'expert';
    
    // Find the highest score
    const highestScore = Math.max(...Object.values(scores));
    
    // Set threshold based on expertise level
    const threshold = isExpert ? highestScore * 0.5 : highestScore * 0.7;
    
    // Filter plants that meet the threshold
    const recommendedPlants = Object.entries(scores)
      .filter(([_, score]) => score >= threshold)
      .sort((a, b) => b[1] - a[1]) // Sort by score in descending order
      .map(([plantKey, score]) => {
        const plant = plantProfiles[plantKey];
        // Calculate match percentage based on the highest score
        const matchPercentage = Math.round((score / highestScore) * 100);
        return {
          ...plant,
          matchPercentage,
          score
        };
      });

    onComplete(recommendedPlants);
  };

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="w-full h-full overflow-y-auto bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Scrollable Container */}
      <div className="min-h-screen py-4 px-4 relative">
        {/* Animated Background - Absolute positioning for better performance */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute opacity-10 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${4 + Math.random() * 3}s`
              }}
            >
              <span className="text-2xl sm:text-4xl">
                {['🌱', '🌿', '🍃', '🌺', '🌵', '🌳'][Math.floor(Math.random() * 6)]}
              </span>
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center space-x-2 sm:space-x-3 bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-4 sm:mb-6 shadow-lg">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-bold text-sm sm:text-base">Plant Personality Quiz</span>
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-3 sm:mb-4">
              Find Your Perfect
              <span className="block">Plant Match! 🌱</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Discover the plant that matches your personality and lifestyle
            </p>
          </div>

          {/* Quiz Container */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 mb-6">
            {/* Progress Bar */}
            <div className="relative h-2 sm:h-3 bg-gray-200 rounded-t-2xl sm:rounded-t-3xl">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-700 ease-out rounded-t-2xl sm:rounded-t-3xl"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="p-4 sm:p-6 md:p-8">
              {/* Question Header */}
              <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8">
                <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-0">
                  <div className="text-3xl sm:text-5xl">{question.emoji}</div>
                  <div className="text-center sm:text-left">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                      Question {currentQuestion + 1}
                    </h2>
                    <p className="text-sm text-gray-600">of {questions.length}</p>
                  </div>
                </div>
                <div className="text-center sm:text-right">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">{Math.round(progress)}%</div>
                  <p className="text-xs sm:text-sm text-gray-500">Complete</p>
                </div>
              </div>

              {/* Question */}
              <div className={`mb-6 sm:mb-8 transition-all duration-500 ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-6 leading-relaxed text-center sm:text-left">
                  {question.question}
                </h3>

                {/* Options */}
                <div className="space-y-3 sm:space-y-4 max-h-96 overflow-y-auto">
                  {question.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(question.id, option)}
                      disabled={isAnimating}
                      className={`group relative w-full p-4 sm:p-5 bg-white hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 rounded-xl border-2 border-gray-200 hover:border-green-300 transition-all duration-300 transform hover:scale-[1.02] text-left ${
                        selectedOption === option ? 'bg-gradient-to-r from-green-100 to-blue-100 border-green-400 scale-[1.02]' : ''
                      } ${isAnimating ? 'pointer-events-none' : ''}`}
                    >
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        <div className="text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-300 flex-shrink-0 mt-1">
                          {option.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base text-gray-800 group-hover:text-gray-900 transition-colors duration-300 font-medium leading-relaxed">
                            {option.text}
                          </p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0 mt-1">
                          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fun Fact */}
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-gray-100 to-green-100 px-4 sm:px-6 py-2 sm:py-3 rounded-full">
                  <Target className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                  <span className="text-xs sm:text-sm text-gray-700 font-medium">
                    {currentQuestion === 0 && "Let's start with your lifestyle! 🌟"}
                    {currentQuestion === 1 && "Space matters for plant happiness! 🏠"}
                    {currentQuestion === 2 && "Light is life for plants! ☀️"}
                    {currentQuestion === 3 && "Experience helps us match you better! 🌱"}
                    {currentQuestion === 4 && "Watering habits are crucial! 💧"}
                    {currentQuestion === 5 && "Almost done! What's your plant goal? 🎯"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Encouragement */}
          <div className="text-center pb-6">
            <p className="text-gray-600 text-base sm:text-lg">
              🌿 Discover your perfect plant companion! 🌿
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantPersonalityQuiz;