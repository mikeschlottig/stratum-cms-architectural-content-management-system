import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Image as ImageIcon, Search, Download, Trash2, Loader2 } from "lucide-react";
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
      body: JSON.stringify({ name: "IMG_STRATUM_" + Date.now().toString().slice(-4), type: "image/jpeg" })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-assets"] });
      toast.success("Asset Uploaded Successfully");
      setIsUploading(false);
      setUploadProgress(0);
    }
  });
  const handleSimulatedUpload = () => {
    setIsUploading(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        uploadMutation.mutate();
      }
    }, 100);
  };
  const filteredMedia = media?.items?.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];
  return (
    <AppLayout title="Asset Library">
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Media Matrix</h1>
            <p className="text-muted-foreground font-bold text-lg mt-1">High-performance asset delivery hub.</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-foreground font-bold" />
              <Input
                className="pl-12 h-12 border-2 bg-card font-bold placeholder:text-muted-foreground/50"
                placeholder="Search matrix assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button className="btn-gradient h-12 px-8" onClick={handleSimulatedUpload} disabled={isUploading}>
              {isUploading ? <Loader2 className="animate-spin mr-2 size-5" /> : <Plus className="mr-2 size-5" />}
              Import Asset
            </Button>
          </div>
        </div>
        {isUploading && (
          <div className="p-8 rounded-2xl border-2 border-orange-500 bg-orange-500/10 space-y-4 animate-in fade-in slide-in-from-top-4">
            <div className="flex justify-between items-center text-sm font-black uppercase tracking-widest">
              <span>Streaming Asset...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-3 bg-white/20" />
          </div>
        )}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-square rounded-2xl bg-secondary animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {filteredMedia.map((asset) => (
              <Card key={asset.id} className="group overflow-hidden border-2 border-border bg-card hover:border-orange-500 transition-all cursor-pointer shadow-soft">
                <CardContent className="p-0">
                  <div className="aspect-square relative overflow-hidden bg-secondary">
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-95 group-hover:brightness-100"
                    />
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <Button variant="outline" size="icon" className="h-10 w-10 text-white border-2 border-white/40 hover:bg-white hover:text-black">
                        <Download className="size-5" />
                      </Button>
                      <Button variant="destructive" size="icon" className="h-10 w-10">
                        <Trash2 className="size-5" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 bg-card border-t-2">
                    <p className="text-xs font-black truncate text-foreground uppercase tracking-wider">{asset.name}</p>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter mt-1">
                      {asset.type.split('/')[1]} ��� {(asset.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredMedia.length === 0 && (
              <div className="col-span-full py-40 text-center border-4 border-dashed border-border rounded-3xl">
                <ImageIcon className="size-20 text-muted-foreground opacity-20 mx-auto mb-6" />
                <h3 className="text-2xl font-black uppercase tracking-tighter">Matrix Empty</h3>
                <p className="text-muted-foreground font-bold mt-2">Initialize your asset catalog.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}