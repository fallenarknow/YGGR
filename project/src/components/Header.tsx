import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, Leaf, Camera } from 'lucide-react';

interface HeaderProps {
  cartItemsCount: number;
  onCartToggle: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartItemsCount,
  onCartToggle,
  searchQuery,
  onSearchChange
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = React.useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsMobileSearchOpen(false);
  };

  const toggleMobileSearch = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group flex-shrink-0">
            <div className="bg-primary-500 p-2 rounded-lg group-hover:bg-primary-600 transition-colors">
              <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-secondary-900">YGGR</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-primary-600 ${
                isActive('/') ? 'text-primary-600' : 'text-secondary-700'
              }`}
            >
              Home
            </Link>
            <Link
              to="/design-gallery"
              className={`text-sm font-medium transition-colors hover:text-primary-600 flex items-center space-x-1 ${
                isActive('/design-gallery') ? 'text-primary-600' : 'text-secondary-700'
              }`}
            >
              <Camera className="h-4 w-4" />
              <span>Design Gallery</span>
            </Link>
            <Link
              to="/sellers"
              className={`text-sm font-medium transition-colors hover:text-primary-600 ${
                isActive('/sellers') ? 'text-primary-600' : 'text-secondary-700'
              }`}
            >
              Sellers
            </Link>
          </nav>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-secondary-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search plants, care guides, sellers..."
                className="block w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-secondary-400"
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile Search Button */}
            <button
              onClick={toggleMobileSearch}
              className="lg:hidden p-2 text-secondary-600 hover:text-primary-600 transition-colors"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Cart */}
            <button
              onClick={onCartToggle}
              className="relative p-2 text-secondary-600 hover:text-primary-600 transition-colors"
              data-cart-toggle
            >
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center animate-bounce-subtle">
                  {cartItemsCount > 99 ? '99+' : cartItemsCount}
                </span>
              )}
            </button>

            {/* User Profile */}
            <Link
              to="/profile"
              className="p-2 text-secondary-600 hover:text-primary-600 transition-colors"
            >
              <User className="h-5 w-5 sm:h-6 sm:w-6" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 text-secondary-600 hover:text-primary-600 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {isMobileSearchOpen && (
          <div className="lg:hidden pb-4 animate-slide-up">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-secondary-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search plants..."
                className="block w-full pl-10 pr-3 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-secondary-200 animate-slide-up">
          <div className="px-4 py-2 space-y-1">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-3 text-base font-medium rounded-md transition-colors ${
                isActive('/') 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-secondary-700 hover:text-primary-600 hover:bg-secondary-50'
              }`}
            >
              Home
            </Link>
            <Link
              to="/design-gallery"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center space-x-2 px-3 py-3 text-base font-medium rounded-md transition-colors ${
                isActive('/design-gallery') 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-secondary-700 hover:text-primary-600 hover:bg-secondary-50'
              }`}
            >
              <Camera className="h-5 w-5" />
              <span>Design Gallery</span>
            </Link>
            <Link
              to="/sellers"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-3 text-base font-medium rounded-md transition-colors ${
                isActive('/sellers') 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-secondary-700 hover:text-primary-600 hover:bg-secondary-50'
              }`}
            >
              Sellers
            </Link>
            <Link
              to="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-3 text-base font-medium rounded-md transition-colors ${
                isActive('/profile') 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-secondary-700 hover:text-primary-600 hover:bg-secondary-50'
              }`}
            >
              My Profile
            </Link>
            
            {/* Mobile-only quick actions */}
            <div className="border-t border-secondary-200 pt-2 mt-2">
              <Link
                to="/plant-matcher"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-3 text-base font-medium text-primary-600 bg-primary-50 rounded-md"
              >
                🎯 Find My Perfect Plant
              </Link>
              <Link
                to="/marketplace"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-3 text-base font-medium text-secondary-700 hover:text-primary-600 hover:bg-secondary-50 rounded-md"
              >
                🛒 Browse Marketplace
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};