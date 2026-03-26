// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Header from './components/Header';
import About from './pages/About';
import Contact from './pages/contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import { PredictionProvider } from './context/PredictionContext';

export default function App() {
  return (
    <PredictionProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes (no header) */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected Routes (with header) */}
          <Route path="/*" element={
            <ProtectedRoute>
              <Header />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/result" element={<Profile />} />
                <Route path="/contact" element={<Contact />} />
              </Routes>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </PredictionProvider>
  );
}
