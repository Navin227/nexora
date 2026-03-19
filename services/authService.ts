// Authentication Service with Username/Password and OTP for Sign-Up
// Integrates with AWS Cognito for production
// Structure prepared for Cognito migration

export const STATIC_EMAIL = 'team@nexora.app';

interface AuthUser {
  phoneNumber: string;
  email: string;
  username: string;
  name: string;
  college: string;
  role: string;
  avatar: string;
  bio: string;
  skills: string[];
  interests: string[];
  github?: string;
  linkedin?: string;
  cvUrl?: string;
  passwordHash: string; // In production, use Cognito - never store passwords
  registeredAt: number;
  cognitoId?: string; // AWS Cognito user ID for production
}

interface OTPSession {
  phoneNumber: string;
  username: string;
  otp: string;
  expiresAt: number;
  attempts: number;
}

class AuthService {
  private otpSessions: Map<string, OTPSession> = new Map();
  private registeredUsers: Map<string, AuthUser> = new Map();
  private OTP_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes
  private MAX_OTP_ATTEMPTS = 5;

  constructor() {
    this.loadRegisteredUsers();
  }

  /**
   * Load registered users from localStorage
   */
  private loadRegisteredUsers() {
    try {
      const stored = localStorage.getItem('nexora_auth_users');
      if (stored) {
        const users = JSON.parse(stored);
        Object.entries(users).forEach(([key, user]) => {
          this.registeredUsers.set(key, user as AuthUser);
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
      const users: Record<string, AuthUser> = {};
      this.registeredUsers.forEach((user, key) => {
        users[key] = user;
      });
      localStorage.setItem('nexora_auth_users', JSON.stringify(users));
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
   * Simple hash function for demo (use proper hashing in production)
   */
  private hashPassword(password: string): string {
    // In production, use bcrypt or AWS Cognito
    return btoa(password); // Base64 encode for demo only
  }

  /**
   * Verify password
   */
  private verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phoneNumber: string): boolean {
    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    return cleanedNumber.length >= 10;
  }

  /**
   * Validate username format (alphanumeric, min 3 chars, max 20)
   */
  validateUsername(username: string): { valid: boolean; message?: string } {
    if (username.length < 3) {
      return { valid: false, message: 'Username must be at least 3 characters' };
    }
    if (username.length > 20) {
      return { valid: false, message: 'Username must be less than 20 characters' };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return { valid: false, message: 'Username can only contain letters, numbers, and underscores' };
    }
    return { valid: true };
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number' };
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one special character (!@#$%^&*)' };
    }
    return { valid: true };
  }

  /**
   * Check if phone is already registered
   */
  isPhoneRegistered(phoneNumber: string): boolean {
    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    for (const user of this.registeredUsers.values()) {
      if (user.phoneNumber === cleanedNumber) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if username is available
   */
  isUsernameAvailable(username: string): boolean {
    for (const user of this.registeredUsers.values()) {
      if (user.username.toLowerCase() === username.toLowerCase()) {
        return false;
      }
    }
    return true;
  }

  /**
   * Request OTP for sign-up
   */
  requestSignUpOTP(phoneNumber: string, username: string): { success: boolean; message: string; otp?: string } {
    if (!this.validatePhoneNumber(phoneNumber)) {
      return { success: false, message: 'Invalid phone number format' };
    }

    const cleanedNumber = phoneNumber.replace(/\D/g, '');

    if (this.isPhoneRegistered(cleanedNumber)) {
      return { success: false, message: 'Phone number already registered' };
    }

    if (!this.isUsernameAvailable(username)) {
      return { success: false, message: 'Username already taken' };
    }

    const otp = this.generateOTP();
    const expiresAt = Date.now() + this.OTP_EXPIRY_TIME;

    this.otpSessions.set(cleanedNumber, {
      phoneNumber: cleanedNumber,
      username,
      otp,
      expiresAt,
      attempts: 0
    });

    console.log(`[Auth] Sign-up OTP for ${cleanedNumber}: ${otp}`);

    return {
      success: true,
      message: 'OTP sent to your phone number',
      otp
    };
  }

  /**
   * Verify OTP for sign-up
   */
  verifySignUpOTP(phoneNumber: string, otp: string): { success: boolean; message: string } {
    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    const session = this.otpSessions.get(cleanedNumber);

    if (!session) {
      return { success: false, message: 'No OTP session found. Request OTP first.' };
    }

    if (Date.now() > session.expiresAt) {
      this.otpSessions.delete(cleanedNumber);
      return { success: false, message: 'OTP expired. Please request a new one.' };
    }

    session.attempts++;

    if (session.attempts > this.MAX_OTP_ATTEMPTS) {
      this.otpSessions.delete(cleanedNumber);
      return { success: false, message: 'Too many attempts. Please request a new OTP.' };
    }

    if (otp !== session.otp) {
      return { success: false, message: `Incorrect OTP. ${this.MAX_OTP_ATTEMPTS - session.attempts} attempts remaining.` };
    }

    // OTP verified successfully
    return { success: true, message: 'OTP verified' };
  }

  /**
   * Complete sign-up: Register user with username, password, and profile
   */
  completeSignUp(phoneNumber: string, username: string, password: string, profileData: {
    name: string;
    college: string;
    role: string;
    bio: string;
    skills: string[];
    interests: string[];
    github?: string;
    linkedin?: string;
    cv?: File | null;
  }): { success: boolean; message: string; user?: AuthUser } {
    const cleanedNumber = phoneNumber.replace(/\D/g, '');

    // Validate inputs
    if (this.isPhoneRegistered(cleanedNumber)) {
      return { success: false, message: 'Phone number already registered' };
    }

    if (!this.isUsernameAvailable(username)) {
      return { success: false, message: 'Username already taken' };
    }

    const usernameValidation = this.validateUsername(username);
    if (!usernameValidation.valid) {
      return { success: false, message: usernameValidation.message! };
    }

    const passwordValidation = this.validatePassword(password);
    if (!passwordValidation.valid) {
      return { success: false, message: passwordValidation.message! };
    }

    if (!profileData.skills || profileData.skills.length === 0) {
      return { success: false, message: 'At least one skill is required' };
    }

    // Create new user with comprehensive profile
    const user: AuthUser = {
      phoneNumber: cleanedNumber,
      email: STATIC_EMAIL,
      username,
      name: profileData.name,
      college: profileData.college,
      role: profileData.role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profileData.name)}`,
      bio: profileData.bio,
      skills: profileData.skills || [],
      interests: profileData.interests || [],
      github: profileData.github,
      linkedin: profileData.linkedin,
      // In production, upload CV to cloud storage and store URL
      cvUrl: profileData.cv ? `cv-${cleanedNumber}-${Date.now()}` : undefined,
      passwordHash: this.hashPassword(password),
      registeredAt: Date.now()
    };

    this.registeredUsers.set(username.toLowerCase(), user);
    this.otpSessions.delete(cleanedNumber);
    this.saveRegisteredUsers();

    console.log(`[Auth] User registered: ${username} with ${profileData.skills.length} skills and ${profileData.interests.length} interests`);

    return {
      success: true,
      message: 'Account created successfully',
      user
    };
  }

  /**
   * Login with username and password
   */
  login(username: string, password: string): { success: boolean; message: string; user?: AuthUser } {
    const user = this.registeredUsers.get(username.toLowerCase());

    if (!user) {
      return { success: false, message: 'Username or password incorrect' };
    }

    if (!this.verifyPassword(password, user.passwordHash)) {
      return { success: false, message: 'Username or password incorrect' };
    }

    console.log(`[Auth] User logged in: ${username}`);

    return {
      success: true,
      message: 'Login successful',
      user
    };
  }

  /**
   * Get user by username
   */
  getUser(username: string): AuthUser | null {
    return this.registeredUsers.get(username.toLowerCase()) || null;
  }

  /**
   * Clear all sessions (for testing)
   */
  clearAllSessions(): void {
    this.otpSessions.clear();
  }

  /**
   * Note: AWS Cognito Integration
   * Replace the above methods with Cognito API calls in production:
   * - Use cognito-idp.signUp() for sign-up
   * - Use cognito-idp.respondToAuthChallenge() for OTP verification
   * - Use cognito-idp.initiateAuth() for login
   * - Use cognito-idp.adminSetUserPassword() for password management
   */
}

export const authService = new AuthService();
export default authService;
