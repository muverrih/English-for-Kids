import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, LogIn, LogOut, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const { user, isAuthenticated, signOut } = useAuth();
  const { toast } = useToast();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data) {
          setDisplayName(data.display_name);
          setAvatarUrl(data.avatar_url);
        }
      }
    };

    loadProfile();
  }, [user]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: 'Hata',
        description: 'Çıkış yapılırken bir hata oluştu.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Görüşürüz! 👋',
        description: 'Başarıyla çıkış yaptın.',
      });
      navigate('/');
    }
  };

  const getInitials = () => {
    if (displayName) {
      return displayName.slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b-2 border-border/50 shadow-sm">
      <div className="container flex items-center justify-between h-18 px-4 py-3">
        <div className="flex items-center gap-3">
          {!isHome && (
            <Button 
              variant="ghost" 
              size="icon" 
              asChild
              className="rounded-2xl hover:bg-primary/10 hover:scale-110 transition-all"
            >
              <Link to="/">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
          )}
          <Link to="/" className="flex items-center gap-3 group">
            <span className="text-4xl group-hover:animate-wiggle transition-transform">🦉</span>
            <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              English for Kids
            </h1>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 px-3 py-2 rounded-2xl hover:bg-primary/10 transition-all"
                >
                  <Avatar className="w-9 h-9 border-2 border-primary/30 shadow-md">
                    <AvatarImage src={avatarUrl || undefined} alt="Profil" />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-sm font-black">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline max-w-[100px] truncate text-sm font-bold">
                    {displayName || user?.email?.split('@')[0]}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-2xl p-2 shadow-card border-2 border-border/50">
                <DropdownMenuItem 
                  onClick={() => navigate('/profile')}
                  className="rounded-xl py-3 px-4 cursor-pointer hover:bg-primary/10 font-semibold"
                >
                  <User className="w-5 h-5 mr-3" />
                  Profilim
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem 
                  onClick={handleSignOut} 
                  className="rounded-xl py-3 px-4 cursor-pointer text-destructive hover:bg-destructive/10 font-semibold"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Çıkış Yap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="default" 
              size="sm" 
              asChild
              className="rounded-2xl font-bold shadow-button hover:shadow-glow hover:scale-105 transition-all gap-2"
            >
              <Link to="/auth">
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Giriş</span>
              </Link>
            </Button>
          )}
          
          {!isHome && (
            <Button 
              variant="ghost" 
              size="icon" 
              asChild
              className="rounded-2xl hover:bg-primary/10 hover:scale-110 transition-all"
            >
              <Link to="/">
                <Home className="w-5 h-5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
