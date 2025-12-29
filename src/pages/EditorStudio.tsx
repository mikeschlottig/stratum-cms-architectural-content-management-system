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
import { ChevronLeft, Save, Loader2, FileText, Database, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import type { ContentType, ContentItem } from "@/types/schema";
import { Skeleton } from "@/components/ui/skeleton";
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
      body: JSON.stringify({
        id: id,
        ...values,
      }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-items", typeId] });
      toast.success(isEditing ? "Entry updated" : "Entry created");
      navigate(`/content/${typeId}`);
    },
    onError: (err: any) => toast.error(`Save failed: ${err.message}`),
  });
  if (schemaLoading || (isEditing && itemLoading)) {
    return (
      <AppLayout title="Loading Studio...">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="lg:col-span-2 h-[400px] w-full" />
            <Skeleton className="h-[200px] w-full" />
          </div>
        </div>
      </AppLayout>
    );
  }
  if (schemaError || !schema) {
    return (
      <AppLayout title="Error">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="size-12 text-destructive mb-4" />
          <h2 className="text-2xl font-bold">Schema Not Found</h2>
          <p className="text-muted-foreground mt-2">Could not load the content model for this editor.</p>
          <Button asChild className="mt-6" variant="outline">
            <Link to="/schema">Return to Architect</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }
  return (
    <AppLayout title={isEditing ? `Edit ${schema.name}` : `New ${schema.name}`}>
      <form onSubmit={form.handleSubmit((data) => saveMutation.mutate(data))} className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to={`/content/${typeId}`}>
                <ChevronLeft className="size-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {isEditing ? `Edit Entry` : `Create ${schema.name}`}
              </h1>
              <p className="text-sm text-muted-foreground">{schema.name} model</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" type="button" onClick={() => navigate(`/content/${typeId}`)}>
              Cancel
            </Button>
            <Button className="btn-gradient" type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="animate-spin mr-2 size-4" /> : <Save className="mr-2 size-4" />}
              {isEditing ? 'Save Changes' : 'Publish Entry'}
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="obsidian-card border-border/40">
              <CardHeader>
                <CardTitle>Content Fields</CardTitle>
                <CardDescription>Enter the data for this {schema.name} entry.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {schema.fields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label className="flex items-center gap-1 font-medium">
                      {field.label}
                      {field.required && <span className="text-destructive">*</span>}
                    </Label>
                    {field.type === 'text' && (
                      <Input
                        className="bg-zinc-950/50"
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                        {...form.register(`data.${field.slug}`, { required: field.required })}
                      />
                    )}
                    {field.type === 'rich-text' && (
                      <Textarea
                        className="bg-zinc-950/50"
                        rows={8}
                        placeholder={field.placeholder || `Write content...`}
                        {...form.register(`data.${field.slug}`, { required: field.required })}
                      />
                    )}
                    {field.type === 'number' && (
                      <Input
                        className="bg-zinc-950/50"
                        type="number"
                        {...form.register(`data.${field.slug}`, { required: field.required, valueAsNumber: true })}
                      />
                    )}
                    {field.type === 'boolean' && (
                      <Controller
                        control={form.control}
                        name={`data.${field.slug}`}
                        render={({ field: { value, onChange } }) => (
                          <div className="flex items-center gap-2 p-3 rounded-md bg-zinc-950/50 border border-zinc-800/50">
                            <Switch checked={!!value} onCheckedChange={onChange} />
                            <span className="text-sm text-muted-foreground">{value ? 'Yes / Enabled' : 'No / Disabled'}</span>
                          </div>
                        )}
                      />
                    )}
                    {field.type === 'date' && (
                      <Input
                        className="bg-zinc-950/50"
                        type="datetime-local"
                        {...form.register(`data.${field.slug}`, { required: field.required })}
                      />
                    )}
                    {field.type === 'media' && (
                      <div className="p-4 border-2 border-dashed rounded-lg bg-zinc-950/50 border-zinc-800 flex flex-col items-center justify-center gap-2 transition-colors hover:bg-zinc-900/50">
                        <FileText className="size-8 text-muted-foreground/40" />
                        <Input
                          className="bg-transparent border-zinc-800"
                          placeholder="Media URL"
                          {...form.register(`data.${field.slug}`, { required: field.required })}
                        />
                        <span className="text-2xs text-muted-foreground italic">Paste a public URL from the Asset Library</span>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="obsidian-card border-border/40">
              <CardHeader>
                <CardTitle>Publishing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Workflow Status</Label>
                  <Controller
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="bg-zinc-950/50 border-zinc-800">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-zinc-800">
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="pt-4 border-t border-zinc-800/50 text-[10px] space-y-2 text-muted-foreground uppercase tracking-wider font-semibold">
                  <div className="flex justify-between">
                    <span>Created At</span>
                    <span className="text-foreground">{existingItem ? format(existingItem.createdAt, 'MMM d, yyyy') : 'Current Session'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Sync</span>
                    <span className="text-foreground">{existingItem ? format(existingItem.updatedAt, 'HH:mm:ss') : 'Unsaved'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="obsidian-card border-border/40 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-[11px] text-muted-foreground break-all font-mono">
                  ID: {id || 'Auto-generated'}
                </div>
                <div className="text-[11px] text-muted-foreground font-mono">
                  Type: {typeId}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </AppLayout>
  );
}