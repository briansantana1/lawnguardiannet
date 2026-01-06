import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Leaf, Mail, Lock, User, Apple, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Auth Page
 * 
 * Supports:
 * - Email/Password authentication
 * - Sign in with Apple (required by Apple App Store if any social sign-in is offered)
 * - Sign in with Google
 * - Terms acceptance (required for app store compliance)
 */

// Google icon component
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'apple' | 'google' | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        // Record consent for terms when signing up via social providers
        if (event === 'SIGNED_IN') {
          recordInitialConsent(session.user.id);
        }
        navigate('/');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Record initial consent when user signs up - store locally
  const recordInitialConsent = async (userId: string) => {
    try {
      // Store consent in localStorage as a simple fallback
      const consents = {
        privacy_policy: true,
        terms_of_service: true,
      };
      localStorage.setItem(`consents_${userId}`, JSON.stringify(consents));
    } catch (error) {
      console.log('Error recording consent locally:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For sign up, require terms acceptance
    if (!isLogin && !acceptedTerms) {
      toast.error('Please accept the Terms of Use and Privacy Policy to create an account.');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Welcome back!');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              display_name: displayName,
              accepted_terms: true,
              terms_accepted_at: new Date().toISOString(),
            },
          },
        });
        if (error) throw error;
        
        // Record consent for new user
        if (data.user) {
          await recordInitialConsent(data.user.id);
        }
        
        toast.success('Account created successfully! Please check your email to confirm your account.');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      if (error.message.includes('User already registered')) {
        toast.error('This email is already registered. Please sign in instead.');
      } else if (error.message.includes('Invalid login credentials')) {
        toast.error('Invalid email or password.');
      } else if (error.message.includes('Email not confirmed')) {
        toast.error('Please check your email and confirm your account.');
      } else {
        toast.error(error.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: 'apple' | 'google') => {
    // For social sign-in during registration, ensure terms are implicitly accepted
    // by continuing (terms acceptance is shown in the UI)
    
    setSocialLoading(provider);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: provider === 'apple' ? {
            // Request email and name from Apple
            scope: 'email name',
          } : undefined,
        },
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error(`${provider} sign-in error:`, error);
      toast.error(`Failed to sign in with ${provider === 'apple' ? 'Apple' : 'Google'}. Please try again.`);
      setSocialLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-lawn-50 to-white dark:from-lawn-950 dark:to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md" variant="elevated">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-lawn-400 to-lawn-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Leaf className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-display text-lawn-800 dark:text-lawn-200">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
          <CardDescription>
            {isLogin 
              ? 'Sign in to access your lawn care dashboard' 
              : 'Join Lawn Guardian™ to start caring for your lawn'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Social Sign-In Buttons */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-base font-medium"
              onClick={() => handleSocialSignIn('apple')}
              disabled={socialLoading !== null || loading}
            >
              {socialLoading === 'apple' ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Apple className="w-5 h-5 mr-2" />
              )}
              Continue with Apple
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-base font-medium"
              onClick={() => handleSocialSignIn('google')}
              disabled={socialLoading !== null || loading}
            >
              {socialLoading === 'google' ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              <span className="ml-2">Continue with Google</span>
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pl-10"
                />
              </div>
              {!isLogin && (
                <p className="text-xs text-muted-foreground">
                  Must be at least 6 characters
                </p>
              )}
            </div>

            {/* Terms Acceptance for Sign Up */}
            {!isLogin && (
              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                  className="mt-0.5"
                />
                <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                  I agree to the{' '}
                  <Link 
                    to="/terms-of-use" 
                    className="text-primary hover:underline"
                    target="_blank"
                  >
                    Terms of Use
                  </Link>{' '}
                  and{' '}
                  <Link 
                    to="/privacy-policy" 
                    className="text-primary hover:underline"
                    target="_blank"
                  >
                    Privacy Policy
                  </Link>
                </Label>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              variant="hero"
              disabled={loading || socialLoading !== null || (!isLogin && !acceptedTerms)}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Please wait...
                </>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </form>

          {/* Terms notice for social sign-in */}
          <p className="text-xs text-center text-muted-foreground">
            By continuing, you agree to our{' '}
            <Link to="/terms-of-use" className="text-primary hover:underline">
              Terms of Use
            </Link>{' '}
            and{' '}
            <Link to="/privacy-policy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>

          {/* Toggle Login/Sign Up */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setAcceptedTerms(false);
              }}
              className="text-lawn-600 hover:text-lawn-700 dark:text-lawn-400 dark:hover:text-lawn-300 font-medium transition-colors"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : 'Already have an account? Sign in'
              }
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
