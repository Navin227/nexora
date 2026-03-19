// OTP Authentication Service
// Handles phone number verification with OTP for Sign-Up and Login flows

export const STATIC_EMAIL = 'team@nexora.app';

interface OTPSession {
  phoneNumber: string;
  email?: string;
  otp: string;
  expiresAt: number;
  attempts: number;
  mode: 'signup' | 'login'; // Track if this is sign-up or login
}

interface RegisteredUser {
  phoneNumber: string;
  email: string;
  name: string;
  college: string;
  role: string;
  avatar: string;
  bio: string;
  registeredAt: number;
}

class OTPAuthService {
  private sessions: Map<string, OTPSession> = new Map();
  private registeredUsers: Map<string, RegisteredUser> = new Map();
  private OTP_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes
  private MAX_ATTEMPTS = 5;

  constructor() {
    // Load registered users from localStorage
    this.loadRegisteredUsers();
  }

  /**
   * Load registered users from localStorage
   */
  private loadRegisteredUsers() {
    try {
      const stored = localStorage.getItem('nexora_registered_users');
      if (stored) {
        const users = JSON.parse(stored);
        Object.entries(users).forEach(([key, user]) => {
          this.registeredUsers.set(key, user as RegisteredUser);
        });
      }
    } catch (err) {
      console.error('Failed to load registered users:', err);
    }
  }

  /**
   * Save registered users to localStorage
   */
  private saveRegisteredUsers() {
    try {
      const users: Record<string, RegisteredUser> = {};
      this.registeredUsers.forEach((user, key) => {
        users[key] = user;
      });
      localStorage.setItem('nexora_registered_users', JSON.stringify(users));
    } catch (err) {
      console.error('Failed to save registered users:', err);
    }
  }

