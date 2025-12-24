import React, { useRef, useEffect } from 'react';
import type { CutLayout } from '@/lib/optimizer';
import { cn } from '@/lib/utils';

interface CutCanvasProps {
  layout: CutLayout | null;
  className?: string;
}

export function CutCanvas({ layout, className }: CutCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !layout) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Clear canvas
    ctx.fillStyle = '#F9FAFB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= canvas.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i <= canvas.height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Calculate scale
    const maxWidth = 2000;
    const maxHeight = 1500;
    const scaleX = (canvas.width * 0.9) / maxWidth;
    const scaleY = (canvas.height * 0.9) / maxHeight;
    const scale = Math.min(scaleX, scaleY);

    const offsetX = (canvas.width - maxWidth * scale) / 2;
    const offsetY = (canvas.height - maxHeight * scale) / 2;

    // Draw stock outline
    ctx.strokeStyle = '#1F2937';
    ctx.lineWidth = 3;
    ctx.strokeRect(offsetX, offsetY, maxWidth * scale, maxHeight * scale);

    // Draw cut pieces
    const colors = [
      '#F59E0B',
      '#3B82F6',
      '#10B981',
      '#8B5CF6',
      '#EC4899',
      '#F97316',
    ];

    layout.positions.forEach((pos, index) => {
      const x = offsetX + pos.x * scale;
      const y = offsetY + pos.y * scale;
      const w = pos.width * scale;
      const h = pos.height * scale;

      // Draw piece
      ctx.fillStyle = colors[index % colors.length];
      ctx.globalAlpha = 0.7;
      ctx.fillRect(x, y, w, h);

      // Draw border
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, w, h);

      // Draw label
      ctx.fillStyle = '#1F2937';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        `${pos.width}×${pos.height}`,
        x + w / 2,
        y + h / 2
      );
    });

    // Draw waste area indicator
    ctx.fillStyle = '#EF4444';
    ctx.globalAlpha = 0.1;
    ctx.fillRect(offsetX, offsetY, maxWidth * scale, maxHeight * scale);
    ctx.globalAlpha = 1;
  }, [layout]);

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-auto bg-slate-50"
        />
      </div>
      {layout && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-border">
            <div className="text-sm text-muted-foreground">Utilization</div>
            <div className="text-2xl font-bold text-amber-600">
              {layout.utilizationRate.toFixed(1)}%
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-border">
            <div className="text-sm text-muted-foreground">Pieces Placed</div>
            <div className="text-2xl font-bold text-slate-900">
              {layout.positions.length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-border">
            <div className="text-sm text-muted-foreground">Waste Area</div>
            <div className="text-2xl font-bold text-slate-900">
              {layout.wasteArea.toFixed(0)} u²
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
