import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import type { EdgeBand } from '@/lib/optimizer';

interface EdgeBandingConfigProps {
  onApply: (edgeBand: EdgeBand) => void;
  onCancel: () => void;
}

export function EdgeBandingConfig({ onApply, onCancel }: EdgeBandingConfigProps) {
  const [name, setName] = useState('');
  const [thickness, setThickness] = useState('2');
  const [sides, setSides] = useState({
    top: false,
    bottom: false,
    left: false,
    right: false,
  });

  const handleApply = () => {
    if (!name || !thickness) return;

    const edgeBand: EdgeBand = {
      name,
      thickness: parseFloat(thickness),
      sides,
    };

    onApply(edgeBand);
    setName('');
    setThickness('2');
    setSides({ top: false, bottom: false, left: false, right: false });
  };

  const toggleSide = (side: keyof typeof sides) => {
    setSides((prev) => ({ ...prev, [side]: !prev[side] }));
  };

  const allSides = sides.top && sides.bottom && sides.left && sides.right;

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="text-base text-amber-900">Add Edge Banding</CardTitle>
        <CardDescription className="text-amber-800">
          Configure edge banding for the cut piece
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="band-name">Material Name</Label>
            <Input
              id="band-name"
              placeholder="e.g., Oak, Walnut"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="band-thickness">Thickness (mm)</Label>
            <Input
              id="band-thickness"
              type="number"
              placeholder="2"
              value={thickness}
              onChange={(e) => setThickness(e.target.value)}
              min="0.5"
              max="10"
              step="0.5"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Apply to Sides</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="top"
                checked={sides.top}
                onCheckedChange={() => toggleSide('top')}
              />
              <Label htmlFor="top" className="text-sm font-normal cursor-pointer">
                Top
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="bottom"
                checked={sides.bottom}
                onCheckedChange={() => toggleSide('bottom')}
              />
              <Label htmlFor="bottom" className="text-sm font-normal cursor-pointer">
                Bottom
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="left"
                checked={sides.left}
                onCheckedChange={() => toggleSide('left')}
              />
              <Label htmlFor="left" className="text-sm font-normal cursor-pointer">
                Left
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="right"
                checked={sides.right}
                onCheckedChange={() => toggleSide('right')}
              />
              <Label htmlFor="right" className="text-sm font-normal cursor-pointer">
                Right
              </Label>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSides({ top: !allSides, bottom: !allSides, left: !allSides, right: !allSides })}
            className="w-full"
          >
            {allSides ? 'Deselect All' : 'Select All'}
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleApply}
            disabled={!name || !thickness || !Object.values(sides).some((v) => v)}
            className="flex-1 bg-amber-600 hover:bg-amber-700"
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
