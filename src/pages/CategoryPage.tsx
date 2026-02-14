import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCategory } from '@/data/vocabulary';
import { FlashCard } from '@/components/FlashCard';
import { QuizGame } from '@/components/QuizGame';
import { MatchingGame } from '@/components/MatchingGame';
import MemoryGame from '@/components/MemoryGame';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useCloudProgress } from '@/hooks/useCloudProgress';
import { ChevronLeft, ChevronRight, BookOpen, Gamepad2, Shuffle, Brain } from 'lucide-react';

type Mode = 'learn' | 'quiz' | 'match' | 'memory';

const CategoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const category = getCategory(id || '');
  const [mode, setMode] = useState<Mode>('learn');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const { markWordLearned, isWordLearned, addQuizScore } = useCloudProgress();

  // Scroll to top when category page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-muted-foreground mb-4">Kategori bulunamadı</p>
          <Button asChild>
            <Link to="/">Ana Sayfaya Dön</Link>
          </Button>
        </div>
      </div>
    );
  }

  const currentWord = category.words[currentWordIndex];

  const goToNext = () => {
    if (currentWordIndex < category.words.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
    }
  };

  const goToPrev = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(prev => prev - 1);
    }
  };

  const handleWordLearned = () => {
    markWordLearned(currentWord.id, category.id);
  };

  const handleQuizComplete = (score: number) => {
    addQuizScore(category.id, score);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 pb-20">
        {/* Category Header */}
        <div className="text-center mb-6">
          <div className={`inline-flex items-center gap-2 ${category.gradient} text-primary-foreground px-4 py-2 rounded-full text-lg font-bold mb-3`}>
            <span className="text-2xl">{category.icon}</span>
            {category.name}
          </div>
          <h2 className="text-xl text-muted-foreground">{category.nameTr}</h2>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          <Button
            variant={mode === 'learn' ? 'default' : 'outline'}
            onClick={() => setMode('learn')}
            className="gap-2"
            size="sm"
          >
            <BookOpen className="w-4 h-4" />
            Öğren
          </Button>
          <Button
            variant={mode === 'quiz' ? 'secondary' : 'outline'}
            onClick={() => setMode('quiz')}
            className="gap-2"
            size="sm"
          >
            <Gamepad2 className="w-4 h-4" />
            Quiz
          </Button>
          <Button
            variant={mode === 'match' ? 'secondary' : 'outline'}
            onClick={() => setMode('match')}
            className="gap-2"
            size="sm"
          >
            <Shuffle className="w-4 h-4" />
            Eşleştir
          </Button>
          <Button
            variant={mode === 'memory' ? 'secondary' : 'outline'}
            onClick={() => setMode('memory')}
            className="gap-2"
            size="sm"
          >
            <Brain className="w-4 h-4" />
            Hafıza
          </Button>
        </div>

        {/* Content based on mode */}
        {mode === 'learn' ? (
          <div>
            {/* Progress indicator */}
            <div className="flex justify-center items-center gap-2 mb-6">
              {category.words.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentWordIndex(index)}
                  className={`
                    w-3 h-3 rounded-full transition-all
                    ${index === currentWordIndex 
                      ? `${category.gradient} scale-125` 
                      : isWordLearned(category.words[index].id) 
                        ? 'bg-secondary' 
                        : 'bg-muted'
                    }
                  `}
                />
              ))}
            </div>

            {/* Flash Card */}
            <FlashCard 
              key={currentWord.id}
              word={currentWord}
              gradient={category.gradient}
              onLearned={handleWordLearned}
              isLearned={isWordLearned(currentWord.id)}
            />

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 max-w-xs mx-auto">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPrev}
                disabled={currentWordIndex === 0}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              
              <span className="text-muted-foreground font-medium">
                {currentWordIndex + 1} / {category.words.length}
              </span>
              
              <Button
                variant="outline"
                size="icon"
                onClick={goToNext}
                disabled={currentWordIndex === category.words.length - 1}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>

            {/* Word list preview */}
            <div className="mt-10">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                📝 Tüm Kelimeler
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {category.words.map((word, index) => (
                  <button
                    key={word.id}
                    onClick={() => setCurrentWordIndex(index)}
                    className={`
                      p-3 rounded-xl text-left transition-all hover:scale-105
                      ${index === currentWordIndex 
                        ? `${category.gradient} text-primary-foreground` 
                        : 'bg-card shadow-sm hover:shadow-card'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{word.emoji}</span>
                      <div>
                        <p className="font-bold text-sm">{word.english}</p>
                        <p className={`text-xs ${index === currentWordIndex ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                          {word.turkish}
                        </p>
                      </div>
                      {isWordLearned(word.id) && (
                        <span className="ml-auto text-lg">⭐</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : mode === 'quiz' ? (
          <QuizGame
            words={category.words}
            gradient={category.gradient}
            onComplete={handleQuizComplete}
          />
        ) : mode === 'match' ? (
          <MatchingGame
            words={category.words}
            gradient={category.gradient}
            onComplete={handleQuizComplete}
          />
        ) : (
          <MemoryGame
            words={category.words}
            gradient={category.gradient}
            onComplete={handleQuizComplete}
          />
        )}
      </main>
    </div>
  );
};

export default CategoryPage;
