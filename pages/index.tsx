import { useEffect } from 'react';
import { useRouter } from 'next/router';

const HomePage = () => {
  const router = useRouter();

  useEffect(() => {
    // Check if a user token exists in local storage
    const token = localStorage.getItem('token');

    if (token) {
      // If the user is already logged in, redirect to the dashboard
      router.push('/dashboard');
    } else {
      // If the user is not logged in, redirect to the login page
      router.push('/login');
    }
  }, [router]); // The effect depends on the router being ready

  // Render a simple loading state while the redirect happens
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Loading...</p>
    </div>
  );
};

export default HomePage;