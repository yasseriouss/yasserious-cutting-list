import * as React from "react";
import { cn } from "@/lib/utils";

export interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  value: number[];
  onValueChange: (value: number[]) => void;
}

export function Slider({ className, value, onValueChange, ...props }: SliderProps) {
  return (
    <input
      type="range"
      className={cn("w-full accent-amber-600", className)}
      value={value[0] ?? 0}
      onChange={(e) => onValueChange([Number(e.target.value)])}
      {...props}
    />
  );
}

