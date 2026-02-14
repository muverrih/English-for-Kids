import { Link } from 'react-router-dom';
import { Category } from '@/data/vocabulary';
import { useProgress } from '@/hooks/useProgress';

// Category images
import animalsImg from '@/assets/category-animals.webp';
import colorsImg from '@/assets/category-colors.webp';
import numbersImg from '@/assets/category-numbers.webp';
import fruitsImg from '@/assets/category-fruits.webp';
import familyImg from '@/assets/category-family.webp';
import bodyImg from '@/assets/category-body.webp';
import schoolImg from '@/assets/category-school.webp';
import foodImg from '@/assets/category-food.webp';
import clothesImg from '@/assets/category-clothes.webp';
import homeImg from '@/assets/category-home.webp';
import vehiclesImg from '@/assets/category-vehicles.webp';
import weatherImg from '@/assets/category-weather.webp';
import sportsImg from '@/assets/category-sports.webp';
import musicImg from '@/assets/category-music.webp';
import jobsImg from '@/assets/category-jobs.webp';
import natureImg from '@/assets/category-nature.webp';
import emotionsImg from '@/assets/category-emotions.webp';
import shapesImg from '@/assets/category-shapes.webp';
import vacationImg from '@/assets/category-vacation.webp';
import seasonsImg from '@/assets/category-seasons.webp';
import toysImg from '@/assets/category-toys.webp';
import daysImg from '@/assets/category-days.webp';
import kitchenImg from '@/assets/category-kitchen.webp';
import technologyImg from '@/assets/category-technology.webp';
import buildingsImg from '@/assets/category-buildings.webp';
import countriesImg from '@/assets/category-countries.webp';
import verbsImg from '@/assets/category-verbs.webp';

const categoryImages: Record<string, string> = {
  animals: animalsImg,
  colors: colorsImg,
  numbers: numbersImg,
  fruits: fruitsImg,
  family: familyImg,
  body: bodyImg,
  school: schoolImg,
  food: foodImg,
  clothes: clothesImg,
  home: homeImg,
  vehicles: vehiclesImg,
  weather: weatherImg,
  sports: sportsImg,
  music: musicImg,
  jobs: jobsImg,
  nature: natureImg,
  emotions: emotionsImg,
  shapes: shapesImg,
  vacation: vacationImg,
  seasons: seasonsImg,
  toys: toysImg,
  days: daysImg,
  kitchen: kitchenImg,
  technology: technologyImg,
  buildings: buildingsImg,
  countries: countriesImg,
  verbs: verbsImg,
};

interface CategoryCardProps {
  category: Category;
  index: number;
}

export const CategoryCard = ({ category, index }: CategoryCardProps) => {
  const { getCategoryProgress } = useProgress();
  const progress = getCategoryProgress(category.id, category.words.length);
  
  return (
    <Link
      to={`/category/${category.id}`}
      className={`
        group relative overflow-hidden rounded-[2rem] bg-card 
        shadow-card border-4 border-transparent
        transition-all duration-300 ease-out
        hover:scale-[1.08] hover:shadow-glow hover:-translate-y-1
        active:scale-[1.02]
        animate-pop cursor-pointer
      `}
      style={{ 
        animationDelay: `${index * 80}ms`,
      }}
    >
      {/* Fun background pattern */}
      <div className={`absolute inset-0 ${category.gradient} opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-300`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_-20%,hsl(var(--primary)/0.1)_0%,transparent_50%)]" />
      
      {/* Decorative corner shapes */}
      <div className={`absolute -top-4 -right-4 w-16 h-16 ${category.gradient} opacity-20 rounded-full blur-xl group-hover:opacity-30 transition-opacity`} />
      
      {/* Content */}
      <div className="relative p-5 flex flex-col items-center">
        {/* Image with bounce effect */}
        <div className="w-28 h-28 md:w-32 md:h-32 mb-4 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 group-hover:drop-shadow-lg">
          <img 
            src={categoryImages[category.id]} 
            alt={category.name}
            className="w-full h-full object-contain drop-shadow-md"
          />
        </div>
        
        {/* Text with better hierarchy */}
        <h3 className="text-xl md:text-2xl font-black text-foreground mb-0.5 tracking-tight">
          {category.name}
        </h3>
        <p className="text-sm font-medium text-muted-foreground">{category.nameTr}</p>
        
        {/* Colorful progress bar */}
        <div className="w-full mt-4">
          <div className="h-3 bg-muted/60 rounded-full overflow-hidden shadow-inner">
            <div 
              className={`h-full ${category.gradient} transition-all duration-500 rounded-full relative`}
              style={{ width: `${Math.max(progress, 5)}%` }}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </div>
          </div>
          <p className="text-xs font-bold text-muted-foreground mt-2 text-center">
            %{progress} tamamlandı ✨
          </p>
        </div>
        
        {/* Word count badge - more playful */}
        <div className={`absolute top-4 right-4 ${category.gradient} text-white text-xs font-black px-3 py-1.5 rounded-2xl shadow-md transform group-hover:scale-110 transition-transform`}>
          {category.words.length} 📚
        </div>
      </div>
    </Link>
  );
};
