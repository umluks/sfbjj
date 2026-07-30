import React from 'react';
import { Inbox, type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-obsidian-900/40 border border-obsidian-850/80 rounded-none max-w-full min-w-0 ${className}`}
    >
      <div className="p-4 bg-obsidian-850 border border-obsidian-800 rounded-full mb-4 text-slate-400">
        <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400 stroke-[1.5]" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-slate-200 uppercase tracking-wider">
        {title}
      </h3>
      {description && (
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mt-2 leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="btn-gold mt-6 text-xs uppercase font-extrabold tracking-wider px-6 py-2.5"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
