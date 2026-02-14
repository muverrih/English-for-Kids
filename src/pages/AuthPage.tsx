import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, User, Loader2, ArrowLeft } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Geçerli bir e-posta adresi girin');
const passwordSchema = z.string().min(6, 'Şifre en az 6 karakter olmalıdır');

type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

// Basic SVG Google Icon
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-1.5c-1 0-1.5.5-1.5 1.5V12h3l-.5 3h-2.5v6.8A10.04 10.04 0 0 0 22 12z"/>
    </svg>
);

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const urlMode = searchParams.get('mode');
  
  const [mode, setMode] = useState<AuthMode>(urlMode === 'reset' ? 'reset' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});
  
  const { signIn, signUp, resetPassword, updatePassword, isAuthenticated, loading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && isAuthenticated && mode !== 'reset') {
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate, mode]);

  useEffect(() => {
    if (urlMode === 'reset') {
      setMode('reset');
    }
  }, [urlMode]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; confirmPassword?: string } = {};
    if (mode !== 'reset') {
      const emailResult = emailSchema.safeParse(email);
      if (!emailResult.success) {
        newErrors.email = emailResult.error.errors[0].message;
      }
    }
    if (mode === 'login' || mode === 'register' || mode === 'reset') {
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        newErrors.password = passwordResult.error.errors[0].message;
      }
    }
    if (mode === 'reset' && password !== confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast({
        title: 'Google ile Giriş Başarısız',
        description: error.message,
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          toast({ title: 'Giriş Başarısız', description: 'E-posta veya şifre hatalı.', variant: 'destructive' });
        } else {
          toast({ title: 'Hoş Geldin! 🎉', description: 'Başarıyla giriş yaptın!' });
          navigate('/');
        }
      } else if (mode === 'register') {
        const { error } = await signUp(email, password, displayName);
        if (error) {
          toast({ title: 'Kayıt Başarısız', description: 'Bu e-posta adresi zaten kayıtlı.', variant: 'destructive' });
        } else {
          toast({ title: 'Kayıt Başarılı! 🎉', description: 'Hesabın oluşturuldu. Hoş geldin!' });
          navigate('/');
        }
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) {
          toast({ title: 'Hata', description: error.message, variant: 'destructive' });
        } else {
          toast({ title: 'E-posta Gönderildi! 📧', description: 'Şifre sıfırlama bağlantısı gönderildi.' });
          setMode('login');
        }
      } else if (mode === 'reset') {
        const { error } = await updatePassword(password);
        if (error) {
          toast({ title: 'Hata', description: error.message, variant: 'destructive' });
        } else {
          toast({ title: 'Şifre Güncellendi! 🎉', description: 'Yeni şifrenle giriş yapabilirsin.' });
          navigate('/');
        }
      }
    } catch (error) {
      toast({ title: 'Hata', description: 'Bir şeyler yanlış gitti.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !isSubmitting) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Hesabına giriş yap';
      case 'register': return 'Yeni hesap oluştur';
      case 'forgot': return 'Şifreni sıfırla';
      case 'reset': return 'Yeni şifre belirle';
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-card">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">🦉</div>
          <CardTitle className="text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">English for Kids</CardTitle>
          <CardDescription>{getTitle()}</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <GoogleIcon className="w-4 h-4 mr-2"/>}
              Google ile Devam Et
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Veya e-posta ile devam et</span>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="flex items-center gap-2"><User className="w-4 h-4" />İsim</Label>
                  <Input id="displayName" type="text" placeholder="Adını gir" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="bg-card"/>
                </div>
              )}
              {mode !== 'reset' && (
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2"><Mail className="w-4 h-4" />E-posta</Label>
                  <Input id="email" type="email" placeholder="ornek@email.com" value={email} onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }} className={`bg-card ${errors.email ? 'border-destructive' : ''}`}/>
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
              )}
              {(mode === 'login' || mode === 'register' || mode === 'reset') && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2"><Lock className="w-4 h-4" />{mode === 'reset' ? 'Yeni Şifre' : 'Şifre'}</Label>
                  <Input id="password" type="password" placeholder="••••••" value={password} onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }} className={`bg-card ${errors.password ? 'border-destructive' : ''}`}/>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>
              )}
              {mode === 'reset' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="flex items-center gap-2"><Lock className="w-4 h-4" />Şifreyi Onayla</Label>
                  <Input id="confirmPassword" type="password" placeholder="••••••" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: undefined })); }} className={`bg-card ${errors.confirmPassword ? 'border-destructive' : ''}`}/>
                  {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                </div>
              )}
              <Button type="submit" className="w-full font-bold" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Yükleniyor...</> : (mode === 'login' ? 'Giriş Yap' : (mode === 'register' ? 'Kayıt Ol' : 'Gönder'))}
              </Button>
            </form>
          </div>
          
          <div className="mt-6 space-y-2 text-center">
            {mode === 'login' && <button type="button" onClick={() => setMode('register')} className="text-sm text-primary hover:underline">Hesabın yok mu? Kayıt ol</button>}
            {mode === 'register' && <button type="button" onClick={() => setMode('login')} className="text-sm text-primary hover:underline">Zaten hesabın var mı? Giriş yap</button>}
            {(mode === 'login' || mode === 'register') && <button type="button" onClick={() => setMode('forgot')} className="text-sm text-muted-foreground hover:underline block w-full">Şifreni mi unuttun?</button>}
            {(mode === 'forgot' || mode === 'reset') && <button type="button" onClick={() => setMode('login')} className="text-sm text-primary hover:underline flex items-center justify-center gap-1 w-full"><ArrowLeft className="w-4 h-4" />Giriş sayfasına dön</button>}
          </div>
          
          <div className="mt-4 text-center">
            <button type="button" onClick={() => navigate('/')} className="text-sm text-muted-foreground hover:underline">← Ana sayfaya dön</button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
