import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'avatar' | 'button' | 'table-row';
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  count = 1,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'avatar':
        return 'w-12 h-12 rounded-full shrink-0';
      case 'button':
        return 'h-10 w-28 rounded-none';
      case 'card':
        return 'h-40 w-full rounded-none';
      case 'table-row':
        return 'h-12 w-full rounded-none';
      case 'text':
      default:
        return 'h-4 w-3/4 rounded-none';
    }
  };

  const skeletons = Array.from({ length: count });

  return (
    <>
      {skeletons.map((_, index) => (
        <div
          key={index}
          className={`bg-obsidian-850/80 animate-pulse border border-obsidian-800/50 ${getVariantStyles()} ${className}`}
          aria-hidden="true"
        />
      ))}
    </>
  );
};

export default SkeletonLoader;
