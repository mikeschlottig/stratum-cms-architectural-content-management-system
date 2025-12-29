import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, MoreHorizontal, FileText, Database } from "lucide-react";
import type { ContentType, ContentItem } from "@/types/schema";
import { format } from "date-fns";
export function ContentMatrix() {
  const { typeId } = useParams<{ typeId: string }>();
  const navigate = useNavigate();
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
  if (schemaLoading || itemsLoading) {
    return (
      <AppLayout title="Loading Matrix...">
        <div className="flex items-center justify-center h-64">
          <Database className="animate-spin size-8 text-primary/20" />
        </div>
      </AppLayout>
    );
  }
  if (!schema) {
    return (
      <AppLayout title="Error">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold">Model Not Found</h2>
          <p className="text-muted-foreground mt-2">The content model you are looking for does not exist.</p>
          <Button asChild className="mt-6" variant="outline">
            <Link to="/schema">Create Model</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }
  return (
    <AppLayout title={schema.name}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{schema.name}</h1>
            <p className="text-muted-foreground">{schema.description || `Manage all ${schema.name} entries.`}</p>
          </div>
          <Button asChild className="btn-gradient">
            <Link to={`/content/${typeId}/new`}>
              <Plus className="size-4 mr-2" /> New Entry
            </Link>
          </Button>
        </div>
        <div className="rounded-xl border border-border/40 obsidian-card overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[100px]">Status</TableHead>
                {schema.fields.slice(0, 3).map((field) => (
                  <TableHead key={field.id}>{field.label}</TableHead>
                ))}
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items?.items.map((item) => (
                <TableRow 
                  key={item.id} 
                  className="cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => navigate(`/content/${typeId}/edit/${item.id}`)}
                >
                  <TableCell>
                    <Badge variant={item.status === 'published' ? 'default' : 'secondary'} className="capitalize">
                      {item.status}
                    </Badge>
                  </TableCell>
                  {schema.fields.slice(0, 3).map((field) => (
                    <TableCell key={field.id} className="font-medium">
                      {item.data[field.slug]?.toString() || <span className="text-muted-foreground/30">—</span>}
                    </TableCell>
                  ))}
                  <TableCell className="text-muted-foreground text-xs">
                    {format(item.updatedAt, 'MMM d, yyyy HH:mm')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Edit2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!items || items.items.length === 0) && (
                <TableRow>
                  <TableCell colSpan={schema.fields.length + 3} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <FileText className="size-10 mb-4 opacity-20" />
                      <p>No entries found for this model</p>
                      <Button asChild variant="link" className="mt-2">
                        <Link to={`/content/${typeId}/new`}>Create the first entry</Link>
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