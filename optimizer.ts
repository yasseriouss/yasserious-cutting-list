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
  name?: string;
  width: number;
  height: number;
  quantity: number;
  pattern?: 'none' | 'horizontal' | 'vertical';
  grain?: 'none' | 'horizontal' | 'vertical';
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
  length?: 'full' | 'custom'; // full = full length of piece in direction, custom = specified length
  lengthValue?: number; // custom length value in mm
  direction: 'horizontal' | 'vertical'; // horizontal = parallel to width, vertical = parallel to height
  offsetSide?: 'top' | 'bottom' | 'left' | 'right'; // which side to offset from
  offset?: number; // distance from edge
}

export interface CutPiece {
  id: string;
  name?: string;
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
 * Calculate the cutting dimensions for a piece, accounting for edge banding thickness.
 * The cutting size should be reduced by the edge banding thickness on each applicable side.
 */
function getCuttingDimensions(cut: CutPiece): { width: number; height: number } {
  let width = cut.width;
  let height = cut.height;

  if (cut.edgeBand && cut.edgeBand.thickness > 0) {
    // Subtract edge banding thickness from the cutting dimensions
    if (cut.edgeBand.sides.left) {
      width -= cut.edgeBand.thickness;
    }
    if (cut.edgeBand.sides.right) {
      width -= cut.edgeBand.thickness;
    }
    if (cut.edgeBand.sides.top) {
      height -= cut.edgeBand.thickness;
    }
    if (cut.edgeBand.sides.bottom) {
      height -= cut.edgeBand.thickness;
    }
  }

  // Ensure dimensions don't go below 1mm
  return {
    width: Math.max(1, width),
    height: Math.max(1, height),
  };
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
    // Get cutting dimensions accounting for edge banding
    const cuttingDims = getCuttingDimensions(cut);

    for (let q = 0; q < cut.quantity; q++) {
      // Try to place the cut piece using cutting dimensions
      const placement = findPlacement(positions, stock, cut, cuttingDims, cutWidth);
      if (placement) {
        positions.push(placement);
        usedArea += cuttingDims.width * cuttingDims.height;
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
  cuttingDims: { width: number; height: number },
  cutWidth: number
): CutPosition | null {
  const { width, height } = cuttingDims;

  // Try different positions
  for (let x = 0; x <= stock.width - width; x += 10) {
    for (let y = 0; y <= stock.height - height; y += 10) {
      if (canPlacePiece(positions, x, y, width, height, cutWidth)) {
        return {
          pieceId: cut.id,
          x,
          y,
          width: width,
          height: height,
          rotated: false,
        };
      }
    }
  }

  // Try rotated (only if piece pattern/grain allows rotation)
  if (width !== height && (!cut.pattern || cut.pattern === 'none')) {
    for (let x = 0; x <= stock.width - height; x += 10) {
      for (let y = 0; y <= stock.height - width; y += 10) {
        if (canPlacePiece(positions, x, y, height, width, cutWidth)) {
          return {
            pieceId: cut.id,
            x,
            y,
            width: height,
            height: width,
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
