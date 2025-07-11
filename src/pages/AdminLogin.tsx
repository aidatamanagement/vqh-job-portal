
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 animate-slide-up">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center animate-slide-up">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
            <p className="text-gray-600 mt-2">Enter your email to receive reset instructions</p>
          </div>

          <Card className="p-8 animate-slide-up-delayed">
            <form onSubmit={handlePasswordReset} className="space-y-6">
              <div>
                <Label htmlFor="resetEmail" className="text-gray-900">Email Address</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input 
                    id="resetEmail" 
                    type="email" 
                    value={resetEmail} 
                    onChange={e => setResetEmail(e.target.value)} 
                    className="pl-10" 
                    placeholder="admin@hospicecare.com" 
                    disabled={isResetting} 
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 py-3" disabled={isResetting}>
                {isResetting ? (
                  <div className="flex items-center space-x-2">
                    <div className="spinner" />
                    <span>Sending...</span>
                  </div>
                ) : 'Send Reset Email'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <button 
                onClick={() => setShowForgotPassword(false)}
                className="text-sm text-primary hover:underline"
              >
                ← Back to Login
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 animate-slide-up">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center animate-slide-up">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Admin Login</h2>
          <p className="text-gray-600 mt-2">Sign in to access the dashboard</p>
        </div>

        <Card className="p-8 animate-slide-up-delayed">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-gray-900">Email Address</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input id="email" type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} className="pl-10" placeholder="admin@hospicecare.com" disabled={isLoading} />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-900">Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input id="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={e => handleInputChange('password', e.target.value)} className="pl-10 pr-10" placeholder="Enter your password" disabled={isLoading} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600" disabled={isLoading}>
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 py-3" disabled={isLoading}>
              {isLoading ? <div className="flex items-center space-x-2">
                  <div className="spinner" />
                  <span>Signing in...</span>
                </div> : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <button 
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-primary hover:underline mt-2"
            >
              Forgot your password?
            </button>
          </div>
        </Card>

        <div className="text-center animate-slide-up-delayed-2">
          <Button variant="ghost" onClick={() => navigate('/')} className="text-gray-600 hover:text-gray-900">
            ← Back to Job Portal
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
