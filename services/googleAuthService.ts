// Google OAuth Authentication Service
// This service handles Google OAuth 2.0 flow using the Google Identity Services library

interface GoogleAuthConfig {
  clientId: string;
  redirectUri: string;
  scope?: string;
}

interface GoogleAuthUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  email_verified: boolean;
}

interface GoogleAuthResponse {
  credential: string; // JWT token
}

class GoogleAuthService {
  private config: GoogleAuthConfig | null = null;
  private isInitialized = false;

  /**
   * Initialize Google OAuth service
   * @param config Google OAuth configuration
   */
  async initialize(config: GoogleAuthConfig): Promise<void> {
    this.config = config;

    // Load Google Identity Services library
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: config.clientId,
            callback: this.handleCredentialResponse.bind(this),
          });
          this.isInitialized = true;
          resolve();
        } else {
          reject(new Error('Failed to load Google Identity Services'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load Google Identity Services script'));
      document.head.appendChild(script);
    });
  }

  /**
   * Render Google Sign-In button
   * @param containerId ID of the container element
   * @param options Button customization options
   */
  renderButton(
    containerId: string,
    options?: {
      theme?: 'outline' | 'filled_blue' | 'filled_black';
      size?: 'large' | 'medium' | 'small';
      text?: 'signin_with' | 'signup_with' | 'signin' | 'signup';
    }
  ): void {
    if (!this.isInitialized || !window.google?.accounts?.id) {
      console.error('Google Auth Service not initialized');
      return;
    }

    window.google.accounts.id.renderButton(
      document.getElementById(containerId),
      {
        theme: options?.theme || 'outline',
        size: options?.size || 'large',
        text: options?.text || 'signin_with',
      }
    );
  }

  /**
   * Trigger Google OAuth flow programmatically
   */
  async signIn(): Promise<void> {
    if (!this.isInitialized || !window.google?.accounts?.id) {
      throw new Error('Google Auth Service not initialized');
    }

    return new Promise((resolve, reject) => {
      window.google!.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          reject(new Error('Google prompt not displayed'));
        }
      });
      resolve();
    });
  }

  /**
   * Sign out from Google
   */
  async signOut(): Promise<void> {
    if (!this.isInitialized || !window.google?.accounts?.id) {
      throw new Error('Google Auth Service not initialized');
    }

    window.google.accounts.id.disableAutoSelect();
    window.google.accounts.id.revoke('', () => {
      console.log('User signed out');
    });
  }

  /**
   * Decode JWT token and extract user info
   * @param token JWT token from Google
   */
  private decodeJwt(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  }

  /**
   * Handle credential response from Google
   * @param response Credential response from Google
   */
  private handleCredentialResponse(response: GoogleAuthResponse): void {
    const userInfo = this.decodeJwt(response.credential);
    const event = new CustomEvent('google-auth-success', {
      detail: {
        id: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        email_verified: userInfo.email_verified,
        token: response.credential,
      },
    });
    window.dispatchEvent(event);
  }

  /**
   * Check if user is signed in
   */
  isSignedIn(): boolean {
    try {
      const token = sessionStorage.getItem('google_auth_token');
      return !!token;
    } catch {
      return false;
    }
  }

  /**
   * Get stored auth token
   */
  getToken(): string | null {
    try {
      return sessionStorage.getItem('google_auth_token');
    } catch {
      return null;
    }
  }

  /**
   * Store auth token
   */
  setToken(token: string): void {
    try {
      sessionStorage.setItem('google_auth_token', token);
    } catch (err) {
      console.error('Failed to store auth token:', err);
    }
  }

  /**
   * Clear stored token
   */
  clearToken(): void {
    try {
      sessionStorage.removeItem('google_auth_token');
    } catch (err) {
      console.error('Failed to clear auth token:', err);
    }
  }
}

// Export singleton instance
export const googleAuthService = new GoogleAuthService();

// Extend window object for TypeScript
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, options: any) => void;
          prompt: (callback: any) => void;
          disableAutoSelect: () => void;
          revoke: (hint: string, callback?: () => void) => void;
        };
      };
    };
  }
}
