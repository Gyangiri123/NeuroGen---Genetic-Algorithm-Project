// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '../firebase/config';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Regular email/password login with validation
  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Check if fields are empty
    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // Check credentials (you can customize these or connect to backend)
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const user = storedUsers.find(u => u.email === email);

    if (!user) {
      setError('Email not found. Please sign up first.');
      setLoading(false);
      return;
    }

    if (user.password !== password) {
      setError('Incorrect password. Please try again.');
      setLoading(false);
      return;
    }

    // Successful login
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userName', user.name || email.split('@')[0]);
    
    setTimeout(() => {
      setLoading(false);
      navigate('/');
    }, 500);
  };

  // Google Sign-In
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Store authentication
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', user.displayName);
      localStorage.setItem('userPhoto', user.photoURL);
      
      console.log('Google login successful:', user);
      navigate('/');
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError(`Google sign-in failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // GitHub Sign-In
  const handleGithubLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, githubProvider);
      const user = result.user;
      
      // Store authentication
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', user.displayName);
      localStorage.setItem('userPhoto', user.photoURL);
      
      console.log('GitHub login successful:', user);
      navigate('/');
    } catch (error) {
      console.error('GitHub sign-in error:', error);
      setError(`GitHub sign-in failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="bg-slate-800/50 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
        <h2 className="text-3xl font-bold text-center text-sky-400 mb-6">
          Welcome Back
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(''); // Clear error when user types
              }}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
              placeholder="your@email.com"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(''); // Clear error when user types
              }}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-slate-600"></div>
          <span className="px-4 text-slate-400 text-sm">or continue with</span>
          <div className="flex-1 border-t border-slate-600"></div>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FcGoogle size={24} />
            <span>Continue with Google</span>
          </button>

          <button
            onClick={handleGithubLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-lg transition duration-300 border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaGithub size={24} />
            <span>Continue with GitHub</span>
          </button>
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-slate-400 mt-6 text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="text-sky-400 hover:text-sky-300 font-semibold">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
