/**
 * DXF Export Utility
 * Generates DXF (Drawing Exchange Format) files for CNC machines and CAD software
 * 
 * Design Philosophy: Industrial Minimalism
 * - Precision-focused output for manufacturing
 * - Support for edge banding and groove visualization
 */

import type { OptimizationResult, CutLayout, CutPosition } from './optimizer';

/**
 * Generate a basic DXF file from optimization results
 */
export function generateDXF(result: OptimizationResult): string {
  let dxf = '';

  // DXF Header
  dxf += generateDXFHeader();

  // DXF Entities Section
  dxf += '  0\nSECTION\n  2\nENTITIES\n';

  // Draw each layout
  result.layouts.forEach((layout, layoutIndex) => {
    dxf += generateLayoutEntities(layout, layoutIndex);
  });

  // End sections
  dxf += '  0\nENDSEC\n  0\nEOF\n';

  return dxf;
}

/**
 * Generate DXF header section
 */
function generateDXFHeader(): string {
  return `  0
SECTION
  2
HEADER
  9
$ACADVER
  1
AC1021
  9
$EXTMIN
 10
0.0
 20
0.0
  9
$EXTMAX
 10
10000.0
 20
10000.0
  0
ENDSEC
  0
SECTION
  2
TABLES
  0
TABLE
  2
LAYER
 70
1
  0
LAYER
  2
0
 70
0
 62
7
  6
CONTINUOUS
  0
ENDTAB
  0
ENDTAB
  0
ENDSEC
`;
}

/**
 * Generate DXF entities for a layout
 */
function generateLayoutEntities(layout: CutLayout, layoutIndex: number): string {
  let entities = '';

  layout.positions.forEach((pos, index) => {
    // Draw rectangle for each cut piece
    entities += generateDXFRectangle(
      pos.x,
      pos.y,
      pos.width,
      pos.height,
      `PIECE_${layoutIndex}_${index}`
    );
  });

  return entities;
}

/**
 * Generate a DXF rectangle (4 lines)
 */
function generateDXFRectangle(x: number, y: number, width: number, height: number, label: string): string {
  let rect = '';

  // Bottom line
  rect += `  0
LINE
  8
0
 10
${x}
 20
${y}
 11
${x + width}
 21
${y}
`;

  // Right line
  rect += `  0
LINE
  8
0
 10
${x + width}
 20
${y}
 11
${x + width}
 21
${y + height}
`;

  // Top line
  rect += `  0
LINE
  8
0
 10
${x + width}
 20
${y + height}
 11
${x}
 21
${y + height}
`;

  // Left line
  rect += `  0
LINE
  8
0
 10
${x}
 20
${y + height}
 11
${x}
 21
${y}
`;

  // Add text label
  rect += `  0
TEXT
  8
0
 10
${x + width / 2}
 20
${y + height / 2}
 40
2.5
  1
${label}
`;

  return rect;
}

/**
 * Export DXF file
 */
export function exportDXFFile(result: OptimizationResult, filename: string = 'freecut-layout.dxf'): void {
  const dxfContent = generateDXF(result);
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(dxfContent));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
