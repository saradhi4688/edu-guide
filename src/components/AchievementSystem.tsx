import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Trophy, Flame, Award, Star, CheckCircle, RefreshCw } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: string;
  earnedAt?: string;
}

const CATALOG: Achievement[] = [
  { id: 'first_login', title: 'Welcome Aboard', description: 'Logged in for the first time', points: 10, icon: '👋' },
  { id: 'quiz_1', title: 'Quiz Starter', description: 'Completed your first quiz', points: 25, icon: '🧠' },
  { id: 'colleges_10', title: 'College Explorer', description: 'Viewed 10 colleges', points: 30, icon: '🏛️' },
  { id: 'streak_7', title: 'Weekly Streak', description: '7-day activity streak', points: 50, icon: '🔥' },
  { id: 'profile_100', title: 'Profile Pro', description: 'Completed profile 100%', points: 20, icon: '✅' },
];

export function AchievementSystem() {
  const [earned, setEarned] = useState<Record<string, Achievement>>({});
  const [points, setPoints] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    const data = localStorage.getItem('achievements');
    const pts = localStorage.getItem('points');
    const st = localStorage.getItem('streak');
    if (data) setEarned(JSON.parse(data));
    if (pts) setPoints(parseInt(pts));
    if (st) setStreak(parseInt(st));
  }, []);

  const progressPct = useMemo(() => {
    const total = CATALOG.reduce((s, a) => s + a.points, 0);
    return total ? Math.min(100, Math.round((points / total) * 100)) : 0;
  }, [points]);

  const reset = () => {
    setEarned({});
    setPoints(0);
    setStreak(0);
    localStorage.removeItem('achievements');
    localStorage.removeItem('points');
    localStorage.removeItem('streak');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Achievements</h1>
          <p className="text-muted-foreground mt-1">Badges, points, and streaks for motivation</p>
        </div>
        <Button variant="outline" onClick={reset}>
          <RefreshCw className="h-4 w-4 mr-2" />Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="text-2xl font-bold">{points}</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-600" />
            </div>
            <Progress value={progressPct} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Streak</p>
                <p className="text-2xl font-bold">{streak} days</p>
              </div>
              <Flame className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Keep learning daily</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Badges</p>
                <p className="text-2xl font-bold">{Object.keys(earned).length}</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">From your recent activity</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold">{progressPct}%</p>
              </div>
              <Star className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Towards catalog total</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Badge Catalog</CardTitle>
          <CardDescription>Earn badges by engaging with the platform</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATALOG.map((a) => {
            const isEarned = !!earned[a.id];
            return (
              <div key={a.id} className={`p-4 rounded-lg border ${isEarned ? 'bg-green-50' : ''}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-2xl">{a.icon}</div>
                    <h3 className="font-medium mt-1">{a.title}</h3>
                    <p className="text-sm text-muted-foreground">{a.description}</p>
                  </div>
                  <Badge variant={isEarned ? 'default' : 'secondary'}>{a.points} pts</Badge>
                </div>
                {isEarned && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                    <CheckCircle className="h-3 w-3" /> Earned on {new Date(earned[a.id].earnedAt!).toLocaleDateString()}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

export default AchievementSystem;

