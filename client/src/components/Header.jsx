// Header.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('isAuthenticated');

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Results", path: "/Result" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header className="bg-slate-950/80 backdrop-blur border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo / title */}
        <Link to="/" className="text-slate-50 font-semibold text-lg">
          <h1>NeuroGen (DigitRecognizer)</h1>
        </Link>

        {/* Desktop menu */}
        <nav className="hidden md:flex gap-6 text-sm items-center">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="text-slate-300 hover:text-sky-400 transition-colors"
            >
              {item.name}
            </Link>
          ))}
          
          {/* Auth button */}
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="text-slate-300 hover:text-sky-400 transition-colors font-medium"
            >
              Logout
            </button>
          ) : (
            <Link 
              to="/login" 
              className="text-slate-300 hover:text-sky-400 transition-colors font-medium"
            >
              Login
            </Link>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-slate-100"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/95">
          <nav className="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="text-slate-200 py-1 hover:text-sky-400 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Auth button for mobile */}
            {isAuthenticated ? (
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="text-slate-200 py-1 hover:text-sky-400 transition-colors text-left font-medium"
              >
                Logout
              </button>
            ) : (
              <Link 
                to="/login" 
                className="text-slate-200 py-1 hover:text-sky-400 transition-colors font-medium"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
