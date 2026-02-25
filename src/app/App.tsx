import { useState, useEffect } from 'react';
import { PublicHome } from './components/public-home';
import { EmployerDashboard } from './components/employer-dashboard';
import { ContractorDashboard } from './components/contractor-dashboard';
import { EmployerLogin } from './components/employer-login';
import { supabase } from './lib/supabase';
import { Toaster } from './components/ui/sonner';


export default function App() {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEmployerLogin, setShowEmployerLogin] = useState(false);

  useEffect(() => {
    // Check for existing session
    checkSession();
    
    // Check for employer access via URL hash
    if (window.location.hash === '#employer') {
      setShowEmployerLogin(true);
    }
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Fetch user profile
        const response = await fetch(
          `https://${supabase.supabaseUrl.replace('https://', '')}/functions/v1/make-server-d6e2fa79/profile`,
          {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setAccessToken(session.access_token);
        }
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData: any, token: string) => {
    setUser(userData);
    setAccessToken(token);
    setShowEmployerLogin(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAccessToken(null);
    window.location.hash = '';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is logged in
  if (user && accessToken) {
    if (user.userType === 'employer') {
      return (
        <>
          <EmployerDashboard user={user} accessToken={accessToken} onLogout={handleLogout} />
          <Toaster />
        </>
      );
    }

    return (
      <>
        <ContractorDashboard user={user} accessToken={accessToken} onLogout={handleLogout} />
        <Toaster />
      </>
    );
  }

  // Show employer login if accessed via special link
  if (showEmployerLogin) {
    return (
      <>
        <EmployerLogin 
          onLogin={handleLogin} 
          onBack={() => {
            setShowEmployerLogin(false);
            window.location.hash = '';
          }} 
        />
        <Toaster />
      </>
    );
  }

  // Show public home by default
  return (
    <>
      <PublicHome 
        onLogin={handleLogin}
        onEmployerAccess={() => {
          setShowEmployerLogin(true);
          window.location.hash = 'employer';
        }}
      />
      <Toaster />
    </>
  );
}