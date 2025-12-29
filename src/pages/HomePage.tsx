import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Database, Users, Box, TrendingUp, Clock, FileText } from 'lucide-react';
const MOCK_STATS = [
  { label: 'Total Objects', value: '1,284', icon: Box, color: 'text-indigo-600 dark:text-indigo-400' },
  { label: 'Content Types', value: '12', icon: Database, color: 'text-emerald-600 dark:text-emerald-400' },
  { label: 'API Requests', value: '45.2k', icon: TrendingUp, color: 'text-orange-600 dark:text-orange-400' },
  { label: 'Active Users', value: '24', icon: Users, color: 'text-rose-600 dark:text-rose-400' },
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
            <Card key={i} className="bg-card border-border shadow-soft hover:border-primary/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</CardTitle>
                <stat.icon className={`size-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 bg-card border-border shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Content Velocity</CardTitle>
              <CardDescription className="text-muted-foreground">Activity across all models in the last 7 days</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_CHART_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" opacity={0.3} />
                  <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', boxShadow: 'var(--shadow-soft)' }}
                    itemStyle={{ color: '#f97316', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#f97316" strokeWidth={4} dot={{ r: 6, fill: '#f97316', strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="bg-card border-border shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Recent Activity</CardTitle>
              <CardDescription className="text-muted-foreground">Latest changes from the team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[1, 2, 3, 4].map((_, i) => (
                  <div key={i} className="flex gap-4 items-start group cursor-pointer">
                    <div className="p-2.5 rounded-lg bg-secondary border border-border group-hover:bg-primary/10 transition-colors">
                      <Clock className="size-4 text-foreground font-bold" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold">Updated <span className="text-orange-600 dark:text-orange-400">"About Us"</span> page</p>
                      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
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