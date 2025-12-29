import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Database, Trash2, GripVertical, Settings2 } from "lucide-react";
import { toast } from "sonner";
import type { ContentType, FieldDefinition, FieldType } from "@/types/schema";
const FIELD_TYPES: { type: FieldType; label: string }[] = [
  { type: 'text', label: 'Short Text' },
  { type: 'rich-text', label: 'Rich Text' },
  { type: 'number', label: 'Number' },
  { type: 'boolean', label: 'Boolean' },
  { type: 'date', label: 'Date' },
  { type: 'media', label: 'Media' },
  { type: 'reference', label: 'Reference' },
];
export function SchemaBuilder() {
  const queryClient = useQueryClient();
  const [editingType, setEditingType] = useState<Partial<ContentType> | null>(null);
  const { data: types, isLoading } = useQuery({
    queryKey: ["content-types"],
    queryFn: () => api<{ items: ContentType[] }>("/api/types"),
  });
  const saveMutation = useMutation({
    mutationFn: (data: Partial<ContentType>) => api("/api/types", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-types"] });
      toast.success("Schema saved successfully");
      setEditingType(null);
    },
  });
  const addField = () => {
    if (!editingType) return;
    const newField: FieldDefinition = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'text',
      label: 'New Field',
      slug: 'new-field',
      required: false,
    };
    setEditingType({ ...editingType, fields: [...(editingType.fields || []), newField] });
  };
  const removeField = (id: string) => {
    if (!editingType) return;
    setEditingType({ ...editingType, fields: editingType.fields?.filter(f => f.id !== id) });
  };
  const updateField = (id: string, updates: Partial<FieldDefinition>) => {
    if (!editingType) return;
    setEditingType({
      ...editingType,
      fields: editingType.fields?.map(f => f.id === id ? { ...f, ...updates } : f)
    });
  };
  if (isLoading) return <AppLayout title="Schema Architect"><div>Loading...</div></AppLayout>;
  return (
    <AppLayout title="Schema Architect">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Content Models</h2>
            <Button size="sm" onClick={() => setEditingType({ name: '', slug: '', fields: [] })}>
              <Plus className="size-4 mr-2" /> New Model
            </Button>
          </div>
          {types?.items.map(type => (
            <Card 
              key={type.id} 
              className={`cursor-pointer transition-all obsidian-card ${editingType?.id === type.id ? 'border-primary ring-1 ring-primary' : 'hover:border-primary/50'}`}
              onClick={() => setEditingType(type)}
            >
              <CardHeader className="p-4">
                <div className="flex items-center gap-3">
                  <Database className="size-4 text-primary" />
                  <div>
                    <CardTitle className="text-sm">{type.name}</CardTitle>
                    <CardDescription className="text-xs">{type.fields.length} fields</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className="lg:col-span-2">
          {editingType ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <Card className="obsidian-card">
                <CardHeader>
                  <CardTitle>Model Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Display Name</Label>
                      <Input 
                        value={editingType.name} 
                        onChange={e => setEditingType({ ...editingType, name: e.target.value })}
                        placeholder="e.g. Blog Post"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>API Slug</Label>
                      <Input 
                        value={editingType.slug} 
                        onChange={e => setEditingType({ ...editingType, slug: e.target.value })}
                        placeholder="e.g. blog-posts"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Fields</h3>
                <Button variant="outline" size="sm" onClick={addField}>
                  <Plus className="size-4 mr-2" /> Add Field
                </Button>
              </div>
              <div className="space-y-3">
                {editingType.fields?.map((field) => (
                  <Card key={field.id} className="obsidian-card group">
                    <CardContent className="p-4 flex items-center gap-4">
                      <GripVertical className="size-4 text-muted-foreground/40 cursor-grab" />
                      <div className="grid grid-cols-3 gap-4 flex-1">
                        <Input 
                          value={field.label} 
                          onChange={e => updateField(field.id, { label: e.target.value })}
                          className="h-8"
                        />
                        <select 
                          className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                          value={field.type}
                          onChange={e => updateField(field.id, { type: e.target.value as FieldType })}
                        >
                          {FIELD_TYPES.map(ft => <option key={ft.type} value={ft.type}>{ft.label}</option>)}
                        </select>
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-muted-foreground">Required</Label>
                          <input 
                            type="checkbox" 
                            checked={field.required} 
                            onChange={e => updateField(field.id, { required: e.target.checked })} 
                          />
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeField(field.id)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="flex justify-end gap-3 pt-6">
                <Button variant="outline" onClick={() => setEditingType(null)}>Cancel</Button>
                <Button className="btn-gradient" onClick={() => saveMutation.mutate(editingType)}>Save Changes</Button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-xl border-border/40">
              <Database className="size-12 text-muted-foreground/20 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Model Selected</h3>
              <p className="text-muted-foreground max-w-xs">Select a model from the sidebar or create a new one to start architecting your data structure.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}