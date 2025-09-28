import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  BookOpen as BookIcon,
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
  { 
    name: 'Dashboard', 
    href: '/', 
    icon: Home,
    description: 'Overview & Analytics',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    gradient: 'from-blue-500 to-cyan-500'
  },
  { 
    name: 'Profile', 
    href: '/profile', 
    icon: User,
    description: 'Personal Information',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    gradient: 'from-purple-500 to-pink-500'
  },
  { 
    name: 'Aptitude Quiz', 
    href: '/quiz', 
    icon: Brain,
    description: 'Skill Assessment',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    gradient: 'from-green-500 to-emerald-500'
  },
  { 
    name: 'Smart Recommendations', 
    href: '/advanced-recommendation-engine', 
    icon: Zap,
    description: 'AI-Powered Matching',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    gradient: 'from-yellow-500 to-orange-500',
    featured: true
  },
  { 
    name: 'Streams & Courses', 
    href: '/streams', 
    icon: BookOpen,
    description: 'Academic Programs',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    gradient: 'from-indigo-500 to-blue-500'
  },
  { 
    name: 'College Finder', 
    href: '/colleges', 
    icon: GraduationCap,
    description: 'Explore Institutions',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    gradient: 'from-orange-500 to-red-500'
  },
  { 
    name: 'Career Paths', 
    href: '/careers', 
    icon: TrendingUp,
    description: 'Future Opportunities',
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
    gradient: 'from-teal-500 to-cyan-500'
  },
  { 
    name: 'Awareness Center', 
    href: '/awareness', 
    icon: Lightbulb,
    description: 'Clear Confusion & Myths',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    gradient: 'from-amber-500 to-yellow-500',
    featured: true
  },
  { 
    name: 'Knowledge Quiz', 
    href: '/awareness-quiz', 
    icon: HelpCircle,
    description: 'Test Your Understanding',
    color: 'text-rose-600',
    bgColor: 'bg-rose-100',
    gradient: 'from-rose-500 to-pink-500'
  },
  { 
    name: 'Achievements', 
    href: '/achievements', 
    icon: Award,
    description: 'Badges & Points',
    color: 'text-fuchsia-600',
    bgColor: 'bg-fuchsia-100',
    gradient: 'from-fuchsia-500 to-pink-500'
  },
  {
    name: 'Financial Aid',
    href: '/financial-aid',
    icon: Search,
    description: 'Find scholarships',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    gradient: 'from-emerald-500 to-teal-500'
  },
  {
    name: 'Mentorship',
    href: '/mentorship',
    icon: Users,
    description: 'Connect with mentors',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    gradient: 'from-cyan-500 to-blue-500'
  },
  {
    name: 'Progress Tracker',
    href: '/progress',
    icon: BarChart3,
    description: 'Track your growth',
    color: 'text-sky-600',
    bgColor: 'bg-sky-100',
    gradient: 'from-sky-500 to-indigo-500'
  },
  {
    name: 'Skill Gap Analysis',
    href: '/skills',
    icon: Target,
    description: 'Analyze your skills',
    color: 'text-stone-600',
    bgColor: 'bg-stone-100',
    gradient: 'from-stone-500 to-gray-500'
  },
  {
    name: 'For Parents',
    href: '/parent',
    icon: Users,
    description: 'Parental guidance',
    color: 'text-lime-600',
    bgColor: 'bg-lime-100',
    gradient: 'from-lime-500 to-green-500'
  },
  {
    name: 'Predictive Analytics',
    href: '/predictive',
    icon: Sparkles,
    description: 'Future career insights',
    color: 'text-violet-600',
    bgColor: 'bg-violet-100',
    gradient: 'from-violet-500 to-purple-500'
  },
  { 
    name: 'Alerts', 
    href: '/alerts', 
    icon: Bell,
    description: 'Important Updates',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    gradient: 'from-red-500 to-pink-500'
  },
];

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();

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
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg transition-colors",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  <span className="flex-1">{item.name}</span>
                  {item.featured && (
                    <Badge variant="secondary" className="text-xs">
                      New
                    </Badge>
                  )}
                </Link>
              );
            })}

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex items-center px-3 py-2 rounded-lg transition-colors",
                  location.pathname === '/admin' 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Briefcase className="mr-3 h-5 w-5" />
                <span className="flex-1">Admin</span>
                <Badge variant="secondary" className="text-xs">Admin</Badge>
              </Link>
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
