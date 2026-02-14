import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Trophy, Clock, Sparkles, Brain, Zap, Flame, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { soundManager } from '@/lib/sounds';

interface Word {
  english: string;
  turkish: string;
  image?: string;
}

interface MemoryCard {
  id: string;
  content: string;
  type: 'english' | 'turkish';
  pairId: number;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryGameProps {
  words: Word[];
  gradient: string;
  onComplete: (score: number, total: number) => void;
}

type Difficulty = 'easy' | 'medium' | 'hard';

const difficultyConfig = {
  easy: { pairs: 4, label: 'Kolay', icon: Target, color: 'from-green-400 to-emerald-500' },
  medium: { pairs: 6, label: 'Orta', icon: Zap, color: 'from-yellow-400 to-orange-500' },
  hard: { pairs: 8, label: 'Zor', icon: Flame, color: 'from-red-400 to-rose-600' },
};

const MemoryGame: React.FC<MemoryGameProps> = ({ words, gradient, onComplete }) => {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [gameComplete, setGameComplete] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [bestScore, setBestScore] = useState<number | null>(null);

  const totalPairs = difficulty ? difficultyConfig[difficulty].pairs : 0;

  const initializeGame = useCallback((selectedDifficulty: Difficulty) => {
    const pairs = difficultyConfig[selectedDifficulty].pairs;
    const selectedWords = [...words]
      .sort(() => Math.random() - 0.5)
      .slice(0, pairs);

    const newCards: MemoryCard[] = [];
    
    selectedWords.forEach((word, index) => {
      newCards.push({
        id: `en-${index}`,
        content: word.english,
        type: 'english',
        pairId: index,
        isFlipped: false,
        isMatched: false,
      });
      newCards.push({
        id: `tr-${index}`,
        content: word.turkish,
        type: 'turkish',
        pairId: index,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle cards
    const shuffledCards = newCards.sort(() => Math.random() - 0.5);
    
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setGameComplete(false);
    setTimer(0);
    setIsActive(true);
    setIsChecking(false);
  }, [words]);

  const handleSelectDifficulty = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    initializeGame(selectedDifficulty);
  };

  const handleRestart = () => {
    if (difficulty) {
      initializeGame(difficulty);
    }
  };

  const handleBackToSelection = () => {
    setDifficulty(null);
    setCards([]);
    setGameComplete(false);
    setIsActive(false);
    setTimer(0);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && !gameComplete) {
      interval = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, gameComplete]);

  useEffect(() => {
    if (matchedPairs === totalPairs && totalPairs > 0 && !gameComplete) {
      setGameComplete(true);
      setIsActive(false);
      soundManager.playApplause();
      
      const score = Math.max(100 - (moves - totalPairs) * 5, 50);
      
      if (bestScore === null || score > bestScore) {
        setBestScore(score);
      }
      
      onComplete(matchedPairs, totalPairs);
    }
  }, [matchedPairs, totalPairs, gameComplete]);

  const handleCardClick = (cardId: string) => {
    if (isChecking) return;
    
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;
    if (flippedCards.length >= 2) return;

    soundManager.playFlip();

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);
    
    setCards((prev) =>
      prev.map((c) =>
        c.id === cardId ? { ...c, isFlipped: true } : c
      )
    );

    if (newFlippedCards.length === 2) {
      setIsChecking(true);
      setMoves((m) => m + 1);

      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find((c) => c.id === firstId);
      const secondCard = cards.find((c) => c.id === secondId);

      if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
        // Match found!
        setTimeout(() => {
          soundManager.playCorrect();
          setCards((prev) =>
            prev.map((c) =>
              c.pairId === firstCard.pairId ? { ...c, isMatched: true } : c
            )
          );
          setMatchedPairs((m) => m + 1);
          setFlippedCards([]);
          setIsChecking(false);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          soundManager.playWrong();
          setCards((prev) =>
            prev.map((c) =>
              newFlippedCards.includes(c.id) ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStars = () => {
    const efficiency = moves > 0 ? matchedPairs / moves : 0;
    if (efficiency >= 0.8) return 3;
    if (efficiency >= 0.5) return 2;
    return 1;
  };

  // Difficulty selection screen
  if (!difficulty) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <Brain className="w-16 h-16 mx-auto text-primary mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Hafıza Oyunu</h2>
          <p className="text-muted-foreground">Zorluk seviyesi seç</p>
        </div>

        <div className="space-y-4">
          {(Object.keys(difficultyConfig) as Difficulty[]).map((level) => {
            const config = difficultyConfig[level];
            const Icon = config.icon;
            return (
              <motion.button
                key={level}
                onClick={() => handleSelectDifficulty(level)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full p-4 rounded-xl bg-gradient-to-r ${config.color} text-white shadow-lg flex items-center justify-between`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-6 h-6" />
                  <span className="font-bold text-lg">{config.label}</span>
                </div>
                <span className="text-white/90">{config.pairs} çift</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header Stats */}
      <div className="flex justify-between items-center mb-6 px-2">
        <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
          <Clock className="w-4 h-4 text-primary" />
          <span className="font-bold text-foreground">{formatTime(timer)}</span>
        </div>
        
        <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
          <Brain className="w-4 h-4 text-purple-500" />
          <span className="font-bold text-foreground">{moves} Hamle</span>
        </div>

        <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="font-bold text-foreground">{matchedPairs}/{totalPairs}</span>
        </div>
      </div>

      {/* Game Grid */}
      <div className={`grid gap-3 mb-6 ${difficulty === 'hard' ? 'grid-cols-4' : 'grid-cols-3 sm:grid-cols-4'}`}>
        <AnimatePresence>
          {cards.map((card) => (
            <motion.div
              key={card.id}
              initial={{ scale: 0, rotateY: 180 }}
              animate={{ scale: 1, rotateY: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="aspect-square perspective-1000"
            >
              <motion.button
                onClick={() => handleCardClick(card.id)}
                disabled={card.isFlipped || card.isMatched || isChecking}
                className={`
                  w-full h-full rounded-xl shadow-lg transition-all duration-300
                  transform-style-preserve-3d cursor-pointer
                  ${card.isMatched 
                    ? 'bg-gradient-to-br from-green-400 to-emerald-500 scale-95 opacity-80' 
                    : card.isFlipped 
                      ? card.type === 'english' 
                        ? 'bg-gradient-to-br from-blue-400 to-blue-600' 
                        : 'bg-gradient-to-br from-orange-400 to-red-500'
                      : `bg-gradient-to-br ${gradient}`
                  }
                  ${!card.isFlipped && !card.isMatched ? 'hover:scale-105 hover:shadow-xl' : ''}
                `}
                animate={{
                  rotateY: card.isFlipped || card.isMatched ? 0 : 180,
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-full h-full flex items-center justify-center p-2">
                  {card.isFlipped || card.isMatched ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center"
                    >
                      <span className="text-white font-bold text-sm sm:text-base drop-shadow-lg">
                        {card.content}
                      </span>
                      {card.isMatched && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <Sparkles className="w-8 h-8 text-yellow-300" />
                        </motion.div>
                      )}
                    </motion.div>
                  ) : (
                    <div className="text-white/80">
                      <span className="text-3xl">❓</span>
                    </div>
                  )}
                </div>
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Game Complete */}
      {gameComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl p-6 text-center shadow-2xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="mb-4"
          >
            <Trophy className="w-16 h-16 mx-auto text-yellow-200 drop-shadow-lg" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Tebrikler! 🎉</h2>
          <p className="text-white/90 mb-4">
            {moves} hamlede tamamladın!
          </p>
          
          <div className="flex justify-center gap-1 mb-4">
            {[1, 2, 3].map((star) => (
              <motion.span
                key={star}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: star <= getStars() ? 1 : 0.3, 
                  scale: 1 
                }}
                transition={{ delay: 0.3 + star * 0.1 }}
                className="text-3xl"
              >
                ⭐
              </motion.span>
            ))}
          </div>

          <div className="text-white/80 text-sm mb-4">
            Süre: {formatTime(timer)}
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleRestart}
              className="bg-white text-orange-600 hover:bg-white/90 font-bold px-6 py-2 rounded-full shadow-lg"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Tekrar Oyna
            </Button>
            <Button
              onClick={handleBackToSelection}
              variant="outline"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30 font-bold px-6 py-2 rounded-full"
            >
              Zorluk Değiştir
            </Button>
          </div>
        </motion.div>
      )}

      {/* Restart Button */}
      {!gameComplete && (
        <div className="flex justify-center gap-3">
          <Button
            onClick={handleRestart}
            variant="outline"
            className="rounded-full"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Yeniden Başla
          </Button>
          <Button
            onClick={handleBackToSelection}
            variant="ghost"
            className="rounded-full"
          >
            Zorluk Değiştir
          </Button>
        </div>
      )}
    </div>
  );
};

export default MemoryGame;
