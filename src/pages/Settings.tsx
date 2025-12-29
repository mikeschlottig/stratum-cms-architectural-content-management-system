import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Globe, Shield, Code, Save, RefreshCw } from "lucide-react";
import { toast } from "sonner";
export function Settings() {
  const handleSave = () => {
    toast.success("Settings updated successfully");
  };
  return (
    <AppLayout title="System Settings">
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Configuration</h1>
            <p className="text-muted-foreground">Global controls and API configuration for Stratum.</p>
          </div>
          <Button className="btn-gradient" onClick={handleSave}>
            <Save className="mr-2 size-4" /> Save Global State
          </Button>
        </div>
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-zinc-950 border border-zinc-900 p-1 h-12">
            <TabsTrigger value="general" className="flex items-center gap-2 px-6 h-10 data-[state=active]:bg-zinc-900">
              <Globe className="size-4" /> General
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2 px-6 h-10 data-[state=active]:bg-zinc-900">
              <Code className="size-4" /> API Access
            </TabsTrigger>
            <TabsTrigger value="localization" className="flex items-center gap-2 px-6 h-10 data-[state=active]:bg-zinc-900">
              <RefreshCw className="size-4" /> Localization
            </TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="space-y-6 animate-in slide-in-from-left-4 duration-300">
            <Card className="obsidian-card">
              <CardHeader>
                <CardTitle>Instance Profile</CardTitle>
                <CardDescription>Primary identification for this CMS instance.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Site Name</Label>
                    <Input defaultValue="Stratum Production" className="bg-zinc-950 border-zinc-900" />
                  </div>
                  <div className="space-y-2">
                    <Label>Base URL</Label>
                    <Input defaultValue="https://cms.stratum.io" className="bg-zinc-950 border-zinc-900" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-lg border border-zinc-900">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Public Registration</p>
                    <p className="text-xs text-muted-foreground">Allow new users to request access to this instance.</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="api" className="space-y-6 animate-in slide-in-from-left-4 duration-300">
            <Card className="obsidian-card">
              <CardHeader>
                <CardTitle>Headless Delivery Keys</CardTitle>
                <CardDescription>Use these keys to consume content from your external applications.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Master Read Key (Production)</Label>
                  <div className="flex gap-2">
                    <Input readOnly value="sk_live_stratum_9238jdf823nd9" className="font-mono bg-zinc-950 border-zinc-900" />
                    <Button variant="outline">Copy</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Webhook Endpoint</Label>
                  <Input placeholder="https://your-app.com/api/webhook" className="bg-zinc-950 border-zinc-900" />
                </div>
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="size-4 text-primary" />
                    <span className="text-sm font-bold uppercase tracking-widest">Security Advisory</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Always keep your delivery keys secret. If a key is compromised, rotate it immediately in the "Key Management" sub-tab.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="localization" className="space-y-6 animate-in slide-in-from-left-4 duration-300">
            <Card className="obsidian-card">
              <CardHeader>
                <CardTitle>Language Configuration</CardTitle>
                <CardDescription>Define which locales are supported for multi-regional content.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {['English (US)', 'Spanish (ES)', 'German (DE)'].map(lang => (
                    <div key={lang} className="flex items-center justify-between p-3 rounded-md border border-zinc-900 bg-zinc-950/50">
                      <span className="text-sm font-medium">{lang}</span>
                      <Button variant="ghost" size="sm" className="text-destructive">Remove</Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full border-dashed border-zinc-800">
                  <Plus className="size-4 mr-2" /> Add Locale
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}