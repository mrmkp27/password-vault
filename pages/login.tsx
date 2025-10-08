// pages/login.tsx
import React from 'react';
import { useEffect } from 'react';
import AuthForm from '../components/AuthForm';
import { useRouter,  } from 'next/router';

const LoginPage = () => {
  const router = useRouter();
  
useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleLogin = async (event: React.FormEvent, email: string, password: string) => {
    event.preventDefault();

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // In a real app, you would save the token to manage the session
      // For now, we'll just redirect to a placeholder dashboard page
      localStorage.setItem('token', data.token);
      router.push('/dashboard'); // Redirect to the main app page
    } else {
      alert(data.message || 'Something went wrong!');
    }
  };

  return <AuthForm formType="Login" onSubmit={handleLogin} />;
};

export default LoginPage;