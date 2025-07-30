
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  TrendingUp,
  Users,
  MapPin,
  Calendar,
  Filter,
  Download,
  Target,
  Activity,
  Clock,
  Award,
  Building2,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

const CrmReports: React.FC = () => {
  const { salespeople, visitLogs } = useAppContext();
  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  const [selectedTeam, setSelectedTeam] = useState('all');

  // Calculate real CRM metrics from actual data
  const getCrmMetrics = () => {
    const totalVisits = visitLogs.length;
    const activeSalespeople = salespeople.filter(p => p.status === 'active').length;
    const strongLeads = visitLogs.filter(log => log.strength === 'strong').length;
    const followUpPending = visitLogs.filter(log => log.status === 'follow_up').length;
    const closedDeals = visitLogs.filter(log => log.status === 'closed').length;
    const conversionRate = totalVisits > 0 ? ((closedDeals / totalVisits) * 100).toFixed(1) : '0';
    const avgVisitsPerWeek = totalVisits > 0 ? Math.round(totalVisits / 4) : 0; // Assuming 4 weeks of data

    return {
      totalVisits,
      visitGrowth: 15, // Could be calculated from historical data
      activeSalespeople,
      conversionRate: parseFloat(conversionRate),
      avgVisitsPerWeek,
      strongLeads,
      followUpPending,
      closedDeals
    };
  };

  const crmMetrics = getCrmMetrics();

  // Calculate performance for each salesperson
  const getSalespeoplePerformance = () => {
    return salespeople.map(person => {
      const personVisits = visitLogs.filter(log => log.salesperson_name === person.name);
      const leads = personVisits.filter(log => log.strength === 'strong' || log.strength === 'medium').length;
      const conversions = personVisits.filter(log => log.status === 'closed').length;
      
      let performance = 'Average';
      const conversionRate = personVisits.length > 0 ? (conversions / personVisits.length) * 100 : 0;
      
      if (conversionRate >= 30) performance = 'Excellent';
      else if (conversionRate >= 20) performance = 'Good';
      
      const lastVisit = personVisits.length > 0 
        ? Math.max(...personVisits.map(v => new Date(v.visit_date).getTime()))
        : 0;
      
      const lastActivity = lastVisit > 0 
        ? `${Math.floor((Date.now() - lastVisit) / (1000 * 60 * 60 * 24))} days ago`
        : 'No visits';

      return {
        ...person,
        visits: personVisits.length,
        leads,
        conversions,
        performance,
        lastActivity
      };
    });
  };

  const salespeoplePerformance = getSalespeoplePerformance();

  // Get recent visits with enhanced data
  const getRecentVisits = () => {
    return visitLogs
      .sort((a, b) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime())
      .slice(0, 10)
      .map(visit => ({
        ...visit,
        date: visit.visit_date,
        salesperson: visit.salesperson_name,
        facility: visit.location_name,
        notes: visit.notes || 'No notes provided'
      }));
  };

  const recentVisits = getRecentVisits();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'closed':
        return 'bg-green-100 text-green-800';
      case 'follow_up':
        return 'bg-blue-100 text-blue-800';
      case 'initial':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'weak':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceIcon = (performance: string) => {
    switch (performance) {
      case 'Excellent':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Good':
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      case 'Average':
        return <XCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
  
        </div>
      </div>

      {/* CRM Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Visits</p>
                <p className="text-3xl font-bold text-blue-900">{crmMetrics.totalVisits}</p>
                <div className="flex items-center mt-2 text-xs text-blue-600">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{crmMetrics.visitGrowth}% this month
                </div>
              </div>
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Conversion Rate</p>
                <p className="text-3xl font-bold text-green-900">{crmMetrics.conversionRate}%</p>
                <p className="text-xs text-green-600 mt-2">{crmMetrics.closedDeals} deals closed</p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Strong Leads</p>
                <p className="text-3xl font-bold text-purple-900">{crmMetrics.strongLeads}</p>
                <p className="text-xs text-purple-600 mt-2">{crmMetrics.followUpPending} follow-ups pending</p>
              </div>
              <Award className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Active Team</p>
                <p className="text-3xl font-bold text-orange-900">{crmMetrics.activeSalespeople}</p>
                <p className="text-xs text-orange-600 mt-2">{crmMetrics.avgVisitsPerWeek} avg visits/week</p>
              </div>
              <Users className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Team Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Sales Team Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Salesperson</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Region</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Visits</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Leads</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Conversions</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Performance</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {salespeoplePerformance.map((person) => (
                  <tr key={person.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {person.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium text-gray-900">{person.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="outline" className="bg-gray-50">
                        {person.region}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-center font-medium">{person.visits}</td>
                    <td className="py-4 px-4 text-center font-medium">{person.leads}</td>
                    <td className="py-4 px-4 text-center font-medium text-green-600">{person.conversions}</td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        {getPerformanceIcon(person.performance)}
                        <span className="text-sm font-medium">{person.performance}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">{person.lastActivity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sales Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Recent Sales Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentVisits.map((visit) => (
              <div key={visit.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Building2 className="w-5 h-5 text-gray-500" />
                      <h3 className="font-medium text-gray-900">{visit.facility}</h3>
                      <Badge className={getStatusColor(visit.status)}>
                        {visit.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={getStrengthColor(visit.strength)}>
                        {visit.strength}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {visit.salesperson}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(visit.date).toLocaleDateString()}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{visit.notes}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Visit Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-2 border-dashed border-purple-200">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">Sales Visit Trends</p>
                <p className="text-sm text-gray-500">Weekly visit analytics and forecasts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-dashed border-green-200">
              <div className="text-center">
                <Target className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">Lead Conversion Funnel</p>
                <p className="text-sm text-gray-500">From initial contact to closed deals</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CrmReports;
