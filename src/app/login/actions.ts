
'use server';

import { signIn } from '@/lib/auth';

export async function authenticate(prevState: string | undefined, formData: FormData) {
  try {
    await signIn('credentials', Object.fromEntries(formData));
    return 'Success';
  } catch (error) {
    return 'Log in failed.';
  }
}
