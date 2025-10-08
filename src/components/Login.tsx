import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { GraduationCap } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Alert, AlertDescription } from './ui/alert';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationNotice, setVerificationNotice] = useState<string | null>(null);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setVerificationNotice(null);

    try {
      await login(email, password);
      toast.success('Welcome to EduGuide!');
    } catch (error: any) {
      const msg = (error && error.message) ? String(error.message).toLowerCase() : '';
      if (msg.includes('confirm') || msg.includes('verify') || msg.includes('not confirmed') || msg.includes('not verified') || msg.includes('email')) {
        // Show a friendly verification notice instead of the raw backend message
        setVerificationNotice('Mail sent — please click the link in the email and come back to this page.');
        toast('Verification required — check your email.');
      } else {
        toast.error(error.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setVerificationNotice(null);

    try {
      const res: any = await signup(signupEmail, signupPassword, signupName);
      // If signup returns a message (no automatic sign-in), show verification notice
      if (res && res.message) {
        setVerificationNotice('Mail sent — please click the link in the email and come back to this page.');
        toast.success('Verification mail has been sent. Please confirm it.');
      } else {
        toast.success('Account created successfully! Welcome to EduGuide!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    const demoEmail = 'demo@eduguide.in';
    const demoUser = {
      uid: 'demo_user_123',
      email: demoEmail,
      displayName: 'Demo Student',
      role: 'student',
      profileCompleted: true,
      locale: 'en'
    };

    try {
      setEmail(demoEmail);
      setPassword('demo123');
      localStorage.setItem('user_data', JSON.stringify(demoUser));
      localStorage.setItem('access_token', 'demo_token_123');
      try { window.dispatchEvent(new CustomEvent('edu:authChange')); } catch {}
      toast.success('Entering demo mode...');
      try { navigate('/'); } catch (e) { window.location.href = '/'; }
    } catch (err) {
      console.error('Failed to start demo session:', err);
      toast.error('Demo login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">EduGuide</CardTitle>
          <CardDescription>
            Your personalized education and career guidance platform
          </CardDescription>
        </CardHeader>

        <CardContent>
          {verificationNotice && (
            <div className="mb-4">
              <Alert>
                <AlertDescription>{verificationNotice}</AlertDescription>
                <div className="mt-2 flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => setVerificationNotice(null)}>Dismiss</Button>
                </div>
              </Alert>
            </div>
          )}

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="student@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleDemoLogin}
                disabled={loading}
              >
                Try Demo Account
              </Button>

              <div className="mt-4 p-3 rounded-md bg-card text-sm text-muted-foreground">
                <h4 className="font-medium mb-1">Registration steps</h4>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Enter a valid email address you can access.</li>
                  <li>Choose a secure password (min 6 characters).</li>
                  <li>Check your email for a verification link and click it.</li>
                  <li>Return to this page and sign in after verifying your email.</li>
                </ol>
              </div>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-name">Full Name</Label>
                  <Input 
                    id="reg-name" 
                    placeholder="Your full name"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input 
                    id="reg-email" 
                    type="email" 
                    placeholder="student@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <Input 
                    id="reg-password" 
                    type="password" 
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Supporting education in Hindi & English</p>
            <p>हिंदी और अंग्रेजी में शिक्षा सहायता</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
