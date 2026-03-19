import React, { useState } from 'react';
import { User } from '../types';
import { authService, STATIC_EMAIL } from '../services/authService';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
}

type AuthMode = 'auth-selection' | 'login' | 'signup-phone' | 'signup-otp' | 'signup-credentials' | 'signup-profile';

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('auth-selection');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');

  const [profileData, setProfileData] = useState({
    name: '',
    college: '',
    role: 'Student',
    bio: ''
  });

  // Check password strength
  const checkPasswordStrength = (pwd: string) => {
    if (pwd.length < 8) return 'weak';
    if (/^[a-zA-Z0-9!@#$%^&*]{8,}$/.test(pwd)) return 'medium';
    return 'strong';
  };

  // ===== LOGIN FLOW =====
  const handleLoginSubmit = async () => {
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password');
      return;
    }

    setLoading(true);
    try {
      const result = authService.login(username, password);
      if (result.success && result.user) {
        const loginUser: User = {
          id: `u-${result.user.username}`,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          college: result.user.college,
          bio: result.user.bio,
          avatar: result.user.avatar,
          skills: [],
          githubUrl: '',
          linkedinUrl: '',
          reputation: 0,
          hasOnboarded: true
        };

        sessionStorage.setItem('nexora_auth_token', `token-${Date.now()}`);
        sessionStorage.setItem('nexora_user', JSON.stringify(loginUser));
        sessionStorage.setItem('nexora_username', result.user.username);

        onAuthSuccess(loginUser);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  // ===== SIGN UP FLOW =====
  const handleSignUpPhoneSubmit = async () => {
    setError('');
    if (!phoneNumber.trim() || !username.trim()) {
      setError('Please enter phone number and username');
      return;
    }

    const usernameValidation = authService.validateUsername(username);
    if (!usernameValidation.valid) {
      setError(usernameValidation.message!);
      return;
    }

    setLoading(true);
    try {
      const result = authService.requestSignUpOTP(phoneNumber, username);
      if (result.success) {
        if (result.otp) {
          setDevOtp(result.otp);
        }
        setMode('signup-otp');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to request OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpOTPVerify = async () => {
    setError('');
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }

    setLoading(true);
    try {
      const result = authService.verifySignUpOTP(phoneNumber, otp);
      if (result.success) {
        setMode('signup-credentials');
        setOtp('');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpCredentialsSubmit = async () => {
    setError('');

    if (!password.trim() || !confirmPassword.trim()) {
      setError('Please enter and confirm password');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordValidation = authService.validatePassword(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message!);
      return;
    }

    setMode('signup-profile');
  };

  const handleSignUpProfileComplete = async () => {
    setError('');
    if (!profileData.name.trim() || !profileData.college.trim()) {
      setError('Name and college are required');
      return;
    }

    setLoading(true);
    try {
      const result = authService.completeSignUp(phoneNumber, username, password, profileData);
      if (result.success && result.user) {
        const newUser: User = {
          id: `u-${result.user.username}`,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          college: result.user.college,
          bio: result.user.bio,
          avatar: result.user.avatar,
          skills: [],
          githubUrl: '',
          linkedinUrl: '',
          reputation: 0,
          hasOnboarded: false
        };

        sessionStorage.setItem('nexora_auth_token', `token-${Date.now()}`);
        sessionStorage.setItem('nexora_user', JSON.stringify(newUser));
        sessionStorage.setItem('nexora_username', result.user.username);

        onAuthSuccess(newUser);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  // ===== RENDER FUNCTIONS =====
  const renderAuthSelection = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase">Nexora</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Builder Communities & Projects</p>
      </div>

      <div className="space-y-3 pt-8">
        <button
          onClick={() => {
            setMode('login');
            setError('');
          }}
          className="w-full py-4 vibrant-gradient text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-brand-500/20 hover:scale-105 active:scale-95 transition-all"
        >
          Sign In
        </button>

        <button
          onClick={() => {
            setMode('signup-phone');
            setError('');
          }}
          className="w-full py-4 bg-slate-200 dark:bg-zinc-800 text-slate-900 dark:text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-zinc-700 transition-all"
        >
          Create Account
        </button>
      </div>
    </div>
  );

  const renderLogin = () => (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase">Sign In</h2>
        <p className="text-xs text-slate-400">Welcome back</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Username *</label>
          <input
            type="text"
            placeholder="Your username"
            className={`w-full bg-slate-100 dark:bg-zinc-950 border-2 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-bold transition-all ${
              error ? 'border-rose-500 dark:border-rose-500' : 'border-slate-200 dark:border-white/5'
            }`}
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (error) setError('');
            }}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Password *</label>
          <input
            type="password"
            placeholder="Your password"
            className={`w-full bg-slate-100 dark:bg-zinc-950 border-2 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-bold transition-all ${
              error ? 'border-rose-500 dark:border-rose-500' : 'border-slate-200 dark:border-white/5'
            }`}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError('');
            }}
            disabled={loading}
          />
        </div>

        {error && <p className="text-xs text-rose-500 font-bold px-2">{error}</p>}
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          onClick={() => setMode('auth-selection')}
          className="flex-1 py-4 bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-zinc-700 transition-all disabled:opacity-50"
          disabled={loading}
        >
          Back
        </button>
        <button
          onClick={handleLoginSubmit}
          className="flex-1 py-4 vibrant-gradient text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Signing In...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>
      </div>
    </div>
  );

  const renderSignUpPhone = () => (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase">Create Account</h2>
        <p className="text-xs text-slate-400">Step 1 of 4</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Phone Number *</label>
          <input
            type="tel"
            placeholder="+1 (555) 000-0000"
            className={`w-full bg-slate-100 dark:bg-zinc-950 border-2 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-bold transition-all ${
              error ? 'border-rose-500 dark:border-rose-500' : 'border-slate-200 dark:border-white/5'
            }`}
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value);
              if (error) setError('');
            }}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Username *</label>
          <input
            type="text"
            placeholder="Choose a username (3-20 chars)"
            className={`w-full bg-slate-100 dark:bg-zinc-950 border-2 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-bold transition-all ${
              error ? 'border-rose-500 dark:border-rose-500' : 'border-slate-200 dark:border-white/5'
            }`}
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (error) setError('');
            }}
            disabled={loading}
          />
          <p className="text-[10px] text-slate-400">Letters, numbers, underscores only</p>
        </div>

        {error && <p className="text-xs text-rose-500 font-bold px-2">{error}</p>}
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          onClick={() => setMode('auth-selection')}
          className="flex-1 py-4 bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-zinc-700 transition-all disabled:opacity-50"
          disabled={loading}
        >
          Back
        </button>
        <button
          onClick={handleSignUpPhoneSubmit}
          className="flex-1 py-4 vibrant-gradient text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Sending OTP...</span>
            </>
          ) : (
            <span>Continue</span>
          )}
        </button>
      </div>
    </div>
  );

  const renderSignUpOTP = () => (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase">Verify Phone</h2>
        <p className="text-xs text-slate-400">Step 2 of 4</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">Sent to {phoneNumber.replace(/(\d{2})(\d{3})(\d{4})/, '+$1 ($2) $3')}</p>
      </div>

      {devOtp && (
        <div className="bg-brand-500/10 border border-brand-500/30 rounded-xl p-3">
          <p className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase">Dev Mode OTP</p>
          <p className="text-lg font-black text-brand-600 dark:text-brand-400 tracking-widest">{devOtp}</p>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">6-Digit OTP *</label>
        <input
          type="text"
          placeholder="000000"
          maxLength={6}
          className={`w-full bg-slate-100 dark:bg-zinc-950 border-2 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 text-center text-3xl font-black tracking-widest transition-all ${
            error ? 'border-rose-500 dark:border-rose-500' : 'border-slate-200 dark:border-white/5'
          }`}
          value={otp}
          onChange={(e) => {
            setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
            if (error) setError('');
          }}
          disabled={loading}
        />
        {error && <p className="text-xs text-rose-500 font-bold px-2">{error}</p>}
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          onClick={() => setMode('signup-phone')}
          className="flex-1 py-4 bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-zinc-700 transition-all disabled:opacity-50"
          disabled={loading}
        >
          Back
        </button>
        <button
          onClick={handleSignUpOTPVerify}
          className="flex-1 py-4 vibrant-gradient text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
          disabled={loading || otp.length !== 6}
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Verifying...</span>
            </>
          ) : (
            <span>Verify OTP</span>
          )}
        </button>
      </div>
    </div>
  );

  const renderSignUpCredentials = () => (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase">Set Password</h2>
        <p className="text-xs text-slate-400">Step 3 of 4</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Password *</label>
          <input
            type="password"
            placeholder="Create a strong password"
            className="w-full bg-slate-100 dark:bg-zinc-950 border-2 border-slate-200 dark:border-white/5 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-bold transition-all"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordStrength(checkPasswordStrength(e.target.value) as 'weak' | 'medium' | 'strong');
              if (error) setError('');
            }}
            disabled={loading}
          />
          <div className="flex gap-1 px-2">
            <div className={`h-1 flex-1 rounded-full ${passwordStrength === 'weak' ? 'bg-rose-500' : passwordStrength === 'medium' ? 'bg-yellow-500' : 'bg-emerald-500'}`}></div>
            <div className={`h-1 flex-1 rounded-full ${passwordStrength === 'strong' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-zinc-700'}`}></div>
            <div className={`h-1 flex-1 rounded-full ${passwordStrength === 'strong' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-zinc-700'}`}></div>
          </div>
          <p className="text-[10px] text-slate-400">Min 8 chars, uppercase, lowercase, number, special char (!@#$%^&*)</p>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Confirm Password *</label>
          <input
            type="password"
            placeholder="Confirm your password"
            className={`w-full bg-slate-100 dark:bg-zinc-950 border-2 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-bold transition-all ${
              confirmPassword && password !== confirmPassword ? 'border-rose-500 dark:border-rose-500' : 'border-slate-200 dark:border-white/5'
            }`}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (error) setError('');
            }}
            disabled={loading}
          />
          {confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-rose-500 font-bold px-2">Passwords do not match</p>
          )}
        </div>

        {error && <p className="text-xs text-rose-500 font-bold px-2">{error}</p>}
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          onClick={() => setMode('signup-otp')}
          className="flex-1 py-4 bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-zinc-700 transition-all disabled:opacity-50"
          disabled={loading}
        >
          Back
        </button>
        <button
          onClick={handleSignUpCredentialsSubmit}
          className="flex-1 py-4 vibrant-gradient text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
          disabled={loading || !password || !confirmPassword || password !== confirmPassword || passwordStrength === 'weak'}
        >
          <span>Continue</span>
        </button>
      </div>
    </div>
  );

  const renderSignUpProfile = () => (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase">Complete Profile</h2>
        <p className="text-xs text-slate-400">Step 4 of 4</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Full Name *</label>
          <input
            type="text"
            placeholder="Your name"
            className="w-full bg-slate-100 dark:bg-zinc-950 border-2 border-slate-200 dark:border-white/5 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-bold transition-all"
            value={profileData.name}
            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">College/University *</label>
          <input
            type="text"
            placeholder="Your college"
            className="w-full bg-slate-100 dark:bg-zinc-950 border-2 border-slate-200 dark:border-white/5 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-bold transition-all"
            value={profileData.college}
            onChange={(e) => setProfileData({ ...profileData, college: e.target.value })}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Role</label>
          <select
            className="w-full bg-slate-100 dark:bg-zinc-950 border-2 border-slate-200 dark:border-white/5 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-bold transition-all"
            value={profileData.role}
            onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
            disabled={loading}
          >
            <option>Student</option>
            <option>Developer</option>
            <option>Designer</option>
            <option>Founder</option>
            <option>Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Bio</label>
          <textarea
            placeholder="Tell us about yourself"
            className="w-full bg-slate-100 dark:bg-zinc-950 border-2 border-slate-200 dark:border-white/5 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium h-20 transition-all resize-none"
            value={profileData.bio}
            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
            disabled={loading}
          />
        </div>

        <div className="text-center text-xs text-slate-500 dark:text-slate-400">
          <p>Email: <span className="font-bold">{STATIC_EMAIL}</span></p>
        </div>
      </div>

      {error && <p className="text-xs text-rose-500 font-bold px-2 text-center">{error}</p>}

      <div className="flex space-x-3 pt-4">
        <button
          onClick={() => setMode('signup-credentials')}
          className="flex-1 py-4 bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-zinc-700 transition-all disabled:opacity-50"
          disabled={loading}
        >
          Back
        </button>
        <button
          onClick={handleSignUpProfileComplete}
          className="flex-1 py-4 vibrant-gradient text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
          disabled={loading || !profileData.name.trim() || !profileData.college.trim()}
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Creating Account...</span>
            </>
          ) : (
            <span>Complete Sign Up</span>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white dark:bg-zinc-950 transition-colors duration-500">
      <div className="absolute inset-0 vibrant-gradient opacity-5 dark:opacity-10 pointer-events-none"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-500/10 blur-[150px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-accent/10 blur-[150px] rounded-full animate-pulse"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-2xl border border-slate-200 dark:border-white/10 animate-in fade-in zoom-in duration-500">
          {mode === 'auth-selection' && renderAuthSelection()}
          {mode === 'login' && renderLogin()}
          {mode === 'signup-phone' && renderSignUpPhone()}
          {mode === 'signup-otp' && renderSignUpOTP()}
          {mode === 'signup-credentials' && renderSignUpCredentials()}
          {mode === 'signup-profile' && renderSignUpProfile()}
        </div>
      </div>
    </div>
  );
};

export default Auth;
