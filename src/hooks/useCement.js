import { useCallback, useEffect, useMemo, useState } from 'react';

import { CEMENT_LOW_STOCK_THRESHOLD } from '../config/constants';
import { DEFAULT_CEMENT } from '../data/defaultCement';
import { loadJSON, saveJSON } from '../services/storage';
import { fetchCementFromSheet, saveCementToGoogleSheet } from '../services/sheetsApi';

const isCement = (item) => item && item.category === 'सीमेंट';

const normalizeCementItem = (item) => ({
  id: item.id || `cement_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  brandName: String(item.brandName || '').trim(),
  company: String(item.company || '').trim(),
  category: 'सीमेंट',
  grade: String(item.grade || (/OPC\s*53/i.test(`${item.brandName} ${item.technical || ''}`) ? 'OPC 53' : /OPC\s*43/i.test(`${item.brandName} ${item.technical || ''}`) ? 'OPC 43' : 'PPC')),
  pack: String(item.pack || '50 kg'),
  batch: String(item.batch || '').trim(),
  expiry: String(item.expiry || '').trim(),
  cashPrice: Math.max(0, Number(item.cashPrice) || 0),
  creditPrice: Math.max(0, Number(item.creditPrice) || 0),
  stock: Math.max(0, parseInt(item.stock, 10) || 0)
});

export default function useCement() {
  const [cementProducts, setCementProducts] = useState(DEFAULT_CEMENT);
  const [cementSearch, setCementSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [syncPending, setSyncPending] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const queueOperation = useCallback(async (operation) => {
    const pending = await loadJSON('jkk:pendingCementSync', []);
    await saveJSON('jkk:pendingCementSync', [operation, ...pending]);
  }, []);

  const syncOperation = useCallback(async (operation) => {
    setIsSyncing(true);
    try {
      const result = await saveCementToGoogleSheet(operation);
      if (!result.ok) {
        await queueOperation(operation);
        setSyncPending(true);
        return;
      }
      const pending = await loadJSON('jkk:pendingCementSync', []);
      setSyncPending(Array.isArray(pending) && pending.length > 0);
    } finally {
      setIsSyncing(false);
    }
  }, [queueOperation]);

  const commitCement = useCallback(async (nextItems, operation) => {
    const normalizedItems = nextItems.map(normalizeCementItem);
    setCementProducts(normalizedItems);
    await saveJSON('jkk:cement', normalizedItems);
    setSyncPending(true);
    void syncOperation(operation);
    return normalizedItems;
  }, [syncOperation]);

  const syncCement = useCallback(async () => {
    setIsSyncing(true);
    try {
      const pending = await loadJSON('jkk:pendingCementSync', []);
      const pendingOperations = Array.isArray(pending) ? [...pending] : [];
      for (let index = pendingOperations.length - 1; index >= 0; index -= 1) {
        const result = await saveCementToGoogleSheet(pendingOperations[index]);
        if (!result.ok) break;
        pendingOperations.splice(index, 1);
      }
      await saveJSON('jkk:pendingCementSync', pendingOperations);
      if (pendingOperations.length > 0) {
        setSyncPending(true);
        return false;
      }

      const result = await fetchCementFromSheet();
      if (!result.ok) {
        setSyncPending(true);
        return false;
      }

      const remoteItems = result.data.map(normalizeCementItem);
      if (remoteItems.length === 0) {
        setSyncPending(false);
        return false;
      }
      setCementProducts(remoteItems);
      await saveJSON('jkk:cement', remoteItems);
      setSyncPending(false);
      return true;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const hydrate = async () => {
      const savedCement = await loadJSON('jkk:cement', null);
      let localItems = Array.isArray(savedCement) ? savedCement : null;
      let shouldUploadDefaults = false;

      if (!localItems) {
        const oldProducts = await loadJSON('jkk:products', []);
        const legacyCement = Array.isArray(oldProducts) ? oldProducts.filter(isCement) : [];
        const merged = new Map(DEFAULT_CEMENT.map((item) => [item.id, item]));
        legacyCement.forEach((item) => {
          const normalized = normalizeCementItem(item);
          merged.set(normalized.id, normalized);
        });
        localItems = [...merged.values()];
        shouldUploadDefaults = legacyCement.length === 0;
        await saveJSON('jkk:cement', localItems.map(normalizeCementItem));
        if (legacyCement.length) {
          await saveJSON('jkk:products', oldProducts.filter((item) => !isCement(item)));
        }
      }

      if (!mounted) return;
      setCementProducts(localItems.map(normalizeCementItem));
      if (shouldUploadDefaults) {
        await queueOperation({ action: 'saveCement', items: localItems.map(normalizeCementItem) });
      }
      syncCement();
    };

    hydrate();
    return () => { mounted = false; };
  }, [queueOperation, syncCement]);

  const addCement = useCallback(async (item) => {
    const normalized = normalizeCementItem({ ...item, id: item.id || `cement_${Date.now()}` });
    const nextItems = [normalized, ...cementProducts];
    await commitCement(nextItems, { action: 'saveCement', items: [normalized] });
    return normalized;
  }, [cementProducts, commitCement]);

  const updateCement = useCallback(async (item) => {
    const normalized = normalizeCementItem(item);
    const nextItems = cementProducts.map((existing) => existing.id === normalized.id ? normalized : existing);
    await commitCement(nextItems, { action: 'saveCement', items: [normalized] });
  }, [cementProducts, commitCement]);

  const deleteCement = useCallback(async (item) => {
    const nextItems = cementProducts.filter((existing) => existing.id !== item.id);
    await commitCement(nextItems, { action: 'deleteCement', id: item.id });
  }, [cementProducts, commitCement]);

  const updateCementStock = useCallback(async (id, stock) => {
    const item = cementProducts.find((product) => product.id === id);
    if (!item) return;
    const updatedItem = normalizeCementItem({ ...item, stock });
    const nextItems = cementProducts.map((existing) => existing.id === id ? updatedItem : existing);
    await commitCement(nextItems, { action: 'saveCement', items: [updatedItem] });
  }, [cementProducts, commitCement]);

  const deductCementStock = useCallback(async (cartItems) => {
    const quantities = new Map();
    cartItems.filter(isCement).forEach((item) => {
      quantities.set(item.id, (quantities.get(item.id) || 0) + (Number(item.qty) || 0));
    });
    if (quantities.size === 0) return [];

    const stockUpdates = [];
    const nextItems = cementProducts.map((product) => {
      if (!quantities.has(product.id)) return product;
      const stock = Math.max(0, product.stock - quantities.get(product.id));
      stockUpdates.push({ id: product.id, category: 'सीमेंट', stock });
      return { ...product, stock };
    });

    await commitCement(nextItems, { action: 'updateCementStock', items: stockUpdates });
    return stockUpdates;
  }, [cementProducts, commitCement]);

  const brands = useMemo(() => [...new Set(cementProducts.map((item) => item.brandName).filter(Boolean))], [cementProducts]);
  const filteredCementProducts = useMemo(() => {
    const query = cementSearch.trim().toLowerCase();
    return cementProducts.filter((item) => {
      const matchesSearch = !query || [item.brandName, item.company, item.grade, item.pack].some((value) => value.toLowerCase().includes(query));
      const matchesBrand = brandFilter === 'all' || item.brandName === brandFilter;
      const matchesStock = !lowStockOnly || item.stock <= CEMENT_LOW_STOCK_THRESHOLD;
      return matchesSearch && matchesBrand && matchesStock;
    });
  }, [brandFilter, cementProducts, cementSearch, lowStockOnly]);

  return {
    cementProducts,
    filteredCementProducts,
    brands,
    cementSearch,
    setCementSearch,
    brandFilter,
    setBrandFilter,
    lowStockOnly,
    setLowStockOnly,
    syncPending,
    isSyncing,
    syncCement,
    addCement,
    updateCement,
    deleteCement,
    updateCementStock,
    deductCementStock
  };
}