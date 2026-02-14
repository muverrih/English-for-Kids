import { useState } from 'react';
import { badges } from '@/data/badges';
import { useCloudBadges } from '@/hooks/useCloudBadges';
import { BadgeDisplay } from './BadgeDisplay';
import { Button } from '@/components/ui/button';
import { ChevronRight, Trophy, Flame, BookOpen, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BadgeSection = () => {
  const { earnedBadges, isBadgeEarned, earnedBadgesCount, totalBadges, getNextBadges } = useCloudBadges();
  const [showAll, setShowAll] = useState(false);

  const earnedBadgesList = badges.filter(b => earnedBadges.includes(b.id));
  const nextBadges = getNextBadges();
  const progress = Math.round((earnedBadgesCount / totalBadges) * 100);

  const categoryIcons = {
    words: BookOpen,
    quiz: Trophy,
    streak: Flame,
    special: Star,
  };

  const categoryLabels = {
    words: 'Kelime Rozetleri',
    quiz: 'Quiz Rozetleri',
    streak: 'Seri Rozetleri',
    special: 'Özel Rozetler',
  };

  return (
    <section className="bg-card rounded-3xl p-6 shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          <h3 className="text-lg font-bold text-foreground">Rozetlerim</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {earnedBadgesCount}/{totalBadges}
          </span>
          <Link to="/badges">
            <Button variant="ghost" size="sm" className="gap-1">
              Tümü <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1 text-center">
          %{progress} tamamlandı
        </p>
      </div>

      {/* Earned Badges Preview */}
      {earnedBadgesList.length > 0 ? (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-foreground mb-3">Kazanılan Rozetler ✨</h4>
          <div className="flex flex-wrap gap-3">
            {earnedBadgesList.slice(0, showAll ? undefined : 6).map(badge => (
              <BadgeDisplay 
                key={badge.id} 
                badge={badge} 
                isEarned={true} 
                size="sm"
                showDetails={false}
              />
            ))}
            {!showAll && earnedBadgesList.length > 6 && (
              <button
                onClick={() => setShowAll(true)}
                className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                +{earnedBadgesList.length - 6}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-4 mb-4">
          <span className="text-4xl mb-2 block">🎯</span>
          <p className="text-sm text-muted-foreground">
            Henüz rozet kazanmadın. Öğrenmeye başla!
          </p>
        </div>
      )}

      {/* Next Badges to Earn */}
      {nextBadges.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Sıradaki Hedefler 🎯</h4>
          <div className="space-y-2">
            {nextBadges.map(badge => (
              <div 
                key={badge.id}
                className="flex items-center gap-3 p-2 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center text-xl opacity-50 grayscale`}>
                  {badge.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{badge.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
