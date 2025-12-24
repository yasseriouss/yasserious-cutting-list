import React from 'react';
import type { OptimizationResult } from '@/lib/optimizer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileJson } from 'lucide-react';
import { exportDXFFile } from '@/lib/dxf-export';

interface ResultsSummaryProps {
  result: OptimizationResult | null;
}

export function ResultsSummary({ result }: ResultsSummaryProps) {
  if (!result) {
    return null;
  }

  const handleExportDXF = () => {
    if (result) {
      exportDXFFile(result, 'freecut-layout.dxf');
    }
  };

  const handleExportPDF = () => {
    // Create a simple text-based export for now
    let content = 'FreeCut Optimization Report\n';
    content += '===========================\n\n';
    content += `Total Stock Used: ${result.totalStockUsed}\n`;
    content += `Total Cuts Needed: ${result.totalCutsNeeded}\n`;
    content += `Cuts Placed: ${result.cutsPlaced}\n`;
    content += `Average Utilization: ${result.averageUtilization.toFixed(2)}%\n`;
    content += `Total Waste: ${result.totalWaste.toFixed(2)} units²\n\n`;

    result.layouts.forEach((layout, index) => {
      content += `Layout ${index + 1}:\n`;
      content += `  Utilization: ${layout.utilizationRate.toFixed(2)}%\n`;
      content += `  Waste: ${layout.wasteArea.toFixed(2)} units²\n`;
      content += `  Pieces: ${layout.positions.length}\n\n`;
    });

    // Create and download file
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', 'freecut-report.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-4">
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-lg text-amber-900">Optimization Results</CardTitle>
          <CardDescription className="text-amber-800">
            Your cutting layout has been optimized
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-amber-700 font-medium">Average Utilization</div>
              <div className="text-3xl font-bold text-amber-600">
                {result.averageUtilization.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-amber-700 font-medium">Total Waste</div>
              <div className="text-3xl font-bold text-amber-600">
                {result.totalWaste.toFixed(0)} u²
              </div>
            </div>
            <div>
              <div className="text-sm text-amber-700 font-medium">Stock Panels Used</div>
              <div className="text-3xl font-bold text-amber-600">
                {result.totalStockUsed}
              </div>
            </div>
            <div>
              <div className="text-sm text-amber-700 font-medium">Cuts Placed</div>
              <div className="text-3xl font-bold text-amber-600">
                {result.cutsPlaced}/{result.totalCutsNeeded}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h3 className="font-semibold text-slate-900">Layout Details</h3>
        {result.layouts.map((layout, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground uppercase font-semibold">Layout {index + 1}</div>
                  <div className="text-sm text-slate-900 mt-1">{layout.positions.length} pieces</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase font-semibold">Utilization</div>
                  <div className="text-sm text-slate-900 mt-1">{layout.utilizationRate.toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase font-semibold">Waste</div>
                  <div className="text-sm text-slate-900 mt-1">{layout.wasteArea.toFixed(0)} u²</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button onClick={handleExportPDF} className="w-full bg-slate-900 hover:bg-slate-800">
        <Download className="w-4 h-4 mr-2" />
        Export Report
      </Button>
    </div>
  );
}
