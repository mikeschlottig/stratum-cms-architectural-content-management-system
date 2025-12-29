import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Database, Trash2, GripVertical, Settings2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ContentType, FieldDefinition, FieldType } from "@/types/schema";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
const FIELD_TYPES: { type: FieldType; label: string }[] = [
  { type: 'text', label: 'Short Text' },
  { type: 'rich-text', label: 'Rich Text' },
  { type: 'number', label: 'Number' },
  { type: 'boolean', label: 'Boolean' },
  { type: 'date', label: 'Date' },
  { type: 'media', label: 'Media' },
  { type: 'reference', label: 'Reference' },
];
function SortableField({
  field,
  onUpdate,
  onRemove
}: {
  field: FieldDefinition;
  onUpdate: (id: string, updates: Partial<FieldDefinition>) => void;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className="mb-3">
      <Card className="obsidian-card group">
        <CardContent className="p-4 flex items-center gap-4">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-zinc-800 rounded">
            <GripVertical className="size-4 text-muted-foreground/40" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase text-zinc-500 font-bold">Field Label</Label>
              <Input
                value={field.label}
                onChange={e => onUpdate(field.id, { label: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                className="h-8 bg-zinc-950 border-zinc-800"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase text-zinc-500 font-bold">Field Type</Label>
              <select
                className="w-full h-8 rounded-md border border-zinc-800 bg-zinc-950 px-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                value={field.type}
                onChange={e => onUpdate(field.id, { type: e.target.value as FieldType })}
              >
                {FIELD_TYPES.map(ft => <option key={ft.type} value={ft.type}>{ft.label}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-4 pt-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`req-${field.id}`}
                  checked={field.required}
                  onChange={e => onUpdate(field.id, { required: e.target.checked })}
                  className="rounded border-zinc-800 bg-zinc-950 text-primary"
                />
                <Label htmlFor={`req-${field.id}`} className="text-xs text-muted-foreground cursor-pointer">Required</Label>
              </div>
              <Button variant="ghost" size="icon" className="ml-auto text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onRemove(field.id)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export function SchemaBuilder() {
  const queryClient = useQueryClient();
  const [editingType, setEditingType] = useState<Partial<ContentType> | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const { data: types, isLoading } = useQuery({
    queryKey: ["content-types"],
    queryFn: () => api<{ items: ContentType[] }>("/api/types"),
  });
  const saveMutation = useMutation({
    mutationFn: (data: Partial<ContentType>) => api("/api/types", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-types"] });
      toast.success("Schema architected successfully");
      setEditingType(null);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/api/types/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-types"] });
      toast.success("Model purged from core");
      setEditingType(null);
    },
    onError: (err: any) => toast.error(`Deletion failed: ${err.message}`),
  });
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id && editingType?.fields) {
      const oldIndex = editingType.fields.findIndex(f => f.id === active.id);
      const newIndex = editingType.fields.findIndex(f => f.id === over.id);
      setEditingType({
        ...editingType,
        fields: arrayMove(editingType.fields, oldIndex, newIndex)
      });
    }
  };
  const addField = () => {
    if (!editingType) return;
    const newField: FieldDefinition = {
      id: crypto.randomUUID().split('-')[0],
      type: 'text',
      label: 'New Field',
      slug: `field-${Date.now()}`,
      required: false,
    };
    setEditingType({ ...editingType, fields: [...(editingType.fields || []), newField] });
  };
  const handleDeleteModel = () => {
    if (!editingType?.id) return;
    if (confirm(`Purge "${editingType.name}" model? All associated data will become orphaned.`)) {
      deleteMutation.mutate(editingType.id);
    }
  };
  if (isLoading) return <AppLayout title="Schema Architect"><div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-primary" /></div></AppLayout>;
  return (
    <AppLayout title="Schema Architect">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">Content Models</h2>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingType({ name: '', slug: '', fields: [] })}>
              <Plus className="size-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {types?.items.map(type => (
              <Card
                key={type.id}
                className={`cursor-pointer transition-all bg-zinc-950/50 border-zinc-900 ${editingType?.id === type.id ? 'border-primary/50 bg-primary/5' : 'hover:border-zinc-700'}`}
                onClick={() => setEditingType(type)}
              >
                <div className="p-3 flex items-center gap-3">
                  <Database className={`size-4 ${editingType?.id === type.id ? 'text-primary' : 'text-zinc-600'}`} />
                  <span className="text-sm font-medium">{type.name}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
        <div className="lg:col-span-3">
          {editingType ? (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex justify-between items-center bg-zinc-950 border border-zinc-900 rounded-xl p-4">
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-zinc-500">Model Name</Label>
                    <Input
                      value={editingType.name}
                      onChange={e => setEditingType({ ...editingType, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      className="bg-transparent border-none text-xl font-bold p-0 h-auto focus-visible:ring-0"
                      placeholder="Enter model name..."
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-zinc-500">API Identifier</Label>
                    <div className="text-sm font-mono text-primary">/api/content/{editingType.slug || '...'}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {editingType.id && (
                    <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={handleDeleteModel} disabled={deleteMutation.isPending}>
                      {deleteMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4 mr-2" />}
                      Delete Model
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setEditingType(null)}>Discard</Button>
                  <Button className="btn-gradient" size="sm" onClick={() => saveMutation.mutate(editingType)} disabled={saveMutation.isPending}>
                    {saveMutation.isPending && <Loader2 className="size-4 animate-spin mr-2" />}
                    Save Schema
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Fields Layout</h3>
                <Button variant="ghost" size="sm" onClick={addField} className="text-primary hover:text-primary hover:bg-primary/10">
                  <Plus className="size-4 mr-2" /> Add Dynamic Field
                </Button>
              </div>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={editingType.fields?.map(f => f.id) || []} strategy={verticalListSortingStrategy}>
                  <div className="space-y-1">
                    {editingType.fields?.map((field) => (
                      <SortableField
                        key={field.id}
                        field={field}
                        onRemove={(id) => setEditingType({ ...editingType, fields: editingType.fields?.filter(f => f.id !== id) })}
                        onUpdate={(id, updates) => setEditingType({ ...editingType, fields: editingType.fields?.map(f => f.id === id ? { ...f, ...updates } : f) })}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              {(!editingType.fields || editingType.fields.length === 0) && (
                <div className="py-20 text-center border-2 border-dashed border-zinc-900 rounded-2xl">
                  <Plus className="size-12 text-zinc-800 mx-auto mb-4" />
                  <p className="text-zinc-500">Add fields to define your content structure.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-40 text-center bg-zinc-950/30 border border-dashed border-zinc-900 rounded-3xl">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Settings2 className="size-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Architect Your Core</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">Select a content model or create a new one to begin designing scalable data structures for your application.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}