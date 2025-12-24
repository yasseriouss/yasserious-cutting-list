import { useState, useCallback } from 'react';
import type { StockPiece, CutPiece, OptimizationResult } from '@/lib/optimizer';
import { optimize } from '@/lib/optimizer';
import { generateId } from '@/lib/utils';

export function useOptimizer() {
  const [stockPieces, setStockPieces] = useState<StockPiece[]>([]);
  const [cutPieces, setCutPieces] = useState<CutPiece[]>([]);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [cutWidth, setCutWidth] = useState(3);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const addStockPiece = useCallback((stock: Omit<StockPiece, 'id'>) => {
    const newStock: StockPiece = {
      ...stock,
      id: generateId(),
    };
    setStockPieces((prev) => [...prev, newStock]);
  }, []);

  const removeStockPiece = useCallback((id: string) => {
    setStockPieces((prev) => prev.filter((piece) => piece.id !== id));
  }, []);

  const addCutPiece = useCallback((cut: Omit<CutPiece, 'id'>) => {
    const newCut: CutPiece = {
      ...cut,
      id: generateId(),
    };
    setCutPieces((prev) => [...prev, newCut]);
  }, []);

  const removeCutPiece = useCallback((id: string) => {
    setCutPieces((prev) => prev.filter((piece) => piece.id !== id));
  }, []);

  const updateStockPiece = useCallback((id: string, updates: Partial<StockPiece>) => {
    setStockPieces((prev) =>
      prev.map((piece) => (piece.id === id ? { ...piece, ...updates } : piece))
    );
  }, []);

  const updateCutPiece = useCallback((id: string, updates: Partial<CutPiece>) => {
    setCutPieces((prev) =>
      prev.map((piece) => (piece.id === id ? { ...piece, ...updates } : piece))
    );
  }, []);

  const runOptimization = useCallback(() => {
    if (stockPieces.length === 0 || cutPieces.length === 0) {
      return;
    }

    setIsOptimizing(true);
    try {
      const optimizationResult = optimize(stockPieces, cutPieces, cutWidth);
      setResult(optimizationResult);
    } catch (error) {
      console.error('Optimization error:', error);
    } finally {
      setIsOptimizing(false);
    }
  }, [stockPieces, cutPieces, cutWidth]);

  const clearAll = useCallback(() => {
    setStockPieces([]);
    setCutPieces([]);
    setResult(null);
  }, []);

  return {
    stockPieces,
    cutPieces,
    result,
    cutWidth,
    isOptimizing,
    addStockPiece,
    removeStockPiece,
    addCutPiece,
    removeCutPiece,
    updateStockPiece,
    updateCutPiece,
    setCutWidth,
    runOptimization,
    clearAll,
  };
}
