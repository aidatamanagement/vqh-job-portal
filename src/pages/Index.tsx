
import React from 'react';
import Header from '@/components/Header';
import CursorGlow from '@/components/CursorGlow';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Heart, Award } from 'lucide-react';

const Index: React.FC = () => {
  const navigate = useNavigate();

  const handleAdminAccess = () => {
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-white relative animate-slide-up">
      <CursorGlow />
      <Header />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-primary">HospiceCare</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Providing compassionate care and support to patients and families during life's most challenging moments.
          </p>
          
          <Card className="p-8 max-w-md mx-auto bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <div className="text-center">
              <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Administrative Access</h2>
              <p className="text-gray-600 mb-6">
                Access the administrative dashboard to manage operations and services.
              </p>
              <Button
                onClick={handleAdminAccess}
                className="w-full bg-primary hover:bg-primary/90 py-3"
                size="lg"
              >
                Access Admin Dashboard
              </Button>
            </div>
          </Card>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <Users className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Expert Care Team</h3>
            <p className="text-gray-600">
              Our dedicated professionals provide comprehensive support tailored to each family's needs.
            </p>
          </Card>
          
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Compassionate Approach</h3>
            <p className="text-gray-600">
              We focus on comfort, dignity, and quality of life for patients and their loved ones.
            </p>
          </Card>
          
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <Award className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Quality Excellence</h3>
            <p className="text-gray-600">
              Committed to the highest standards of care and continuous improvement in our services.
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
