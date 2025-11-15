
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormStatus } from 'react-dom';
import { authenticate } from './actions';
import { useActionState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [result, dispatch] = useActionState(authenticate, undefined);

  useEffect(() => {
    // Only show error toast if there's an error and it's not the redirect error
    if (result?.error) {
      toast({
        title: "Login Failed",
        description: result.error,
        variant: "destructive",
      });
    }
  }, [result]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={dispatch} className="space-y-4" id="login-form">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                onChange={(e) => validateField('email', e.target.value)}
              />
              <span id="email-error" className="text-xs text-red-500 hidden"></span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                onChange={(e) => validateField('password', e.target.value)}
              />
              <span id="password-error" className="text-xs text-red-500 hidden"></span>
            </div>
            <LoginButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Field validation function
function validateField(fieldName: string, value: string) {
  const errorElement = document.getElementById(`${fieldName}-error`) as HTMLSpanElement;

  // Clear previous error state
  errorElement.classList.add('hidden');
  const inputElement = document.getElementById(fieldName) as HTMLInputElement;
  inputElement.classList.remove('border-red-500');

  if (fieldName === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      showError('email', 'Email is required');
      return false;
    } else if (!emailRegex.test(value)) {
      showError('email', 'Please enter a valid email address');
      return false;
    }
  }

  if (fieldName === 'password') {
    if (!value) {
      showError('password', 'Password is required');
      return false;
    } else if (value.length < 6) {
      showError('password', 'Password must be at least 6 characters');
      return false;
    }
  }

  return true;
}

// Show error helper
function showError(field: string, message: string) {
  const errorElement = document.getElementById(`${field}-error`) as HTMLSpanElement;
  const inputElement = document.getElementById(field) as HTMLInputElement;

  errorElement.textContent = message;
  errorElement.classList.remove('hidden');
  inputElement.classList.add('border-red-500');
}

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="w-full"
      aria-disabled={pending}
      form="login-form"
      onClick={(e) => {
        const email = (document.getElementById('email') as HTMLInputElement).value;
        const password = (document.getElementById('password') as HTMLInputElement).value;

        // Validate both fields before submission
        const isEmailValid = validateField('email', email);
        const isPasswordValid = validateField('password', password);

        if (!isEmailValid || !isPasswordValid) {
          e.preventDefault();
          return false;
        }
      }}
    >
      {pending ? 'Logging in...' : 'Login'}
    </Button>
  );
}
