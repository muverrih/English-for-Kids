import mascotOwl from '@/assets/mascot-owl.webp';

interface MascotOwlProps {
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  message?: string;
}

const sizeClasses = {
  sm: 'w-24 h-24',
  md: 'w-36 h-36',
  lg: 'w-52 h-52',
};

export const MascotOwl = ({ size = 'md', animate = true, message }: MascotOwlProps) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`relative ${animate ? 'animate-float' : ''}`}>
        {/* Glow effect behind owl */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-accent/20 rounded-full blur-3xl scale-90" />
        
        <img 
          src={mascotOwl} 
          alt="Wise Owl Mascot" 
          className={`${sizeClasses[size]} object-contain drop-shadow-2xl relative z-10`}
        />
        
        {/* Fun sparkle effects */}
        {animate && (
          <>
            <div className="absolute -top-1 -right-1 text-2xl animate-sparkle">✨</div>
            <div className="absolute -bottom-1 -left-1 text-xl animate-sparkle delay-200">⭐</div>
            <div className="absolute top-1/4 -right-4 text-lg animate-sparkle delay-500">💫</div>
          </>
        )}
      </div>
      
      {message && (
        <div className="relative bg-card rounded-3xl px-6 py-4 shadow-card max-w-sm border-2 border-primary/20 animate-pop">
          {/* Rainbow gradient border effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10" />
          
          <p className="relative text-foreground text-center font-bold text-lg">
            {message}
          </p>
          
          {/* Speech bubble tail */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <div className="w-5 h-5 bg-card rotate-45 border-l-2 border-t-2 border-primary/20" />
          </div>
        </div>
      )}
    </div>
  );
};
