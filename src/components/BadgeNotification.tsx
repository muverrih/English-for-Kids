import { useEffect, useState } from 'react';
import { Badge } from '@/data/badges';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BadgeNotificationProps {
  badge: Badge;
  onDismiss: () => void;
}

export const BadgeNotification = ({ badge, onDismiss }: BadgeNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 100);

    // Auto dismiss after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 pointer-events-auto ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleDismiss}
      />
      
      {/* Notification Card */}
      <div 
        className={`relative bg-card rounded-3xl p-8 shadow-2xl max-w-sm mx-4 text-center pointer-events-auto transform transition-all duration-500 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}
      >
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2"
          onClick={handleDismiss}
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Confetti Effect */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti-fall"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              {['🎉', '⭐', '✨', '🎊', '💫'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>

        {/* Trophy Animation */}
        <div className="relative mb-4">
          <div className="text-8xl animate-celebrate">
            🏆
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute w-32 h-32 bg-yellow-400/20 rounded-full animate-ping" />
          </div>
        </div>

        {/* Badge Icon */}
        <div 
          className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center text-5xl mb-4 animate-bounce shadow-lg`}
        >
          {badge.icon}
        </div>

        {/* Text */}
        <h3 className="text-sm font-medium text-muted-foreground mb-1">
          Yeni Rozet Kazandın! 🎉
        </h3>
        <h2 className="text-2xl font-black text-foreground mb-2">
          {badge.name}
        </h2>
        <p className="text-muted-foreground">
          {badge.description}
        </p>

        {/* Sparkle effect */}
        <div className="absolute top-4 left-4 text-2xl animate-pulse">✨</div>
        <div className="absolute top-8 right-8 text-xl animate-pulse" style={{ animationDelay: '0.5s' }}>⭐</div>
        <div className="absolute bottom-12 left-8 text-lg animate-pulse" style={{ animationDelay: '1s' }}>💫</div>
      </div>
    </div>
  );
};
