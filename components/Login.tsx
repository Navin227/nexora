import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { googleAuthService } from '../services/googleAuthService';

interface LoginProps {
  onAuthSuccess: (user: User) => void;
  isLoading?: boolean;
}

const Login: React.FC<LoginProps> = ({ onAuthSuccess, isLoading = false }) => {
  const [error, setError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    // Initialize Google Auth Service
    const initGoogleAuth = async () => {
      try {
        // Get your Google Client ID from environment variables
        const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
        
        if (!clientId) {
          setError('Google Client ID not configured. Please add REACT_APP_GOOGLE_CLIENT_ID to .env');
          return;
        }

        await googleAuthService.initialize({
          clientId,
          redirectUri: window.location.origin,
        });

        // Render Google Sign-In button
        const buttonContainer = document.getElementById('google-signin-button');
        if (buttonContainer) {
          googleAuthService.renderButton('google-signin-button', {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
          });
        }

        // Listen for successful authentication
        window.addEventListener('google-auth-success', handleAuthSuccess as EventListener);

        return () => {
          window.removeEventListener('google-auth-success', handleAuthSuccess as EventListener);
        };
      } catch (err) {
        console.error('Failed to initialize Google Auth:', err);
        setError('Failed to initialize Google authentication. Please refresh and try again.');
      }
    };

    initGoogleAuth();
  }, []);

  const handleAuthSuccess = (event: Event) => {
    const customEvent = event as CustomEvent;
    const { id, email, name, picture, token } = customEvent.detail;

    // Store token
    googleAuthService.setToken(token);

    // Create user object
    const user: User = {
      id,
      email,
      name,
      role: 'Builder',
      college: '',
      bio: '',
      avatar: picture,
      skills: [],
      githubUrl: '',
      linkedinUrl: '',
      reputation: 100,
      hasOnboarded: false,
    };

    // Call parent callback
    onAuthSuccess(user);
  };

  const handleManualSignIn = async () => {
    setAuthLoading(true);
    try {
      await googleAuthService.signIn();
    } catch (err) {
      console.error('Sign-in failed:', err);
      setError(err instanceof Error ? err.message : 'Sign-in failed');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-950 dark:to-zinc-900 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Logo and Branding */}
        <div className="flex flex-col items-center mb-12 animate-in fade-in slide-in-from-top-8 duration-700">
          <div className="w-20 h-20 rounded-3xl vibrant-gradient flex items-center justify-center mb-6 shadow-2xl shadow-brand-500/30 text-white">
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter uppercase">Nexora</h1>
          <p className="text-slate-500 dark:text-slate-400 text-center font-medium">Build amazing projects together</p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/10 p-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Welcome</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-10 font-medium">Sign in with your Google account to get started</p>

          {/* Google Sign-In Button Container */}
          <div className="mb-8 flex justify-center">
            <div id="google-signin-button" className="flex justify-center" />
          </div>

          {/* Or Divider */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
          </div>

          {/* Alternative Sign-In Button */}
          <button
            onClick={handleManualSignIn}
            disabled={authLoading || isLoading}
            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg flex items-center justify-center space-x-3"
          >
            {authLoading ? (
              <>
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Sign in with Google</span>
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/50 rounded-xl animate-in shake duration-300">
              <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{error}</p>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-10 p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Privacy Notice</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              We use your Google account to create a Nexora profile. Your email is never shared with communities unless you make it public in your profile settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
