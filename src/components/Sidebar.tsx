import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  User, 
  Brain, 
  BookOpen, 
  GraduationCap, 
  TrendingUp, 
  Bell,
  LogOut,
  Menu,
  X,
  Zap,
  Sparkles,
  BarChart3,
  Target,
  Award,
  Activity,
  Search,
  Building,
  Compass,
  Users,
  Briefcase,
  Lightbulb,
  HelpCircle
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { cn } from './ui/utils';

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home, section: 'essentials' },
  { name: 'Profile', href: '/profile', icon: User, section: 'essentials' },
  { name: 'Aptitude Quiz', href: '/quiz', icon: Brain, section: 'essentials' },
  { name: 'Smart Recommendations', href: '/advanced-recommendation-engine', icon: Zap, section: 'essentials', featured: true },
  { name: 'Streams & Courses', href: '/streams', icon: BookOpen, section: 'essentials' },
  { name: 'College Finder', href: '/colleges', icon: GraduationCap, section: 'essentials' },

  { name: 'Career Paths', href: '/careers', icon: TrendingUp, section: 'advanced' },
  { name: 'Awareness Center', href: '/awareness', icon: Lightbulb, section: 'advanced', featured: true },
  { name: 'Knowledge Quiz', href: '/awareness-quiz', icon: HelpCircle, section: 'advanced' },
  { name: 'Achievements', href: '/achievements', icon: Award, section: 'advanced' },
  { name: 'Financial Aid', href: '/financial-aid', icon: Search, section: 'advanced' },
  { name: 'Mentorship', href: '/mentorship', icon: Users, section: 'advanced' },
  { name: 'Progress Tracker', href: '/progress', icon: BarChart3, section: 'advanced' },
  { name: 'Skill Gap Analysis', href: '/skills', icon: Target, section: 'advanced' },
  { name: 'For Parents', href: '/parent', icon: Users, section: 'advanced' },
  { name: 'Predictive Analytics', href: '/predictive', icon: Sparkles, section: 'advanced' },
  { name: 'Alerts', href: '/alerts', icon: Bell, section: 'advanced' }
];

import { useState } from 'react';
import { logEvent } from '../utils/telemetry';

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const { user, logout } = useAuth();
  const [showMore, setShowMore] = useState(false);

  const essentials = navigation.filter(n => n.section === 'essentials');
  const advanced = navigation.filter(n => n.section === 'advanced');

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => onOpenChange(false)}
        />
      )}
      
      {/* Mobile menu button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => onOpenChange(!open)}
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b">
            <h1 className="text-xl font-semibold text-primary">EduGuide</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Welcome, {user?.displayName}
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2" aria-label="Main navigation">
            {essentials.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => { onOpenChange(false); logEvent('nav_click', { href: item.href, name: item.name }); }}
                  className={({ isActive }) => cn(
                    "flex items-center px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" aria-hidden="true" />
                  <span className="flex-1">{item.name}</span>
                  {item.featured && (
                    <Badge variant="secondary" className="text-xs">New</Badge>
                  )}
                </NavLink>
              );
            })}

            <div className="mt-2 border-t pt-2">
              <button aria-expanded={showMore} className="w-full text-left px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent" onClick={() => { setShowMore(!showMore); logEvent('sidebar_toggle_more', { open: !showMore }); }}>
                {showMore ? 'Show less' : 'More features'}
              </button>

              {showMore && (
                <div className="mt-2 space-y-1">
                  {advanced.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        onClick={() => { onOpenChange(false); logEvent('nav_click', { href: item.href, name: item.name }); }}
                        className={({ isActive }) => cn(
                          "flex items-center px-3 py-2 rounded-lg transition-colors",
                          isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <Icon className="mr-3 h-4 w-4" aria-hidden="true" />
                        <span className="flex-1 text-sm">{item.name}</span>
                        {item.featured && <Badge variant="secondary" className="text-xs">New</Badge>}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>

            {user?.role === 'admin' && (
              <NavLink
                to="/admin"
                onClick={() => { onOpenChange(false); logEvent('nav_click', { href: '/admin', name: 'Admin' }); }}
                className={({ isActive }) => cn(
                  "flex items-center px-3 py-2 rounded-lg transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Briefcase className="mr-3 h-5 w-5" aria-hidden="true" />
                <span className="flex-1">Admin</span>
                <Badge variant="secondary" className="text-xs">Admin</Badge>
              </NavLink>
            )}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={logout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
