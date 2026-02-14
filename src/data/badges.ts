export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'words' | 'quiz' | 'streak' | 'special';
  requirement: number;
  color: string;
}

export const badges: Badge[] = [
  // Kelime Rozetleri
  {
    id: 'first-word',
    name: 'İlk Adım',
    description: 'İlk kelimeni öğrendin!',
    icon: '🌱',
    category: 'words',
    requirement: 1,
    color: 'from-green-400 to-green-600',
  },
  {
    id: 'words-10',
    name: 'Kelime Avcısı',
    description: '10 kelime öğrendin!',
    icon: '📖',
    category: 'words',
    requirement: 10,
    color: 'from-blue-400 to-blue-600',
  },
  {
    id: 'words-25',
    name: 'Kelime Ustası',
    description: '25 kelime öğrendin!',
    icon: '📚',
    category: 'words',
    requirement: 25,
    color: 'from-purple-400 to-purple-600',
  },
  {
    id: 'words-50',
    name: 'Kelime Şampiyonu',
    description: '50 kelime öğrendin!',
    icon: '🏆',
    category: 'words',
    requirement: 50,
    color: 'from-yellow-400 to-yellow-600',
  },
  {
    id: 'words-100',
    name: 'Kelime Efsanesi',
    description: '100 kelime öğrendin!',
    icon: '👑',
    category: 'words',
    requirement: 100,
    color: 'from-amber-400 to-amber-600',
  },
  {
    id: 'words-200',
    name: 'Kelime İmparatoru',
    description: '200 kelime öğrendin!',
    icon: '🦁',
    category: 'words',
    requirement: 200,
    color: 'from-orange-400 to-red-600',
  },
  {
    id: 'words-300',
    name: 'Süper Beyin',
    description: '300 kelime öğrendin!',
    icon: '🧠',
    category: 'words',
    requirement: 300,
    color: 'from-pink-400 to-rose-600',
  },
  {
    id: 'words-400',
    name: 'Dil Dehası',
    description: '400 kelime öğrendin!',
    icon: '🌟',
    category: 'words',
    requirement: 400,
    color: 'from-indigo-400 to-violet-600',
  },

  // Quiz Rozetleri
  {
    id: 'first-quiz',
    name: 'İlk Quiz',
    description: 'İlk quizini tamamladın!',
    icon: '✨',
    category: 'quiz',
    requirement: 1,
    color: 'from-cyan-400 to-cyan-600',
  },
  {
    id: 'quiz-5',
    name: 'Quiz Meraklısı',
    description: '5 quiz tamamladın!',
    icon: '🎯',
    category: 'quiz',
    requirement: 5,
    color: 'from-teal-400 to-teal-600',
  },
  {
    id: 'quiz-10',
    name: 'Quiz Uzmanı',
    description: '10 quiz tamamladın!',
    icon: '🎓',
    category: 'quiz',
    requirement: 10,
    color: 'from-emerald-400 to-emerald-600',
  },
  {
    id: 'quiz-25',
    name: 'Quiz Kahramanı',
    description: '25 quiz tamamladın!',
    icon: '🦸',
    category: 'quiz',
    requirement: 25,
    color: 'from-violet-400 to-violet-600',
  },
  {
    id: 'quiz-50',
    name: 'Quiz Efendisi',
    description: '50 quiz tamamladın!',
    icon: '🏅',
    category: 'quiz',
    requirement: 50,
    color: 'from-fuchsia-400 to-fuchsia-600',
  },

  // Seri Rozetleri
  {
    id: 'streak-3',
    name: '3 Günlük Seri',
    description: '3 gün üst üste öğrendin!',
    icon: '🔥',
    category: 'streak',
    requirement: 3,
    color: 'from-orange-400 to-orange-600',
  },
  {
    id: 'streak-7',
    name: 'Haftalık Seri',
    description: '7 gün üst üste öğrendin!',
    icon: '⚡',
    category: 'streak',
    requirement: 7,
    color: 'from-yellow-400 to-orange-600',
  },
  {
    id: 'streak-14',
    name: '2 Haftalık Seri',
    description: '14 gün üst üste öğrendin!',
    icon: '💪',
    category: 'streak',
    requirement: 14,
    color: 'from-red-400 to-red-600',
  },
  {
    id: 'streak-30',
    name: 'Aylık Seri',
    description: '30 gün üst üste öğrendin!',
    icon: '🌈',
    category: 'streak',
    requirement: 30,
    color: 'from-pink-400 to-purple-600',
  },

  // Özel Rozetler
  {
    id: 'perfect-quiz',
    name: 'Mükemmel Quiz',
    description: 'Bir quizi %100 doğru tamamladın!',
    icon: '💯',
    category: 'special',
    requirement: 100,
    color: 'from-yellow-400 to-amber-600',
  },
  {
    id: 'star-50',
    name: 'Yıldız Toplayıcı',
    description: '50 yıldız topladın!',
    icon: '⭐',
    category: 'special',
    requirement: 50,
    color: 'from-yellow-300 to-yellow-500',
  },
  {
    id: 'star-100',
    name: 'Yıldız Avcısı',
    description: '100 yıldız topladın!',
    icon: '🌟',
    category: 'special',
    requirement: 100,
    color: 'from-amber-300 to-amber-500',
  },
  {
    id: 'star-250',
    name: 'Süper Yıldız',
    description: '250 yıldız topladın!',
    icon: '✨',
    category: 'special',
    requirement: 250,
    color: 'from-orange-300 to-orange-500',
  },
  {
    id: 'explorer',
    name: 'Kaşif',
    description: '5 farklı kategoriyi keşfettin!',
    icon: '🗺️',
    category: 'special',
    requirement: 5,
    color: 'from-sky-400 to-sky-600',
  },
  {
    id: 'master-explorer',
    name: 'Büyük Kaşif',
    description: '10 farklı kategoriyi keşfettin!',
    icon: '🧭',
    category: 'special',
    requirement: 10,
    color: 'from-indigo-400 to-indigo-600',
  },
  {
    id: 'category-master',
    name: 'Kategori Ustası',
    description: 'Bir kategoriyi tamamladın!',
    icon: '🎖️',
    category: 'special',
    requirement: 1,
    color: 'from-rose-400 to-rose-600',
  },
];

export const getBadgeById = (id: string): Badge | undefined => {
  return badges.find(badge => badge.id === id);
};

export const getBadgesByCategory = (category: Badge['category']): Badge[] => {
  return badges.filter(badge => badge.category === category);
};
