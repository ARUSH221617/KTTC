
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
    // Handle NextAuth errors
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return {
            error: 'Invalid email or password. Please try again.'
          };
        default:
          return {
            error: 'Something went wrong. Please try again later.'
          };
      }
    }

    // Handle generic errors
    console.error('Authentication error:', error);
    return {
      error: 'An unexpected error occurred. Please try again later.'
    };
  }
}
