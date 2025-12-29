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
import { ChevronLeft, Save, Loader2, Calendar as CalendarIcon, FileText } from "lucide-react";
import { toast } from "sonner";
import type { ContentType, ContentItem } from "@/types/schema";
export function EditorStudio() {
  const { typeId, id } = useParams<{ typeId: string; id?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const { data: schema, isLoading: schemaLoading } = useQuery({
    queryKey: ["content-type", typeId],
    queryFn: () => api<ContentType>(`/api/types/${typeId}`),
  });
  const { data: existingItem, isLoading: itemLoading } = useQuery({
    queryKey: ["content-item", id],
    queryFn: () => api<ContentItem>(`/api/content/${typeId}/${id}`),
    enabled: isEditing,
  });
  const form = useForm({
    defaultValues: {
      status: 'draft' as 'draft' | 'published',
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
    onError: (err) => toast.error(`Save failed: ${err.message}`),
  });
  if (schemaLoading || (isEditing && itemLoading)) {
    return <AppLayout title="Loading Studio..."><div>Loading...</div></AppLayout>;
  }
  if (!schema) return <div>Schema not found</div>;
  return (
    <AppLayout title={isEditing ? `Edit ${schema.name}` : `New ${schema.name}`}>
      <form onSubmit={form.handleSubmit((data) => saveMutation.mutate(data))} className="space-y-8">
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
            <Card className="obsidian-card">
              <CardHeader>
                <CardTitle>Content Fields</CardTitle>
                <CardDescription>Enter the data for this {schema.name} entry.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {schema.fields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label className="flex items-center gap-1">
                      {field.label}
                      {field.required && <span className="text-destructive">*</span>}
                    </Label>
                    {field.type === 'text' && (
                      <Input 
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                        {...form.register(`data.${field.slug}`, { required: field.required })}
                      />
                    )}
                    {field.type === 'rich-text' && (
                      <Textarea 
                        rows={6}
                        placeholder={field.placeholder || `Write content...`}
                        {...form.register(`data.${field.slug}`, { required: field.required })}
                      />
                    )}
                    {field.type === 'number' && (
                      <Input 
                        type="number"
                        {...form.register(`data.${field.slug}`, { required: field.required, valueAsNumber: true })}
                      />
                    )}
                    {field.type === 'boolean' && (
                      <Controller
                        control={form.control}
                        name={`data.${field.slug}`}
                        render={({ field: { value, onChange } }) => (
                          <div className="flex items-center gap-2">
                            <Switch checked={!!value} onCheckedChange={onChange} />
                            <span className="text-sm text-muted-foreground">{value ? 'Yes' : 'No'}</span>
                          </div>
                        )}
                      />
                    )}
                    {field.type === 'date' && (
                      <Input 
                        type="datetime-local"
                        {...form.register(`data.${field.slug}`, { required: field.required })}
                      />
                    )}
                    {field.type === 'media' && (
                      <div className="p-4 border-2 border-dashed rounded-lg bg-secondary/20 flex flex-col items-center justify-center gap-2">
                        <FileText className="size-8 text-muted-foreground/40" />
                        <Input 
                          placeholder="Media URL"
                          {...form.register(`data.${field.slug}`, { required: field.required })}
                        />
                        <span className="text-2xs text-muted-foreground italic">Paste a public URL for now</span>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="obsidian-card">
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
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="pt-4 border-t border-border/40 text-xs space-y-2 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span>{existingItem ? format(existingItem.createdAt, 'MMM d, yyyy') : 'Now'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Updated:</span>
                    <span>{existingItem ? format(existingItem.updatedAt, 'MMM d, yyyy HH:mm') : 'Not saved'}</span>
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