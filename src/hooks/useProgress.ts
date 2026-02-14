import { useState, useEffect, useCallback } from 'react';

export interface ProgressData {
  learnedWords: string[];
  categoryProgress: Record<string, number>;
  totalStars: number;
  dailyStreak: number;
  lastPlayDate: string;
  quizScores: Record<string, number[]>;
}

const STORAGE_KEY = 'english-kids-progress';

const getInitialProgress = (): ProgressData => ({
  learnedWords: [],
  categoryProgress: {},
  totalStars: 0,
  dailyStreak: 0,
  lastPlayDate: '',
  quizScores: {},
});

export const useProgress = () => {
  const [progress, setProgress] = useState<ProgressData>(getInitialProgress);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProgress(parsed);
        
        // Check daily streak
        const today = new Date().toDateString();
        const lastPlay = parsed.lastPlayDate;
        
        if (lastPlay && lastPlay !== today) {
          const lastDate = new Date(lastPlay);
          const todayDate = new Date(today);
          const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays > 1) {
            // Reset streak if more than 1 day passed
            setProgress(prev => ({ ...prev, dailyStreak: 0 }));
          }
        }
      } catch (e) {
        console.error('Error loading progress:', e);
      }
    }
  }, []);

  const saveProgress = useCallback((newProgress: ProgressData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
    setProgress(newProgress);
  }, []);

  const markWordLearned = useCallback((wordId: string, categoryId: string) => {
    setProgress(prev => {
      if (prev.learnedWords.includes(wordId)) return prev;
      
      const today = new Date().toDateString();
      const isNewDay = prev.lastPlayDate !== today;
      
      const newProgress: ProgressData = {
        ...prev,
        learnedWords: [...prev.learnedWords, wordId],
        categoryProgress: {
          ...prev.categoryProgress,
          [categoryId]: (prev.categoryProgress[categoryId] || 0) + 1,
        },
        totalStars: prev.totalStars + 1,
        dailyStreak: isNewDay ? prev.dailyStreak + 1 : prev.dailyStreak,
        lastPlayDate: today,
      };
      
      saveProgress(newProgress);
      return newProgress;
    });
  }, [saveProgress]);

  const addQuizScore = useCallback((categoryId: string, score: number) => {
    setProgress(prev => {
      const today = new Date().toDateString();
      const isNewDay = prev.lastPlayDate !== today;
      
      const categoryScores = prev.quizScores[categoryId] || [];
      const newProgress: ProgressData = {
        ...prev,
        quizScores: {
          ...prev.quizScores,
          [categoryId]: [...categoryScores, score],
        },
        totalStars: prev.totalStars + Math.floor(score / 10),
        dailyStreak: isNewDay ? prev.dailyStreak + 1 : prev.dailyStreak,
        lastPlayDate: today,
      };
      
      saveProgress(newProgress);
      return newProgress;
    });
  }, [saveProgress]);

  const getCategoryProgress = useCallback((categoryId: string, totalWords: number) => {
    const learned = progress.categoryProgress[categoryId] || 0;
    return Math.min(100, Math.round((learned / totalWords) * 100));
  }, [progress.categoryProgress]);

  const isWordLearned = useCallback((wordId: string) => {
    return progress.learnedWords.includes(wordId);
  }, [progress.learnedWords]);

  const resetProgress = useCallback(() => {
    const initial = getInitialProgress();
    saveProgress(initial);
  }, [saveProgress]);

  return {
    progress,
    markWordLearned,
    addQuizScore,
    getCategoryProgress,
    isWordLearned,
    resetProgress,
  };
};
