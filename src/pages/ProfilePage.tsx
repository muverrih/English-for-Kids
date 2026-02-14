import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCloudProgress } from '@/hooks/useCloudProgress';
import { useCloudBadges } from '@/hooks/useCloudBadges';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  User, 
  Camera, 
  Loader2, 
  Star, 
  Flame, 
  BookOpen, 
  Trophy,
  Save
} from 'lucide-react';

const ProfilePage = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { progress, loading: progressLoading } = useCloudProgress();
  const { earnedBadges } = useCloudBadges();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!error && data) {
          setDisplayName(data.display_name || '');
          setAvatarUrl(data.avatar_url);
        }
      }
    };

    loadProfile();
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Hata',
        description: 'Lütfen bir resim dosyası seçin.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Hata',
        description: 'Dosya boyutu 2MB\'dan küçük olmalıdır.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const newAvatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      // Update profile
      await supabase
        .from('profiles')
        .update({ avatar_url: newAvatarUrl })
        .eq('user_id', user.id);

      setAvatarUrl(newAvatarUrl);
      
      toast({
        title: 'Başarılı! 📸',
        description: 'Profil fotoğrafın güncellendi.',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Hata',
        description: 'Fotoğraf yüklenirken bir hata oluştu.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Kaydedildi! ✅',
        description: 'Profil bilgilerin güncellendi.',
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Hata',
        description: 'Profil kaydedilirken bir hata oluştu.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || progressLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Profilim
          </h1>
        </div>

        {/* Profile Card */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profil Bilgileri
            </CardTitle>
            <CardDescription>
              Fotoğrafını ve ismini düzenle
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-primary/20">
                  <AvatarImage src={avatarUrl || undefined} alt="Profil" />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <label 
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Fotoğraf yüklemek için kameraya tıkla
              </p>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName">İsim</Label>
              <div className="flex gap-2">
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Adını gir"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-card"
                />
                <Button 
                  onClick={handleSaveProfile} 
                  disabled={isSaving}
                  size="icon"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label>E-posta</Label>
              <Input
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              İstatistikler
            </CardTitle>
            <CardDescription>
              Öğrenme yolculuğun
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl p-4 text-center">
                <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-black text-yellow-600 dark:text-yellow-400">
                  {progress.totalStars}
                </p>
                <p className="text-sm text-muted-foreground">Toplam Yıldız</p>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4 text-center">
                <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <p className="text-2xl font-black text-orange-600 dark:text-orange-400">
                  {progress.dailyStreak}
                </p>
                <p className="text-sm text-muted-foreground">Günlük Seri</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 text-center">
                <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                  {progress.learnedWords.length}
                </p>
                <p className="text-sm text-muted-foreground">Öğrenilen Kelime</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 text-center">
                <Trophy className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
                  {earnedBadges.length}
                </p>
                <p className="text-sm text-muted-foreground">Kazanılan Rozet</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* View Badges Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate('/badges')}
        >
          <Trophy className="w-4 h-4 mr-2" />
          Tüm Rozetleri Gör
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;
