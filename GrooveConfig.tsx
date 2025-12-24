import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { Groove } from '@/lib/optimizer';

interface GrooveConfigProps {
  onApply: (groove: Groove) => void;
  onCancel: () => void;
}

export function GrooveConfig({ onApply, onCancel }: GrooveConfigProps) {
  const [enabled, setEnabled] = useState(false);
  const [width, setWidth] = useState('2');
  const [direction, setDirection] = useState<'horizontal' | 'vertical'>('horizontal');
  const [offset, setOffset] = useState('0');

  const handleApply = () => {
    if (!enabled) {
      onApply({ enabled: false, width: 0, direction: 'horizontal' });
      return;
    }

    if (!width) return;

    const groove: Groove = {
      enabled: true,
      width: parseFloat(width),
      direction,
      offset: offset ? parseFloat(offset) : undefined,
    };

    onApply(groove);
    setEnabled(false);
    setWidth('2');
    setDirection('horizontal');
    setOffset('0');
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-base text-blue-900">Groove Configuration</CardTitle>
        <CardDescription className="text-blue-800">
          Add a groove to the cut piece (optional)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="groove-enabled"
            checked={enabled}
            onCheckedChange={(checked) => setEnabled(checked as boolean)}
          />
          <Label htmlFor="groove-enabled" className="text-sm font-medium cursor-pointer">
            Enable Groove
          </Label>
        </div>

        {enabled && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="groove-width">Groove Width (mm)</Label>
                <Input
                  id="groove-width"
                  type="number"
                  placeholder="2"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  min="0.5"
                  max="20"
                  step="0.5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="groove-direction">Direction</Label>
                <Select value={direction} onValueChange={(value) => setDirection(value as 'horizontal' | 'vertical')}>
                  <SelectTrigger id="groove-direction">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="horizontal">Horizontal (Width)</SelectItem>
                    <SelectItem value="vertical">Vertical (Height)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="groove-offset">Offset from Edge (mm)</Label>
              <Input
                id="groove-offset"
                type="number"
                placeholder="0"
                value={offset}
                onChange={(e) => setOffset(e.target.value)}
                min="0"
                max="100"
                step="1"
              />
              <p className="text-xs text-slate-500">Distance from the edge where groove will be placed</p>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleApply}
            disabled={enabled && !width}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Apply
          </Button>
          <Button onClick={onCancel} variant="outline" className="flex-1">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
