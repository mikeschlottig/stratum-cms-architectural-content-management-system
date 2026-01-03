import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { api } from "@/lib/api-client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, Save, Loader2, AlertCircle, Globe, Link2, FileText } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import type { ContentType, ContentItem, AuditLog } from "@shared/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
const LOCALES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'de', name: 'German' }
];
export function EditorStudio() {
  const { typeId, id } = useParams<{ typeId: string; id?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const [activeLocale, setActiveLocale] = useState('en');
  const { data: schema, isLoading: schemaLoading } = useQuery({
    queryKey: ["content-type", typeId],
    queryFn: () => api<ContentType>(`/api/types/${typeId}`),
    enabled: !!typeId,
  });
  const { data: existingItem, isLoading: itemLoading } = useQuery({
    queryKey: ["content-item", id],
    queryFn: () => api<ContentItem>(`/api/content/${typeId}/${id}`),
    enabled: isEditing,
  });
  const { data: auditLogs } = useQuery({
    queryKey: ["audit-logs", id],
    queryFn: () => api<{ items: AuditLog[] }>(`/api/audit/${id}`),
    enabled: isEditing,
  });
  const form = useForm({
    defaultValues: {
      status: 'draft' as 'draft' | 'published' | 'archived',
      data: {} as Record<string, any>,
    },
  });
  React.useEffect(() => {
    if (existingItem) {
      form.reset({ status: existingItem.status, data: existingItem.data });
    }
  }, [existingItem, form]);
  const saveMutation = useMutation({
    mutationFn: (values: any) => api(`/api/content/${typeId}`, {
      method: "POST",
      body: JSON.stringify({ id, ...values }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-items", typeId] });
      toast.success(isEditing ? "Matrix Entry Synced" : "New Entry Dispatched");
      navigate(`/content/${typeId}`);
    },
  });
  const getFieldValue = (slug: string, isLocalized?: boolean) => {
    const data = form.watch(`data.${slug}`);
    if (isLocalized) return data?.[activeLocale] || '';
    return data || '';
  };
  const setFieldValue = (slug: string, value: any, isLocalized?: boolean) => {
    if (isLocalized) {
      const current = form.getValues(`data.${slug}`) || {};
      form.setValue(`data.${slug}`, { ...current, [activeLocale]: value });
    } else {
      form.setValue(`data.${slug}`, value);
    }
  };
  const renderField = (field: any) => {
    const value = getFieldValue(field.slug, field.localized);
    const onChange = (v: any) => setFieldValue(field.slug, v, field.localized);
    return (
      <div key={field.id} className="space-y-3 p-6 border-2 border-border rounded-2xl bg-zinc-950/20 group hover:border-primary/30 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
            {field.label} {field.required && <span className="text-orange-500">*</span>}
            {field.localized && <Globe className="size-3 text-indigo-400" />}
            {field.type === 'reference' && <Link2 className="size-3 text-emerald-400" />}
          </Label>
          {field.localized && (
            <span className="text-[10px] font-black uppercase bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded">
              Locale: {activeLocale}
            </span>
          )}
        </div>
        {field.type === 'text' && (
          <Input className="h-12 border-2 font-bold" value={value} onChange={e => onChange(e.target.value)} />
        )}
        {field.type === 'rich-text' && (
          <Textarea className="min-h-[200px] border-2 font-bold" value={value} onChange={e => onChange(e.target.value)} />
        )}
        {field.type === 'number' && (
          <Input type="number" className="h-12 border-2 font-bold" value={value} onChange={e => onChange(e.target.valueAsNumber)} />
        )}
        {field.type === 'boolean' && (
          <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
            <span className="text-xs font-black uppercase">{value ? 'ENABLED' : 'DISABLED'}</span>
            <Switch checked={!!value} onCheckedChange={onChange} className="data-[state=checked]:bg-orange-600" />
          </div>
        )}
        {field.type === 'reference' && (
          <div className="space-y-4">
            <Input className="h-12 border-2 font-mono text-xs uppercase" placeholder="TARGET_OBJECT_ID" value={value} onChange={e => onChange(e.target.value)} />
            <p className="text-[10px] font-black text-emerald-500/80 uppercase tracking-tighter">Linking to: {field.targetTypeId}</p>
          </div>
        )}
        {field.type === 'media' && (
          <Input className="h-12 border-2 font-bold" placeholder="PASTE_ASSET_URL" value={value} onChange={e => onChange(e.target.value)} />
        )}
      </div>
    );
  };
  if (schemaLoading || (isEditing && itemLoading)) return <AppLayout title="Editor Engine"><Loader2 className="animate-spin" /></AppLayout>;
  if (!schema) return <AppLayout title="Error">Schema lost.</AppLayout>;
  return (
    <AppLayout title={isEditing ? `Refining ${schema.name}` : `Defining ${schema.name}`}>
      <form onSubmit={form.handleSubmit((data) => saveMutation.mutate(data))} className="space-y-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between sticky top-20 bg-background/80 backdrop-blur-xl z-20 py-4 border-b">
          <div className="flex items-center gap-6">
            <Button variant="outline" size="icon" asChild className="h-10 w-10 border-2">
              <Link to={`/content/${typeId}`}><ChevronLeft className="size-5" /></Link>
            </Button>
            <div className="flex items-center gap-4">
              {LOCALES.map(loc => (
                <Button
                  key={loc.code}
                  type="button"
                  variant={activeLocale === loc.code ? 'default' : 'ghost'}
                  className="h-8 px-4 font-black uppercase text-[10px] tracking-widest"
                  onClick={() => setActiveLocale(loc.code)}
                >
                  {loc.code}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" type="button" onClick={() => navigate(`/content/${typeId}`)} className="font-bold uppercase text-[10px] tracking-widest">Discard</Button>
            <Button className="btn-gradient px-8 py-5 h-auto font-black uppercase tracking-widest text-xs" type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
              Dispatch Entry
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-3">
            <Tabs defaultValue="content">
              <TabsList className="bg-secondary p-1 h-12 mb-8 rounded-xl">
                <TabsTrigger value="content" className="flex-1 font-black uppercase tracking-widest text-[10px]">Data Matrix</TabsTrigger>
                <TabsTrigger value="audit" className="flex-1 font-black uppercase tracking-widest text-[10px]">Log History</TabsTrigger>
              </TabsList>
              <TabsContent value="content" className="space-y-6">
                {schema.fields.map(renderField)}
              </TabsContent>
              <TabsContent value="audit" className="space-y-6">
                <Card className="border-2 bg-card">
                  <CardContent className="p-8 space-y-8">
                    {auditLogs?.items?.map((log) => (
                      <div key={log.id} className="flex gap-4 items-start border-b border-zinc-900 pb-6 last:border-0">
                        <Avatar className="size-10 border-2">
                          <AvatarFallback className="bg-orange-600 font-black">{log.userName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="text-sm font-black uppercase tracking-tight">{log.userName} • <span className="text-orange-500">{log.action}</span></p>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase">{format(log.timestamp, 'MMM dd, HH:mm')}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          <div className="lg:col-span-1">
            <Card className="border-2 sticky top-48">
              <CardHeader className="bg-secondary/20">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Node Status</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <Controller
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-12 border-2 font-black uppercase tracking-widest text-[10px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft" className="font-black uppercase text-[10px]">Draft</SelectItem>
                        <SelectItem value="published" className="font-black uppercase text-[10px]">Published</SelectItem>
                        <SelectItem value="archived" className="font-black uppercase text-[10px] text-destructive">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <div className="pt-6 border-t border-zinc-900 space-y-4">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-zinc-500">
                    <span>Identity</span>
                    <span className="text-foreground truncate max-w-[100px]">{id || 'VOLATILE'}</span>
                  </div>
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-zinc-500">
                    <span>Type</span>
                    <span className="text-orange-500">{typeId}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </AppLayout>
  );
}