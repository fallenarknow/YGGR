import React from 'react';
import { Filter, X } from 'lucide-react';

interface FilterOptions {
  category: string[];
  size: string[];
  careLevel: number[];
  lightRequirement: string[];
  priceRange: [number, number];
  petSafe: boolean | null;
}

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange
}) => {
  const categories = ['Indoor Plants', 'Outdoor Plants', 'Flowering Plants', 'Trailing Plants', 'Succulents', 'Herbs'];
  const sizes = ['small', 'medium', 'large'];
  const lightOptions = ['low', 'medium', 'bright', 'direct'];

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: 'category' | 'size' | 'careLevel' | 'lightRequirement', value: any) => {
    const currentArray = filters[key] as any[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      category: [],
      size: [],
      careLevel: [],
      lightRequirement: [],
      priceRange: [0, 200],
      petSafe: null
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden animate-fade-in"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 md:relative md:w-64 md:shadow-none md:bg-transparent
        transform transition-transform duration-300 md:transform-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 md:hidden">
            <h2 className="text-lg font-semibold flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="hidden md:flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </h2>
            <button
              onClick={clearAllFilters}
              className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
            >
              Clear All
            </button>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h3 className="font-medium text-secondary-900 mb-3">Category</h3>
            <div className="space-y-2">
              {categories.map(category => (
                <label key={category} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.category.includes(category)}
                    onChange={() => toggleArrayFilter('category', category)}
                    className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-secondary-700">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="mb-6">
            <h3 className="font-medium text-secondary-900 mb-3">Size</h3>
            <div className="space-y-2">
              {sizes.map(size => (
                <label key={size} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.size.includes(size)}
                    onChange={() => toggleArrayFilter('size', size)}
                    className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-secondary-700 capitalize">{size}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Care Level */}
          <div className="mb-6">
            <h3 className="font-medium text-secondary-900 mb-3">Care Level</h3>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(level => (
                <label key={level} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.careLevel.includes(level)}
                    onChange={() => toggleArrayFilter('careLevel', level)}
                    className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-secondary-700">
                    {level}/5 {'⭐'.repeat(level)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Light Requirements */}
          <div className="mb-6">
            <h3 className="font-medium text-secondary-900 mb-3">Light Requirements</h3>
            <div className="space-y-2">
              {lightOptions.map(light => (
                <label key={light} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.lightRequirement.includes(light)}
                    onChange={() => toggleArrayFilter('lightRequirement', light)}
                    className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-secondary-700 capitalize">{light} light</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <h3 className="font-medium text-secondary-900 mb-3">Price Range</h3>
            <div className="space-y-3">
              <input
                type="range"
                min="0"
                max="200"
                step="5"
                value={filters.priceRange[1]}
                onChange={(e) => updateFilter('priceRange', [0, parseInt(e.target.value)])}
                className="w-full accent-primary-600"
              />
              <div className="flex justify-between text-sm text-secondary-600">
                <span>$0</span>
                <span>${filters.priceRange[1]}</span>
              </div>
            </div>
          </div>

          {/* Pet Safe */}
          <div className="mb-6">
            <h3 className="font-medium text-secondary-900 mb-3">Pet Safety</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="petSafe"
                  checked={filters.petSafe === true}
                  onChange={() => updateFilter('petSafe', true)}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-secondary-700">Pet Safe Only</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="petSafe"
                  checked={filters.petSafe === null}
                  onChange={() => updateFilter('petSafe', null)}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-secondary-700">All Plants</span>
              </label>
            </div>
          </div>

          {/* Mobile Clear Button */}
          <button
            onClick={clearAllFilters}
            className="w-full md:hidden bg-secondary-100 text-secondary-700 py-2 rounded-lg hover:bg-secondary-200 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      </div>
    </>
  );
};