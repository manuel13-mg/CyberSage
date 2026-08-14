import React from 'react';
import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ className, checked, onCheckedChange, ...props }) => {
  const handleToggle = () => {
    if (onCheckedChange) {
      onCheckedChange(!checked);
    }
  };

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={handleToggle}
      className={cn(
        'peer h-4 w-4 shrink-0 rounded-sm border border-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-blue-600 border-blue-600' : 'bg-gray-800',
        className
      )}
      {...props}
    >
      {checked && <Check className="h-3 w-3 text-white" />}
    </button>
  );
};

export default Checkbox;