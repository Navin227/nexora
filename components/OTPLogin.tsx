import React, { useState } from 'react';
import { User } from '../types';
import { otpAuthService, STATIC_EMAIL } from '../services/otpAuthService';

interface OTPLoginProps {
  onAuthSuccess: (user: User) => void;
}

type AuthMode = 'mode-select' | 'signup-phone' | 'signup-otp' | 'signup-profile' | 'login-identifier' | 'login-otp';

const OTPLogin: React.FC<OTPLoginProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('mode-select');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState('');
  const [isPhoneLogin, setIsPhoneLogin] = useState(true);

  // Profile setup state for sign-up
  const [profileData, setProfileData] = useState({
    name: '',
    college: '',
    role: 'Student',
    bio: ''
  });

  // ===== SIGN UP FLOW =====
  const handleSignUpPhoneSubmit = async () => {
    setError('');
    if (!phoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }

    setLoading(true);
    try {
      const result = otpAuthService.requestSignUpOTP(phoneNumber);
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
      const result = otpAuthService.verifyOTP(phoneNumber, otp);
      if (result.success) {
        setMode('signup-profile');
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

  const handleSignUpProfileComplete = async () => {
    setError('');
    if (!profileData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!profileData.college.trim()) {
      setError('College/University is required');
      return;
    }

    setLoading(true);
    try {
      const result = otpAuthService.registerUser(phoneNumber, profileData);
      if (result.success) {
        // Get the registered user
        const user = otpAuthService.getRegisteredUser(phoneNumber);
        if (user) {
          const newUser: User = {
            id: `u-${phoneNumber.replace(/\D/g, '')}`,
            name: user.name,
            email: user.email,
            role: user.role,
            college: user.college,
            bio: user.bio,
            avatar: user.avatar,
            skills: [],
            githubUrl: '',
            linkedinUrl: '',
            reputation: 0,
            hasOnboarded: false
          };

          // Store auth token
          sessionStorage.setItem('nexora_auth_token', `token-${Date.now()}`);
          sessionStorage.setItem('nexora_user', JSON.stringify(newUser));
          sessionStorage.setItem('nexora_phone', phoneNumber.replace(/\D/g, ''));

          onAuthSuccess(newUser);
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to complete sign up');
    } finally {
      setLoading(false);
    }
  };

  // ===== LOGIN FLOW =====
  const handleLoginIdentifierSubmit = async () => {
    setError('');
    if (!emailOrPhone.trim()) {
      setError('Please enter your phone number or email');
      return;
    }

    setLoading(true);
    try {
      const result = otpAuthService.requestLoginOTP(emailOrPhone);
      if (result.success) {
        if (result.otp) {
          setDevOtp(result.otp);
        }
        setIsPhoneLogin(result.isPhone !== false);
        setMode('login-otp');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to request OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginOTPVerify = async () => {
    setError('');
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }

    setLoading(true);
    try {
      // Get the phone number from identifier
      let phoneNumber = emailOrPhone;
      if (!isPhoneLogin) {
        const user = otpAuthService.getUserByEmail(emailOrPhone);
        if (user) {
          phoneNumber = user.phoneNumber;
        }
      }

      const result = otpAuthService.verifyOTP(phoneNumber, otp);
      if (result.success) {
        // Get user data
        const user = otpAuthService.getRegisteredUser(phoneNumber);
        if (user) {
          const loginUser: User = {
            id: `u-${user.phoneNumber}`,
            name: user.name,
            email: user.email,
            role: user.role,
            college: user.college,
            bio: user.bio,
            avatar: user.avatar,
            skills: [],
            githubUrl: '',
            linkedinUrl: '',
            reputation: 0,
            hasOnboarded: true
          };

          // Store auth token
          sessionStorage.setItem('nexora_auth_token', `token-${Date.now()}`);
          sessionStorage.setItem('nexora_user', JSON.stringify(loginUser));
          sessionStorage.setItem('nexora_phone', user.phoneNumber);

          onAuthSuccess(loginUser);
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  // Render based on mode
  const renderModeSelect = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase">Nexora</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Builder Communities & Projects</p>
      </div>

      <div className="space-y-3 pt-8">
        <button
          onClick={() => {
            setMode('signup-phone');
            setError('');
          }}
          className="w-full py-4 vibrant-gradient text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-brand-500/20 hover:scale-105 active:scale-95 transition-all"
        >
          Create New Account
        </button>

        <button
          onClick={() => {
            setMode('login-identifier');
            setError('');
          }}
          className="w-full py-4 bg-slate-200 dark:bg-zinc-800 text-slate-900 dark:text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-zinc-700 transition-all"
        >
          Sign In
        </button>
      </div>
    </div>
  );

  const renderSignUpPhone = () => (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase">Create Account</h2>
        <p className="text-xs text-slate-400">Step 1 of 3</p>
      </div>

      {devOtp && (
        <div className="bg-brand-500/10 border border-brand-500/30 rounded-xl p-3">
          <p className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase">Dev Mode: Your OTP</p>
          <p className="text-lg font-black text-brand-600 dark:text-brand-400 tracking-widest">{devOtp}</p>
        </div>
      )}

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
        {error && <p className="text-xs text-rose-500 font-bold px-2">{error}</p>}
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          onClick={() => setMode('mode-select')}
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
              <span>Sending...</span>
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
        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase">Verify OTP</h2>
        <p className="text-xs text-slate-400">Step 2 of 3</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">Sent to {phoneNumber.replace(/(\d{2})(\d{3})(\d{4})/, '+$1 ($2) $3')}</p>
      </div>

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
            <span>Verify</span>
          )}
        </button>
      </div>
    </div>
  );

  const renderSignUpProfile = () => (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase">Set Up Profile</h2>
        <p className="text-xs text-slate-400">Step 3 of 3</p>
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
      </div>

      <div className="text-center text-xs text-slate-500 dark:text-slate-400">
        <p>Email: <span className="font-bold">{STATIC_EMAIL}</span></p>
      </div>

      {error && <p className="text-xs text-rose-500 font-bold px-2 text-center">{error}</p>}

      <div className="flex space-x-3 pt-4">
        <button
          onClick={() => setMode('signup-otp')}
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
              <span>Creating...</span>
            </>
          ) : (
            <span>Complete Sign Up</span>
          )}
        </button>
      </div>
    </div>
  );

  const renderLoginIdentifier = () => (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase">Sign In</h2>
        <p className="text-xs text-slate-400">Enter your phone or email</p>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Phone Number or Email *</label>
        <input
          type="text"
          placeholder="Phone: +1234567890 or Email: user@example.com"
          className={`w-full bg-slate-100 dark:bg-zinc-950 border-2 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-bold transition-all ${
            error ? 'border-rose-500 dark:border-rose-500' : 'border-slate-200 dark:border-white/5'
          }`}
          value={emailOrPhone}
          onChange={(e) => {
            setEmailOrPhone(e.target.value);
            if (error) setError('');
          }}
          disabled={loading}
        />
        {error && <p className="text-xs text-rose-500 font-bold px-2">{error}</p>}
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          onClick={() => setMode('mode-select')}
          className="flex-1 py-4 bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-zinc-700 transition-all disabled:opacity-50"
          disabled={loading}
        >
          Back
        </button>
        <button
          onClick={handleLoginIdentifierSubmit}
          className="flex-1 py-4 vibrant-gradient text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Sending...</span>
            </>
          ) : (
            <span>Send OTP</span>
          )}
        </button>
      </div>
    </div>
  );

  const renderLoginOTP = () => (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase">Verify OTP</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Sent to your registered {isPhoneLogin ? 'phone' : 'email'}</p>
      </div>

      {devOtp && (
        <div className="bg-brand-500/10 border border-brand-500/30 rounded-xl p-3">
          <p className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase">Dev Mode: Your OTP</p>
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
          onClick={() => setMode('login-identifier')}
          className="flex-1 py-4 bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-zinc-700 transition-all disabled:opacity-50"
          disabled={loading}
        >
          Back
        </button>
        <button
          onClick={handleLoginOTPVerify}
          className="flex-1 py-4 vibrant-gradient text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
          disabled={loading || otp.length !== 6}
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

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white dark:bg-zinc-950 transition-colors duration-500">
      <div className="absolute inset-0 vibrant-gradient opacity-5 dark:opacity-10 pointer-events-none"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-500/10 blur-[150px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-accent/10 blur-[150px] rounded-full animate-pulse"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-2xl border border-slate-200 dark:border-white/10 animate-in fade-in zoom-in duration-500">
          {mode === 'mode-select' && renderModeSelect()}
          {mode === 'signup-phone' && renderSignUpPhone()}
          {mode === 'signup-otp' && renderSignUpOTP()}
          {mode === 'signup-profile' && renderSignUpProfile()}
          {mode === 'login-identifier' && renderLoginIdentifier()}
          {mode === 'login-otp' && renderLoginOTP()}
        </div>
      </div>
    </div>
  );
};

export default OTPLogin;
    setError('');
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }

    setLoading(true);
    try {
      const result = otpAuthService.verifyOTP(phoneNumber, otp);
      if (result.success) {
        setStep('profile');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = async () => {
    setError('');
    if (!profileData.name.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      const user: User = {
        id: `user-${Date.now()}`,
        name: profileData.name,
        email: STATIC_EMAIL,
        role: profileData.role,
        college: profileData.college,
        bio: profileData.bio,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileData.name}`,
        skills: [],
        githubUrl: '',
        linkedinUrl: '',
        reputation: 0,
        hasOnboarded: false
      };

      // Store user data and phone in session
      try {
        sessionStorage.setItem('nexora_user', JSON.stringify(user));
        sessionStorage.setItem('nexora_phone', phoneNumber);
        sessionStorage.setItem('nexora_auth_token', `token-${Date.now()}`);
      } catch (e) {
        console.warn('Could not store in sessionStorage:', e);
      }

      onAuthSuccess(user);
    } catch (err) {
      setError('Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-950 dark:to-zinc-900 overflow-hidden relative">
      {/* Animated background */}
      <div className="absolute inset-0 vibrant-gradient opacity-5 dark:opacity-10 pointer-events-none"></div>
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-brand-500/20 blur-[150px] rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] bg-brand-accent/20 blur-[150px] rounded-full animate-pulse-slow"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-xl shadow-brand-500/30">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Nexora</h1>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Build communities. Create impact.</p>
        </div>

        {/* Card */}
        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 p-8 space-y-6">
          {/* Phone Step */}
          {step === 'phone' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    setError('');
                  }}
                  disabled={loading}
                  className="w-full bg-slate-100 dark:bg-zinc-800 border-2 border-slate-200 dark:border-white/10 px-5 py-4 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/30 transition-all disabled:opacity-50"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">We'll send an OTP to verify your number</p>
              </div>

              {error && (
                <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4">
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p>
                </div>
              )}

              <button
                onClick={handleRequestOTP}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-brand-500/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center space-x-2"
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
                  <span>Send OTP</span>
                )}
              </button>
            </div>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Enter OTP</label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  We've sent a 6-digit code to <span className="font-bold text-slate-700 dark:text-slate-300">{phoneNumber}</span>
                </p>
                <input
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                    setError('');
                  }}
                  maxLength={6}
                  disabled={loading}
                  className="w-full bg-slate-100 dark:bg-zinc-800 border-2 border-slate-200 dark:border-white/10 px-5 py-4 rounded-2xl text-center text-2xl font-bold tracking-widest outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/30 transition-all disabled:opacity-50"
                />
              </div>

              {devOtp && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400">Dev OTP: {devOtp}</p>
                </div>
              )}

              {error && (
                <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4">
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
                  className="w-full py-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-brand-500/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button
                  onClick={() => {
                    setStep('phone');
                    setOtp('');
                    setError('');
                  }}
                  disabled={loading}
                  className="w-full py-3 bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-zinc-700 transition-all disabled:opacity-50"
                >
                  Change Number
                </button>
              </div>
            </div>
          )}

          {/* Profile Setup Step */}
          {step === 'profile' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest px-1">Full Name *</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={profileData.name}
                    onChange={(e) => {
                      setProfileData({ ...profileData, name: e.target.value });
                      setError('');
                    }}
                    disabled={loading}
                    className="w-full bg-slate-100 dark:bg-zinc-800 border-2 border-slate-200 dark:border-white/10 px-5 py-3 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/30 transition-all disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest px-1">College/University</label>
                  <input
                    type="text"
                    placeholder="Your institution"
                    value={profileData.college}
                    onChange={(e) => setProfileData({ ...profileData, college: e.target.value })}
                    disabled={loading}
                    className="w-full bg-slate-100 dark:bg-zinc-800 border-2 border-slate-200 dark:border-white/10 px-5 py-3 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/30 transition-all disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest px-1">Role</label>
                  <select
                    value={profileData.role}
                    onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                    disabled={loading}
                    className="w-full bg-slate-100 dark:bg-zinc-800 border-2 border-slate-200 dark:border-white/10 px-5 py-3 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/30 transition-all disabled:opacity-50"
                  >
                    <option>Student</option>
                    <option>Developer</option>
                    <option>Designer</option>
                    <option>Founder</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest px-1">Bio</label>
                  <textarea
                    placeholder="Tell us about yourself"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    disabled={loading}
                    rows={3}
                    className="w-full bg-slate-100 dark:bg-zinc-800 border-2 border-slate-200 dark:border-white/10 px-5 py-3 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/30 transition-all disabled:opacity-50 resize-none"
                  />
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Email: <span className="font-bold text-slate-700 dark:text-slate-300">{STATIC_EMAIL}</span>
                </p>
              </div>

              {error && (
                <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4">
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p>
                </div>
              )}

              <button
                onClick={handleCompleteProfile}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-brand-500/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? 'Creating Account...' : 'Get Started'}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-8 font-bold uppercase tracking-wider">
          Secure • Private • Open Source
        </p>
      </div>
    </div>
  );
};

export default OTPLogin;
