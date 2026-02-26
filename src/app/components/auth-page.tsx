import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { supabase, API_BASE_URL } from '../lib/supabase';
import { publicAnonKey } from '/utils/supabase/info';
import { Briefcase, Users, Building2 } from 'lucide-react';
import { toast } from 'sonner';

interface AuthPageProps {
  onLogin: (user: any, accessToken: string) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export function AuthPage({ onLogin, onClose, isModal = false }: AuthPageProps) {
  const [isSignup, setIsSignup] = useState(true);
  const [userType, setUserType] = useState<'startup' | 'contractor'>('contractor');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          userType
        })
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Signup failed');
        setLoading(false);
        return;
      }

      toast.success('Account created successfully! Please sign in.');
      setIsSignup(false);
      setFormData({ email: '', password: '', name: '' });
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        // Fetch user profile
        const profileResponse = await fetch(`${API_BASE_URL}/profile`, {
          headers: {
            'Authorization': `Bearer ${data.session.access_token}`
          }
        });

        const profileData = await profileResponse.json();

        if (profileResponse.ok) {
          onLogin(profileData.user, data.session.access_token);
          toast.success('Logged in successfully!');
          if (onClose) onClose();
        } else {
          toast.error('Failed to fetch user profile');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const userTypeOptions = [
    { value: 'contractor', label: 'Contractor/Employee', icon: Users, description: 'Looking for work opportunities' },
    { value: 'startup', label: 'Startup', icon: Building2, description: 'Company seeking projects' }
  ];

  const content = (
    <Card className={isModal ? 'border-0 shadow-none' : 'w-full max-w-md'}>
      <CardHeader className="text-center">
        {!isModal && (
          <>
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">Tarakki</CardTitle>
            <CardDescription>Empowering careers, building futures</CardDescription>
          </>
        )}
      </CardHeader>
      <CardContent>
        <Tabs value={isSignup ? 'signup' : 'login'} onValueChange={(v) => setIsSignup(v === 'signup')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
            <TabsTrigger value="login">Login</TabsTrigger>
          </TabsList>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label>I am a:</Label>
                <div className="grid gap-2">
                  {userTypeOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setUserType(option.value as any)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          userType === option.value
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className={`h-5 w-5 mt-0.5 ${
                            userType === option.value ? 'text-purple-600' : 'text-gray-500'
                          }`} />
                          <div>
                            <div className={`font-medium ${
                              userType === option.value ? 'text-purple-600' : 'text-gray-900'
                            }`}>
                              {option.label}
                            </div>
                            <div className="text-sm text-gray-500">{option.description}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Sign Up'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );

  if (isModal) {
    return content;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      {content}
    </div>
  );
}