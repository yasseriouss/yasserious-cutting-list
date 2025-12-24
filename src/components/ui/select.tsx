import * as React from "react";
import { cn } from "@/lib/utils";

type SelectItemData = { value: string; label: React.ReactNode };

type SelectContextValue = {
  value: string;
  onValueChange?: (value: string) => void;
  items: SelectItemData[];
};

const SelectContext = React.createContext<SelectContextValue | null>(null);

function useSelectContext() {
  const ctx = React.useContext(SelectContext);
  if (!ctx) throw new Error("Select components must be used within <Select />");
  return ctx;
}

function collectItems(children: React.ReactNode): SelectItemData[] {
  const items: SelectItemData[] = [];

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === SelectItem) {
      const value = String((child.props as { value: string }).value);
      const label = (child.props as { children?: React.ReactNode }).children;
      items.push({ value, label });
      return;
    }
    if (child.props && "children" in child.props) {
      items.push(...collectItems((child.props as { children?: React.ReactNode }).children));
    }
  });

  return items;
}

export interface SelectProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  onValueChange?: (value: string) => void;
}

export function Select({ value, onValueChange, children, ...props }: SelectProps) {
  const items = React.useMemo(() => collectItems(children), [children]);
  return (
    <SelectContext.Provider value={{ value, onValueChange, items }}>
      <div {...props}>{children}</div>
    </SelectContext.Provider>
  );
}

export interface SelectTriggerProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "value" | "onChange"> {}

export const SelectTrigger = React.forwardRef<HTMLSelectElement, SelectTriggerProps>(
  ({ className, ...props }, ref) => {
    const ctx = useSelectContext();
    return (
      <select
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        value={ctx.value}
        onChange={(e) => ctx.onValueChange?.(e.target.value)}
        {...props}
      >
        {ctx.items.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    );
  },
);
SelectTrigger.displayName = "SelectTrigger";

export interface SelectContentProps {
  children?: React.ReactNode;
}

export function SelectContent(_props: SelectContentProps) {
  return null;
}

export interface SelectValueProps {
  placeholder?: string;
}

export function SelectValue(_props: SelectValueProps) {
  return null;
}

export interface SelectItemProps {
  value: string;
  children?: React.ReactNode;
}

export function SelectItem(_props: SelectItemProps) {
  return null;
}
