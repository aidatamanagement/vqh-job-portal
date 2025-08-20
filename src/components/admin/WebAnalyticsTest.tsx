import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { metricoolApi } from '@/utils/metricoolApi';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function WebAnalyticsTest() {
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<{
    apiToken: boolean;
    webAnalytics: boolean;
    error?: string;
    data?: any;
  } | null>(null);

  const testApi = async () => {
    setIsTesting(true);
    setTestResults(null);

    try {
      // Test 1: Check if API token is configured
      const apiToken = import.meta.env.VITE_METRICOOL_API_TOKEN;
      const hasApiToken = !!apiToken;

      // Test 2: Try to fetch web analytics
      let webAnalyticsSuccess = false;
      let webAnalyticsData = null;
      let error = null;

      if (hasApiToken) {
        try {
          webAnalyticsData = await metricoolApi.getWebAnalytics();
          webAnalyticsSuccess = true;
        } catch (err) {
          error = err instanceof Error ? err.message : 'Unknown error';
          webAnalyticsSuccess = false;
        }
      }

      setTestResults({
        apiToken: hasApiToken,
        webAnalytics: webAnalyticsSuccess,
        error: error || undefined,
        data: webAnalyticsData
      });

    } catch (err) {
      setTestResults({
        apiToken: false,
        webAnalytics: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Metricool API Test</h2>
          <p className="text-muted-foreground">
            Test the Metricool API connection and configuration
          </p>
        </div>
        <Button onClick={testApi} disabled={isTesting}>
          {isTesting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            'Test API Connection'
          )}
        </Button>
      </div>

      {/* Environment Variables Check */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">API Token</label>
              <div className="flex items-center gap-2">
                {import.meta.env.VITE_METRICOOL_API_TOKEN ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <Badge variant="secondary">Configured</Badge>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-500" />
                    <Badge variant="destructive">Missing</Badge>
                  </>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">User ID</label>
              <div className="text-sm text-muted-foreground">
                {import.meta.env.VITE_METRICOOL_USER_ID || '3950725 (default)'}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Blog ID</label>
              <div className="text-sm text-muted-foreground">
                {import.meta.env.VITE_METRICOOL_BLOG_ID || '5077788 (default)'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">API Token Check</label>
                <div className="flex items-center gap-2">
                  {testResults.apiToken ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-green-600">Token configured</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-red-600">Token missing</span>
                    </>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Web Analytics API</label>
                <div className="flex items-center gap-2">
                  {testResults.webAnalytics ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-green-600">API working</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-red-600">API failed</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {testResults.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong> {testResults.error}
                </AlertDescription>
              </Alert>
            )}

            {testResults.data && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Response Data</label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(testResults.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* API Configuration Help */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Help</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Required Environment Variables:</h4>
            <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
              <div>VITE_METRICOOL_API_TOKEN=your_api_token_here</div>
              <div>VITE_METRICOOL_USER_ID=3950725</div>
              <div>VITE_METRICOOL_BLOG_ID=5077788</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">API Endpoint:</h4>
            <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
              https://app.metricool.com/api/analytics/web?userId=3950725&blogId=5077788
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Authentication:</h4>
            <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
              Headers: X-Mc-Auth: your_api_token_here
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

