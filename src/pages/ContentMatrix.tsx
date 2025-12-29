import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, FileText, Trash2, Loader2, Globe, Link2 } from "lucide-react";
import type { ContentType, ContentItem } from "@shared/types";
import { format } from "date-fns";
import { toast } from "sonner";
export function ContentMatrix() {
  const { typeId } = useParams<{ typeId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: schema, isLoading: schemaLoading } = useQuery({
    queryKey: ["content-type", typeId],
    queryFn: () => api<ContentType>(`/api/types/${typeId}`),
    enabled: !!typeId,
  });
  const { data: items, isLoading: itemsLoading } = useQuery({
    queryKey: ["content-items", typeId],
    queryFn: () => api<{ items: ContentItem[] }>(`/api/content/${typeId}`),
    enabled: !!typeId,
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/api/content/${typeId}/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-items", typeId] });
      toast.success("Entry purged from core");
    },
  });
  const renderCellContent = (item: ContentItem, field: any) => {
    let value = item.data?.[field.slug];
    // Safety check for localized fields
    if (field.localized && value && typeof value === 'object') {
      value = value['en'] || Object.values(value)[0] || '';
    }
    if (value === null || value === undefined) return <span className="text-zinc-800 italic">null</span>;
    if (field.type === 'reference') {
      return (
        <div className="flex items-center gap-1.5 font-mono text-[9px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full w-fit max-w-[120px] truncate">
          <Link2 className="size-3 shrink-0" /> {String(value)}
        </div>
      );
    }
    if (field.type === 'boolean') {
      return !!value ? 
        <Badge className="bg-emerald-500 text-[9px] font-black uppercase">True</Badge> : 
        <Badge variant="outline" className="text-[9px] font-black uppercase border-zinc-800">False</Badge>;
    }
    if (field.type === 'media' && typeof value === 'string' && value.startsWith('http')) {
      return (
        <div className="size-8 rounded-md overflow-hidden border border-zinc-800 bg-zinc-900">
          <img src={value} className="w-full h-full object-cover" alt="Preview" />
        </div>
      );
    }
    return String(value).length > 40 ? String(value).slice(0, 40) + '...' : String(value);
  };
  if (schemaLoading || itemsLoading) return <AppLayout title="Matrix Core"><div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-primary" /></div></AppLayout>;
  if (!schema) return <AppLayout title="Error"><div className="text-center py-20">Model context lost.</div></AppLayout>;
  return (
    <AppLayout title={schema.name}>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black tracking-tighter uppercase">{schema.name}</h1>
            <p className="text-zinc-500 font-bold tracking-widest uppercase text-xs mt-1">Matrix Interface_v2</p>
          </div>
          <Button asChild className="btn-gradient px-8 py-7 h-auto font-black uppercase tracking-widest text-xs">
            <Link to={`/content/${typeId}/new`}><Plus className="size-5 mr-2" /> New Dispatch</Link>
          </Button>
        </div>
        <div className="rounded-[2rem] border-4 border-zinc-900 bg-black overflow-hidden shadow-2xl">
          <Table>
            <TableHeader className="bg-zinc-950">
              <TableRow className="hover:bg-transparent border-b-4 border-zinc-900">
                <TableHead className="w-[120px] font-black text-zinc-500 uppercase tracking-[0.2em] text-[10px] py-6 px-8">Workflow</TableHead>
                {schema.fields.slice(0, 4).map((field) => (
                  <TableHead key={field.id} className="font-black text-zinc-500 uppercase tracking-[0.2em] text-[10px] py-6 px-8">
                    <div className="flex items-center gap-2">
                      {field.label}
                      {field.localized && <Globe className="size-3 text-indigo-400" />}
                    </div>
                  </TableHead>
                ))}
                <TableHead className="font-black text-zinc-500 uppercase tracking-[0.2em] text-[10px] py-6 px-8">Lifecycle</TableHead>
                <TableHead className="text-right font-black text-zinc-500 uppercase tracking-[0.2em] text-[10px] py-6 px-8">Control</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items?.items.map((item) => (
                <TableRow
                  key={item.id}
                  className="cursor-pointer hover:bg-zinc-900/50 border-zinc-900 group"
                  onClick={() => navigate(`/content/${typeId}/edit/${item.id}`)}
                >
                  <TableCell className="px-8 py-6">
                    <Badge variant="outline" className={`font-black uppercase text-[9px] border-2 ${item.status === 'published' ? 'border-emerald-600 text-emerald-500' : 'border-zinc-800 text-zinc-500'}`}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  {schema.fields.slice(0, 4).map((field) => (
                    <TableCell key={field.id} className="font-bold text-sm px-8 py-6 text-zinc-200">
                      {renderCellContent(item, field)}
                    </TableCell>
                  ))}
                  <TableCell className="text-zinc-500 font-black uppercase text-[10px] tracking-tighter px-8 py-6">
                    {item.updatedAt ? format(item.updatedAt, 'MMM dd, HH:mm') : '---'}
                  </TableCell>
                  <TableCell className="text-right px-8 py-6">
                    <div className="flex items-center justify-end gap-3">
                      <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-white hover:text-black rounded-xl transition-all">
                        <Edit2 className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 hover:bg-destructive hover:text-destructive-foreground rounded-xl transition-all"
                        onClick={(e) => { e.stopPropagation(); if (confirm("Purge?")) deleteMutation.mutate(item.id); }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!items || items.items.length === 0) && (
                <TableRow>
                  <TableCell colSpan={schema.fields.length + 3} className="h-80 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="size-16 mb-4 text-zinc-800" />
                      <h3 className="text-2xl font-black uppercase tracking-tighter text-zinc-400">Matrix Empty</h3>
                      <p className="text-zinc-600 font-bold mb-6">Initial objects not found for this core model.</p>
                      <Button asChild variant="outline" className="border-2 border-zinc-800 font-black uppercase text-[10px] tracking-widest h-12 px-8 hover:bg-zinc-900">
                        <Link to={`/content/${typeId}/new`}>Initialize First Entry</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}