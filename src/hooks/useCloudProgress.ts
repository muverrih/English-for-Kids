import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface CloudProgressData {
  learnedWords: string[];
  categoryProgress: Record<string, number>;
  totalStars: number;
  dailyStreak: number;
  lastPlayDate: string;
  quizScores: Record<string, number[]>;
}

const LOCAL_STORAGE_KEY = 'english-kids-progress';

const getInitialProgress = (): CloudProgressData => ({
  learnedWords: [],
  categoryProgress: {},
  totalStars: 0,
  dailyStreak: 0,
  lastPlayDate: '',
  quizScores: {},
});

export const useCloudProgress = () => {
  const [progress, setProgress] = useState<CloudProgressData>(getInitialProgress);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  // Load progress from cloud or local storage
  useEffect(() => {
    const loadProgress = async () => {
      if (isAuthenticated && user) {
        // Load from cloud
        try {
          const { data, error } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          if (error) {
            console.error('Error loading progress:', error);
            loadFromLocalStorage();
          } else if (data) {
            // Load quiz scores separately
            const { data: quizData } = await supabase
              .from('user_quiz_scores')
              .select('*')
              .eq('user_id', user.id);

            const quizScores: Record<string, number[]> = {};
            if (quizData) {
              quizData.forEach((score) => {
                if (!quizScores[score.category_id]) {
                  quizScores[score.category_id] = [];
                }
                quizScores[score.category_id].push(score.score);
              });
            }

            setProgress({
              learnedWords: data.learned_words || [],
              categoryProgress: (data.category_progress as Record<string, number>) || {},
              totalStars: data.total_stars || 0,
              dailyStreak: data.daily_streak || 0,
              lastPlayDate: data.last_play_date || '',
              quizScores,
            });

            // Sync local progress to cloud if exists
            const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (localData) {
              const local = JSON.parse(localData) as CloudProgressData;
              // If local has more progress, merge it
              if (local.learnedWords.length > (data.learned_words?.length || 0)) {
                await mergeProgressToCloud(local, user.id);
              }
              // Clear local storage after merge
              localStorage.removeItem(LOCAL_STORAGE_KEY);
            }
          } else {
            // No cloud data, check local storage
            loadFromLocalStorage();
          }
        } catch (error) {
          console.error('Error loading progress:', error);
          loadFromLocalStorage();
        }
      } else {
        // Not authenticated, use local storage
        loadFromLocalStorage();
      }
      setLoading(false);
    };

    const loadFromLocalStorage = () => {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
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
              setProgress((prev) => ({ ...prev, dailyStreak: 0 }));
            }
          }
        } catch (e) {
          console.error('Error loading progress:', e);
        }
      }
    };

    loadProgress();
  }, [isAuthenticated, user]);

  const mergeProgressToCloud = async (localProgress: CloudProgressData, userId: string) => {
    try {
      await supabase
        .from('user_progress')
        .update({
          learned_words: localProgress.learnedWords,
          category_progress: localProgress.categoryProgress,
          total_stars: localProgress.totalStars,
          daily_streak: localProgress.dailyStreak,
          last_play_date: localProgress.lastPlayDate || null,
        })
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error merging progress:', error);
    }
  };

  const saveProgress = useCallback(async (newProgress: CloudProgressData) => {
    setProgress(newProgress);
    
    if (isAuthenticated && user) {
      // Save to cloud
      try {
        await supabase
          .from('user_progress')
          .update({
            learned_words: newProgress.learnedWords,
            category_progress: newProgress.categoryProgress,
            total_stars: newProgress.totalStars,
            daily_streak: newProgress.dailyStreak,
            last_play_date: newProgress.lastPlayDate || null,
          })
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error saving progress:', error);
      }
    } else {
      // Save to local storage
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newProgress));
    }
  }, [isAuthenticated, user]);

  const markWordLearned = useCallback(async (wordId: string, categoryId: string) => {
    if (progress.learnedWords.includes(wordId)) return;
    
    const today = new Date().toDateString();
    const isNewDay = progress.lastPlayDate !== today;
    
    const newProgress: CloudProgressData = {
      ...progress,
      learnedWords: [...progress.learnedWords, wordId],
      categoryProgress: {
        ...progress.categoryProgress,
        [categoryId]: (progress.categoryProgress[categoryId] || 0) + 1,
      },
      totalStars: progress.totalStars + 1,
      dailyStreak: isNewDay ? progress.dailyStreak + 1 : progress.dailyStreak,
      lastPlayDate: today,
    };
    
    await saveProgress(newProgress);
  }, [progress, saveProgress]);

  const addQuizScore = useCallback(async (categoryId: string, score: number) => {
    const today = new Date().toDateString();
    const isNewDay = progress.lastPlayDate !== today;
    
    const categoryScores = progress.quizScores[categoryId] || [];
    const newProgress: CloudProgressData = {
      ...progress,
      quizScores: {
        ...progress.quizScores,
        [categoryId]: [...categoryScores, score],
      },
      totalStars: progress.totalStars + Math.floor(score / 10),
      dailyStreak: isNewDay ? progress.dailyStreak + 1 : progress.dailyStreak,
      lastPlayDate: today,
    };
    
    await saveProgress(newProgress);

    // Save quiz score to cloud
    if (isAuthenticated && user) {
      try {
        await supabase
          .from('user_quiz_scores')
          .insert({
            user_id: user.id,
            category_id: categoryId,
            score,
          });
      } catch (error) {
        console.error('Error saving quiz score:', error);
      }
    }
  }, [progress, saveProgress, isAuthenticated, user]);

  const getCategoryProgress = useCallback((categoryId: string, totalWords: number) => {
    const learned = progress.categoryProgress[categoryId] || 0;
    return Math.min(100, Math.round((learned / totalWords) * 100));
  }, [progress.categoryProgress]);

  const isWordLearned = useCallback((wordId: string) => {
    return progress.learnedWords.includes(wordId);
  }, [progress.learnedWords]);

  const resetProgress = useCallback(async () => {
    const initial = getInitialProgress();
    await saveProgress(initial);
    
    // Also delete quiz scores from cloud
    if (isAuthenticated && user) {
      try {
        await supabase
          .from('user_quiz_scores')
          .delete()
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error deleting quiz scores:', error);
      }
    }
  }, [saveProgress, isAuthenticated, user]);

  return {
    progress,
    loading,
    markWordLearned,
    addQuizScore,
    getCategoryProgress,
    isWordLearned,
    resetProgress,
  };
};
