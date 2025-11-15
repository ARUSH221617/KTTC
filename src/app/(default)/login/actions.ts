
'use server';

import { signIn } from '@/lib/auth';
import { AuthError } from 'next-auth';

// Extend the return type to provide detailed information
type Result = {
  success?: boolean;
  error?: string;
};

export async function authenticate(prevState: Result | undefined, formData: FormData): Promise<Result> {
  try {
    // Convert FormData to object
    const rawFormData = Object.fromEntries(formData);

    // Validate email and password before attempting to sign in
    const email = rawFormData.email as string;
    const password = rawFormData.password as string;

    if (!email || !password) {
      return {
        error: 'Email and password are required.'
      };
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        error: 'Please enter a valid email address.'
      };
    }

    // Password validation
    if (password.length < 6) {
      return {
        error: 'Password must be at least 6 characters long.'
      };
    }

    // Attempt to sign in
    await signIn('credentials', {
      email,
      password,
      redirectTo: '/admin', // Redirect to admin dashboard after successful login
    });

    return {
      success: true,
      error: undefined
    };
  } catch (error) {
    // Handle NextAuth errors with more specific error messages
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return {
            error: 'Invalid credentials. Please check your email and password.'
          };
        case 'AccessDenied':
          return {
            error: 'Access denied. Your account may be deactivated.'
          };
        case 'Verification':
          return {
            error: 'Verification error. Please try again.'
          };
        case 'OAuthAccountNotLinked':
          return {
            error: 'Account not linked. Please try another sign in method.'
          };
        default:
          return {
            error: 'An unexpected authentication error occurred. Please try again.'
          };
      }
    }

    // Handle generic errors with more detailed messages
    console.error('Authentication error:', error);

    // Check for network errors or other specific error types
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        return {
          error: 'Network error. Please check your connection and try again.'
        };
      } else if (error.message.includes('timeout')) {
        return {
          error: 'Request timed out. Please try again.'
        };
      }
    }

    return {
      error: 'An unexpected error occurred during authentication. Please try again later.'
    };
  }
}
