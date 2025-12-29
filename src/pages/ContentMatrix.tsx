import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, FileText, Database, Trash2, Loader2 } from "lucide-react";
import type { ContentType, ContentItem } from "@/types/schema";
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
      toast.success("Entry purged from matrix");
    },
    onError: (err: any) => toast.error(`Deletion failed: ${err.message}`),
  });
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Permanently delete this entry?")) {
      deleteMutation.mutate(id);
    }
  };
  if (schemaLoading || itemsLoading) {
    return (
      <AppLayout title="Loading Matrix...">
        <div className="flex items-center justify-center h-64">
          <Database className="animate-spin size-8 text-primary" />
        </div>
      </AppLayout>
    );
  }
  if (!schema) {
    return (
      <AppLayout title="Error">
        <div className="text-center py-20">
          <h2 className="text-3xl font-black">Model Not Found</h2>
          <p className="text-muted-foreground mt-2 font-medium">The content model you are looking for does not exist.</p>
          <Button asChild className="mt-8" variant="default">
            <Link to="/schema">Create Model</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }
  return (
    <AppLayout title={schema.name}>
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black tracking-tight">{schema.name}</h1>
            <p className="text-muted-foreground font-semibold mt-1">{schema.description || `Manage all ${schema.name} entries.`}</p>
          </div>
          <Button asChild className="btn-gradient px-8 py-6">
            <Link to={`/content/${typeId}/new`}>
              <Plus className="size-5 mr-2" /> New Entry
            </Link>
          </Button>
        </div>
        <div className="rounded-xl border-2 border-border bg-card shadow-soft overflow-hidden">
          <Table>
            <TableHeader className="bg-secondary/80">
              <TableRow className="hover:bg-transparent border-b-2 border-border">
                <TableHead className="w-[120px] font-black text-foreground uppercase tracking-widest text-xs">Status</TableHead>
                {schema.fields.slice(0, 3).map((field) => (
                  <TableHead key={field.id} className="font-black text-foreground uppercase tracking-widest text-xs">{field.label}</TableHead>
                ))}
                <TableHead className="font-black text-foreground uppercase tracking-widest text-xs">Updated</TableHead>
                <TableHead className="text-right font-black text-foreground uppercase tracking-widest text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items?.items.map((item) => (
                <TableRow
                  key={item.id}
                  className="cursor-pointer hover:bg-muted/50 border-border group"
                  onClick={() => navigate(`/content/${typeId}/edit/${item.id}`)}
                >
                  <TableCell>
                    <Badge
                      variant={item.status === 'published' ? 'default' : 'outline'}
                      className={`capitalize font-black text-[10px] px-3 border-2 ${item.status === 'published' ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-border text-muted-foreground'}`}
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  {schema.fields.slice(0, 3).map((field) => (
                    <TableCell key={field.id} className="font-bold text-sm">
                      {item.data[field.slug]?.toString() || <span className="text-muted-foreground/40 font-normal">—</span>}
                    </TableCell>
                  ))}
                  <TableCell className="text-muted-foreground font-bold text-xs">
                    {format(item.updatedAt, 'MMM d, HH:mm')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="hover:bg-primary hover:text-primary-foreground">
                        <Edit2 className="size-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="hover:bg-destructive hover:text-destructive-foreground"
                        disabled={deleteMutation.isPending && deleteMutation.variables === item.id}
                        onClick={(e) => handleDelete(e, item.id)}
                      >
                        {deleteMutation.isPending && deleteMutation.variables === item.id ? (
                          <Loader2 className="animate-spin size-4" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!items || items.items.length === 0) && (
                <TableRow>
                  <TableCell colSpan={schema.fields.length + 3} className="h-80 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="size-16 mb-4 text-muted-foreground opacity-30" />
                      <p className="text-xl font-bold">Zero Entries Found</p>
                      <p className="text-muted-foreground font-medium mb-6">Start populating your {schema.name} matrix.</p>
                      <Button asChild variant="outline" className="border-2 font-bold">
                        <Link to={`/content/${typeId}/new`}>Create First Entry</Link>
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