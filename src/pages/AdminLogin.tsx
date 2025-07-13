
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Lock, Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AdminLogin: React.FC = () => {
  const {
    login,
    isLoading
  } = useAppContext();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast({
        title: "Missing Fields",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }
    const success = await login(formData.email, formData.password);
    if (success) {
      toast({
        title: "Login Successful",
        description: "Welcome to the admin dashboard"
      });
      navigate('/admin');
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast({
        title: "Missing Email",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    setIsResetting(true);
    try {
      const redirectUrl = `${window.location.origin}/admin/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: redirectUrl,
      });

      if (error) {
        toast({
          title: "Reset Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Reset Email Sent",
          description: "Check your email for password reset instructions",
        });
        setShowForgotPassword(false);
        setResetEmail('');
      }
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsResetting(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex">
        {/* Left Side - SVG Image */}
        <div className="hidden lg:flex lg:w-1/2 relative">
          <img 
            src="/images/signin.svg" 
            alt="ViaQuest Hospice" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Side - Reset Password Form */}
        <div className="flex-1 lg:w-1/2 flex items-center justify-start px-4 sm:px-6 lg:px-20 bg-white">
          <div className="max-w-md w-full space-y-8">
            <div className="text-left">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
              <p className="text-gray-600 mt-2">Enter your email to receive reset instructions</p>
            </div>

            <form onSubmit={handlePasswordReset} className="space-y-6">
              <div>
                <Label htmlFor="resetEmail" className="text-sm font-medium text-gray-700">Email Address</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input 
                    id="resetEmail" 
                    type="email" 
                    value={resetEmail} 
                    onChange={e => setResetEmail(e.target.value)} 
                    className="pl-10 h-14 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" 
                    placeholder="Enter you Email Address" 
                    disabled={isResetting} 
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-full text-sm font-medium flex items-center justify-center" 
                disabled={isResetting}
              >
                {isResetting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending...</span>
                  </div>
                ) : 'Send Reset Email'}
              </Button>
            </form>

            <div className="text-left">
              <button 
                onClick={() => setShowForgotPassword(false)}
                className="text-sm text-blue-600 hover:underline flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - SVG Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img 
          src="/images/signin.svg" 
          alt="ViaQuest Hospice" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-start px-4 sm:px-6 lg:px-20 bg-white">
        <div className="max-w-md w-full space-y-8">
          <div className="text-left">
            <h2 className="text-3xl font-bold text-gray-900">Admin Login</h2>
            <p className="text-gray-600 mt-2">Sign in to access the dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input 
                  id="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={e => handleInputChange('email', e.target.value)} 
                  className="pl-10 h-14 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" 
                  placeholder="Enter you Email Address" 
                  disabled={isLoading} 
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input 
                  id="password" 
                  type={showPassword ? 'text' : 'password'} 
                  value={formData.password} 
                  onChange={e => handleInputChange('password', e.target.value)} 
                  className="pl-10 pr-10 h-14 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" 
                  placeholder="Enter your Password" 
                  disabled={isLoading} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600" 
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-full text-sm font-medium flex items-center justify-center" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Sign In</span>
                  <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                    <ArrowLeft className="w-3 h-3 text-blue-600 rotate-180" />
                  </div>
                </div>
              )}
            </Button>
          </form>

          <div className="text-left space-y-4">
            <button 
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-gray-600 hover:text-gray-900 block"
            >
              Forgot your password?
            </button>
            
            <button 
              onClick={() => navigate('/')}
              className="flex items-center text-sm text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Job Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
