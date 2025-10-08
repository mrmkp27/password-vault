// pages/signup.tsx
import React from 'react';
import { useEffect } from 'react';
import AuthForm from '../components/AuthForm';
import { useRouter } from 'next/router';

const SignupPage = () => {
  const router = useRouter();

useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

// pages/signup.tsx

const handleSignup = async (event: React.FormEvent, email: string, password: string) => {
  event.preventDefault();

  // Step 1: Attempt to sign the user up
  const signupResponse = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  // If signup failed, show an error and stop
  if (!signupResponse.ok) {
    const errorData = await signupResponse.json();
    alert(errorData.message || 'Something went wrong during signup!');
    return;
  }

  // Step 2: If signup was successful, automatically log the user in
  const loginResponse = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const loginData = await loginResponse.json();

  if (loginResponse.ok) {
    // If auto-login is successful, save the token...
    localStorage.setItem('token', loginData.token);
    // ...and redirect straight to the dashboard!
    router.push('/dashboard');
  } else {
    // This is a fallback in case the auto-login fails
    alert('Signup successful, but we couldn\'t log you in automatically. Please log in.');
    router.push('/login');
  }
};

  return <AuthForm formType="Sign Up" onSubmit={handleSignup} />;
};

export default SignupPage;