// frontend/src/context/StoreContext.js
// Manages the currently selected store across the application
// Users can have access to multiple stores, this tracks which one they're viewing

import React, { createContext, useState, useContext, useEffect } from 'react';
import { storesAPI } from '../utils/api';

const StoreContext = createContext(null);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

export const StoreProvider = ({ children }) => {
  const [currentStore, setCurrentStore] = useState(null);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user's stores when component mounts
  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      setError(null);
      const response = await storesAPI.list();
      const userStores = response.data.stores;
      setStores(userStores);

      // If user has stores, select the first one by default
      // Or restore previously selected store from localStorage
      if (userStores.length > 0) {
        const savedStoreId = localStorage.getItem('currentStoreId');
        const savedStore = userStores.find(s => s.id === parseInt(savedStoreId));

        if (savedStore) {
          setCurrentStore(savedStore);
        } else {
          setCurrentStore(userStores[0]);
          localStorage.setItem('currentStoreId', userStores[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load stores:', error);
      setError('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const switchStore = (storeId) => {
    const store = stores.find(s => s.id === storeId);
    if (store) {
      setCurrentStore(store);
      localStorage.setItem('currentStoreId', storeId);
    }
  };

  const createStore = async (storeData) => {
    try {
      const response = await storesAPI.create(storeData);
      const newStore = response.data;

      // Add new store to the list
      setStores([...stores, newStore]);

      // Switch to the newly created store
      setCurrentStore(newStore);
      localStorage.setItem('currentStoreId', newStore.id);

      return { success: true, store: newStore };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to create store';
      return { success: false, error: errorMessage };
    }
  };

  const updateStoreSettings = async (storeId, settings) => {
    try {
      const response = await storesAPI.updateSettings(storeId, settings);
      const updatedStore = response.data;

      // Update store in the list
      setStores(stores.map(s => s.id === storeId ? updatedStore : s));

      // Update current store if it's the one being updated
      if (currentStore && currentStore.id === storeId) {
        setCurrentStore(updatedStore);
      }

      return { success: true, store: updatedStore };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update store';
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    currentStore,
    stores,
    loading,
    error,
    switchStore,
    createStore,
    updateStore: updateStoreSettings,
    updateStoreSettings,
    refreshStores: loadStores
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};
