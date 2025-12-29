import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Database, Trash2, GripVertical, Settings2, Loader2, Globe, Link2, AlertCircle } from "lucide-react";
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
  const handleTypeChange = (newType: FieldType) => {
    const updates: Partial<FieldDefinition> = { type: newType };
    if (newType === 'reference' && !field.targetTypeId) {
      updates.targetTypeId = allTypes[0]?.id || "";
    }
    onUpdate(field.id, updates);
  };
  return (
    <div ref={setNodeRef} style={style} className="mb-4">
      <Card className="bg-zinc-950 border-zinc-800 group overflow-hidden shadow-xl">
        <CardContent className="p-0">
          <div className="flex items-center gap-4 p-4 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-zinc-800 rounded transition-colors">
              <GripVertical className="size-4 text-zinc-600" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              <Input
                value={field.label}
                onChange={e => onUpdate(field.id, { label: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                className="h-9 bg-zinc-950 border-zinc-800 font-bold focus:ring-orange-500/50"
                placeholder="Field Label"
              />
              <select
                className="h-9 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm font-bold text-zinc-300 focus:ring-1 focus:ring-orange-500 outline-none"
                value={field.type}
                onChange={e => handleTypeChange(e.target.value as FieldType)}
              >
                {FIELD_TYPES.map(ft => <option key={ft.type} value={ft.type}>{ft.label}</option>)}
              </select>
            </div>
            <Button variant="ghost" size="icon" className="text-zinc-600 hover:text-destructive hover:bg-destructive/10 rounded-lg" onClick={() => onRemove(field.id)}>
              <Trash2 className="size-4" />
            </Button>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6 bg-zinc-900/10">
            <div className="flex items-center gap-3">
              <Switch checked={field.required} onCheckedChange={v => onUpdate(field.id, { required: v })} className="data-[state=checked]:bg-orange-600" />
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Required</Label>
              {field.required && field.localized && <AlertCircle className="size-3 text-orange-500" title="Required & Localized" />}
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={field.localized} onCheckedChange={v => onUpdate(field.id, { localized: v })} className="data-[state=checked]:bg-indigo-600" />
              <div className="flex items-center gap-1.5">
                <Globe className="size-3 text-indigo-400" />
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Localized</Label>
              </div>
            </div>
            {field.type === 'reference' && (
              <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2">
                <Link2 className="size-4 text-emerald-400" />
                <select
                  className="h-9 flex-1 rounded-md border border-zinc-800 bg-zinc-950 px-2 text-[9px] font-black uppercase tracking-widest text-emerald-500 outline-none focus:ring-1 focus:ring-emerald-500/50"
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
    onError: (err: any) => toast.error(`Schema error: ${err.message}`),
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
  if (isLoading) return <AppLayout title="Schema Architect"><div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-orange-500" /></div></AppLayout>;
  return (
    <AppLayout title="Schema Architect">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-500">Content Models</h2>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-orange-500 hover:bg-orange-500/10" onClick={() => setEditingType({ name: '', slug: '', fields: [] })}>
              <Plus className="size-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {types?.items.map(type => (
              <Card
                key={type.id}
                className={`cursor-pointer transition-all bg-zinc-950 border-zinc-900 ${editingType?.id === type.id ? 'border-orange-500 ring-1 ring-orange-500/20' : 'hover:border-zinc-700'}`}
                onClick={() => setEditingType(type)}
              >
                <div className="p-3.5 flex items-center gap-3">
                  <Database className={`size-4 ${editingType?.id === type.id ? 'text-orange-500' : 'text-zinc-600'}`} />
                  <span className="text-xs font-black uppercase tracking-tight text-zinc-200">{type.name}</span>
                </div>
              </Card>
            ))}
            {(!types || types.items.length === 0) && <div className="p-10 text-center text-[10px] font-black uppercase text-zinc-600 border-2 border-dashed border-zinc-900 rounded-xl">No models</div>}
          </div>
        </div>
        <div className="lg:col-span-3">
          {editingType ? (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-zinc-950 border border-zinc-900 rounded-3xl p-8 gap-6 shadow-2xl">
                <div className="flex-1 space-y-4 w-full">
                  <Input
                    value={editingType.name}
                    onChange={e => setEditingType({ ...editingType, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="bg-transparent border-none text-4xl font-black p-0 h-auto focus-visible:ring-0 uppercase tracking-tighter text-white"
                    placeholder="ENTER MODEL NAME..."
                  />
                  <div className="text-[10px] font-black uppercase tracking-widest text-orange-500 bg-orange-500/10 px-4 py-2 rounded-full inline-block border border-orange-500/20">
                    CORE_ENDPOINT: /api/content/{editingType.slug || '...'}
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  {editingType.id && (
                    <Button variant="ghost" size="sm" className="text-destructive font-black uppercase text-[10px] tracking-widest hover:bg-destructive/10" onClick={() => deleteMutation.mutate(editingType.id!)}>
                      Purge
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="font-black uppercase text-[10px] tracking-widest border-zinc-800" onClick={() => setEditingType(null)}>Discard</Button>
                  <Button className="btn-gradient font-black uppercase text-[10px] tracking-widest px-8" onClick={() => saveMutation.mutate(editingType)}>
                    {saveMutation.isPending ? <Loader2 className="size-3 animate-spin mr-2" /> : <Settings2 className="size-3 mr-2" />}
                    Commit Schema
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center px-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Atomic Structure_v4</h3>
                <Button variant="ghost" size="sm" onClick={addField} className="text-orange-500 hover:bg-orange-500/10 font-black uppercase text-[10px] tracking-widest px-4">
                  <Plus className="size-3 mr-2" /> Add Primitive
                </Button>
              </div>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={editingType.fields?.map(f => f.id) || []} strategy={verticalListSortingStrategy}>
                  <div className="space-y-4">
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
                <div className="py-24 text-center border-4 border-dashed border-zinc-900 rounded-[3rem] bg-zinc-950/50">
                  <Plus className="size-12 text-zinc-800 mx-auto mb-6" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Model has no atomic properties defined</p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-40 text-center bg-zinc-950/30 border-4 border-dashed border-zinc-900 rounded-[3rem] animate-in fade-in slide-in-from-bottom-4">
              <Settings2 className="size-20 text-zinc-800 mb-8" />
              <h3 className="text-4xl font-black uppercase tracking-tighter text-zinc-200">Architect Mode</h3>
              <p className="text-zinc-600 font-bold max-w-sm mx-auto mt-4 text-lg">Define structured, object-oriented content models for high-performance delivery.</p>
              <Button onClick={() => setEditingType({ name: '', slug: '', fields: [] })} className="mt-8 btn-gradient h-12 px-10 font-black uppercase text-xs tracking-widest">Create First Model</Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}