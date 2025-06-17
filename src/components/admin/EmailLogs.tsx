
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Search, Calendar, User, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { EmailLog } from '@/types';

const EmailLogs: React.FC = () => {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<EmailLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    fetchEmailLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, selectedStatus]);

  const fetchEmailLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      // Transform the data to match our EmailLog interface
      const transformedLogs: EmailLog[] = (data || []).map(log => ({
        id: log.id,
        recipient_email: log.recipient_email,
        template_slug: log.template_slug,
        subject: log.subject,
        status: log.status,
        brevo_message_id: log.brevo_message_id,
        error_message: log.error_message,
        variables_used: (log.variables_used as Record<string, any>) || {},
        sent_at: log.sent_at,
        created_at: log.created_at
      }));
      
      setLogs(transformedLogs);
    } catch (error) {
      console.error('Error fetching email logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.recipient_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.template_slug.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(log => log.status === selectedStatus);
    }

    setFilteredLogs(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Mail className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      sent: "default",
      failed: "destructive",
      pending: "secondary"
    };

    return (
      <Badge variant={variants[status] || "secondary"} className="capitalize">
        {status}
      </Badge>
    );
  };

  const statusCounts = logs.reduce((acc, log) => {
    acc[log.status] = (acc[log.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Logs</h2>
          <p className="text-gray-600">Monitor email delivery status and troubleshoot issues</p>
        </div>
        <Button onClick={fetchEmailLogs} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Emails</p>
              <p className="text-2xl font-bold">{logs.length}</p>
            </div>
            <Mail className="w-8 h-8 text-gray-400" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sent</p>
              <p className="text-2xl font-bold text-green-600">{statusCounts.sent || 0}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600">{statusCounts.failed || 0}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending || 0}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by email, subject, or template..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white"
          >
            <option value="all">All Status</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </Card>

      {/* Email Logs Table */}
      <div className="space-y-4">
        {filteredLogs.map((log) => (
          <Card key={log.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {getStatusIcon(log.status)}
                  <span className="font-medium">{log.subject}</span>
                  {getStatusBadge(log.status)}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>{log.recipient_email}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span className="capitalize">{log.template_slug.replace('_', ' ')}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}</span>
                  </div>
                  
                  {log.sent_at && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Sent: {format(new Date(log.sent_at), 'MMM d, yyyy HH:mm')}</span>
                    </div>
                  )}
                </div>
                
                {log.error_message && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">
                      <strong>Error:</strong> {log.error_message}
                    </p>
                  </div>
                )}
                
                {log.brevo_message_id && (
                  <div className="mt-2">
                    <span className="text-xs text-gray-500">
                      Brevo ID: {log.brevo_message_id}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
        
        {filteredLogs.length === 0 && (
          <Card className="p-8 text-center">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No email logs found</h3>
            <p className="text-gray-600">
              {logs.length === 0 
                ? "No emails have been sent yet." 
                : "No emails match your current filters."
              }
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EmailLogs;
