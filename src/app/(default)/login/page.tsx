
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
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Basic validation
    if (!email || !password) {
      toast({
        title: "Login Failed",
        description: "Email and password are required.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful - redirect to admin dashboard
        toast({
          title: "Login Successful",
          description: "Redirecting to dashboard...",
        });
        router.push('/admin');
      } else {
        // Login failed
        toast({
          title: "Login Failed",
          description: data.error || "Invalid credentials. Please check your email and password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
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
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
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

