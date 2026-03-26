import React, { useState } from 'react';
import { motion } from 'framer-motion';


export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
  });


  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    alert('Thank you! Your message has been submitted.');
  };


  return (
    <motion.div
      className="min-h-screen bg-[#0f172a] py-12 px-6 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 bg-black bg-opacity-30 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-700 p-6">


        {/* Left Section */}
        <motion.div
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="p-6"
        >
          <h2 className="text-4xl font-bold text-cyan-400 mb-4">📬 Contact Us</h2>
          <p className="text-gray-300 text-base mb-6">
            Welcome to our AI-based image recognition project! We're building a system using Genetic Algorithms + Deep Learning for feature matching on noisy images — perfect for real-time object recognition.
          </p>


          <div className="space-y-4 text-sm">
            <div>
              <p className="font-semibold text-purple-300">📧 Email:</p>
              <p className="text-cyan-300">gyangiri508@gmail.com</p>
            </div>
            <div>
              <p className="font-semibold text-purple-300">📞 Phone:</p>
              <p className="text-cyan-300">+91-9876543210</p>
            </div>
          </div>


          <div className="mt-8 space-y-4">
            {[
              {
                title: '🛠 Technical Support',
                desc: 'Facing issues or bugs? Reach out — we'
                
              },
              {
                title: '💡 Project Feedback',
                desc: 'Have suggestions or feedback? Let us know!',
              },
              {
                title: '🎥 Media & Demos',
                desc: 'Contact us for demos, collaborations, or press.',
              },
            ].map((item, i) => (
              <div key={i} className="bg-[#1e1e2f] p-4 rounded-xl border border-purple-600">
                <h4 className="text-lg font-semibold text-cyan-400">{item.title}</h4>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>


        {/* Right Section: Contact Form */}
        <motion.div
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="p-6"
        >
          <h3 className="text-3xl font-bold text-cyan-400 mb-3">📨 Get in Touch</h3>
          <p className="text-gray-400 mb-6 text-sm">We're just a message away. Drop your query or feedback!</p>


          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                className="p-3 rounded-xl bg-[#2c2f48] text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                className="p-3 rounded-xl bg-[#2c2f48] text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>


            <input
              type="email"
              name="email"
              placeholder="Email Address"
              className="p-3 rounded-xl bg-[#2c2f48] text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500"
              value={formData.email}
              onChange={handleChange}
              required
            />


            <div className="flex gap-3">
              <select className="p-3 rounded-xl bg-[#2c2f48] text-white border-none">
                <option>+91</option>
                <option>+1</option>
              </select>
              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                className="p-3 rounded-xl w-full bg-[#2c2f48] text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>


            <textarea
              name="message"
              placeholder="Your Message"
              className="p-3 rounded-xl w-full bg-[#2c2f48] text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500"
              rows="5"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>


            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white py-3 rounded-xl font-semibold shadow-md hover:opacity-90 transition"
            >
              Submit
            </motion.button>


            <p className="text-xs text-gray-400 mt-2">
              By submitting this form, you agree to our{' '}
              <a href="#" className="underline text-cyan-300">Terms of Service</a> and{' '}
              <a href="#" className="underline text-cyan-300">Privacy Policy</a>.
            </p>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}
