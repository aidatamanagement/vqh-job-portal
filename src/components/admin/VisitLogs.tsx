
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, MapPin, Calendar, Filter, Download, Eye } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { VisitLog } from '@/types';

const VisitLogs: React.FC = () => {
  const { 
    visitLogs, 
    salespeople,
    createVisitLog, 
    updateVisitLog, 
    deleteVisitLog 
  } = useAppContext();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<VisitLog | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterStrength, setFilterStrength] = useState<string>('all');
  const [filterSalesperson, setFilterSalesperson] = useState<string>('all');
  const [formData, setFormData] = useState({
    salesperson_name: '',
    location_name: '',
    visit_date: '',
    visit_time: '',
    notes: '',
    status: 'initial' as 'initial' | 'follow_up' | 'closed',
    strength: 'medium' as 'strong' | 'medium' | 'weak',
  });

  const handleAddVisit = () => {
    setSelectedLog(null);
    setFormData({
      salesperson_name: '',
      location_name: '',
      visit_date: new Date().toISOString().split('T')[0],
      visit_time: new Date().toTimeString().slice(0, 5),
      notes: '',
      status: 'initial',
      strength: 'medium',
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    const success = await createVisitLog(formData);
    if (success) {
      setIsDialogOpen(false);
    }
  };

  const handleViewDetails = (log: VisitLog) => {
    setSelectedLog(log);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'initial': return 'bg-blue-100 text-blue-800';
      case 'follow_up': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStrengthBadgeColor = (strength: string) => {
    switch (strength) {
      case 'strong': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'weak': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLogs = visitLogs.filter(log => {
    return (
      (filterStatus === 'all' || log.status === filterStatus) &&
      (filterStrength === 'all' || log.strength === filterStrength) &&
      (filterSalesperson === 'all' || log.salesperson_name === filterSalesperson)
    );
  });

  const getStatusStats = () => {
    const initial = visitLogs.filter(log => log.status === 'initial').length;
    const followUp = visitLogs.filter(log => log.status === 'follow_up').length;
    const closed = visitLogs.filter(log => log.status === 'closed').length;
    return { initial, followUp, closed };
  };

  const stats = getStatusStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
          <MapPin className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
  
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={handleAddVisit} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Log Visit
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Visits</p>
                <p className="text-2xl font-bold text-gray-900">{visitLogs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">I</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Initial</p>
                <p className="text-2xl font-bold text-gray-900">{stats.initial}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Follow-up</p>
                <p className="text-2xl font-bold text-gray-900">{stats.followUp}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Closed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.closed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <div className="flex space-x-4">
              <div>
                <Label htmlFor="status-filter">Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="initial">Initial</SelectItem>
                    <SelectItem value="follow_up">Follow-up</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="strength-filter">Strength</Label>
                <Select value={filterStrength} onValueChange={setFilterStrength}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="strong">Strong</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="weak">Weak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="salesperson-filter">Salesperson</Label>
                <Select value={filterSalesperson} onValueChange={setFilterSalesperson}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {salespeople.map((person) => (
                      <SelectItem key={person.id} value={person.name}>
                        {person.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Visits ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Salesperson</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Strength</TableHead>
                <TableHead>Notes Preview</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                      <div>
                        <div className="font-medium">{new Date(log.visit_date).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-500">{log.visit_time}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{log.salesperson_name}</TableCell>
                  <TableCell>{log.location_name}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(log.status)}>
                      {log.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStrengthBadgeColor(log.strength)}>
                      {log.strength}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-600 truncate max-w-xs">
                      {log.notes}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(log)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Visit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Log New Visit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.visit_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, visit_date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.visit_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, visit_time: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="salesperson">Salesperson</Label>
              <Select
                value={formData.salesperson_name}
                onValueChange={(value) => setFormData(prev => ({ ...prev, salesperson_name: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select salesperson" />
                </SelectTrigger>
                <SelectContent>
                  {salespeople.map((person) => (
                    <SelectItem key={person.id} value={person.name}>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Location Name</Label>
              <Input
                id="location"
                value={formData.location_name}
                onChange={(e) => setFormData(prev => ({ ...prev, location_name: e.target.value }))}
                placeholder="Enter location name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'initial' | 'follow_up' | 'closed') => 
                    setFormData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initial">Initial</SelectItem>
                    <SelectItem value="follow_up">Follow-up</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="strength">Strength</Label>
                <Select
                  value={formData.strength}
                  onValueChange={(value: 'strong' | 'medium' | 'weak') => 
                    setFormData(prev => ({ ...prev, strength: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strong">Strong</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="weak">Weak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Enter visit notes and details..."
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
                Save Visit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Visit Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date</Label>
                  <p className="text-sm font-medium">{new Date(selectedLog.visit_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Time</Label>
                  <p className="text-sm font-medium">{selectedLog.visit_time}</p>
                </div>
              </div>
              <div>
                <Label>Salesperson</Label>
                <p className="text-sm font-medium">{selectedLog.salesperson_name}</p>
              </div>
              <div>
                <Label>Location</Label>
                <p className="text-sm font-medium">{selectedLog.location_name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusBadgeColor(selectedLog.status)}>
                    {selectedLog.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label>Strength</Label>
                  <Badge className={getStrengthBadgeColor(selectedLog.strength)}>
                    {selectedLog.strength}
                  </Badge>
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <p className="text-sm bg-gray-50 p-3 rounded border">{selectedLog.notes}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VisitLogs;