  /**
   * Generate a random 6-digit OTP
   */
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phoneNumber: string): boolean {
    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    return cleanedNumber.length >= 10;
  }

  /**
   * Validate email format (basic)
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Check if phone number is already registered
   */
  isPhoneRegistered(phoneNumber: string): boolean {
    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    return this.registeredUsers.has(cleanedNumber);
  }

  /**
   * Check if email is already registered
   */
  isEmailRegistered(email: string): boolean {
    for (const user of this.registeredUsers.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return true;
      }
    }
    return false;
  }

  /**
   * Request OTP for sign-up (new phone number)
   */
  requestSignUpOTP(phoneNumber: string): { success: boolean; message: string; otp?: string } {
    if (!this.validatePhoneNumber(phoneNumber)) {
      return {
        success: false,
        message: 'Invalid phone number format'
      };
    }

    const cleanedNumber = phoneNumber.replace(/\D/g, '');

    // Check if already registered
    if (this.isPhoneRegistered(cleanedNumber)) {
      return {
        success: false,
        message: 'Phone number already registered. Please login instead.'
      };
    }

    const otp = this.generateOTP();
    const expiresAt = Date.now() + this.OTP_EXPIRY_TIME;

    this.sessions.set(cleanedNumber, {
      phoneNumber: cleanedNumber,
      otp,
      expiresAt,
      attempts: 0,
      mode: 'signup'
    });

    console.log(`[OTP Auth] Sign-up OTP for ${cleanedNumber}: ${otp}`);

    return {
      success: true,
      message: 'OTP sent to your phone number',
      otp
    };
  }

  /**
   * Request OTP for login (existing phone or email)
   */
  requestLoginOTP(identifier: string): { success: boolean; message: string; otp?: string; isPhone?: boolean } {
    let phoneNumber = '';
    let isPhone = true;

    // Check if identifier is phone or email
    if (identifier.includes('@')) {
      isPhone = false;
      if (!this.validateEmail(identifier)) {
        return {
          success: false,
          message: 'Invalid email format'
        };
      }

      // Find phone number by email
      for (const user of this.registeredUsers.values()) {
        if (user.email.toLowerCase() === identifier.toLowerCase()) {
          phoneNumber = user.phoneNumber;
          break;
        }
      }

      if (!phoneNumber) {
        return {
          success: false,
          message: 'Email not registered. Please sign up first.'
        };
      }
    } else {
      if (!this.validatePhoneNumber(identifier)) {
        return {
          success: false,
          message: 'Invalid phone number format'
        };
      }

      phoneNumber = identifier.replace(/\D/g, '');

      if (!this.isPhoneRegistered(phoneNumber)) {
        return {
          success: false,
          message: 'Phone number not registered. Please sign up first.'
        };
      }
    }

    const otp = this.generateOTP();
    const expiresAt = Date.now() + this.OTP_EXPIRY_TIME;

    this.sessions.set(phoneNumber, {
      phoneNumber,
      email: isPhone ? undefined : identifier,
      otp,
      expiresAt,
      attempts: 0,
      mode: 'login'
    });

    console.log(`[OTP Auth] Login OTP for ${phoneNumber}: ${otp}`);

    return {
      success: true,
      message: 'OTP sent to your registered phone number',
      otp,
      isPhone
    };
  }
      expiresAt,
      attempts: 0
    });

    // In production, you would send OTP via SMS here
    // For now, return it for development
    console.log(`[OTP Service] OTP for ${cleanedNumber}: ${otp}`);

    return {
      success: true,
      message: 'OTP sent to your phone number',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    };
  }

  /**
   * Verify OTP
   */
  verifyOTP(phoneNumber: string, otp: string): { success: boolean; message: string } {
    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    const session = this.sessions.get(cleanedNumber);

    if (!session) {
      return {
        success: false,
        message: 'No OTP session found. Request a new OTP.'
      };
    }

    if (Date.now() > session.expiresAt) {
      this.sessions.delete(cleanedNumber);
      return {
        success: false,
        message: 'OTP expired. Request a new OTP.'
      };
    }

    if (session.attempts >= this.MAX_ATTEMPTS) {
      this.sessions.delete(cleanedNumber);
      return {
        success: false,
        message: 'Too many attempts. Request a new OTP.'
      };
    }

    session.attempts++;

    if (session.otp !== otp) {
      return {
        success: false,
        message: `Invalid OTP. Attempts remaining: ${this.MAX_ATTEMPTS - session.attempts}`
      };
    }

    // OTP verified successfully
    this.sessions.delete(cleanedNumber);
    return {
      success: true,
      message: 'OTP verified successfully'
    };
  }

  /**
   * Clear all sessions (for testing/logout)
   */
  clearAllSessions(): void {
    this.sessions.clear();
  }

  /**
   * Get session info (for debugging)
   */
  getSessionInfo(phoneNumber: string) {
    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    return this.sessions.get(cleanedNumber);
  }

  /**
   * Register a new user after successful OTP verification
   */
  registerUser(phoneNumber: string, userData: {
    name: string;
    college: string;
    role: string;
    bio: string;
  }): { success: boolean; message: string } {
    const cleanedNumber = phoneNumber.replace(/\D/g, '');

    if (this.isPhoneRegistered(cleanedNumber)) {
      return {
        success: false,
        message: 'Phone number already registered'
      };
    }

    const user: RegisteredUser = {
      phoneNumber: cleanedNumber,
      email: STATIC_EMAIL,
      name: userData.name,
      college: userData.college,
      role: userData.role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData.name)}`,
      bio: userData.bio,
      registeredAt: Date.now()
    };

    this.registeredUsers.set(cleanedNumber, user);
    this.saveRegisteredUsers();

    console.log(`[OTP Auth] User registered: ${cleanedNumber}`);

    return {
      success: true,
      message: 'User registered successfully'
    };
  }

  /**
   * Get registered user info (for login)
   */
  getRegisteredUser(phoneNumber: string): RegisteredUser | null {
    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    return this.registeredUsers.get(cleanedNumber) || null;
  }

  /**
   * Get user by email
   */
  getUserByEmail(email: string): RegisteredUser | null {
    for (const user of this.registeredUsers.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return null;
  }
}

export const otpAuthService = new OTPAuthService();
