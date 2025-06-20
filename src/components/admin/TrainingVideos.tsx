
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
import { Plus, Video, Play, Filter, Upload, ExternalLink } from 'lucide-react';

interface TrainingVideo {
  id: string;
  title: string;
  description: string;
  category: string;
  role: string;
  tag: 'mandatory' | 'optional';
  type: 'youtube' | 'vimeo' | 'direct';
  url: string;
  duration: string;
  viewCount: number;
  uploadDate: string;
}

const TrainingVideos: React.FC = () => {
  const [videos, setVideos] = useState<TrainingVideo[]>([
    {
      id: '1',
      title: 'Hospice Care Fundamentals',
      description: 'Introduction to hospice care principles and patient-centered approach.',
      category: 'Patient Care',
      role: 'All Staff',
      tag: 'mandatory',
      type: 'youtube',
      url: 'https://youtube.com/watch?v=example1',
      duration: '15:30',
      viewCount: 245,
      uploadDate: '2024-01-10',
    },
    {
      id: '2',
      title: 'Pain Management Techniques',
      description: 'Advanced pain management strategies for hospice patients.',
      category: 'Clinical',
      role: 'Nurses',
      tag: 'mandatory',
      type: 'vimeo',
      url: 'https://vimeo.com/example2',
      duration: '22:45',
      viewCount: 187,
      uploadDate: '2024-01-08',
    },
    {
      id: '3',
      title: 'Family Communication Skills',
      description: 'Best practices for communicating with families during difficult times.',
      category: 'Communication',
      role: 'All Staff',
      tag: 'optional',
      type: 'direct',
      url: '/videos/family-communication.mp4',
      duration: '18:20',
      viewCount: 156,
      uploadDate: '2024-01-05',
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    role: '',
    tag: 'optional' as 'mandatory' | 'optional',
    type: 'youtube' as 'youtube' | 'vimeo' | 'direct',
    url: '',
    duration: '',
  });

  const categories = ['Patient Care', 'Clinical', 'Communication', 'Compliance', 'Safety'];
  const roles = ['All Staff', 'Nurses', 'Managers', 'Social Workers', 'Chaplains'];

  const handleAddVideo = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      role: '',
      tag: 'optional',
      type: 'youtube',
      url: '',
      duration: '',
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    const newVideo: TrainingVideo = {
      id: Date.now().toString(),
      ...formData,
      viewCount: 0,
      uploadDate: new Date().toISOString().split('T')[0],
    };
    setVideos(prev => [newVideo, ...prev]);
    setIsDialogOpen(false);
  };

  const getTagBadgeColor = (tag: string) => {
    return tag === 'mandatory' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'youtube': return 'bg-red-100 text-red-800';
      case 'vimeo': return 'bg-blue-100 text-blue-800';
      case 'direct': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredVideos = videos.filter(video => {
    return (
      (filterCategory === 'all' || video.category === filterCategory) &&
      (filterRole === 'all' || video.role === filterRole) &&
      (filterTag === 'all' || video.tag === filterTag)
    );
  });

  const getStats = () => {
    const mandatory = videos.filter(v => v.tag === 'mandatory').length;
    const optional = videos.filter(v => v.tag === 'optional').length;
    const totalViews = videos.reduce((sum, v) => sum + v.viewCount, 0);
    return { mandatory, optional, totalViews };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Training Videos</h1>
          <p className="text-gray-600 mt-1">Manage training content and video library</p>
        </div>
        <Button onClick={handleAddVideo} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Video
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Video className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Videos</p>
                <p className="text-2xl font-bold text-gray-900">{videos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Mandatory</p>
                <p className="text-2xl font-bold text-gray-900">{stats.mandatory}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">O</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Optional</p>
                <p className="text-2xl font-bold text-gray-900">{stats.optional}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Play className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
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
                <Label htmlFor="category-filter">Category</Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="role-filter">Role</Label>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tag-filter">Tag</Label>
                <Select value={filterTag} onValueChange={setFilterTag}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tags</SelectItem>
                    <SelectItem value="mandatory">Mandatory</SelectItem>
                    <SelectItem value="optional">Optional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredVideos.map((video) => (
          <Card key={video.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-2">{video.title}</CardTitle>
                <div className="flex space-x-1">
                  <Badge className={getTagBadgeColor(video.tag)}>
                    {video.tag}
                  </Badge>
                  <Badge className={getTypeBadgeColor(video.type)}>
                    {video.type}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600 line-clamp-3">{video.description}</p>
                
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Category: {video.category}</span>
                  <span>Duration: {video.duration}</span>
                </div>
                
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Role: {video.role}</span>
                  <span>{video.viewCount} views</span>
                </div>
                
                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="text-xs text-gray-400">
                    Uploaded: {new Date(video.uploadDate).toLocaleDateString()}
                  </span>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Play className="w-4 h-4 mr-1" />
                      Play
                    </Button>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Video Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Training Video</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter video title"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter video description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="role">Target Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tag">Tag</Label>
                <Select
                  value={formData.tag}
                  onValueChange={(value: 'mandatory' | 'optional') => 
                    setFormData(prev => ({ ...prev, tag: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mandatory">Mandatory</SelectItem>
                    <SelectItem value="optional">Optional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="type">Video Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'youtube' | 'vimeo' | 'direct') => 
                    setFormData(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="vimeo">Vimeo</SelectItem>
                    <SelectItem value="direct">Direct Upload</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="url">Video URL</Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="Enter video URL or upload path"
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration (mm:ss)</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="e.g., 15:30"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
                Add Video
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrainingVideos;
