import { useState, useEffect, useCallback } from 'react';
import { Word } from '@/data/vocabulary';
import { Button } from '@/components/ui/button';
import { MascotOwl } from './MascotOwl';
import { Check, X, Trophy, RotateCcw } from 'lucide-react';
import { soundManager } from '@/lib/sounds';

interface QuizGameProps {
  words: Word[];
  gradient: string;
  onComplete: (score: number) => void;
}

interface Question {
  word: Word;
  options: Word[];
  correctIndex: number;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const generateQuestions = (words: Word[], count: number = 5): Question[] => {
  const shuffledWords = shuffleArray(words);
  const questionWords = shuffledWords.slice(0, Math.min(count, words.length));
  
  return questionWords.map(word => {
    const otherWords = words.filter(w => w.id !== word.id);
    const wrongOptions = shuffleArray(otherWords).slice(0, 3);
    const allOptions = shuffleArray([word, ...wrongOptions]);
    const correctIndex = allOptions.findIndex(w => w.id === word.id);
    
    return {
      word,
      options: allOptions,
      correctIndex,
    };
  });
};

const ConfettiPiece = ({ delay, left }: { delay: number; left: number }) => {
  const colors = ['🌟', '⭐', '✨', '💫', '🎉', '🏆'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
  return (
    <div
      className="absolute text-3xl animate-confetti-fall pointer-events-none"
      style={{
        left: `${left}%`,
        top: '-30px',
        animationDelay: `${delay}s`,
        animationDuration: `${2 + Math.random() * 2}s`,
      }}
    >
      {randomColor}
    </div>
  );
};

export const QuizGame = ({ words, gradient, onComplete }: QuizGameProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [buttonAnimation, setButtonAnimation] = useState<Record<number, string>>({});
  const [showConfetti, setShowConfetti] = useState(false);

  const initQuiz = useCallback(() => {
    const newQuestions = generateQuestions(words);
    setQuestions(newQuestions);
    setCurrentIndex(0);
    setSelectedIndex(null);
    setScore(0);
    setShowResult(false);
    setIsCorrect(null);
    setIsFinished(false);
    setShowConfetti(false);
    soundManager.playPop();
  }, [words]);

  useEffect(() => {
    initQuiz();
  }, [initQuiz]);

  const currentQuestion = questions[currentIndex];

  const handleAnswer = (index: number) => {
    if (showResult) return;
    
    soundManager.playClick();
    setSelectedIndex(index);
    setShowResult(true);
    
    const correct = index === currentQuestion.correctIndex;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(prev => prev + 20);
      soundManager.playCorrect();
      soundManager.speak('Great!', 'en-US');
      setButtonAnimation({ [index]: 'animate-celebrate' });
    } else {
      soundManager.playWrong();
      setButtonAnimation({ 
        [index]: 'animate-shake',
        [currentQuestion.correctIndex]: 'animate-pulse-scale'
      });
    }
  };

  const handleNext = () => {
    soundManager.playPop();
    setButtonAnimation({});
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedIndex(null);
      setShowResult(false);
      setIsCorrect(null);
    } else {
      setIsFinished(true);
      setShowConfetti(true);
      soundManager.playLevelUp();
      onComplete(score);
    }
  };

  const speak = (text: string) => {
    soundManager.speakWithElevenLabs(text);
  };

  if (!currentQuestion && !isFinished) {
    return <div className="text-center">Yükleniyor...</div>;
  }

