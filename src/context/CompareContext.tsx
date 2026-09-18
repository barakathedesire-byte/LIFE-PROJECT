import React, { createContext, useContext, useState } from 'react';
import { Product } from '../types';
import { useNotification } from './NotificationContext';
import { api } from '../services/api';

export interface ComparisonMatrixRow {
  group?: string;
  label: string;
  values: Record<string, string | number>;
  hasDifference: boolean;
}

export interface ComparisonData {
  eligible: boolean;
  sharedSubcategory?: string;
  products: Product[];
  comparisonMatrix: ComparisonMatrixRow[];
  error?: string;
}

interface CompareContextType {
  compareList: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  compareModalOpen: boolean;
  activeComparison: ComparisonData | null;
  isLoadingComparison: boolean;
  openCompareForProducts: (products: Product[]) => Promise<void>;
  openCompareByIds: (productIds: string[]) => Promise<void>;
  closeCompareModal: () => void;
  getCartComparisonGroups: (cartItems: any[]) => Array<{ subcategory: string; items: any[] }>;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState<boolean>(false);
  const [activeComparison, setActiveComparison] = useState<ComparisonData | null>(null);
  const [isLoadingComparison, setIsLoadingComparison] = useState<boolean>(false);
  const { showToast } = useNotification();

  const addToCompare = (product: Product) => {
    if (compareList.find((p) => p.id === product.id)) {
      showToast('Product already in compare list.', 'error');
      return;
    }
    if (compareList.length >= 4) {
      showToast('You can compare a maximum of 4 products simultaneously.', 'error');
      return;
    }
    const updated = [...compareList, product];
    setCompareList(updated);
    showToast(`${product.name} added to comparison.`, 'success');
  };

  const removeFromCompare = (productId: string) => {
    setCompareList(compareList.filter((p) => p.id !== productId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const openCompareByIds = async (productIds: string[]) => {
    if (productIds.length < 2) {
      showToast('Please select at least 2 products to compare.', 'error');
      return;
    }
    if (productIds.length > 4) {
      showToast('You can compare a maximum of 4 products.', 'error');
      return;
    }

    setIsLoadingComparison(true);
    setCompareModalOpen(true);

    try {
      const res = await api.validateCompare(productIds);
      if (res && res.eligible && res.products && res.comparisonMatrix) {
        setActiveComparison({
          eligible: true,
          sharedSubcategory: res.sharedSubcategory,
          products: res.products,
          comparisonMatrix: res.comparisonMatrix as ComparisonMatrixRow[]
        });
      } else {
        showToast(res.error || 'Selected products do not share the same subcategory.', 'error');
        setActiveComparison(null);
        setCompareModalOpen(false);
      }
    } catch (err: any) {
      console.error('Failed to validate comparison:', err);
      showToast('Failed to generate product comparison. Please try again.', 'error');
      setActiveComparison(null);
      setCompareModalOpen(false);
    } finally {
      setIsLoadingComparison(false);
    }
  };

  const openCompareForProducts = async (products: Product[]) => {
    const ids = products.map((p) => p.id);
    await openCompareByIds(ids);
  };

  const closeCompareModal = () => {
    setCompareModalOpen(false);
    setActiveComparison(null);
  };

  // Helper to find groups of 2+ items in cart sharing the exact same subcategory
  const getCartComparisonGroups = (cartItems: any[]): Array<{ subcategory: string; items: any[] }> => {
    if (!cartItems || cartItems.length < 2) return [];

    const grouped: Record<string, any[]> = {};
    cartItems.forEach((item) => {
      const product = item.product || item;
      const subcat = product.subcategory || product.category || 'General';
      if (!grouped[subcat]) {
        grouped[subcat] = [];
      }
      grouped[subcat].push(item);
    });

    return Object.entries(grouped)
      .filter(([_, items]) => items.length >= 2)
      .map(([subcategory, items]) => ({
        subcategory,
        items
      }));
  };

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        compareModalOpen,
        activeComparison,
        isLoadingComparison,
        openCompareForProducts,
        openCompareByIds,
        closeCompareModal,
        getCartComparisonGroups
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
