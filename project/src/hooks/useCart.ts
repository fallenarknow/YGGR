import { useState, useCallback } from 'react';
import { CartItem, Plant } from '../types';

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addToCart = useCallback((plant: Plant, quantity: number = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.plantId === plant.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.plantId === plant.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...prevItems, { plantId: plant.id, plant, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((plantId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.plantId !== plantId));
  }, []);

  const updateQuantity = useCallback((plantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(plantId);
      return;
    }
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.plantId === plantId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.plant.price * item.quantity), 0);
  }, [cartItems]);

  const getCartItemsCount = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const toggleCart = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    cartItems,
    isOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    toggleCart,
    setIsOpen
  };
};