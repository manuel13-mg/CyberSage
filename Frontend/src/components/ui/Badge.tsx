import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info';
}

const Badge: React.FC<BadgeProps> = ({ children, className, variant = 'default', ...props }) => {
  const baseClasses = 'inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2';

  const variantClasses = {
    default: 'border-transparent bg-gray-700 text-gray-100 hover:bg-gray-600',
    secondary: 'border-transparent bg-gray-600 text-gray-100 hover:bg-gray-500',
    destructive: 'border-transparent bg-red-600 text-white hover:bg-red-700',
    success: 'border-transparent bg-green-600 text-white hover:bg-green-700',
    warning: 'border-transparent bg-yellow-500 text-gray-900 hover:bg-yellow-600',
    info: 'border-transparent bg-blue-600 text-white hover:bg-blue-700',
    outline: 'text-gray-100 border border-gray-600',
  };

  return (
    <span className={cn(baseClasses, variantClasses[variant], className)} {...props}>
      {children}
    </span>
  );
};

export default Badge;