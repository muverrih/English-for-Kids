import { Link } from 'react-router-dom';
import { categories } from '@/data/vocabulary';
import { CategoryCard } from '@/components/CategoryCard';
import { ProgressStats } from '@/components/ProgressStats';
import { MascotOwl } from '@/components/MascotOwl';
import { Header } from '@/components/Header';
import { BadgeSection } from '@/components/BadgeSection';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogIn, Cloud } from 'lucide-react';

const Index = () => {
  const { isAuthenticated, loading } = useAuth();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Fun background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-40 right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-float delay-500" />
        <div className="absolute bottom-40 left-1/4 w-36 h-36 bg-secondary/10 rounded-full blur-3xl animate-float delay-300" />
      </div>
      
      <Header />
      
      <main className="container px-4 py-8 pb-24 relative z-10">
        {/* Hero Section */}
        <section className="text-center mb-10">
          <MascotOwl size="lg" message="Merhaba! 🎉 İngilizce öğrenmeye hazır mısın?" />
          
          <h2 className="text-3xl md:text-4xl font-black text-foreground mt-8 mb-3 animate-pop">
            Eğlenerek İngilizce Öğren! 
            <span className="inline-block animate-bounce-slow ml-2">🚀</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Kelimeler, oyunlar ve quizlerle İngilizce öğrenmek çok kolay ve eğlenceli!
          </p>
        </section>

        {/* Cloud Sync Banner for non-authenticated users */}
        {!loading && !isAuthenticated && (
          <section className="mb-10 animate-slide-up">
            <div className="relative overflow-hidden bg-gradient-to-r from-primary/15 via-accent/15 to-secondary/15 rounded-[2rem] p-5 flex items-center justify-between gap-4 border-2 border-primary/20 shadow-card">
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
              
              <div className="flex items-center gap-4 relative">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-3xl animate-bounce-slow">
                  ☁️
                </div>
                <div>
                  <p className="font-black text-lg text-foreground">İlerlemeni Kaydet!</p>
                  <p className="text-sm text-muted-foreground font-medium">
                    Giriş yap ve ilerlemenin hiç kaybolmasın ✨
                  </p>
                </div>
              </div>
              <Button asChild size="lg" className="gap-2 shrink-0 rounded-2xl font-bold shadow-button hover:shadow-glow transition-all">
                <Link to="/auth">
                  <LogIn className="w-5 h-5" />
                  Giriş Yap
                </Link>
              </Button>
            </div>
          </section>
        )}

        {/* Progress Stats */}
        <section className="mb-10">
          <ProgressStats />
        </section>

        {/* Badges Section */}
        <section className="mb-10">
          <BadgeSection />
        </section>

        {/* Categories Grid */}
        <section>
          <h3 className="text-2xl font-black text-foreground mb-6 flex items-center gap-3">
            <span className="text-3xl">📚</span>
            Kategoriler
            <span className="text-sm font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full">
              {categories.length} adet
            </span>
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {categories.map((category, index) => (
              <CategoryCard key={category.id} category={category} index={index} />
            ))}
          </div>
        </section>

        {/* Fun Fact Section */}
        <section className="mt-12 relative overflow-hidden bg-gradient-to-r from-accent via-primary/80 to-secondary rounded-[2rem] p-8 text-center shadow-glow animate-pop">
          {/* Decorative bubbles */}
          <div className="absolute top-4 left-8 text-4xl animate-float">💡</div>
          <div className="absolute bottom-4 right-8 text-3xl animate-float delay-300">🌟</div>
          
          <h3 className="text-2xl font-black text-white mb-3 drop-shadow-md">
            Biliyor musun?
          </h3>
          <p className="text-white/95 font-semibold text-lg max-w-md mx-auto drop-shadow-sm">
            Her gün 5 yeni kelime öğrenirsen, bir yılda <span className="font-black">1825</span> kelime öğrenmiş olursun! 🎯
          </p>
        </section>
      </main>
    </div>
  );
};

export default Index;
