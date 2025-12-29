import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { api } from "@/lib/api-client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronLeft, Save, Loader2, Globe, Link2, FileText, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import type { ContentType, ContentItem, AuditLog } from "@shared/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
const LOCALES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'de', name: 'German' }
];
function ReferencePicker({ targetTypeId, value, onChange }: { targetTypeId: string; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const { data: items, isLoading } = useQuery({
    queryKey: ["content-items", targetTypeId],
    queryFn: () => api<{ items: ContentItem[] }>(`/api/content/${targetTypeId}`),
    enabled: !!targetTypeId,
  });
  const selectedItem = items?.items.find(i => i.id === value);
  const getLabel = (item: ContentItem) => {
    const firstVal = Object.values(item.data)[0];
    if (typeof firstVal === 'string') return firstVal;
    if (firstVal && typeof firstVal === 'object') return (Object.values(firstVal)[0] as string) || item.id;
    return item.id;
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between h-12 border-2 bg-zinc-950 font-bold">
          {selectedItem ? getLabel(selectedItem) : "Select reference..."}
          {isLoading ? <Loader2 className="ml-2 h-4 w-4 animate-spin shrink-0 opacity-50" /> : <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 bg-zinc-950 border-zinc-800">
        <div className="p-2 space-y-1">
          {items?.items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-zinc-900 transition-colors",
                value === item.id && "bg-zinc-900"
              )}
              onClick={() => {
                onChange(item.id);
                setOpen(false);
              }}
            >
              <Check className={cn("size-4 text-orange-500", value === item.id ? "opacity-100" : "opacity-0")} />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-zinc-100">{getLabel(item)}</span>
                <span className="text-[10px] text-zinc-500 font-mono">{item.id}</span>
              </div>
            </div>
          ))}
          {(!items || items.items.length === 0) && (
            <div className="p-4 text-center text-xs text-zinc-500 font-bold italic">No targets found.</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
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
      form.setValue(`data.${slug}`, { ...current, [activeLocale]: value }, { shouldDirty: true });
    } else {
      form.setValue(`data.${slug}`, value, { shouldDirty: true });
    }
  };
  const renderField = (field: any) => {
    const value = getFieldValue(field.slug, field.localized);
    const onChange = (v: any) => setFieldValue(field.slug, v, field.localized);
    return (
      <div key={field.id} className="space-y-3 p-6 border-2 border-zinc-900 rounded-2xl bg-zinc-950/20 group hover:border-orange-500/30 transition-all">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
            {field.label} {field.required && <span className="text-orange-500">*</span>}
            {field.localized && <Globe className="size-3 text-indigo-400" />}
            {field.type === 'reference' && <Link2 className="size-3 text-emerald-400" />}
          </Label>
          {field.localized && (
            <span className="text-[10px] font-black uppercase bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded">
              {activeLocale.toUpperCase()} CORE
            </span>
          )}
        </div>
        {field.type === 'text' && (
          <Input className="h-12 border-2 bg-zinc-950 font-bold" value={value} onChange={e => onChange(e.target.value)} />
        )}
        {field.type === 'rich-text' && (
          <Textarea className="min-h-[200px] border-2 bg-zinc-950 font-bold" value={value} onChange={e => onChange(e.target.value)} />
        )}
        {field.type === 'number' && (
          <Input type="number" className="h-12 border-2 bg-zinc-950 font-bold" value={value} onChange={e => onChange(e.target.valueAsNumber)} />
        )}
        {field.type === 'boolean' && (
          <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
            <span className="text-xs font-black uppercase text-zinc-400">{value ? 'ENABLED' : 'DISABLED'}</span>
            <Switch checked={!!value} onCheckedChange={onChange} className="data-[state=checked]:bg-orange-600" />
          </div>
        )}
        {field.type === 'reference' && (
          <ReferencePicker targetTypeId={field.targetTypeId} value={value} onChange={onChange} />
        )}
        {field.type === 'media' && (
          <div className="space-y-4">
             <Input className="h-12 border-2 bg-zinc-950 font-bold" placeholder="PASTE_ASSET_URL" value={value} onChange={e => onChange(e.target.value)} />
             {value && typeof value === 'string' && value.startsWith('http') && (
               <div className="aspect-video rounded-xl overflow-hidden border-2 border-zinc-800 bg-zinc-900">
                 <img src={value} className="w-full h-full object-cover" alt="Preview" />
               </div>
             )}
          </div>
        )}
      </div>
    );
  };
  if (schemaLoading || (isEditing && itemLoading)) return <AppLayout title="Editor Engine"><div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-orange-500" /></div></AppLayout>;
  if (!schema) return <AppLayout title="Error"><div className="text-center py-20">Schema lost in transit.</div></AppLayout>;
  return (
    <AppLayout title={isEditing ? `Refining ${schema.name}` : `Defining ${schema.name}`}>
      <form onSubmit={form.handleSubmit((data) => saveMutation.mutate(data))} className="space-y-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between sticky top-16 bg-background/90 backdrop-blur-xl z-20 py-6 border-b border-zinc-900">
          <div className="flex items-center gap-6">
            <Button variant="outline" size="icon" asChild className="h-10 w-10 border-2 border-zinc-800 hover:bg-zinc-900">
              <Link to={`/content/${typeId}`}><ChevronLeft className="size-5" /></Link>
            </Button>
            <div className="flex items-center gap-2 bg-zinc-900 p-1 rounded-lg">
              {LOCALES.map(loc => (
                <Button
                  key={loc.code}
                  type="button"
                  variant={activeLocale === loc.code ? 'secondary' : 'ghost'}
                  className={cn(
                    "h-8 px-4 font-black uppercase text-[10px] tracking-widest transition-all",
                    activeLocale === loc.code ? "bg-zinc-800 text-white" : "text-zinc-500"
                  )}
                  onClick={() => setActiveLocale(loc.code)}
                >
                  {loc.code}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" type="button" onClick={() => navigate(`/content/${typeId}`)} className="font-bold uppercase text-[10px] tracking-widest text-zinc-500 hover:text-white">Discard</Button>
            <Button className="btn-gradient px-8 py-5 h-auto font-black uppercase tracking-widest text-xs" type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
              Dispatch Entry
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-3">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="bg-zinc-950 border border-zinc-900 p-1 h-12 mb-8 rounded-xl w-full">
                <TabsTrigger value="content" className="flex-1 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-zinc-900">Data Matrix</TabsTrigger>
                <TabsTrigger value="audit" className="flex-1 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-zinc-900">Log History</TabsTrigger>
              </TabsList>
              <TabsContent value="content" className="space-y-6">
                {schema.fields.map(renderField)}
                {schema.fields.length === 0 && <div className="text-center py-20 text-zinc-500 italic">No fields defined for this model.</div>}
              </TabsContent>
              <TabsContent value="audit" className="space-y-6">
                <Card className="border-2 border-zinc-900 bg-zinc-950/50">
                  <CardContent className="p-8 space-y-8">
                    {auditLogs?.items?.map((log) => (
                      <div key={log.id} className="flex gap-4 items-start border-b border-zinc-900 pb-6 last:border-0">
                        <Avatar className="size-10 border-2 border-zinc-800">
                          <AvatarFallback className="bg-orange-600 font-black text-white">{log.userName?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="text-sm font-black uppercase tracking-tight text-zinc-200">{log.userName} • <span className="text-orange-500">{log.action}</span></p>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase">{log.timestamp ? format(log.timestamp, 'MMM dd, HH:mm') : 'Recently'}</p>
                        </div>
                      </div>
                    ))}
                    {(!auditLogs || auditLogs.items.length === 0) && (
                      <div className="text-center py-10">
                        <FileText className="size-10 text-zinc-800 mx-auto mb-4" />
                        <p className="text-xs font-black uppercase text-zinc-500">No events logged yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          <div className="lg:col-span-1">
            <Card className="border-2 border-zinc-900 bg-zinc-950 sticky top-48 overflow-hidden">
              <div className="h-1 bg-orange-600" />
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Node Status</Label>
                  <Controller
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="h-12 border-2 bg-zinc-900 font-black uppercase tracking-widest text-[10px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-zinc-800">
                          <SelectItem value="draft" className="font-black uppercase text-[10px]">Draft</SelectItem>
                          <SelectItem value="published" className="font-black uppercase text-[10px] text-emerald-500">Published</SelectItem>
                          <SelectItem value="archived" className="font-black uppercase text-[10px] text-destructive">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="pt-6 border-t border-zinc-900 space-y-4">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-zinc-500">
                    <span>Identity</span>
                    <span className="text-zinc-200 truncate max-w-[80px]">{id || 'VOLATILE'}</span>
                  </div>
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-zinc-500">
                    <span>Type</span>
                    <span className="text-orange-500">{typeId}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </AppLayout>
  );
}