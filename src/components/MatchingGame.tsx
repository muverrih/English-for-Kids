import { useState, useEffect, useCallback } from 'react';
import { Word } from '@/data/vocabulary';
import { Button } from '@/components/ui/button';
import { soundManager } from '@/lib/sounds';
import { RefreshCw, Trophy, Clock, Zap } from 'lucide-react';

interface MatchingGameProps {
  words: Word[];
  gradient: string;
  onComplete: (score: number) => void;
}

interface Card {
  id: string;
  text: string;
  emoji?: string;
  type: 'english' | 'turkish';
  wordId: string;
  isMatched: boolean;
  isSelected: boolean;
  isWrong: boolean;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const MatchingGame = ({ words, gradient, onComplete }: MatchingGameProps) => {
  const [gameWords, setGameWords] = useState<Word[]>([]);
  const [englishCards, setEnglishCards] = useState<Card[]>([]);
  const [turkishCards, setTurkishCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);

  const initializeGame = useCallback(() => {
    // Select 6 random words for the game
    const selectedWords = shuffleArray(words).slice(0, 6);
    setGameWords(selectedWords);

    // Create English cards
    const engCards: Card[] = selectedWords.map(word => ({
      id: `en-${word.id}`,
      text: word.english,
      emoji: word.emoji,
      type: 'english',
      wordId: word.id,
      isMatched: false,
      isSelected: false,
      isWrong: false,
    }));

    // Create Turkish cards
    const trCards: Card[] = selectedWords.map(word => ({
      id: `tr-${word.id}`,
      text: word.turkish,
      type: 'turkish',
      wordId: word.id,
      isMatched: false,
      isSelected: false,
      isWrong: false,
    }));

    setEnglishCards(shuffleArray(engCards));
    setTurkishCards(shuffleArray(trCards));
    setSelectedCard(null);
    setMatchedPairs(0);
    setAttempts(0);
    setGameComplete(false);
    setTimer(0);
    setIsRunning(true);
    setCombo(0);
    setMaxCombo(0);
  }, [words]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && !gameComplete) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, gameComplete]);

  const updateCard = (cards: Card[], cardId: string, updates: Partial<Card>): Card[] => {
    return cards.map(card => 
      card.id === cardId ? { ...card, ...updates } : card
    );
  };

  const handleCardClick = (card: Card) => {
    if (card.isMatched || card.isWrong) return;

    soundManager.playClick();

    if (!selectedCard) {
      // First card selection
      setSelectedCard(card);
      if (card.type === 'english') {
        setEnglishCards(prev => updateCard(prev, card.id, { isSelected: true }));
      } else {
        setTurkishCards(prev => updateCard(prev, card.id, { isSelected: true }));
      }
    } else if (selectedCard.id === card.id) {
      // Deselect same card
      setSelectedCard(null);
      if (card.type === 'english') {
        setEnglishCards(prev => updateCard(prev, card.id, { isSelected: false }));
      } else {
        setTurkishCards(prev => updateCard(prev, card.id, { isSelected: false }));
      }
    } else if (selectedCard.type === card.type) {
      // Same type, switch selection
      if (card.type === 'english') {
        setEnglishCards(prev => 
          prev.map(c => ({ ...c, isSelected: c.id === card.id }))
        );
      } else {
        setTurkishCards(prev => 
          prev.map(c => ({ ...c, isSelected: c.id === card.id }))
        );
      }
      setSelectedCard(card);
    } else {
      // Different type, check for match
      setAttempts(prev => prev + 1);

      if (selectedCard.wordId === card.wordId) {
        // Match found!
        soundManager.playCorrect();
        const newCombo = combo + 1;
        setCombo(newCombo);
        if (newCombo > maxCombo) setMaxCombo(newCombo);

        setEnglishCards(prev => 
          prev.map(c => 
            c.wordId === card.wordId 
              ? { ...c, isMatched: true, isSelected: false } 
              : c
          )
        );
        setTurkishCards(prev => 
          prev.map(c => 
            c.wordId === card.wordId 
              ? { ...c, isMatched: true, isSelected: false } 
              : c
          )
        );

        const newMatchedPairs = matchedPairs + 1;
        setMatchedPairs(newMatchedPairs);

        if (newMatchedPairs === gameWords.length) {
          // Game complete!
          setGameComplete(true);
          setIsRunning(false);
          soundManager.playSuccess();
          
          // Calculate score
          const accuracy = Math.round((gameWords.length / attempts) * 100);
          const timeBonus = Math.max(0, 100 - timer);
          const comboBonus = maxCombo * 10;
          const finalScore = Math.min(100, Math.round((accuracy + timeBonus + comboBonus) / 3));
          
          onComplete(finalScore);
        }

        setSelectedCard(null);
      } else {
        // No match
        soundManager.playWrong();
        setCombo(0);

        // Show wrong state briefly
        if (selectedCard.type === 'english') {
          setEnglishCards(prev => updateCard(prev, selectedCard.id, { isWrong: true, isSelected: false }));
        } else {
          setTurkishCards(prev => updateCard(prev, selectedCard.id, { isWrong: true, isSelected: false }));
        }

        if (card.type === 'english') {
          setEnglishCards(prev => updateCard(prev, card.id, { isWrong: true }));
        } else {
          setTurkishCards(prev => updateCard(prev, card.id, { isWrong: true }));
        }

        // Reset wrong state after animation
        setTimeout(() => {
          setEnglishCards(prev => prev.map(c => ({ ...c, isWrong: false })));
          setTurkishCards(prev => prev.map(c => ({ ...c, isWrong: false })));
        }, 500);

        setSelectedCard(null);
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderCard = (card: Card) => (
    <button
      key={card.id}
      onClick={() => handleCardClick(card)}
      disabled={card.isMatched}
      className={`
        p-4 rounded-2xl font-bold text-center transition-all duration-300 min-h-[80px]
        flex flex-col items-center justify-center gap-1
        ${card.isMatched 
          ? 'bg-green-500/20 text-green-600 scale-95 opacity-60' 
          : card.isWrong
            ? 'bg-red-500/20 text-red-600 animate-shake'
            : card.isSelected
              ? `${gradient} text-primary-foreground scale-105 shadow-lg`
              : 'bg-card shadow-card hover:shadow-lg hover:scale-102'
        }
      `}
    >
      {card.emoji && <span className="text-2xl">{card.emoji}</span>}
      <span className={`text-sm md:text-base ${card.type === 'english' ? 'font-bold' : ''}`}>
        {card.text}
      </span>
      {card.isMatched && <span className="text-lg">✓</span>}
    </button>
  );

  if (gameComplete) {
    const accuracy = Math.round((gameWords.length / attempts) * 100);

    return (
      <div className="text-center py-8 animate-fade-in">
        <div className="text-6xl mb-4 animate-celebrate">🎉</div>
        <h2 className="text-2xl font-black text-foreground mb-2">Tebrikler!</h2>
        <p className="text-muted-foreground mb-6">Tüm eşleştirmeleri tamamladın!</p>

        <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-8">
          <div className="bg-card rounded-2xl p-4 shadow-card">
            <Clock className="w-6 h-6 mx-auto text-blue-500 mb-1" />
            <p className="text-xl font-bold text-foreground">{formatTime(timer)}</p>
            <p className="text-xs text-muted-foreground">Süre</p>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-card">
            <Trophy className="w-6 h-6 mx-auto text-yellow-500 mb-1" />
            <p className="text-xl font-bold text-foreground">%{accuracy}</p>
            <p className="text-xs text-muted-foreground">Doğruluk</p>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-card">
            <Zap className="w-6 h-6 mx-auto text-orange-500 mb-1" />
            <p className="text-xl font-bold text-foreground">{maxCombo}x</p>
            <p className="text-xs text-muted-foreground">Maks Kombo</p>
          </div>
        </div>

        <Button onClick={initializeGame} className="gap-2">
          <RefreshCw className="w-5 h-5" />
          Tekrar Oyna
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Game Stats */}
      <div className="flex justify-center gap-4 mb-6">
        <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-sm">
          <Clock className="w-4 h-4 text-blue-500" />
          <span className="font-bold text-foreground">{formatTime(timer)}</span>
        </div>
        <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-sm">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="font-bold text-foreground">{matchedPairs}/{gameWords.length}</span>
        </div>
        {combo > 1 && (
          <div className="flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full shadow-sm animate-pulse">
            <Zap className="w-4 h-4 text-orange-500" />
            <span className="font-bold text-orange-600">{combo}x Kombo!</span>
          </div>
        )}
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
        {/* English Column */}
        <div>
          <h3 className="text-center font-bold text-foreground mb-3 flex items-center justify-center gap-2">
            🇬🇧 İngilizce
          </h3>
          <div className="space-y-3">
            {englishCards.map(renderCard)}
          </div>
        </div>

        {/* Turkish Column */}
        <div>
          <h3 className="text-center font-bold text-foreground mb-3 flex items-center justify-center gap-2">
            🇹🇷 Türkçe
          </h3>
          <div className="space-y-3">
            {turkishCards.map(renderCard)}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <p className="text-center text-sm text-muted-foreground mt-6">
        İngilizce kelimeyi seç, sonra Türkçe karşılığını bul! 🎯
      </p>

      {/* Reset Button */}
      <div className="text-center mt-6">
        <Button variant="outline" onClick={initializeGame} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Yeni Oyun
        </Button>
      </div>
    </div>
  );
};