  if (isFinished) {
    const percentage = Math.round((score / (questions.length * 20)) * 100);
    let message = '';
    if (percentage >= 80) message = 'Harikasın! 🎉';
    else if (percentage >= 60) message = 'Çok iyi! 👏';
    else if (percentage >= 40) message = 'İyi gidiyorsun! 💪';
    else message = 'Tekrar deneyelim! 🌟';

    return (
      <div className="relative flex flex-col items-center justify-center min-h-[400px] animate-pop">
        {/* Confetti */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
            {[...Array(20)].map((_, i) => (
              <ConfettiPiece 
                key={i} 
                delay={Math.random() * 1} 
                left={Math.random() * 100} 
              />
            ))}
          </div>
        )}
        
        <MascotOwl size="lg" message={message} />
        
        <div className={`mt-8 ${gradient} rounded-3xl p-8 text-center shadow-glow animate-pulse-glow`}>
          <Trophy className="w-16 h-16 mx-auto text-primary-foreground mb-4 animate-bounce" />
          <h2 className="text-3xl font-bold text-primary-foreground mb-2">
            Quiz Tamamlandı!
          </h2>
          <p className="text-6xl font-black text-primary-foreground mb-2 animate-heartbeat">
            {score}
          </p>
          <p className="text-xl text-primary-foreground/80">
            {questions.length} sorudan {Math.round(score / 20)} doğru
          </p>
          <div className="flex justify-center gap-2 mt-4">
            {[...Array(Math.round(score / 20))].map((_, i) => (
              <span 
                key={i} 
                className="text-3xl animate-swing" 
                style={{ animationDelay: `${i * 150}ms` }}
              >
                ⭐
              </span>
            ))}
          </div>
        </div>

        <Button 
          variant="default" 
          size="lg" 
          onClick={initQuiz}
          className="mt-8 gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          Tekrar Oyna
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Soru {currentIndex + 1} / {questions.length}</span>
          <span className="flex items-center gap-1">
            Puan: <span className="text-primary font-bold">{score}</span>
          </span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full ${gradient} transition-all duration-500 ease-out`}
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className={`${gradient} rounded-3xl p-8 text-center shadow-card mb-6 hover:shadow-glow transition-shadow`}>
        <span className="text-8xl mb-4 block animate-jelly">
          {currentQuestion.word.emoji}
        </span>
        <p className="text-xl text-primary-foreground/80">
          Bu kelimenin İngilizcesi nedir?
        </p>
        <button 
          onClick={() => speak(currentQuestion.word.english)}
          className="mt-2 text-primary-foreground/60 hover:text-primary-foreground underline text-sm transition-colors flex items-center gap-1 mx-auto"
        >
          <span className="animate-pulse">🔊</span> Dinle
        </button>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedIndex === index;
          const isCorrectOption = index === currentQuestion.correctIndex;
          
          let buttonClass = 'bg-card text-foreground border-2 border-border hover:border-primary hover:shadow-soft';
          if (showResult) {
            if (isCorrectOption) {
              buttonClass = 'bg-secondary text-secondary-foreground border-2 border-secondary shadow-glow';
            } else if (isSelected && !isCorrectOption) {
              buttonClass = 'bg-destructive text-destructive-foreground border-2 border-destructive';
            }
          }

          return (
            <button
              key={option.id}
              onClick={() => handleAnswer(index)}
              disabled={showResult}
              className={`
                ${buttonClass}
                ${buttonAnimation[index] || ''}
                rounded-2xl p-4 text-lg font-bold transition-all
                ${showResult ? '' : 'hover:scale-105 active:scale-95'}
                ${isSelected ? 'ring-4 ring-ring' : ''}
                flex items-center justify-center gap-2
              `}
            >
              {showResult && isCorrectOption && <Check className="w-5 h-5" />}
              {showResult && isSelected && !isCorrectOption && <X className="w-5 h-5" />}
              {option.english}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {showResult && (
        <div className={`mt-6 p-4 rounded-2xl text-center animate-slide-up ${
          isCorrect ? 'bg-secondary/20' : 'bg-destructive/20'
        }`}>
          <p className={`text-xl font-bold mb-2 ${isCorrect ? 'animate-celebrate' : 'animate-shake'}`}>
            {isCorrect ? '🎉 Doğru!' : '😔 Yanlış!'}
          </p>
          <p className="text-muted-foreground">
            <span className="font-bold">{currentQuestion.word.english}</span> = {currentQuestion.word.turkish}
          </p>
          <Button 
            variant={isCorrect ? 'secondary' : 'default'} 
            size="lg" 
            onClick={handleNext}
            className="mt-4"
          >
            {currentIndex < questions.length - 1 ? 'Sonraki Soru →' : 'Sonuçları Gör 🏆'}
          </Button>
        </div>
      )}
    </div>
  );
};
