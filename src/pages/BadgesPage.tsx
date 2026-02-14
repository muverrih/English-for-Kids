import { Header } from '@/components/Header';
import { badges, getBadgesByCategory, Badge } from '@/data/badges';
import { useCloudBadges } from '@/hooks/useCloudBadges';
import { BadgeDisplay } from '@/components/BadgeDisplay';
import { Trophy, Flame, BookOpen, Star } from 'lucide-react';

const BadgesPage = () => {
  const { isBadgeEarned, earnedBadgesCount, totalBadges } = useCloudBadges();
  const progress = Math.round((earnedBadgesCount / totalBadges) * 100);

  const categories: { key: Badge['category']; label: string; icon: React.ElementType }[] = [
    { key: 'words', label: 'Kelime Rozetleri', icon: BookOpen },
    { key: 'quiz', label: 'Quiz Rozetleri', icon: Trophy },
    { key: 'streak', label: 'Seri Rozetleri', icon: Flame },
    { key: 'special', label: 'Özel Rozetler', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 pb-20">
        {/* Hero Section */}
        <section className="text-center mb-8">
          <div className="text-6xl mb-4 animate-bounce">🏆</div>
          <h2 className="text-2xl md:text-3xl font-black text-foreground mb-2">
            Rozet Koleksiyonu
          </h2>
          <p className="text-muted-foreground mb-4">
            Öğrendikçe rozet kazan ve koleksiyonunu tamamla!
          </p>

          {/* Overall Progress */}
          <div className="max-w-md mx-auto bg-card rounded-2xl p-4 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Toplam İlerleme</span>
              <span className="text-sm font-bold text-primary">{earnedBadgesCount}/{totalBadges}</span>
            </div>
            <div className="h-4 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary via-accent to-secondary transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {progress === 100 
                ? '🎉 Tebrikler! Tüm rozetleri kazandın!' 
                : `%${progress} tamamlandı - Devam et!`}
            </p>
          </div>
        </section>

        {/* Badge Categories */}
        {categories.map(({ key, label, icon: Icon }) => {
          const categoryBadges = getBadgesByCategory(key);
          const earnedInCategory = categoryBadges.filter(b => isBadgeEarned(b.id)).length;

          return (
            <section key={key} className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Icon className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">{label}</h3>
                <span className="text-sm text-muted-foreground">
                  ({earnedInCategory}/{categoryBadges.length})
                </span>
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {categoryBadges.map(badge => (
                  <BadgeDisplay
                    key={badge.id}
                    badge={badge}
                    isEarned={isBadgeEarned(badge.id)}
                    size="md"
                    showDetails={true}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {/* Motivation Section */}
        <section className="gradient-primary rounded-3xl p-6 text-center text-primary-foreground">
          <span className="text-4xl mb-2 block">💪</span>
          <h3 className="text-xl font-bold mb-2">Öğrenmeye Devam Et!</h3>
          <p className="text-primary-foreground/90">
            Her kelime, her quiz seni yeni rozetlere yaklaştırır. Koleksiyonunu tamamla!
          </p>
        </section>
      </main>
    </div>
  );
};

export default BadgesPage;
