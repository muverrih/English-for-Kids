import { useCloudProgress } from '@/hooks/useCloudProgress';
import { Star, Flame, BookOpen, Trophy } from 'lucide-react';

export const ProgressStats = () => {
  const { progress } = useCloudProgress();

  const stats = [
    {
      icon: Star,
      value: progress.totalStars,
      label: 'Yıldız',
      emoji: '⭐',
      gradient: 'from-yellow-400 to-orange-400',
      bgGradient: 'from-yellow-100 to-orange-100',
      darkBgGradient: 'dark:from-yellow-900/30 dark:to-orange-900/30',
    },
    {
      icon: Flame,
      value: progress.dailyStreak,
      label: 'Günlük Seri',
      emoji: '🔥',
      gradient: 'from-orange-400 to-red-400',
      bgGradient: 'from-orange-100 to-red-100',
      darkBgGradient: 'dark:from-orange-900/30 dark:to-red-900/30',
    },
    {
      icon: BookOpen,
      value: progress.learnedWords.length,
      label: 'Kelime',
      emoji: '📖',
      gradient: 'from-blue-400 to-cyan-400',
      bgGradient: 'from-blue-100 to-cyan-100',
      darkBgGradient: 'dark:from-blue-900/30 dark:to-cyan-900/30',
    },
    {
      icon: Trophy,
      value: Object.values(progress.quizScores).flat().length,
      label: 'Quiz',
      emoji: '🏆',
      gradient: 'from-purple-400 to-pink-400',
      bgGradient: 'from-purple-100 to-pink-100',
      darkBgGradient: 'dark:from-purple-900/30 dark:to-pink-900/30',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
      {stats.map((stat, index) => (
        <div 
          key={stat.label}
          className={`
            relative overflow-hidden rounded-3xl p-4 md:p-5 text-center
            bg-gradient-to-br ${stat.bgGradient} ${stat.darkBgGradient}
            border-2 border-white/50 dark:border-white/10
            shadow-card hover:shadow-glow
            transform hover:scale-105 hover:-translate-y-1
            transition-all duration-300 cursor-default
            animate-pop
          `}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Decorative background circle */}
          <div className={`absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br ${stat.gradient} opacity-20 rounded-full blur-xl`} />
          
          {/* Emoji icon */}
          <div className="text-3xl md:text-4xl mb-2 animate-bounce-slow" style={{ animationDelay: `${index * 200}ms` }}>
            {stat.emoji}
          </div>
          
          {/* Value with gradient text */}
          <p className={`text-3xl md:text-4xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
            {stat.value}
          </p>
          
          {/* Label */}
          <p className="text-xs md:text-sm font-bold text-muted-foreground mt-1">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
};
