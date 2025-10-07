import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { BarChart3, Users, BookOpen, GraduationCap, Shield, Settings, Database, RefreshCw } from 'lucide-react';
import { useAuth } from './AuthContext';

export function AdminPanel() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const stats = useMemo(() => ([
    { label: 'Active Users', value: 1284, icon: Users, color: 'text-blue-600' },
    { label: 'Quizzes Taken', value: 5472, icon: BookOpen, color: 'text-purple-600' },
    { label: 'Colleges Viewed', value: 23190, icon: GraduationCap, color: 'text-green-600' },
    { label: 'Alerts Sent', value: 820, icon: BarChart3, color: 'text-orange-600' },
  ]), []);

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>This page is restricted to administrators.</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="destructive">Admin Only</Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground mt-1">Manage content, users, and system settings</p>
        </div>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-2xl font-bold">{value.toLocaleString()}</p>
                </div>
                <Icon className={`h-8 w-8 ${color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Content Management</CardTitle>
            <CardDescription>Colleges, scholarships, alerts, and quizzes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span>Colleges Database</span>
              </div>
              <Button size="sm" variant="outline">Manage</Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span>Scholarships</span>
              </div>
              <Button size="sm" variant="outline">Manage</Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span>Alerts & Timelines</span>
              </div>
              <Button size="sm" variant="outline">Manage</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>Security and roles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Roles & Permissions</span>
              </div>
              <Button size="sm" variant="outline">Open</Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Feature Flags</span>
              </div>
              <Button size="sm" variant="outline">Open</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminPanel;
