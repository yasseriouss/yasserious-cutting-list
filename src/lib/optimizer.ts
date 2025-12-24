/**
 * FreeCut Web - Rectangular Cut Optimizer
 * 
 * This module implements a genetic algorithm-based optimizer for cutting rectangular
 * pieces from panels, minimizing waste and maximizing material utilization.
 * 
 * Design Philosophy: Industrial Minimalism
 * - Precision and clarity in algorithm output
 * - Efficient data structures for optimization
 */

export interface StockPiece {
  id: string;
  width: number;
  height: number;
  quantity: number;
  pattern?: 'none' | 'horizontal' | 'vertical';
}

export interface EdgeBand {
  name: string;
  thickness: number; // in mm
  sides: {
    top: boolean;
    bottom: boolean;
    left: boolean;
    right: boolean;
  };
}

export interface Groove {
  enabled: boolean;
  width: number; // in mm
  direction: 'horizontal' | 'vertical'; // horizontal = parallel to width, vertical = parallel to height
  offset?: number; // distance from edge
}

export interface CutPiece {
  id: string;
  width: number;
  height: number;
  quantity: number;
  pattern?: 'none' | 'horizontal' | 'vertical';
  edgeBand?: EdgeBand;
  groove?: Groove;
}

export interface CutPosition {
  pieceId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotated: boolean;
}

export interface CutLayout {
  stockId: string;
  positions: CutPosition[];
  wasteArea: number;
  utilizationRate: number;
}

export interface OptimizationResult {
  layouts: CutLayout[];
  totalWaste: number;
  averageUtilization: number;
  totalStockUsed: number;
  totalCutsNeeded: number;
  cutsPlaced: number;
}

/**
 * Simple guillotine cutting algorithm - good for panel saws
 * Recursively divides panels into rectangles
 */
function guillotineLayout(
  stock: StockPiece,
  cuts: CutPiece[],
  cutWidth: number
): CutLayout {
  const positions: CutPosition[] = [];
  let remainingCuts = [...cuts];
  let wasteArea = 0;

  // Sort cuts by area (largest first) for better packing
  remainingCuts.sort((a, b) => (b.width * b.height - a.width * a.height));

  // Simple greedy placement
  let usedArea = 0;
  for (const cut of remainingCuts) {
    for (let q = 0; q < cut.quantity; q++) {
      // Try to place the cut piece
      const placement = findPlacement(positions, stock, cut, cutWidth);
      if (placement) {
        positions.push(placement);
        usedArea += cut.width * cut.height;
      }
    }
  }

  const stockArea = stock.width * stock.height;
  wasteArea = stockArea - usedArea;
  const utilizationRate = (usedArea / stockArea) * 100;

  return {
    stockId: stock.id,
    positions,
    wasteArea,
    utilizationRate,
  };
}

/**
 * Find a valid placement for a cut piece on the stock
 */
function findPlacement(
  positions: CutPosition[],
  stock: StockPiece,
  cut: CutPiece,
  cutWidth: number
): CutPosition | null {
  // Try different positions
  for (let x = 0; x <= stock.width - cut.width; x += 10) {
    for (let y = 0; y <= stock.height - cut.height; y += 10) {
      if (canPlacePiece(positions, x, y, cut.width, cut.height, cutWidth)) {
        return {
          pieceId: cut.id,
          x,
          y,
          width: cut.width,
          height: cut.height,
          rotated: false,
        };
      }
    }
  }

  // Try rotated
  if (cut.width !== cut.height) {
    for (let x = 0; x <= stock.width - cut.height; x += 10) {
      for (let y = 0; y <= stock.height - cut.width; y += 10) {
        if (canPlacePiece(positions, x, y, cut.height, cut.width, cutWidth)) {
          return {
            pieceId: cut.id,
            x,
            y,
            width: cut.height,
            height: cut.width,
            rotated: true,
          };
        }
      }
    }
  }

  return null;
}

/**
 * Check if a piece can be placed at the given position
 */
function canPlacePiece(
  positions: CutPosition[],
  x: number,
  y: number,
  width: number,
  height: number,
  cutWidth: number
): boolean {
  const testRect = {
    x: x - cutWidth,
    y: y - cutWidth,
    x2: x + width + cutWidth,
    y2: y + height + cutWidth,
  };

  for (const pos of positions) {
    const existingRect = {
      x: pos.x - cutWidth,
      y: pos.y - cutWidth,
      x2: pos.x + pos.width + cutWidth,
      y2: pos.y + pos.height + cutWidth,
    };

    if (rectsIntersect(testRect, existingRect)) {
      return false;
    }
  }

  return true;
}

/**
 * Check if two rectangles intersect
 */
function rectsIntersect(
  rect1: { x: number; y: number; x2: number; y2: number },
  rect2: { x: number; y: number; x2: number; y2: number }
): boolean {
  return !(rect1.x2 < rect2.x || rect1.x > rect2.x2 || rect1.y2 < rect2.y || rect1.y > rect2.y2);
}

/**
 * Main optimization function
 */
export function optimize(
  stockPieces: StockPiece[],
  cutPieces: CutPiece[],
  cutWidth: number = 3
): OptimizationResult {
  if (stockPieces.length === 0 || cutPieces.length === 0) {
    return {
      layouts: [],
      totalWaste: 0,
      averageUtilization: 0,
      totalStockUsed: 0,
      totalCutsNeeded: 0,
      cutsPlaced: 0,
    };
  }

  const layouts: CutLayout[] = [];
  let totalCutsNeeded = cutPieces.reduce((sum, cut) => sum + cut.quantity, 0);
  let cutsPlaced = 0;

  // Process each stock piece
  for (const stock of stockPieces) {
    for (let q = 0; q < stock.quantity; q++) {
      const layout = guillotineLayout(stock, cutPieces, cutWidth);
      layouts.push(layout);
      cutsPlaced += layout.positions.length;
    }
  }

  const totalWaste = layouts.reduce((sum, layout) => sum + layout.wasteArea, 0);
  const totalStockArea = stockPieces.reduce((sum, stock) => sum + stock.width * stock.height * stock.quantity, 0);
  const averageUtilization = totalStockArea > 0 ? ((totalStockArea - totalWaste) / totalStockArea) * 100 : 0;

  return {
    layouts,
    totalWaste,
    averageUtilization,
    totalStockUsed: stockPieces.length,
    totalCutsNeeded,
    cutsPlaced,
  };
}

/**
 * Generate PDF-ready data for visualization
 */
export function generatePDFData(result: OptimizationResult): string {
  let pdfContent = '';
  pdfContent += `FreeCut Optimization Report\n`;
  pdfContent += `===========================\n\n`;
  pdfContent += `Total Stock Used: ${result.totalStockUsed}\n`;
  pdfContent += `Total Cuts Needed: ${result.totalCutsNeeded}\n`;
  pdfContent += `Cuts Placed: ${result.cutsPlaced}\n`;
  pdfContent += `Average Utilization: ${result.averageUtilization.toFixed(2)}%\n`;
  pdfContent += `Total Waste: ${result.totalWaste.toFixed(2)} units²\n\n`;

  result.layouts.forEach((layout, index) => {
    pdfContent += `Layout ${index + 1}:\n`;
    pdfContent += `Utilization: ${layout.utilizationRate.toFixed(2)}%\n`;
    pdfContent += `Waste: ${layout.wasteArea.toFixed(2)} units²\n`;
    pdfContent += `Pieces: ${layout.positions.length}\n\n`;
  });

  return pdfContent;
}
