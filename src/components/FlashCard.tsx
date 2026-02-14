import { useState, useEffect } from 'react';
import { Word } from '@/data/vocabulary';
import { Button } from '@/components/ui/button';
import { Volume2, Check, RotateCcw } from 'lucide-react';
import { soundManager } from '@/lib/sounds';

interface FlashCardProps {
  word: Word;
  gradient: string;
  onLearned: () => void;
  isLearned: boolean;
}

const ConfettiPiece = ({ delay, left }: { delay: number; left: number }) => {
  const colors = ['🌟', '⭐', '✨', '💫', '🎉', '🎊'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
  return (
    <div
      className="absolute text-2xl animate-confetti-fall pointer-events-none"
      style={{
        left: `${left}%`,
        top: '-20px',
        animationDelay: `${delay}s`,
        animationDuration: `${2 + Math.random()}s`,
      }}
    >
      {randomColor}
    </div>
  );
};

export const FlashCard = ({ word, gradient, onLearned, isLearned }: FlashCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [cardAnimation, setCardAnimation] = useState('');

  // Reset flip state when word changes
  useEffect(() => {
    setIsFlipped(false);
  }, [word.id]);

  const speak = (text: string) => {
    soundManager.speakWithElevenLabs(text);
  };

  const handleFlip = () => {
    soundManager.playFlip();
    setIsFlipped(!isFlipped);
    if (!isFlipped) {
      speak(word.english);
    }
  };

  const handleLearned = () => {
    if (!isLearned) {
      soundManager.playStar();
      setCardAnimation('animate-celebrate');
      setShowConfetti(true);
      onLearned();
      
      setTimeout(() => {
        setCardAnimation('');
        setShowConfetti(false);
      }, 2000);
    }
  };

  return (
    <div className="relative perspective-1000">
      {/* Confetti effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
          {[...Array(15)].map((_, i) => (
            <ConfettiPiece 
              key={i} 
              delay={Math.random() * 0.5} 
              left={Math.random() * 100} 
            />
          ))}
        </div>
      )}

      <div
        className={`
          relative w-full aspect-square max-w-xs mx-auto cursor-pointer
          transition-transform duration-500 transform-style-3d
          ${isFlipped ? 'rotate-y-180' : ''}
          ${cardAnimation}
        `}
        onClick={handleFlip}
      >
        {/* Front side */}
        <div 
          className={`
            absolute inset-0 rounded-3xl ${gradient} shadow-card
            flex flex-col items-center justify-center p-6 backface-hidden
            hover:shadow-glow transition-shadow
          `}
        >
          <span className="text-8xl mb-4 animate-float">{word.emoji}</span>
          <p className="text-sm text-primary-foreground/80 animate-pulse">
            Çevirmek için tıkla!
          </p>
        </div>

        {/* Back side */}
        <div 
          className={`
            absolute inset-0 rounded-3xl bg-card shadow-card border-4 border-primary
            flex flex-col items-center justify-center p-6 backface-hidden rotate-y-180
          `}
        >
          <span className="text-6xl mb-4 animate-bounce-slow">{word.emoji}</span>
          <h2 className="text-3xl font-bold text-foreground mb-2">{word.english}</h2>
          <p className="text-xl text-muted-foreground">{word.turkish}</p>
          
          <div className="flex gap-3 mt-6">
            <Button
              variant="accent"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                soundManager.playClick();
                speak(word.english);
              }}
              className="animate-pulse-glow"
            >
              <Volume2 className="w-5 h-5" />
            </Button>
            
            <Button
              variant={isLearned ? "secondary" : "default"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleLearned();
              }}
              className={`gap-2 ${isLearned ? '' : 'animate-pulse-scale'}`}
              disabled={isLearned}
            >
              {isLearned ? (
                <>
                  <Check className="w-4 h-4" /> Öğrenildi!
                </>
              ) : (
                <>
                  ⭐ Öğrendim!
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Flip hint */}
      <div className="flex justify-center mt-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={(e) => {
            e.stopPropagation();
            handleFlip();
          }} 
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          {isFlipped ? 'Ön yüzü gör' : 'Çevir'}
        </Button>
      </div>
    </div>
  );
};
