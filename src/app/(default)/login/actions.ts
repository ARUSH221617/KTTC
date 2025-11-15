'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { checkAdminCredentials, createAdminSession } from '@/lib/auth';

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

    // Check credentials using the existing function
    const user = await checkAdminCredentials(email, password);

    if (!user) {
      return {
        error: 'Invalid credentials. Please check your email and password.'
      };
    }

    // Create admin session - NOTE: createAdminSession is now async
    const sessionToken = await createAdminSession(user.id, user.email);

    // Set the session cookie
    (await
      // Set the session cookie
      cookies()).set('admin_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
      sameSite: 'strict', // Prevent CSRF
    });

    // Return success result
    return {
      success: true,
      error: undefined
    };
  } catch (error) {
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

// Separate function to handle the redirect after successful login
export async function loginAndRedirect(formData: FormData) {
  const result = await authenticate(undefined, formData);

  if (result.success) {
    redirect('/admin');
  }

  return result;
}