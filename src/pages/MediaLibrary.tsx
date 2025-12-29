import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Image as ImageIcon, Search, Download, Trash2, Loader2, FileIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
interface MediaAsset {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: number;
}
export function MediaLibrary() {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: media, isLoading } = useQuery({
    queryKey: ["media-assets"],
    queryFn: () => api<{ items: MediaAsset[] }>("/api/media"),
  });
  const uploadMutation = useMutation({
    mutationFn: () => api<MediaAsset>("/api/media", { 
      method: "POST", 
      body: JSON.stringify({ name: "Uploaded Asset", type: "image/jpeg" }) 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-assets"] });
      toast.success("Asset uploaded successfully");
      setIsUploading(false);
      setUploadProgress(0);
    }
  });
  const handleSimulatedUpload = () => {
    setIsUploading(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        uploadMutation.mutate();
      }
    }, 150);
  };
  const filteredMedia = media?.items?.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];
  return (
    <AppLayout title="Asset Library">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
            <p className="text-muted-foreground">Manage and use assets across your content.</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input 
                className="pl-9 bg-zinc-950/50 border-zinc-800" 
                placeholder="Search assets..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button className="btn-gradient" onClick={handleSimulatedUpload} disabled={isUploading}>
              {isUploading ? <Loader2 className="animate-spin mr-2 size-4" /> : <Plus className="mr-2 size-4" />}
              Upload
            </Button>
          </div>
        </div>
        {isUploading && (
          <div className="p-6 rounded-xl border border-primary/20 bg-primary/5 space-y-3 animate-in fade-in slide-in-from-top-4">
            <div className="flex justify-between text-sm font-medium">
              <span>Uploading asset...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="aspect-square bg-zinc-950 border-zinc-900 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredMedia.map((asset) => (
              <Card key={asset.id} className="group overflow-hidden border-zinc-800/50 bg-zinc-950/50 hover:border-primary/50 transition-all cursor-pointer">
                <CardContent className="p-0">
                  <div className="aspect-square relative">
                    <img 
                      src={asset.url} 
                      alt={asset.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20">
                        <Download className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/20">
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-medium truncate">{asset.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-tighter mt-1">
                      {asset.type.split('/')[1]} • {(asset.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredMedia.length === 0 && (
              <div className="col-span-full py-32 text-center border-2 border-dashed border-zinc-900 rounded-2xl">
                <ImageIcon className="size-12 text-zinc-800 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-zinc-400">No assets found</h3>
                <p className="text-sm text-zinc-600">Upload your first image to get started.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}