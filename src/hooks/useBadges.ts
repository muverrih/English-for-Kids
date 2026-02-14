import { useState, useEffect, useCallback } from 'react';
import { badges, Badge } from '@/data/badges';
import { useProgress } from './useProgress';
import { soundManager } from '@/lib/sounds';

const BADGES_STORAGE_KEY = 'english-kids-badges';

export interface BadgeNotification {
  badge: Badge;
  isNew: boolean;
}

export const useBadges = () => {
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [newBadge, setNewBadge] = useState<BadgeNotification | null>(null);
  const { progress } = useProgress();

  // Load earned badges from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(BADGES_STORAGE_KEY);
    if (saved) {
      try {
        setEarnedBadges(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading badges:', e);
      }
    }
  }, []);

  // Save badges to localStorage
  const saveBadges = useCallback((newBadges: string[]) => {
    localStorage.setItem(BADGES_STORAGE_KEY, JSON.stringify(newBadges));
    setEarnedBadges(newBadges);
  }, []);

  // Check and award badges based on progress
  const checkBadges = useCallback(() => {
    const newEarnedBadges: string[] = [...earnedBadges];
    let latestNewBadge: Badge | null = null;

    const totalQuizzes = Object.values(progress.quizScores).flat().length;
    const perfectQuizzes = Object.values(progress.quizScores).flat().filter(score => score === 100).length;
    const categoriesExplored = Object.keys(progress.categoryProgress).length;
    const completedCategories = Object.values(progress.categoryProgress).filter(count => count >= 20).length;

    badges.forEach(badge => {
      if (newEarnedBadges.includes(badge.id)) return;

      let earned = false;

      switch (badge.category) {
        case 'words':
          earned = progress.learnedWords.length >= badge.requirement;
          break;
        case 'quiz':
          earned = totalQuizzes >= badge.requirement;
          break;
        case 'streak':
          earned = progress.dailyStreak >= badge.requirement;
          break;
        case 'special':
          if (badge.id === 'perfect-quiz') {
            earned = perfectQuizzes >= 1;
          } else if (badge.id.startsWith('star-')) {
            earned = progress.totalStars >= badge.requirement;
          } else if (badge.id === 'explorer') {
            earned = categoriesExplored >= badge.requirement;
          } else if (badge.id === 'master-explorer') {
            earned = categoriesExplored >= badge.requirement;
          } else if (badge.id === 'category-master') {
            earned = completedCategories >= badge.requirement;
          }
          break;
      }

      if (earned) {
        newEarnedBadges.push(badge.id);
        latestNewBadge = badge;
      }
    });

    if (newEarnedBadges.length > earnedBadges.length) {
      saveBadges(newEarnedBadges);
      
      if (latestNewBadge) {
        soundManager.playLevelUp();
        setNewBadge({ badge: latestNewBadge, isNew: true });
      }
    }
  }, [earnedBadges, progress, saveBadges]);

  // Check badges whenever progress changes
  useEffect(() => {
    checkBadges();
  }, [progress.learnedWords.length, progress.totalStars, progress.dailyStreak, checkBadges]);

  const dismissBadgeNotification = useCallback(() => {
    setNewBadge(null);
  }, []);

  const isBadgeEarned = useCallback((badgeId: string) => {
    return earnedBadges.includes(badgeId);
  }, [earnedBadges]);

  const getEarnedBadges = useCallback(() => {
    return badges.filter(badge => earnedBadges.includes(badge.id));
  }, [earnedBadges]);

  const getNextBadges = useCallback(() => {
    return badges.filter(badge => !earnedBadges.includes(badge.id)).slice(0, 3);
  }, [earnedBadges]);

  const resetBadges = useCallback(() => {
    localStorage.removeItem(BADGES_STORAGE_KEY);
    setEarnedBadges([]);
  }, []);

  return {
    earnedBadges,
    newBadge,
    dismissBadgeNotification,
    isBadgeEarned,
    getEarnedBadges,
    getNextBadges,
    resetBadges,
    totalBadges: badges.length,
    earnedCount: earnedBadges.length,
  };
};
