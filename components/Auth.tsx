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
    bio: '',
    github: '',
    linkedin: '',
    skills: [] as string[],
    interests: [] as string[],
    currentSkill: '',
    currentInterest: '',
    cv: null as File | null
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
    if (!profileData.name.trim() || !profileData.college.trim() || profileData.skills.length === 0) {
      setError('Name, college, and at least one skill are required');
      return;
    }

    setLoading(true);
    try {
      const result = authService.completeSignUp(phoneNumber, username, password, {
        ...profileData,
        skills: profileData.skills,
        interests: profileData.interests,
        github: profileData.github,
        linkedin: profileData.linkedin
      });
      if (result.success && result.user) {
        const newUser: User = {
          id: `u-${result.user.username}`,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          college: result.user.college,
          bio: result.user.bio,
          avatar: result.user.avatar,
          skills: result.user.skills || [],
          githubUrl: result.user.github || '',
          linkedinUrl: result.user.linkedin || '',
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
    <div className="space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
      <div className="text-center space-y-1 sticky top-0 bg-white dark:bg-zinc-900 z-10 pb-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase">Complete Your Profile</h2>
        <p className="text-xs text-slate-400">Step 4 of 4 - Build Your Professional Identity</p>
      </div>

      <div className="space-y-5 pb-20">
        {/* Personal Details Section */}
        <div className="space-y-4 p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-white/5">
          <p className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Personal Details</p>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Full Name *</label>
            <input
              type="text"
              placeholder="Your full name"
              className="w-full bg-white dark:bg-zinc-950 border-2 border-slate-200 dark:border-white/5 p-4 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-bold transition-all"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">College/University *</label>
            <input
              type="text"
              placeholder="Your institution"
              className="w-full bg-white dark:bg-zinc-950 border-2 border-slate-200 dark:border-white/5 p-4 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-bold transition-all"
              value={profileData.college}
              onChange={(e) => setProfileData({ ...profileData, college: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Current Role</label>
            <select
              className="w-full bg-white dark:bg-zinc-950 border-2 border-slate-200 dark:border-white/5 p-4 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-bold transition-all"
              value={profileData.role}
              onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
              disabled={loading}
            >
              <option>Student</option>
              <option>Developer</option>
              <option>Designer</option>
              <option>Product Manager</option>
              <option>Founder</option>
              <option>Marketer</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        {/* Professional Links Section */}
        <div className="space-y-4 p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-white/5">
          <p className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Professional Links</p>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">GitHub Profile</label>
            <input
              type="url"
              placeholder="https://github.com/yourprofile"
              className="w-full bg-white dark:bg-zinc-950 border-2 border-slate-200 dark:border-white/5 p-4 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium transition-all"
              value={profileData.github}
              onChange={(e) => setProfileData({ ...profileData, github: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">LinkedIn Profile</label>
            <input
              type="url"
              placeholder="https://linkedin.com/in/yourprofile"
              className="w-full bg-white dark:bg-zinc-950 border-2 border-slate-200 dark:border-white/5 p-4 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium transition-all"
              value={profileData.linkedin}
              onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Resume/CV (PDF)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="w-full bg-white dark:bg-zinc-950 border-2 border-slate-200 dark:border-white/5 p-4 rounded-xl text-sm font-medium transition-all"
              onChange={(e) => setProfileData({ ...profileData, cv: e.target.files?.[0] || null })}
              disabled={loading}
            />
            {profileData.cv && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold px-2">✓ {profileData.cv.name} ({(profileData.cv.size / 1024).toFixed(1)} KB)</p>
            )}
          </div>
        </div>

        {/* Skills Section */}
        <div className="space-y-4 p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-white/5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Skills & Expertise</p>
            <span className="text-[9px] font-bold text-slate-400">{profileData.skills.length} added</span>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g., React, Python, UI Design"
              className="flex-1 bg-white dark:bg-zinc-950 border-2 border-slate-200 dark:border-white/5 p-3 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium transition-all"
              value={profileData.currentSkill}
              onChange={(e) => setProfileData({ ...profileData, currentSkill: e.target.value })}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && profileData.currentSkill.trim()) {
                  setProfileData({
                    ...profileData,
                    skills: [...profileData.skills, profileData.currentSkill.trim()],
                    currentSkill: ''
                  });
                }
              }}
              disabled={loading}
            />
            <button
              onClick={() => {
                if (profileData.currentSkill.trim()) {
                  setProfileData({
                    ...profileData,
                    skills: [...profileData.skills, profileData.currentSkill.trim()],
                    currentSkill: ''
                  });
                }
              }}
              className="px-4 py-3 bg-brand-500/20 text-brand-600 dark:text-brand-400 rounded-lg hover:bg-brand-500/30 transition-all font-bold text-sm disabled:opacity-50"
              disabled={loading || !profileData.currentSkill.trim()}
            >
              Add
            </button>
          </div>

          {profileData.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {profileData.skills.map((skill, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-1 bg-brand-500/10 border border-brand-500/30 rounded-full">
                  <span className="text-xs font-bold text-brand-600 dark:text-brand-400">{skill}</span>
                  <button
                    onClick={() => setProfileData({
                      ...profileData,
                      skills: profileData.skills.filter((_, i) => i !== idx)
                    })}
                    className="text-brand-500 hover:text-brand-600 font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Interests Section */}
        <div className="space-y-4 p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-white/5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Interests & Passions</p>
            <span className="text-[9px] font-bold text-slate-400">{profileData.interests.length} added</span>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g., Open Source, Startups, Gaming"
              className="flex-1 bg-white dark:bg-zinc-950 border-2 border-slate-200 dark:border-white/5 p-3 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium transition-all"
              value={profileData.currentInterest}
              onChange={(e) => setProfileData({ ...profileData, currentInterest: e.target.value })}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && profileData.currentInterest.trim()) {
                  setProfileData({
                    ...profileData,
                    interests: [...profileData.interests, profileData.currentInterest.trim()],
                    currentInterest: ''
                  });
                }
              }}
              disabled={loading}
            />
            <button
              onClick={() => {
                if (profileData.currentInterest.trim()) {
                  setProfileData({
                    ...profileData,
                    interests: [...profileData.interests, profileData.currentInterest.trim()],
                    currentInterest: ''
                  });
                }
              }}
              className="px-4 py-3 bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all font-bold text-sm disabled:opacity-50"
              disabled={loading || !profileData.currentInterest.trim()}
            >
              Add
            </button>
          </div>

          {profileData.interests.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {profileData.interests.map((interest, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full">
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{interest}</span>
                  <button
                    onClick={() => setProfileData({
                      ...profileData,
                      interests: profileData.interests.filter((_, i) => i !== idx)
                    })}
                    className="text-purple-500 hover:text-purple-600 font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bio Section */}
        <div className="space-y-4 p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-white/5">
          <p className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">About You</p>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Bio</label>
            <textarea
              placeholder="Tell the community about yourself, your journey, and what you're passionate about..."
              className="w-full bg-white dark:bg-zinc-950 border-2 border-slate-200 dark:border-white/5 p-4 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium h-24 transition-all resize-none"
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              disabled={loading}
            />
            <p className="text-[10px] text-slate-400 px-2">{profileData.bio.length}/500 characters</p>
          </div>
        </div>

        {/* Email Display */}
        <div className="p-4 bg-brand-500/5 rounded-xl border border-brand-500/20">
          <p className="text-xs text-slate-600 dark:text-slate-400">Email: <span className="font-black text-brand-600 dark:text-brand-400">{STATIC_EMAIL}</span></p>
        </div>

        {/* Completion Reminder */}
        <div className="p-4 bg-sky-500/5 rounded-xl border border-sky-500/20 space-y-2">
          <p className="text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase">Completion Checklist:</p>
          <ul className="text-xs text-sky-700 dark:text-sky-300 space-y-1 font-medium">
            <li className={`flex items-center gap-2 ${profileData.name.trim() ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
              <span>{profileData.name.trim() ? '✓' : '○'}</span> Full name provided
            </li>
            <li className={`flex items-center gap-2 ${profileData.college.trim() ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
              <span>{profileData.college.trim() ? '✓' : '○'}</span> College/Institution provided
            </li>
            <li className={`flex items-center gap-2 ${profileData.skills.length > 0 ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
              <span>{profileData.skills.length > 0 ? '✓' : '○'}</span> At least one skill added
            </li>
            <li className="flex items-center gap-2">
              <span>✓</span> Professional links (optional but recommended)
            </li>
          </ul>
        </div>

        {error && <p className="text-xs text-rose-500 font-bold px-2 text-center">{error}</p>}
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-white/5 flex space-x-3 max-w-md mx-auto">
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
          disabled={loading || !profileData.name.trim() || !profileData.college.trim() || profileData.skills.length === 0}
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
