import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { supabase, API_BASE_URL } from '../lib/supabase';
import { publicAnonKey } from '/utils/supabase/info';
import { Briefcase, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface EmployerLoginProps {
  onLogin: (user: any, accessToken: string) => void;
  onBack: () => void;
}

export function EmployerLogin({ onLogin, onBack }: EmployerLoginProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  const handleCreateEmployer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

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
          userType: 'employer'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to create employer account');
        setLoading(false);
        return;
      }

      toast.success('Employer account created! Logging in...');
      
      // Auto login after creation
      const { data: loginData, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        toast.error(error.message);
        setIsCreatingAccount(false);
        setLoading(false);
        return;
      }

      if (loginData.session) {
        const profileResponse = await fetch(`${API_BASE_URL}/profile`, {
          headers: {
            'Authorization': `Bearer ${loginData.session.access_token}`
          }
        });

        const profileData = await profileResponse.json();

        if (profileResponse.ok) {
          onLogin(profileData.user, loginData.session.access_token);
          toast.success('Logged in successfully!');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred');
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
        const profileResponse = await fetch(`${API_BASE_URL}/profile`, {
          headers: {
            'Authorization': `Bearer ${data.session.access_token}`
          }
        });

        const profileData = await profileResponse.json();

        if (profileResponse.ok) {
          if (profileData.user.userType !== 'employer') {
            toast.error('This account is not an employer account');
            await supabase.auth.signOut();
            setLoading(false);
            return;
          }
          onLogin(profileData.user, data.session.access_token);
          toast.success('Logged in successfully!');
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="absolute left-4 top-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Employer Access</CardTitle>
          <CardDescription>
            {isCreatingAccount ? 'Create employer account' : 'Login to employer dashboard'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isCreatingAccount ? (
            <form onSubmit={handleCreateEmployer} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Company name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="employer@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Employer Account'}
              </Button>

              <Button 
                type="button" 
                variant="ghost" 
                className="w-full"
                onClick={() => {
                  setIsCreatingAccount(false);
                  setFormData({ email: '', password: '', name: '', confirmPassword: '' });
                }}
              >
                Already have an account? Login
              </Button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="employer@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Login as Employer'}
              </Button>

              <Button 
                type="button" 
                variant="ghost" 
                className="w-full"
                onClick={() => setIsCreatingAccount(true)}
              >
                Create employer account
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
