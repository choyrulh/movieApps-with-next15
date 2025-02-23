'use client'

import { useState } from 'react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-16 pt=[5vw]">
        <h1 className="text-4xl font-bold text-center mb-12">Contact Us</h1>
        
        <div className="bg-gray-800 rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                required
                className="w-full bg-gray-700 rounded-lg border border-gray-600 px-4 py-3 focus:outline-none focus:border-red-500 transition-colors"
                onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                required
                className="w-full bg-gray-700 rounded-lg border border-gray-600 px-4 py-3 focus:outline-none focus:border-red-500 transition-colors"
                onChange={(e: any) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea
                rows={4}
                required
                className="w-full bg-gray-700 rounded-lg border border-gray-600 px-4 py-3 focus:outline-none focus:border-red-500 transition-colors"
                onChange={(e: any) => setFormData({ ...formData, message: e.target.value })}
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 py-3 px-6 rounded-lg font-medium transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;