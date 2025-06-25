
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface ApplicationSearchProps {
  token: string;
  onTokenChange: (token: string) => void;
  onSearch: () => void;
  loading: boolean;
}

const ApplicationSearch: React.FC<ApplicationSearchProps> = ({
  token,
  onTokenChange,
  onSearch,
  loading
}) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-xl">Application Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="trackingToken">Tracking Token</Label>
            <Input
              id="trackingToken"
              value={token}
              onChange={(e) => onTokenChange(e.target.value)}
              placeholder="Enter your tracking token (e.g., abc123de-f456-789g-h012-ijk345lmn678)"
              className="mt-1"
            />
          </div>
          <div className="flex items-end">
            <Button 
              onClick={onSearch}
              disabled={loading || !token.trim()}
              className="w-full sm:w-auto"
            >
              {loading ? 'Searching...' : 'Track Application'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationSearch;
