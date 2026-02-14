import { Badge } from '@/data/badges';
import { Lock } from 'lucide-react';

interface BadgeDisplayProps {
  badge: Badge;
  isEarned: boolean;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export const BadgeDisplay = ({ badge, isEarned, size = 'md', showDetails = true }: BadgeDisplayProps) => {
  const sizeClasses = {
    sm: 'w-12 h-12 text-2xl',
    md: 'w-16 h-16 text-3xl',
    lg: 'w-20 h-20 text-4xl',
  };

  return (
    <div className={`flex flex-col items-center gap-2 ${showDetails ? '' : ''}`}>
      <div 
        className={`relative ${sizeClasses[size]} rounded-full flex items-center justify-center transition-all duration-300 ${
          isEarned 
            ? `bg-gradient-to-br ${badge.color} shadow-lg hover:scale-110 cursor-pointer` 
            : 'bg-muted/50 grayscale opacity-50'
        }`}
      >
        {isEarned ? (
          <span className="drop-shadow-sm">{badge.icon}</span>
        ) : (
          <Lock className="w-1/2 h-1/2 text-muted-foreground" />
        )}
        
        {/* Shine effect for earned badges */}
        {isEarned && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/0 via-white/30 to-white/0 animate-pulse" />
        )}
      </div>
      
      {showDetails && (
        <div className="text-center">
          <p className={`text-xs font-semibold ${isEarned ? 'text-foreground' : 'text-muted-foreground'}`}>
            {badge.name}
          </p>
          {!isEarned && (
            <p className="text-xs text-muted-foreground">
              Kilitli
            </p>
          )}
        </div>
      )}
    </div>
  );
};
