import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Globe, Shield, Code, Save, RefreshCw, Plus } from "lucide-react";
import { toast } from "sonner";
export function Settings() {
  const handleSave = () => {
    toast.success("Global System State Synced");
  };
  return (
    <AppLayout title="System Configuration">
      <div className="space-y-10 animate-in fade-in duration-500">
        <div className="flex justify-between items-end border-b pb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tight">System Node</h1>
            <p className="text-muted-foreground font-bold text-lg mt-1">Global management and security protocols.</p>
          </div>
          <Button className="btn-gradient px-8 py-6 h-auto" onClick={handleSave}>
            <Save className="mr-2 size-5" /> Commit Changes
          </Button>
        </div>
        <Tabs defaultValue="general" className="space-y-8">
          <TabsList className="bg-secondary p-1.5 h-16 rounded-2xl border-2 border-border shadow-soft">
            <TabsTrigger value="general" className="flex items-center gap-3 px-10 h-full data-[state=active]:bg-background data-[state=active]:text-orange-600 data-[state=active]:shadow-soft font-black uppercase tracking-widest text-xs">
              <Globe className="size-4" /> General
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-3 px-10 h-full data-[state=active]:bg-background data-[state=active]:text-orange-600 data-[state=active]:shadow-soft font-black uppercase tracking-widest text-xs">
              <Code className="size-4" /> API Gateway
            </TabsTrigger>
            <TabsTrigger value="localization" className="flex items-center gap-3 px-10 h-full data-[state=active]:bg-background data-[state=active]:text-orange-600 data-[state=active]:shadow-soft font-black uppercase tracking-widest text-xs">
              <RefreshCw className="size-4" /> Localization
            </TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="space-y-8 animate-in slide-in-from-left-4 duration-300">
            <Card className="border-2 border-border bg-card shadow-soft">
              <CardHeader className="border-b">
                <CardTitle className="text-xl font-black">Identity Protocol</CardTitle>
                <CardDescription className="font-semibold text-muted-foreground">Core identification for this Stratum instance.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest">Instance Name</Label>
                    <Input defaultValue="STRATUM_CORE_01" className="h-12 border-2 bg-background font-bold text-lg" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest">System URL</Label>
                    <Input defaultValue="https://cms.stratum.io" className="h-12 border-2 bg-background font-bold text-lg" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-6 bg-secondary/50 rounded-2xl border-2 border-border">
                  <div className="space-y-1">
                    <p className="text-base font-black uppercase tracking-tight">Public Node Access</p>
                    <p className="text-xs text-muted-foreground font-bold">Allow external requests for registration on this instance.</p>
                  </div>
                  <Switch className="data-[state=checked]:bg-orange-600" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="api" className="space-y-8 animate-in slide-in-from-left-4 duration-300">
            <Card className="border-2 border-border bg-card shadow-soft">
              <CardHeader className="border-b">
                <CardTitle className="text-xl font-black">Security Credentials</CardTitle>
                <CardDescription className="font-semibold text-muted-foreground">Manage keys for headless content delivery.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-4">
                  <Label className="text-xs font-black uppercase tracking-widest">Master Read Access Key</Label>
                  <div className="flex gap-4">
                    <Input readOnly value="sk_stratum_live_9238_alpha_v4" className="h-12 border-2 font-mono bg-secondary font-black text-foreground" />
                    <Button variant="default" className="h-12 px-8 font-black">REGENERATE</Button>
                  </div>
                  <p className="text-[10px] font-black text-rose-600 uppercase">Warning: Key rotation will disconnect all production clients.</p>
                </div>
                <div className="p-8 bg-orange-500/10 border-2 border-orange-500/20 rounded-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="size-6 text-orange-600 dark:text-orange-400" />
                    <span className="text-sm font-black uppercase tracking-widest">Encryption Protocol Active</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-bold leading-relaxed">
                    All delivery endpoints are protected with AES-256 equivalent hashing via the Cloudflare Workers edge runtime.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="localization" className="space-y-8 animate-in slide-in-from-left-4 duration-300">
            <Card className="border-2 border-border bg-card shadow-soft">
              <CardHeader className="border-b">
                <CardTitle className="text-xl font-black">Regional Config</CardTitle>
                <CardDescription className="font-semibold text-muted-foreground">Configure content locales and regional overrides.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  {['English (US)', 'Spanish (ES)', 'German (DE)'].map(lang => (
                    <div key={lang} className="flex items-center justify-between p-5 rounded-xl border-2 border-border bg-background hover:border-primary transition-colors">
                      <span className="text-sm font-black uppercase tracking-widest">{lang}</span>
                      <Button variant="ghost" size="sm" className="text-rose-600 font-black hover:bg-rose-600/10 uppercase text-[10px] tracking-widest">Purge Locale</Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full h-14 border-4 border-dashed border-border font-black uppercase tracking-widest hover:bg-secondary">
                  <Plus className="size-5 mr-2" /> Add Regional Locale
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}