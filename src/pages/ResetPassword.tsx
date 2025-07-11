import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Lock, Eye, EyeOff, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // Check if we have the required URL parameters for password reset
  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const type = searchParams.get('type');

    if (type === 'recovery' && accessToken && refreshToken) {
      // Set the session with the tokens from the URL
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      }).then(({ error }) => {
        if (error) {
          console.error('Error setting session:', error);
          setTokenValid(false);
          toast({
            title: "Invalid Reset Link",
            description: "This password reset link is invalid or has expired.",
            variant: "destructive"
          });
        } else {
          setTokenValid(true);
        }
      });
    } else {
      setTokenValid(false);
      toast({
        title: "Invalid Reset Link",
        description: "This password reset link is invalid or has expired.",
        variant: "destructive"
      });
    }
  }, [searchParams]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validatePassword = () => {
    if (!formData.newPassword || formData.newPassword.length < 8) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 8 characters long",
        variant: "destructive"
      });
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "New password and confirmation password do not match",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tokenValid) {
      toast({
        title: "Invalid Session",
        description: "Please request a new password reset link",
        variant: "destructive"
      });
      return;
    }

    if (!validatePassword()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (error) {
        toast({
          title: "Reset Failed",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      setIsSuccess(true);
      toast({
        title: "Password Reset Successful",
        description: "Your password has been updated successfully",
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/admin/login');
      }, 3000);

    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 1, label: 'Weak', color: 'text-red-600' };
    if (password.length < 10) return { strength: 2, label: 'Fair', color: 'text-yellow-600' };
    if (password.length < 12) return { strength: 3, label: 'Good', color: 'text-blue-600' };
    return { strength: 4, label: 'Strong', color: 'text-green-600' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  // Show loading state while checking token
  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Validating Reset Link</h2>
            <p className="text-gray-600 mt-2">Please wait while we validate your reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state for invalid token
  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 animate-slide-up">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center animate-slide-up">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Invalid Reset Link</h2>
            <p className="text-gray-600 mt-2">This password reset link is invalid or has expired.</p>
          </div>

          <Card className="p-8 animate-slide-up-delayed">
            <div className="text-center space-y-4">
              <p className="text-gray-700">
                Password reset links are only valid for a limited time. Please request a new one.
              </p>
              <Button 
                onClick={() => navigate('/admin/login')}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Request New Reset Link
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Show success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 animate-slide-up">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center animate-slide-up">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Password Reset Complete</h2>
            <p className="text-gray-600 mt-2">Your password has been successfully updated.</p>
          </div>

          <Card className="p-8 animate-slide-up-delayed">
            <div className="text-center space-y-4">
              <p className="text-gray-700">
                You will be redirected to the login page in a few seconds.
              </p>
              <Button 
                onClick={() => navigate('/admin/login')}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Go to Login Now
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Show password reset form
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 animate-slide-up">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center animate-slide-up">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Set New Password</h2>
          <p className="text-gray-600 mt-2">Enter your new password below</p>
        </div>

        {/* Security Notice */}
        <Card className="border-blue-200 bg-blue-50 animate-slide-up-delayed">
          <div className="p-4 flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-800 mb-1">Security Tips</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Use a strong password with at least 8 characters</li>
                <li>• Include uppercase letters, lowercase letters, numbers, and symbols</li>
                <li>• Don't reuse passwords from other accounts</li>
                <li>• Consider using a password manager</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-8 animate-slide-up-delayed">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="newPassword" className="text-gray-900">New Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input 
                  id="newPassword" 
                  type={showNewPassword ? 'text' : 'password'} 
                  value={formData.newPassword} 
                  onChange={e => handleInputChange('newPassword', e.target.value)} 
                  className="pl-10 pr-10" 
                  placeholder="Enter your new password" 
                  disabled={isLoading} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowNewPassword(!showNewPassword)} 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600" 
                  disabled={isLoading}
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {formData.newPassword && (
                <div className="mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Password Strength:</span>
                    <span className={`text-xs font-medium ${passwordStrength.color}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength.strength === 1 ? 'bg-red-500 w-1/4' :
                        passwordStrength.strength === 2 ? 'bg-yellow-500 w-2/4' :
                        passwordStrength.strength === 3 ? 'bg-blue-500 w-3/4' :
                        passwordStrength.strength === 4 ? 'bg-green-500 w-full' : 'w-0'
                      }`}
                    />
                  </div>
                </div>
              )}
              
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 8 characters long
              </p>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-gray-900">Confirm New Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input 
                  id="confirmPassword" 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  value={formData.confirmPassword} 
                  onChange={e => handleInputChange('confirmPassword', e.target.value)} 
                  className="pl-10 pr-10" 
                  placeholder="Confirm your new password" 
                  disabled={isLoading} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600" 
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 py-3" 
              disabled={isLoading || !formData.newPassword || !formData.confirmPassword}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="spinner" />
                  <span>Updating Password...</span>
                </div>
              ) : 'Update Password'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <Button variant="ghost" onClick={() => navigate('/admin/login')} className="text-gray-600 hover:text-gray-900">
              ← Back to Login
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword; 