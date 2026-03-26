// src/pages/Signup.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '../firebase/config';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // Password length check
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    // Password match check
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Check if email already exists
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = storedUsers.find(u => u.email === email);

    if (existingUser) {
      setError('Email already registered. Please login instead.');
      setLoading(false);
      return;
    }

    // Save new user
    const newUser = { name, email, password };
    storedUsers.push(newUser);
    localStorage.setItem('users', JSON.stringify(storedUsers));

    // Auto login after signup
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userName', name);

    setTimeout(() => {
      setLoading(false);
      navigate('/');
    }, 500);
  };

  // Google Sign-In
  const handleGoogleSignup = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', user.displayName);
      localStorage.setItem('userPhoto', user.photoURL);
      
      navigate('/');
    } catch (error) {
      console.error('Google sign-up error:', error);
      setError(`Google sign-up failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // GitHub Sign-In
  const handleGithubSignup = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, githubProvider);
      const user = result.user;
      
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', user.displayName);
      localStorage.setItem('userPhoto', user.photoURL);
      
      navigate('/');
    } catch (error) {
      console.error('GitHub sign-up error:', error);
      setError(`GitHub sign-up failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="bg-slate-800/50 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
        <h2 className="text-3xl font-bold text-center text-sky-400 mb-6">
          Create Account
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
              placeholder="John Doe"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
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
                setError('');
              }}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
                        Confirm Password
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setError('');
          }}
          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
          placeholder="••••••••"
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating Account...' : 'Sign Up'}
      </button>
    </form>

    <div className="mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-slate-800/50 text-slate-400">
            Or continue with
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full inline-flex justify-center items-center px-4 py-3 border border-slate-600 rounded-lg shadow-sm bg-slate-900/50 text-sm font-medium text-slate-300 hover:bg-slate-700/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FcGoogle className="h-5 w-5 mr-2" />
          Google
        </button>

        <button
          type="button"
          onClick={handleGithubSignup}
          disabled={loading}
          className="w-full inline-flex justify-center items-center px-4 py-3 border border-slate-600 rounded-lg shadow-sm bg-slate-900/50 text-sm font-medium text-slate-300 hover:bg-slate-700/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaGithub className="h-5 w-5 mr-2" />
          GitHub
        </button>
      </div>
    </div>

    <p className="mt-6 text-center text-sm text-slate-400">
      Already have an account?{' '}
      <Link
        to="/login"
        className="font-medium text-sky-400 hover:text-sky-300 transition"
      >
        Sign in
      </Link>
    </p>
  </div>
</div>
);
}

