
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus, Edit, Trash2, Users, MapPin, Phone, Mail } from 'lucide-react';

interface Salesperson {
  id: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  role: 'manager' | 'sales_rep';
  status: 'active' | 'inactive';
  visitsThisMonth: number;
}

const Salespeople: React.FC = () => {
  const [salespeople, setSalespeople] = useState<Salesperson[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      phone: '(555) 123-4567',
      region: 'North Zone',
      role: 'manager',
      status: 'active',
      visitsThisMonth: 15,
    },
    {
      id: '2',
      name: 'Mike Chen',
      email: 'mike.chen@company.com',
      phone: '(555) 234-5678',
      region: 'South Zone',
      role: 'sales_rep',
      status: 'active',
      visitsThisMonth: 12,
    },
    {
      id: '3',
      name: 'Emma Davis',
      email: 'emma.davis@company.com',
      phone: '(555) 345-6789',
      region: 'East Zone',
      role: 'sales_rep',
      status: 'active',
      visitsThisMonth: 8,
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSalesperson, setEditingSalesperson] = useState<Salesperson | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    region: '',
    role: 'sales_rep' as 'manager' | 'sales_rep',
    status: 'active' as 'active' | 'inactive',
  });

  const regions = ['North Zone', 'South Zone', 'East Zone', 'West Zone', 'Central Zone'];

  const handleAddSalesperson = () => {
    setEditingSalesperson(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      region: '',
      role: 'sales_rep',
      status: 'active',
    });
    setIsDialogOpen(true);
  };

  const handleEditSalesperson = (person: Salesperson) => {
    setEditingSalesperson(person);
    setFormData({
      name: person.name,
      email: person.email,
      phone: person.phone,
      region: person.region,
      role: person.role,
      status: person.status,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingSalesperson) {
      setSalespeople(prev => prev.map(person => 
        person.id === editingSalesperson.id 
          ? { ...person, ...formData }
          : person
      ));
    } else {
      const newPerson: Salesperson = {
        id: Date.now().toString(),
        ...formData,
        visitsThisMonth: 0,
      };
      setSalespeople(prev => [...prev, newPerson]);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setSalespeople(prev => prev.filter(person => person.id !== id));
  };

  const getRoleBadgeColor = (role: string) => {
    return role === 'manager' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Salespeople</h1>
        </div>
        <Button onClick={handleAddSalesperson} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Salesperson
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Salespeople</p>
                <p className="text-2xl font-bold text-gray-900">{salespeople.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Badge className="w-8 h-8 bg-purple-500">M</Badge>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Managers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {salespeople.filter(p => p.role === 'manager').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MapPin className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Regions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(salespeople.map(p => p.region)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">V</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Visits</p>
                <p className="text-2xl font-bold text-gray-900">
                  {salespeople.reduce((sum, p) => sum + p.visitsThisMonth, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Salespeople Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Team</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Visits This Month</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salespeople.map((person) => (
                <TableRow key={person.id}>
                  <TableCell className="font-medium">{person.name}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="w-3 h-3 mr-1" />
                        {person.email}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="w-3 h-3 mr-1" />
                        {person.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{person.region}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(person.role)}>
                      {person.role === 'manager' ? 'Manager' : 'Sales Rep'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(person.status)}>
                      {person.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">{person.visitsThisMonth}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditSalesperson(person)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(person.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSalesperson ? 'Edit Salesperson' : 'Add New Salesperson'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <Label htmlFor="region">Region</Label>
              <Select
                value={formData.region}
                onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'manager' | 'sales_rep') => 
                  setFormData(prev => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales_rep">Sales Representative</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'inactive') => 
                  setFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
                {editingSalesperson ? 'Update' : 'Add'} Salesperson
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Salespeople;
