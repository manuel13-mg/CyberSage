import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-800 bg-gray-900 p-6 shadow-lg transition-all duration-200 hover:shadow-xl',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;