import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { 
  Bell, 
  Search, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  GraduationCap,
  Award,
  BookOpen,
  Users,
  Filter
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

const alerts = [
  {
    id: 1,
    title: 'JEE Main 2025 Registration',
    description: 'Last date to register for JEE Main 2025. Don\'t miss this important deadline!',
    type: 'exam',
    category: 'Engineering',
    priority: 'high',
    date: '2025-03-15',
    daysLeft: 3,
    status: 'active',
    source: 'NTA',
    link: 'https://jeemain.nta.nic.in'
  },
  {
    id: 2,
    title: 'Delhi University Admissions Open',
    description: 'Admissions for various undergraduate courses at Delhi University have started.',
    type: 'admission',
    category: 'University',
    priority: 'medium',
    date: '2025-04-01',
    daysLeft: 19,
    status: 'upcoming',
    source: 'Delhi University',
    link: 'https://du.ac.in'
  },
  {
    id: 3,
    title: 'National Merit Scholarship',
    description: 'Applications open for national merit-based scholarships for academic year 2025-26.',
    type: 'scholarship',
    category: 'Financial Aid',
    priority: 'high',
    date: '2025-03-30',
    daysLeft: 18,
    status: 'active',
    source: 'Ministry of Education',
    link: 'https://scholarships.gov.in'
  },
  {
    id: 4,
    title: 'NEET 2025 Application',
    description: 'Registration for NEET-UG 2025 medical entrance examination begins.',
    type: 'exam',
    category: 'Medical',
    priority: 'high',
    date: '2025-03-20',
    daysLeft: 8,
    status: 'active',
    source: 'NTA',
    link: 'https://neet.nta.nic.in'
  },
  {
    id: 5,
    title: 'Career Counseling Session',
    description: 'Free career guidance session for Class 12 students. Limited seats available.',
    type: 'counseling',
    category: 'Guidance',
    priority: 'medium',
    date: '2025-03-25',
    daysLeft: 13,
    status: 'active',
    source: 'EduGuide',
    link: '#'
  },
  {
    id: 6,
    title: 'IIT Bombay Open Day',
    description: 'Virtual open day for prospective students. Learn about courses and campus life.',
    type: 'event',
    category: 'Engineering',
    priority: 'low',
    date: '2025-04-05',
    daysLeft: 24,
    status: 'upcoming',
    source: 'IIT Bombay',
    link: 'https://iitb.ac.in'
  }
];

const alertIcons = {
  exam: BookOpen,
  admission: GraduationCap,
  scholarship: Award,
  counseling: Users,
  event: Calendar
};

const priorityColors = {
  high: 'bg-red-100 border-red-200 text-red-800',
  medium: 'bg-yellow-100 border-yellow-200 text-yellow-800',
  low: 'bg-green-100 border-green-200 text-green-800'
};

export function Alerts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [onlyActive, setOnlyActive] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false
  });
  const [alertsData, setAlertsData] = useState(alerts);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const response = await api.getAlerts();
      setAlertsData(response.alerts || alerts);
    } catch (error) {
      console.error('Failed to load alerts:', error);
      // Fallback to local data
      setAlertsData(alerts);
    } finally {
      setLoading(false);
    }
  };

  const types = Array.from(new Set(alerts.map(alert => alert.type)));
  const categories = Array.from(new Set(alerts.map(alert => alert.category)));

  const filteredAlerts = alertsData.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || alert.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || alert.category === selectedCategory;
    const matchesStatus = !onlyActive || alert.status === 'active';
    
    return matchesSearch && matchesType && matchesCategory && matchesStatus;
  });

  const handleSubscribe = async (alertId: number) => {
    try {
      await api.subscribeToAlert(alertId.toString());
      toast.success('Successfully subscribed to alerts!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to subscribe to alert');
    }
  };

  const handleUnsubscribe = async (alertId: number) => {
    try {
      // Implementation would depend on backend API
      toast.success('Unsubscribed from alerts.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to unsubscribe from alert');
    }
  };

  const activeAlerts = filteredAlerts.filter(alert => alert.status === 'active');
  const upcomingAlerts = filteredAlerts.filter(alert => alert.status === 'upcoming');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alerts & Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with important dates and opportunities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <Badge variant="default">
            {activeAlerts.length} active alerts
          </Badge>
        </div>
      </div>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notification Preferences</CardTitle>
          <CardDescription>
            Choose how you want to receive important updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="email-notifications"
                checked={notifications.email}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, email: checked }))
                }
              />
              <Label htmlFor="email-notifications">Email Notifications</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="push-notifications"
                checked={notifications.push}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, push: checked }))
                }
              />
              <Label htmlFor="push-notifications">Push Notifications</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="sms-notifications"
                checked={notifications.sms}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, sms: checked }))
                }
              />
              <Label htmlFor="sms-notifications">SMS Alerts</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {types.map(type => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2 px-3 py-2 border rounded-md">
              <Switch
                id="only-active"
                checked={onlyActive}
                onCheckedChange={setOnlyActive}
              />
              <Label htmlFor="only-active" className="text-sm">Active only</Label>
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Alerts */}
      {activeAlerts.filter(alert => alert.priority === 'high' && alert.daysLeft <= 7).length > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              Urgent Alerts - Action Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeAlerts
              .filter(alert => alert.priority === 'high' && alert.daysLeft <= 7)
              .map(alert => {
                const Icon = alertIcons[alert.type as keyof typeof alertIcons];
                return (
                  <div key={alert.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-900">{alert.title}</h4>
                        <p className="text-sm text-red-700">Due in {alert.daysLeft} days</p>
                      </div>
                    </div>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700">
                      Take Action
                    </Button>
                  </div>
                );
              })}
          </CardContent>
        </Card>
      )}

      {/* Alert Cards */}
      <div className="space-y-4">
        {filteredAlerts.map(alert => {
          const Icon = alertIcons[alert.type as keyof typeof alertIcons];
          const isUrgent = alert.priority === 'high' && alert.daysLeft <= 7;
          
          return (
            <Card key={alert.id} className={isUrgent ? 'border-red-200' : ''}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isUrgent ? 'bg-red-100' : 'bg-primary/10'
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        isUrgent ? 'text-red-600' : 'text-primary'
                      }`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{alert.title}</h3>
                        <Badge 
                          variant="outline"
                          className={priorityColors[alert.priority as keyof typeof priorityColors]}
                        >
                          {alert.priority}
                        </Badge>
                        <Badge variant="outline">
                          {alert.type}
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground mb-3">
                        {alert.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due: {new Date(alert.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {alert.daysLeft} days left
                        </div>
                        <div>
                          Source: {alert.source}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {alert.status === 'active' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    )}
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {alert.status === 'active' ? 'Active' : 'Upcoming'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {alert.category}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button size="sm">
                    Learn More
                  </Button>
                  <Button variant="outline" size="sm">
                    Set Reminder
                  </Button>
                  <Button variant="outline" size="sm">
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredAlerts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No alerts found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or filters
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setSelectedType('all');
                setSelectedCategory('all');
                setOnlyActive(false);
              }}
            >
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{activeAlerts.filter(a => a.priority === 'high').length}</div>
            <div className="text-sm text-muted-foreground">High Priority</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{activeAlerts.filter(a => a.type === 'exam').length}</div>
            <div className="text-sm text-muted-foreground">Exam Alerts</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{activeAlerts.filter(a => a.type === 'scholarship').length}</div>
            <div className="text-sm text-muted-foreground">Scholarships</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{upcomingAlerts.length}</div>
            <div className="text-sm text-muted-foreground">Upcoming</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}