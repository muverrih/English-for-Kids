import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCloudProgress } from '@/hooks/useCloudProgress';
import { useCloudBadges } from '@/hooks/useCloudBadges';
import { categories } from '@/data/vocabulary';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, Clock, Star, BookOpen, Trophy, 
  RotateCcw, ChevronRight, Shield, Volume2, VolumeX, Award
} from 'lucide-react';
import { soundManager } from '@/lib/sounds';

const ParentPanel = () => {
  const { progress, resetProgress } = useCloudProgress();
  const { earnedBadgesCount, totalBadges, resetBadges } = useCloudBadges();
  const [isMuted, setIsMuted] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    soundManager.setMuted(newMuted);
  };

  const handleReset = () => {
    resetProgress();
    resetBadges();
    setShowResetConfirm(false);
  };

  const totalWords = categories.reduce((acc, cat) => acc + cat.words.length, 0);
  const learnedPercentage = Math.round((progress.learnedWords.length / totalWords) * 100);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 pb-20">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Ebeveyn Paneli</h1>
        </div>

        {/* Stats Overview */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-2xl p-4 shadow-card">
            <Star className="w-8 h-8 text-yellow-500 mb-2" />
            <p className="text-3xl font-bold text-foreground">{progress.totalStars}</p>
            <p className="text-sm text-muted-foreground">Toplam Yıldız</p>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-card">
            <BookOpen className="w-8 h-8 text-blue-500 mb-2" />
            <p className="text-3xl font-bold text-foreground">{progress.learnedWords.length}</p>
            <p className="text-sm text-muted-foreground">Öğrenilen Kelime</p>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-card">
            <Trophy className="w-8 h-8 text-purple-500 mb-2" />
            <p className="text-3xl font-bold text-foreground">
              {Object.values(progress.quizScores).flat().length}
            </p>
            <p className="text-sm text-muted-foreground">Tamamlanan Quiz</p>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-card">
            <Clock className="w-8 h-8 text-green-500 mb-2" />
            <p className="text-3xl font-bold text-foreground">{progress.dailyStreak}</p>
            <p className="text-sm text-muted-foreground">Günlük Seri</p>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-card col-span-2 md:col-span-4">
            <Link to="/badges" className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-amber-500" />
                <div>
                  <p className="text-3xl font-bold text-foreground">{earnedBadgesCount}/{totalBadges}</p>
                  <p className="text-sm text-muted-foreground">Kazanılan Rozetler</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-muted-foreground" />
            </Link>
          </div>
        </section>

        {/* Overall Progress */}
        <section className="bg-card rounded-2xl p-6 shadow-card mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Genel İlerleme
          </h2>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Toplam ilerleme</span>
              <span className="font-bold text-primary">{learnedPercentage}%</span>
            </div>
            <div className="h-4 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full gradient-primary transition-all duration-500"
                style={{ width: `${learnedPercentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {progress.learnedWords.length} / {totalWords} kelime öğrenildi
            </p>
          </div>
        </section>

        {/* Category Progress */}
        <section className="bg-card rounded-2xl p-6 shadow-card mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4">Kategori İlerlemesi</h2>
          <div className="space-y-4">
            {categories.map(category => {
              const learned = progress.categoryProgress[category.id] || 0;
              const percentage = Math.round((learned / category.words.length) * 100);
              
              return (
                <Link 
                  key={category.id}
                  to={`/category/${category.id}`}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <span className="text-2xl">{category.icon}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-foreground">{category.name}</span>
                      <span className="text-sm text-muted-foreground">{learned}/{category.words.length}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${category.gradient} transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </Link>
              );
            })}
          </div>
        </section>

        {/* Settings */}
        <section className="bg-card rounded-2xl p-6 shadow-card">
          <h2 className="text-lg font-bold text-foreground mb-4">Ayarlar</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div className="flex items-center gap-3">
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                <span>Ses Efektleri</span>
              </div>
              <Button variant="outline" size="sm" onClick={toggleMute}>
                {isMuted ? 'Aç' : 'Kapat'}
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div className="flex items-center gap-3">
                <RotateCcw className="w-5 h-5" />
                <span>İlerlemeyi Sıfırla</span>
              </div>
              {showResetConfirm ? (
                <div className="flex gap-2">
                  <Button variant="destructive" size="sm" onClick={handleReset}>Evet</Button>
                  <Button variant="outline" size="sm" onClick={() => setShowResetConfirm(false)}>İptal</Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setShowResetConfirm(true)}>Sıfırla</Button>
              )}
            </div>
          </div>
        </section>

        <div className="mt-8 text-center">
          <Button asChild variant="default" size="lg">
            <Link to="/">← Ana Sayfaya Dön</Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ParentPanel;
