import React, { useState } from 'react';
import { useOptimizer } from '@/hooks/useOptimizer';
import { InputForm } from '@/components/InputForm';
import { CutCanvas } from '@/components/CutCanvas';
import { ResultsSummary } from '@/components/ResultsSummary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Zap, RotateCcw } from 'lucide-react';

/**
 * FreeCut Web - Main Application
 * 
 * Design Philosophy: Industrial Minimalism
 * - Two-column asymmetric layout (input: 35%, visualization: 65%)
 * - Deep slate gray (#1F2937) with vibrant amber (#F59E0B) accents
 * - Precision-focused interface with minimal visual clutter
 * - Grid-based structure with generous whitespace
 */
export default function Home() {
  const optimizer = useOptimizer();
  const [activeLayout, setActiveLayout] = useState(0);

  const handleOptimize = () => {
    optimizer.runOptimization();
    setActiveLayout(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">FreeCut</h1>
              <p className="text-sm text-slate-600">Rectangular Cut Optimizer</p>
            </div>
            <Button
              onClick={optimizer.clearAll}
              variant="outline"
              className="text-slate-600 hover:text-slate-900"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Input Panel (35%) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Input Form */}
            <InputForm
              onAddStock={optimizer.addStockPiece}
              onAddCut={optimizer.addCutPiece}
              stockPieces={optimizer.stockPieces}
              cutPieces={optimizer.cutPieces}
              onRemoveStock={optimizer.removeStockPiece}
              onRemoveCut={optimizer.removeCutPiece}
            />

            {/* Optimization Controls */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-base">Optimization Settings</CardTitle>
                <CardDescription>Fine-tune the optimization parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-900">
                    Cut Width: <span className="text-amber-600 font-semibold">{optimizer.cutWidth}mm</span>
                  </label>
                  <Slider
                    value={[optimizer.cutWidth]}
                    onValueChange={(value) => optimizer.setCutWidth(value[0])}
                    min={1}
                    max={15}
                    step={0.5}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500">Typical range: 1-15mm for panel saws</p>
                </div>

                <Button
                  onClick={handleOptimize}
                  disabled={optimizer.stockPieces.length === 0 || optimizer.cutPieces.length === 0 || optimizer.isOptimizing}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold h-12"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {optimizer.isOptimizing ? 'Optimizing...' : 'Optimize'}
                </Button>

                {optimizer.stockPieces.length === 0 && (
                  <p className="text-xs text-slate-500 text-center">Add stock pieces to begin</p>
                )}
                {optimizer.cutPieces.length === 0 && optimizer.stockPieces.length > 0 && (
                  <p className="text-xs text-slate-500 text-center">Add cut pieces to begin</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Visualization & Results (65%) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Canvas Visualization */}
            {optimizer.result && optimizer.result.layouts.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Cutting Layout</h2>
                  <CutCanvas
                    layout={optimizer.result.layouts[activeLayout] || null}
                    className="bg-white rounded-lg border border-slate-200 shadow-sm"
                  />
                </div>

                {/* Layout Navigation */}
                {optimizer.result.layouts.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {optimizer.result.layouts.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveLayout(index)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                          activeLayout === index
                            ? 'bg-amber-600 text-white'
                            : 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Layout {index + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Card className="border-slate-200 bg-white">
                <CardContent className="pt-12 pb-12 text-center">
                  <div className="space-y-3">
                    <div className="text-6xl text-slate-300">📐</div>
                    <p className="text-slate-600 font-medium">No optimization yet</p>
                    <p className="text-sm text-slate-500">
                      Add stock and cut pieces, then click Optimize to see the layout
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results Summary */}
            {optimizer.result && (
              <ResultsSummary result={optimizer.result} />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-slate-600">
          <p>FreeCut Web — Free and open source rectangular cut optimizer</p>
        </div>
      </footer>
    </div>
  );
}
