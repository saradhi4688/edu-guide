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

  // Import/export state and handlers for bulk seeding colleges into localStorage / window
  const [importing, setImporting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [importCount, setImportCount] = useState<number>(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('__EXTRA_COLLEGES__');
      if (raw) {
        const parsed = JSON.parse(raw);
        (window as any).__EXTRA_COLLEGES__ = parsed;
        setImportCount(Array.isArray(parsed) ? parsed.length : 0);
      }
    } catch (e) { console.warn('Failed to load extra colleges from storage', e); }
  }, []);

  function splitListField(val: any) {
    if (!val && val !== 0) return [];
    if (Array.isArray(val)) return val;
    return String(val).split(/;|\||,|\n/).map((s) => s.trim()).filter(Boolean);
  }

  function normalizeRecord(r: any) {
    const id = r.id || r.ID || (r.name ? String(r.name).toLowerCase().replace(/[^a-z0-9]+/g, '_') : Math.random().toString(36).slice(2));
    const courses = [] as string[];
    if (Array.isArray(r.courses)) {
      r.courses.forEach((c: any) => { if (typeof c === 'string') courses.push(...splitListField(c)); else if (c) courses.push(String(c)); });
    } else if (typeof r.courses === 'string') courses.push(...splitListField(r.courses));
    else if (r.course) courses.push(...splitListField(r.course));

    return {
      id,
      name: r.name || r.college || '',
      address: r.address || r.addr || '',
      city: r.city || '',
      state: r.state || '',
      latitude: Number(r.latitude || r.lat || r.LAT || 0),
      longitude: Number(r.longitude || r.lon || r.lng || 0),
      rating: Number(r.rating || 4),
      reviews: Number(r.reviews || 0),
      website: r.website || r.url || '',
      phone: r.phone || '',
      courses: courses.length ? courses : splitListField(r.course_list || r.courses_list),
      fees: r.fees || r.fee || '',
      admissionStatus: r.admissionStatus || r.admission_status || 'Open',
      type: r.type || 'Private',
      establishedYear: Number(r.establishedYear || r.established_year || 2000),
      affiliation: r.affiliation || '',
      specializations: splitListField(r.specializations),
      facilities: splitListField(r.facilities),
      placementRate: Number(r.placementRate || r.placement_rate || 0),
      averagePackage: r.averagePackage || r.average_package || '',
      photos: splitListField(r.photos)
    };
  }

  function parseCSV(content: string) {
    const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return [];
    const headerLine = lines.shift() as string;
    const headers = headerLine.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/).map(h => h.trim().replace(/^\"|\"$/g, ''));
    return lines.map((line) => {
      const cols = line.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/).map(c => c.trim().replace(/^\"|\"$/g, ''));
      const obj: any = {};
      headers.forEach((h, i) => { obj[h] = cols[i] ?? ''; });
      return obj;
    });
  }

  async function handleFileUpload(file: File | null) {
    if (!file) return;
    setImporting(true);
    setStatus(null);
    try {
      const text = await file.text();
      let parsed: any[] = [];
      if (file.name.toLowerCase().endsWith('.json')) {
        const data = JSON.parse(text);
        parsed = Array.isArray(data) ? data : (data.colleges || []);
      } else if (file.name.toLowerCase().endsWith('.csv')) {
        parsed = parseCSV(text);
      } else {
        setStatus('Unsupported file type. Use .json or .csv');
        setImporting(false);
        return;
      }

      const normalized = parsed.map(normalizeRecord);
      // persist
      try { (window as any).__EXTRA_COLLEGES__ = normalized; localStorage.setItem('__EXTRA_COLLEGES__', JSON.stringify(normalized)); } catch (e) { console.warn('Failed to persist imported colleges', e); }
      setImportCount(normalized.length);
      setStatus(`Imported ${normalized.length} colleges into local store.`);
    } catch (e: any) {
      console.error('Import failed', e);
      setStatus('Import failed: ' + (e?.message || String(e)));
    } finally { setImporting(false); }
  }

  function handleExport() {
    try {
      const data = (window as any).__EXTRA_COLLEGES__ || JSON.parse(localStorage.getItem('__EXTRA_COLLEGES__') || '[]');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'extra_colleges_export.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) { console.error('Export failed', e); setStatus('Export failed'); }
  }

  function handleClear() {
    try { delete (window as any).__EXTRA_COLLEGES__; localStorage.removeItem('__EXTRA_COLLEGES__'); setImportCount(0); setStatus('Cleared imported colleges.'); } catch (e) { console.warn('Clear failed', e); setStatus('Clear failed'); }
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

      <Card>
        <CardHeader>
          <CardTitle>Bulk Import Colleges</CardTitle>
          <CardDescription>Upload a JSON or CSV file to seed colleges locally (client-only). This works on the free plan and stores data in your browser.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <input id="college-file-input" type="file" accept=".json,.csv" onChange={(e) => handleFileUpload(e.target.files?.[0] || null)} className="border rounded-md p-2" />

            <div className="flex gap-2">
              <Button size="sm" onClick={handleExport}>Export JSON</Button>
              <Button size="sm" variant="outline" onClick={handleClear}>Clear Imported</Button>
              <Button size="sm" variant="ghost" onClick={() => {
                const sample = [
                  {
                    id: 'sample_college_1',
                    name: 'Sample Institute of Technology',
                    address: '123 Sample Rd',
                    city: 'Sample City',
                    state: 'Sample State',
                    latitude: 12.9716,
                    longitude: 77.5946,
                    rating: 4.2,
                    website: 'https://example.edu',
                    phone: '+91-0000000000',
                    courses: ['Computer Science Engineering;Mechanical Engineering'],
                    fees: '₹1.2 LPA',
                    admissionStatus: 'Open',
                    type: 'Private',
                    specializations: ['AI','ML'],
                    facilities: ['Library','Hostels']
                  }
                ];
                const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = 'colleges_sample.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
              }}>Download Sample</Button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">Imported colleges in browser: <strong>{importCount}</strong></div>
          {status && <div className="text-sm">{status}</div>}

          <div className="text-xs text-muted-foreground">Notes: JSON should be an array of college objects or an object with a 'colleges' array. CSV should include headers like id,name,city,state,latitude,longitude,courses (semicolon-separated),fees.</div>
        </CardContent>
      </Card>

    </div>
  );
}

export default AdminPanel;
