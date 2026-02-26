import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { supabase, API_BASE_URL } from '../lib/supabase';
import { Briefcase, ArrowLeft, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface EmployerLoginProps {
  onLogin: (user: any, accessToken: string) => void;
  onBack: () => void;
}

export function EmployerLogin({ onLogin, onBack }: EmployerLoginProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Authenticate with Supabase
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
        // 2. Fetch Profile to verify if this is the Egisedge Admin
        const profileResponse = await fetch(`${API_BASE_URL}/profile`, {
          headers: {
            'Authorization': `Bearer ${data.session.access_token}`
          }
        });

        const profileData = await profileResponse.json();

        if (profileResponse.ok) {
          // Hard-coded check for Egisedge Admin or generic employer type
          // You can change 'admin@egisedge.com' to your actual admin email
          const isEgisedge = profileData.user.email === 'admin@egisedge.com' || profileData.user.userType === 'employer';

          if (!isEgisedge) {
            toast.error('Access Denied: Not an authorized Egisedge account');
            await supabase.auth.signOut();
            setLoading(false);
            return;
          }

          onLogin(profileData.user, data.session.access_token);
          toast.success('Welcome back to Egisedge Portal');
        } else {
          toast.error('Failed to verify employer credentials');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during secure login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      {/* Background Decorative Element */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full" />
      </div>

      <Card className="w-full max-w-md border-slate-800 bg-slate-900 text-slate-100 shadow-2xl relative z-10">
        <CardHeader className="text-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="absolute left-4 top-4 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex justify-center mb-4">
            <div className="h-14 w-14 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <CardTitle className="text-3xl font-bold tracking-tight">Egisedge Portal</CardTitle>
          <CardDescription className="text-slate-400">
            Internal Management & Project Deployment
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Admin Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@egisedge.com"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:ring-purple-500"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" name="password" className="text-slate-300">Secure Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:ring-purple-500"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-6" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                'Authorized Login'
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-widest">
              Egisedge Proprietary System
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}