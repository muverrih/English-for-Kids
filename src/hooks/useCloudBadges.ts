import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useCloudProgress } from './useCloudProgress';
import { badges, Badge } from '@/data/badges';
import { soundManager } from '@/lib/sounds';

interface BadgeNotification {
  badge: Badge;
  isNew: boolean;
}

const LOCAL_STORAGE_KEY = 'english-kids-badges';

export const useCloudBadges = () => {
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [newBadge, setNewBadge] = useState<BadgeNotification | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const { progress } = useCloudProgress();

  // Load badges from cloud or local storage
  useEffect(() => {
    const loadBadges = async () => {
      if (isAuthenticated && user) {
        try {
          const { data, error } = await supabase
            .from('user_badges')
            .select('badge_id')
            .eq('user_id', user.id);

          if (error) {
            console.error('Error loading badges:', error);
            loadFromLocalStorage();
          } else if (data) {
            const badgeIds = data.map((b) => b.badge_id);
            setEarnedBadges(badgeIds);

            // Sync local badges to cloud
            const localBadges = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (localBadges) {
              const local = JSON.parse(localBadges) as string[];
              const newBadgesToSync = local.filter((b) => !badgeIds.includes(b));
              
              if (newBadgesToSync.length > 0) {
                await Promise.all(
                  newBadgesToSync.map((badgeId) =>
                    supabase.from('user_badges').insert({
                      user_id: user.id,
                      badge_id: badgeId,
                    })
                  )
                );
                setEarnedBadges([...badgeIds, ...newBadgesToSync]);
              }
              localStorage.removeItem(LOCAL_STORAGE_KEY);
            }
          }
        } catch (error) {
          console.error('Error loading badges:', error);
          loadFromLocalStorage();
        }
      } else {
        loadFromLocalStorage();
      }
      setLoading(false);
    };

    const loadFromLocalStorage = () => {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        try {
          setEarnedBadges(JSON.parse(saved));
        } catch (e) {
          console.error('Error loading badges:', e);
        }
      }
    };

    loadBadges();
  }, [isAuthenticated, user]);

  const saveBadge = useCallback(async (badgeId: string) => {
    if (isAuthenticated && user) {
      try {
        await supabase.from('user_badges').insert({
          user_id: user.id,
          badge_id: badgeId,
        });
      } catch (error) {
        console.error('Error saving badge:', error);
      }
    } else {
      const current = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...current, badgeId]));
    }
  }, [isAuthenticated, user]);

  // Check for new badges
  const checkBadges = useCallback(async () => {
    for (const badge of badges) {
      if (earnedBadges.includes(badge.id)) continue;

      let earned = false;

      switch (badge.category) {
        case 'words':
          earned = progress.learnedWords.length >= badge.requirement;
          break;
        case 'quiz':
          const totalQuizzes = Object.values(progress.quizScores).flat().length;
          earned = totalQuizzes >= badge.requirement;
          break;
        case 'streak':
          earned = progress.dailyStreak >= badge.requirement;
          break;
        case 'special':
          // Handle special badges differently based on id
          if (badge.id.startsWith('star-')) {
            earned = progress.totalStars >= badge.requirement;
          } else if (badge.id === 'perfect-quiz') {
            const allScores = Object.values(progress.quizScores).flat();
            earned = allScores.some((s) => s === 100);
          } else if (badge.id === 'explorer' || badge.id === 'master-explorer') {
            const categoriesExplored = Object.keys(progress.categoryProgress).length;
            earned = categoriesExplored >= badge.requirement;
          } else if (badge.id === 'category-master') {
            // Check if any category has all words learned (simplified to 10+ words)
            earned = Object.values(progress.categoryProgress).some((count) => count >= 10);
          }
          break;
      }

      if (earned) {
        setEarnedBadges((prev) => [...prev, badge.id]);
        await saveBadge(badge.id);
        soundManager.playLevelUp();
        setNewBadge({ badge, isNew: true });
        break;
      }
    }
  }, [earnedBadges, progress, saveBadge]);

  // Check badges when progress changes
  useEffect(() => {
    if (!loading) {
      checkBadges();
    }
  }, [progress.learnedWords.length, progress.dailyStreak, progress.totalStars, loading]);

  const dismissBadgeNotification = useCallback(() => {
    setNewBadge(null);
  }, []);

  const isBadgeEarned = useCallback((badgeId: string) => {
    return earnedBadges.includes(badgeId);
  }, [earnedBadges]);

  const getEarnedBadges = useCallback(() => {
    return badges.filter((b) => earnedBadges.includes(b.id));
  }, [earnedBadges]);

  const getNextBadges = useCallback(() => {
    return badges.filter((b) => !earnedBadges.includes(b.id)).slice(0, 3);
  }, [earnedBadges]);

  const resetBadges = useCallback(async () => {
    setEarnedBadges([]);
    
    if (isAuthenticated && user) {
      try {
        await supabase
          .from('user_badges')
          .delete()
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error deleting badges:', error);
      }
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [isAuthenticated, user]);

  return {
    earnedBadges,
    earnedBadgesCount: earnedBadges.length,
    totalBadges: badges.length,
    newBadge,
    loading,
    dismissBadgeNotification,
    isBadgeEarned,
    getEarnedBadges,
    getNextBadges,
    resetBadges,
  };
};
