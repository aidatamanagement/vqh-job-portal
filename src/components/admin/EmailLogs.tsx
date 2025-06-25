
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Mail, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { EmailLog } from '@/types';

const EmailLogs: React.FC = () => {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEmailLogs();
  }, []);

  const fetchEmailLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;
      
      // Transform the data to match our EmailLog interface
      const transformedLogs: EmailLog[] = (data || []).map(log => ({
        id: log.id,
        recipient_email: log.recipient_email,
        template_slug: log.template_slug,
        subject: log.subject,
        status: log.status as 'pending' | 'sent' | 'failed' | 'bounced',
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

  const getPositionFromVariables = (variables: Record<string, any>) => {
    return variables?.position || variables?.applied_position || 'N/A';
  };

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
          <p className="text-gray-600">Latest 30 email records</p>
        </div>
        <Button onClick={fetchEmailLogs} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length > 0 ? (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">
                    {log.recipient_email}
                  </TableCell>
                  <TableCell>
                    {format(new Date(log.created_at), 'MMM d, HH:mm')}
                  </TableCell>
                  <TableCell>
                    {getPositionFromVariables(log.variables_used)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(log.status)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No email logs found</h3>
                  <p className="text-gray-600">No emails have been sent yet.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default EmailLogs;
