import * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="checkbox"
        className={cn(
          "h-4 w-4 rounded border border-input bg-background",
          "accent-amber-600",
          className,
        )}
        checked={!!checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        {...props}
      />
    );
  },
);
Checkbox.displayName = "Checkbox";

