import React from "react";
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
import { ChevronLeft, Save, Loader2, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import type { ContentType, ContentItem, AuditLog } from "@/types/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
export function EditorStudio() {
  const { typeId, id } = useParams<{ typeId: string; id?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const { data: schema, isLoading: schemaLoading, error: schemaError } = useQuery({
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
      form.reset({
        status: existingItem.status,
        data: existingItem.data,
      });
    }
  }, [existingItem, form]);
  const saveMutation = useMutation({
    mutationFn: (values: any) => api(`/api/content/${typeId}`, {
      method: "POST",
      body: JSON.stringify({ id, ...values }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-items", typeId] });
      toast.success(isEditing ? "Entry Updated" : "Entry Published");
      navigate(`/content/${typeId}`);
    },
    onError: (err: any) => toast.error(`Save failed: ${err.message}`),
  });
  if (schemaLoading || (isEditing && itemLoading)) {
    return (
      <AppLayout title="Studio Loading...">
        <div className="space-y-8">
          <Skeleton className="h-12 w-3/4" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="lg:col-span-2 h-[500px]" />
            <Skeleton className="h-[300px]" />
          </div>
        </div>
      </AppLayout>
    );
  }
  if (schemaError || !schema) {
    return (
      <AppLayout title="Error">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="size-16 text-destructive mb-4" />
          <h2 className="text-3xl font-black">Editor Fault</h2>
          <p className="text-muted-foreground font-bold mt-2">Could not retrieve content schema.</p>
          <Button asChild className="mt-8 font-bold" variant="outline">
            <Link to="/schema">Return to Architect</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }
  return (
    <AppLayout title={isEditing ? `Edit ${schema.name}` : `New ${schema.name}`}>
      <form onSubmit={form.handleSubmit((data) => saveMutation.mutate(data))} className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between border-b pb-6">
          <div className="flex items-center gap-6">
            <Button variant="outline" size="icon" asChild className="border-2 rounded-xl h-12 w-12">
              <Link to={`/content/${typeId}`}>
                <ChevronLeft className="size-6" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-black tracking-tight">
                {isEditing ? `Edit Entry` : `Create Entry`}
              </h1>
              <p className="text-sm font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest">{schema.name} model</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" type="button" onClick={() => navigate(`/content/${typeId}`)} className="font-bold">
              Discard Changes
            </Button>
            <Button className="btn-gradient px-8 py-6 h-auto" type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="animate-spin mr-2 size-5" /> : <Save className="mr-2 size-5" />}
              {isEditing ? 'Sync Changes' : 'Publish Entry'}
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-3 space-y-8">
            <Tabs defaultValue="fields" className="w-full">
              <TabsList className="bg-secondary p-1 h-12 mb-6">
                <TabsTrigger value="fields" className="px-8 font-black uppercase tracking-widest text-xs">Content Fields</TabsTrigger>
                <TabsTrigger value="activity" className="px-8 font-black uppercase tracking-widest text-xs">Activity Timeline</TabsTrigger>
              </TabsList>
              <TabsContent value="fields">
            <Card className="border-2 border-border bg-card shadow-soft">
              <CardHeader className="border-b">
                <CardTitle className="text-xl font-black">Content Fields</CardTitle>
                <CardDescription className="text-muted-foreground font-semibold">Structured data for this {schema.name}.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {schema.fields.map((field) => (
                  <div key={field.id} className="space-y-3">
                    <Label className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-1">
                      {field.label}
                      {field.required && <span className="text-destructive font-bold text-lg">*</span>}
                    </Label>
                    {field.type === 'text' && (
                      <Input
                        className="h-12 border-2 bg-background font-medium focus:ring-2 focus:ring-orange-500/20"
                        placeholder={field.placeholder || `Enter value...`}
                        {...form.register(`data.${field.slug}`, { required: field.required })}
                      />
                    )}
                    {field.type === 'rich-text' && (
                      <Textarea
                        className="border-2 bg-background font-medium min-h-[250px] focus:ring-2 focus:ring-orange-500/20"
                        placeholder={field.placeholder || `Write detailed content...`}
                        {...form.register(`data.${field.slug}`, { required: field.required })}
                      />
                    )}
                    {field.type === 'number' && (
                      <Input
                        className="h-12 border-2 bg-background font-medium"
                        type="number"
                        {...form.register(`data.${field.slug}`, { required: field.required, valueAsNumber: true })}
                      />
                    )}
                    {field.type === 'boolean' && (
                      <Controller
                        control={form.control}
                        name={`data.${field.slug}`}
                        render={({ field: { value, onChange } }) => (
                          <div className="flex items-center justify-between p-4 rounded-xl border-2 bg-secondary/30">
                            <span className="text-sm font-bold">{value ? 'ENABLED' : 'DISABLED'}</span>
                            <Switch checked={!!value} onCheckedChange={onChange} className="data-[state=checked]:bg-orange-600" />
                          </div>
                        )}
                      />
                    )}
                    {field.type === 'date' && (
                      <Input
                        className="h-12 border-2 bg-background font-medium"
                        type="datetime-local"
                        {...form.register(`data.${field.slug}`, { required: field.required })}
                      />
                    )}
                    {field.type === 'media' && (
                      <div className="p-6 border-2 border-dashed rounded-xl bg-secondary/20 flex flex-col gap-4">
                        <Input
                          className="border-2 bg-background font-bold text-xs"
                          placeholder="PASTE MEDIA ASSET URL HERE"
                          {...form.register(`data.${field.slug}`, { required: field.required })}
                        />
                        <p className="text-[10px] font-black text-muted-foreground uppercase text-center">Reference from the global asset library</p>
                      </div>
                    )}
                    {field.description && <p className="text-xs font-semibold text-muted-foreground">{field.description}</p>}
                  </div>
                ))}
              </CardContent>
            </Card>
              </TabsContent>
              <TabsContent value="activity">
                <Card className="border-2 border-border bg-card shadow-soft">
                  <CardContent className="p-8">
                    <div className="space-y-8">
                      {auditLogs?.items?.map((log, i) => (
                        <div key={log.id} className="relative flex gap-6 pb-8 last:pb-0">
                          {i !== (auditLogs.items.length - 1) && (
                            <div className="absolute left-6 top-10 bottom-0 w-0.5 bg-border" />
                          )}
                          <Avatar className="size-12 border-2 border-background ring-2 ring-secondary shrink-0">
                            <AvatarFallback className="bg-orange-600 text-white font-black">{log.userName[0]}</AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <span className="font-black text-sm">{log.userName}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-widest ${
                                log.action === 'create' ? 'bg-emerald-500/10 text-emerald-600' :
                                log.action === 'delete' ? 'bg-rose-500/10 text-rose-600' : 'bg-blue-500/10 text-blue-600'
                              }`}>
                                {log.action}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground font-semibold">
                              {log.details || `Performed ${log.action} action on this record.`}
                            </p>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase">{format(log.timestamp, 'MMM dd, yyyy ��� HH:mm')}</p>
                          </div>
                        </div>
                      ))}
                      {(!auditLogs?.items || auditLogs.items.length === 0) && <p className="text-center py-10 text-muted-foreground italic">No trace recorded for this item.</p>}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          <div className="space-y-8">
            <Card className="border-2 border-border bg-card shadow-soft">
              <CardHeader className="bg-secondary/20 border-b">
                <CardTitle className="text-lg font-black">Publishing Hub</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest">Workflow State</Label>
                  <Controller
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="h-12 border-2 font-bold bg-background">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft" className="font-bold">Draft</SelectItem>
                          <SelectItem value="published" className="font-bold">Published</SelectItem>
                          <SelectItem value="archived" className="font-bold text-destructive">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="pt-6 border-t space-y-3">
                  <div className="flex justify-between text-[11px] font-black uppercase text-muted-foreground">
                    <span>Model ID</span>
                    <span className="text-foreground">{typeId}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-black uppercase text-muted-foreground">
                    <span>Created</span>
                    <span className="text-foreground">{existingItem ? format(existingItem.createdAt, 'MMM dd, yyyy') : 'NEW'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-orange-500/20 bg-orange-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-orange-600 dark:text-orange-400">System Trace</CardTitle>
              </CardHeader>
              <CardContent className="font-mono text-[10px] break-all text-muted-foreground leading-relaxed">
                ID: {id || 'PENDING_GENERATION'}<br/>
                ENGINE_VERSION: 1.4.0_CONTRAST_REF
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </AppLayout>
  );
}