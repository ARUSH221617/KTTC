
'use server';

import { signIn } from '@/lib/auth';

/**
 * Authenticates a user.
 *
 * @param {string | undefined} prevState - The previous state.
 * @param {FormData} formData - The form data.
 * @returns {Promise<string>} 'Success' if authentication is successful, 'Log in failed.' otherwise.
 */
export async function authenticate(prevState: string | undefined, formData: FormData) {
  try {
    await signIn('credentials', Object.fromEntries(formData));
    return 'Success';
  } catch (error) {
    return 'Log in failed.';
  }
}
