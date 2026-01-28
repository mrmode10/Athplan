
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  team: string;
  plan: 'starter' | 'all-star' | 'hall-of-fame' | 'pilot';
  paymentMethod?: 'apple' | 'google' | 'card';
  setup_mode?: 'undecided' | 'demo' | 'blank';
}

const DELAY = 800; // Simulate network latency

export const mockBackend = {
  // Check if a user is currently logged in via localStorage
  getSession: (): User | null => {
    const stored = localStorage.getItem('athplan_session');
    return stored ? JSON.parse(stored) : null;
  },

  // Create a new user (Signup)
  signup: async (data: Omit<User, 'id' | 'plan'> & { password: string }): Promise<{ success: boolean; message?: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('athplan_users') || '[]');

        // Check if email exists
        if (users.find((u: any) => u.email === data.email)) {
          resolve({ success: false, message: 'Email already exists' });
          return;
        }

        // Store pending user for verification
        localStorage.setItem('athplan_pending_signup', JSON.stringify({
          ...data,
          id: Math.random().toString(36).substr(2, 9),
          plan: 'pilot'
        }));

        resolve({ success: true });
      }, DELAY);
    });
  },

  // Verify email code (Mock: always '123456')
  verifyEmail: async (code: string): Promise<{ success: boolean; user?: User; message?: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (code !== '123456') {
          resolve({ success: false, message: 'Invalid verification code' });
          return;
        }

        const pending = localStorage.getItem('athplan_pending_signup');
        if (!pending) {
          resolve({ success: false, message: 'Session expired. Please sign up again.' });
          return;
        }

        const newUser = JSON.parse(pending);
        // Note: We don't save to DB yet, wait for payment selection
        // But we return the user to show we verified them
        resolve({ success: true, user: newUser });
      }, DELAY);
    });
  },

  // Update payment method and finalize signup
  setPaymentMethod: async (paymentMethod: 'apple' | 'google' | 'card'): Promise<{ success: boolean; user?: User }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const pending = localStorage.getItem('athplan_pending_signup');
        if (!pending) {
          resolve({ success: false });
          return;
        }

        const newUser = JSON.parse(pending);
        newUser.paymentMethod = paymentMethod;

        // Save to "Database"
        const users = JSON.parse(localStorage.getItem('athplan_users') || '[]');
        users.push(newUser);
        localStorage.setItem('athplan_users', JSON.stringify(users));

        // Set Session
        localStorage.setItem('athplan_session', JSON.stringify(newUser));
        localStorage.removeItem('athplan_pending_signup');

        resolve({ success: true, user: newUser });
      }, DELAY);
    });
  },

  // Resend verification code
  resendVerificationCode: async (email: string): Promise<{ success: boolean }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Just a simulation, always succeeds
        console.log(`[MockBackend] Resent code to ${email}`);
        resolve({ success: true });
      }, DELAY);
    });
  },

  // Login
  login: async (email: string, password: string): Promise<{ success: boolean; user?: User; message?: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('athplan_users') || '[]');
        const user = users.find((u: any) => u.email === email && u.password === password); // In real app, hash password!

        if (user) {
          const { password, ...safeUser } = user;
          localStorage.setItem('athplan_session', JSON.stringify(safeUser));
          resolve({ success: true, user: safeUser });
        } else {
          resolve({ success: false, message: 'Invalid email or password' });
        }
      }, DELAY);
    });
  },

  // Simulate Google OAuth
  continueWithGoogle: async (): Promise<{ success: boolean; user: User }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockGoogleUser: User = {
          id: 'google_' + Math.random().toString(36).substr(2, 9),
          firstName: 'Alex',
          lastName: 'Smith',
          email: 'alex.smith@example.com',
          team: 'Example Team',
          plan: 'pilot'
        };

        // Save to "Database" if not exists (simplified logic)
        const users = JSON.parse(localStorage.getItem('athplan_users') || '[]');
        if (!users.find((u: any) => u.email === mockGoogleUser.email)) {
          users.push({ ...mockGoogleUser, password: 'google_auth_placeholder' });
          localStorage.setItem('athplan_users', JSON.stringify(users));
        }

        localStorage.setItem('athplan_session', JSON.stringify(mockGoogleUser));
        resolve({ success: true, user: mockGoogleUser });
      }, 1500);
    });
  },

  // Logout
  logout: async (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.removeItem('athplan_session');
        resolve();
      }, 500);
    });
  }
};
