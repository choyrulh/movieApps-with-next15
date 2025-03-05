// components/AuthForm.tsx
'use client'

import { useState } from 'react'
import { Mail, Lock, User, Github, Twitter, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function AuthForm({ isLogin = true }) {
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Handle form submission
    setTimeout(() => setIsSubmitting(false), 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Floating Background Elements */}
        <div className="absolute -inset-20 opacity-30">
          <div className="absolute w-48 h-48 bg-purple-400 rounded-full -top-12 -left-12 mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute w-48 h-48 bg-blue-400 rounded-full -top-12 -right-12 mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute w-48 h-48 bg-pink-400 rounded-full -bottom-12 left-20 mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-lg p-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              {isLogin ? 'Welcome Back!' : 'Create Account'}
            </h1>
            <p className="text-gray-200">
              {isLogin 
                ? 'Sign in to continue to your account'
                : 'Get started with your free account'}
            </p>
          </div>

          {/* Social Login */}
          <div className="flex gap-4 mb-8">
            <button className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white rounded-lg p-3 transition-all">
              <Github size={20} />
              <span className="hidden sm:inline">GitHub</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white rounded-lg p-3 transition-all">
              <Twitter size={20} />
              <span className="hidden sm:inline">Google</span>
            </button>
          </div>

          <div className="flex items-center mb-8">
            <div className="flex-1 border-t border-white/20"></div>
            <span className="px-4 text-white/60 text-sm">or continue with</span>
            <div className="flex-1 border-t border-white/20"></div>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" size={20} />
                <input
                  type="text"
                  placeholder="Username"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 focus:border-white/30 focus:ring-2 focus:ring-white/10 text-white placeholder-white/60 outline-none transition-all"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" size={20} />
              <input
                type="email"
                placeholder="Email address"
                className="w-full pl-10 pr-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 focus:border-white/30 focus:ring-2 focus:ring-white/10 text-white placeholder-white/60 outline-none transition-all"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className="w-full pl-10 pr-12 py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 focus:border-white/30 focus:ring-2 focus:ring-white/10 text-white placeholder-white/60 outline-none transition-all"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 text-white/60 hover:text-white/80 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-white/30 bg-white/5 focus:ring-white/10"
                  />
                  <span className="text-sm">Remember me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-white/60 hover:text-white/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white py-3 rounded-lg font-medium transition-all transform hover:scale-[1.01] disabled:opacity-50 disabled:transform-none"
            >
              {isSubmitting ? (
                <span className="animate-pulse">Processing...</span>
              ) : isLogin ? (
                'Sign In'
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-white/60">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <Link
              href={isLogin ? '/register' : '/login'}
              className="text-white/80 hover:text-white underline transition-colors"
            >
              {isLogin ? 'Create account' : 'Sign in'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}