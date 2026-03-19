// OTP Authentication Service
// Handles phone number verification with OTP

export const STATIC_EMAIL = 'team@nexora.app';

interface OTPSession {
  phoneNumber: string;
  otp: string;
  expiresAt: number;
  attempts: number;
}

class OTPAuthService {
  private sessions: Map<string, OTPSession> = new Map();
  private OTP_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes
  private MAX_ATTEMPTS = 5;

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
   * Request OTP for phone number
   */
  requestOTP(phoneNumber: string): { success: boolean; message: string; otp?: string } {
    if (!this.validatePhoneNumber(phoneNumber)) {
      return {
        success: false,
        message: 'Invalid phone number format'
      };
    }

    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    const otp = this.generateOTP();
    const expiresAt = Date.now() + this.OTP_EXPIRY_TIME;

    this.sessions.set(cleanedNumber, {
      phoneNumber: cleanedNumber,
      otp,
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
}

export const otpAuthService = new OTPAuthService();
