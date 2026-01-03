import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Database, Trash2, GripVertical, Settings2, Loader2, Globe, Link2 } from "lucide-react";
import { toast } from "sonner";
import type { ContentType, FieldDefinition, FieldType } from "@shared/types";
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
  onRemove,
  allTypes
}: {
  field: FieldDefinition;
  onUpdate: (id: string, updates: Partial<FieldDefinition>) => void;
  onRemove: (id: string) => void;
  allTypes: ContentType[];
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className="mb-4">
      <Card className="obsidian-card group overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-center gap-4 p-4 border-b border-zinc-900 bg-zinc-950/50">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-zinc-800 rounded">
              <GripVertical className="size-4 text-zinc-500" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              <Input
                value={field.label}
                onChange={e => onUpdate(field.id, { label: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                className="h-8 bg-zinc-950 border-zinc-800 font-bold"
                placeholder="Field Label"
              />
              <select
                className="h-8 rounded-md border border-zinc-800 bg-zinc-950 px-2 text-sm font-bold focus:ring-1 focus:ring-primary"
                value={field.type}
                onChange={e => onUpdate(field.id, { type: e.target.value as FieldType })}
              >
                {FIELD_TYPES.map(ft => <option key={ft.type} value={ft.type}>{ft.label}</option>)}
              </select>
            </div>
            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => onRemove(field.id)}>
              <Trash2 className="size-4" />
            </Button>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6 bg-zinc-900/20">
            <div className="flex items-center gap-3">
              <Switch checked={field.required} onCheckedChange={v => onUpdate(field.id, { required: v })} className="data-[state=checked]:bg-orange-600" />
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Required</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={field.localized} onCheckedChange={v => onUpdate(field.id, { localized: v })} className="data-[state=checked]:bg-indigo-600" />
              <div className="flex items-center gap-1.5">
                <Globe className="size-3 text-indigo-400" />
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Localized</Label>
              </div>
            </div>
            {field.type === 'reference' && (
              <div className="flex items-center gap-3">
                <Link2 className="size-4 text-orange-400" />
                <select
                  className="h-8 flex-1 rounded-md border border-zinc-800 bg-zinc-950 px-2 text-[10px] font-black uppercase tracking-widest"
                  value={field.targetTypeId || ''}
                  onChange={e => onUpdate(field.id, { targetTypeId: e.target.value })}
                >
                  <option value="">Select Target...</option>
                  {allTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export function SchemaBuilder() {
  const queryClient = useQueryClient();
  const [editingType, setEditingType] = useState<Partial<ContentType> | null>(null);
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
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
  });
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id && editingType?.fields) {
      const oldIndex = editingType.fields.findIndex(f => f.id === active.id);
      const newIndex = editingType.fields.findIndex(f => f.id === over.id);
      setEditingType({ ...editingType, fields: arrayMove(editingType.fields, oldIndex, newIndex) });
    }
  };
  const addField = () => {
    if (!editingType) return;
    const newField: FieldDefinition = { id: crypto.randomUUID().split('-')[0], type: 'text', label: 'New Field', slug: `field-${Date.now()}`, required: false, localized: false };
    setEditingType({ ...editingType, fields: [...(editingType.fields || []), newField] });
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
                className={`cursor-pointer transition-all bg-zinc-950 border-zinc-900 ${editingType?.id === type.id ? 'border-primary bg-primary/5' : 'hover:border-zinc-700'}`}
                onClick={() => setEditingType(type)}
              >
                <div className="p-3 flex items-center gap-3">
                  <Database className={`size-4 ${editingType?.id === type.id ? 'text-primary' : 'text-zinc-400'}`} />
                  <span className="text-sm font-bold uppercase tracking-tight">{type.name}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
        <div className="lg:col-span-3">
          {editingType ? (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-zinc-950 border border-zinc-900 rounded-2xl p-6 gap-6">
                <div className="flex-1 space-y-4 w-full">
                  <Input
                    value={editingType.name}
                    onChange={e => setEditingType({ ...editingType, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="bg-transparent border-none text-3xl font-black p-0 h-auto focus-visible:ring-0 uppercase tracking-tighter"
                    placeholder="Enter model name..."
                  />
                  <div className="text-[10px] font-black uppercase tracking-widest text-orange-500 bg-orange-500/10 px-3 py-1.5 rounded-full inline-block">
                    ENDPOINT: /api/content/{editingType.slug || '...'}
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  {editingType.id && (
                    <Button variant="ghost" size="sm" className="text-destructive font-bold uppercase text-[10px] tracking-widest" onClick={() => deleteMutation.mutate(editingType.id!)}>
                      Purge
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="font-bold uppercase text-[10px] tracking-widest" onClick={() => setEditingType(null)}>Discard</Button>
                  <Button className="btn-gradient font-bold uppercase text-[10px] tracking-widest px-6" onClick={() => saveMutation.mutate(editingType)}>
                    {saveMutation.isPending ? <Loader2 className="size-3 animate-spin mr-2" /> : <Settings2 className="size-3 mr-2" />}
                    Commit Schema
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center px-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Atomic Structure</h3>
                <Button variant="ghost" size="sm" onClick={addField} className="text-primary hover:bg-primary/10 font-bold uppercase text-[10px] tracking-widest">
                  <Plus className="size-3 mr-1.5" /> Add Primitive
                </Button>
              </div>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={editingType.fields?.map(f => f.id) || []} strategy={verticalListSortingStrategy}>
                  <div>
                    {editingType.fields?.map((field) => (
                      <SortableField
                        key={field.id}
                        field={field}
                        allTypes={types?.items || []}
                        onRemove={(id) => setEditingType({ ...editingType, fields: editingType.fields?.filter(f => f.id !== id) })}
                        onUpdate={(id, updates) => setEditingType({ ...editingType, fields: editingType.fields?.map(f => f.id === id ? { ...f, ...updates } : f) })}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              {(!editingType.fields || editingType.fields.length === 0) && (
                <div className="py-20 text-center border-2 border-dashed border-zinc-900 rounded-3xl bg-zinc-900/10">
                  <Plus className="size-10 text-zinc-700 mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">No defined fields in this model</p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-40 text-center bg-zinc-950/30 border-4 border-dashed border-zinc-900 rounded-[3rem]">
              <Settings2 className="size-16 text-zinc-800 mb-6" />
              <h3 className="text-3xl font-black uppercase tracking-tighter">Architect Mode</h3>
              <p className="text-zinc-500 font-bold max-w-xs mx-auto mt-2">Design object-oriented content models for your headless delivery.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}