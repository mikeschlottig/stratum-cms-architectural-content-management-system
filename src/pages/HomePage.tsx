import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Database, Users, Box, TrendingUp, Clock, FileText } from 'lucide-react';

const MOCK_STATS = [
  { label: 'Total Objects', value: '1,284', icon: Box, color: 'text-indigo-500' },
  { label: 'Content Types', value: '12', icon: Database, color: 'text-emerald-500' },
  { label: 'API Requests', value: '45.2k', icon: TrendingUp, color: 'text-amber-500' },
  { label: 'Active Users', value: '24', icon: Users, color: 'text-rose-500' },
];
const MOCK_CHART_DATA = [
  { name: 'Mon', count: 40 },
  { name: 'Tue', count: 30 },
  { name: 'Wed', count: 65 },
  { name: 'Thu', count: 45 },
  { name: 'Fri', count: 90 },
  { name: 'Sat', count: 20 },
  { name: 'Sun', count: 15 },
];
export function HomePage() {
  return (
    <AppLayout title="Mission Control">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {MOCK_STATS.map((stat, i) => (
            <Card key={i} className="bg-card/40 border-border/40 hover:border-border/80 transition-all duration-300 obsidian-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <stat.icon className={`size-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 obsidian-card bg-card/40">
            <CardHeader>
              <CardTitle>Content Velocity</CardTitle>
              <CardDescription>Activity across all models in the last 7 days</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_CHART_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={12} />
                  <YAxis stroke="#71717a" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                    itemStyle={{ color: '#818cf8' }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="obsidian-card bg-card/40">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest changes from the team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[1, 2, 3, 4].map((_, i) => (
                  <div key={i} className="flex gap-4 items-start group cursor-pointer">
                    <div className="p-2 rounded-lg bg-secondary group-hover:bg-primary/10 transition-colors">
                      <Clock className="size-4 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Updated <span className="text-primary font-semibold">"About Us"</span> page</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <FileText className="size-3" />
                        <span>Page Model</span>
                        <span>•</span>
                        <span>2 mins ago</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}