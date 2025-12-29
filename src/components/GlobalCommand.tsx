import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { LayoutDashboard, Database, Settings, Image as ImageIcon, Plus, Box, Search, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { ContentType } from "@/types/schema";

export function GlobalCommand() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);
  const { data: types } = useQuery({
    queryKey: ["content-types"],
    queryFn: () => api<{ items: ContentType[] }>("/api/types"),
  });
  const { data: searchResults } = useQuery({
    queryKey: ["global-search", debouncedQuery],
    queryFn: () => api<{ items: any[] }>(`/api/search?q=${encodeURIComponent(debouncedQuery)}`),
    enabled: debouncedQuery.length > 1,
  });
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);
  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };
  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput 
        placeholder="Search content, models, or assets..." 
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="max-h-[400px]">
        <CommandEmpty>No results found for "{query}".</CommandEmpty>
        {searchResults?.items && (searchResults.items ?? []).length > 0 && (
          <CommandGroup heading="Content Results">
            {(searchResults.items ?? []).map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => runCommand(() => navigate(`/content/${item.typeId}/edit/${item.id}`))}
                className="flex items-center gap-2"
              >
                <FileText className="size-4 text-primary" />
                <div className="flex flex-col">
                  <span className="font-medium">{item.title}</span>
                  <span className="text-[10px] text-muted-foreground uppercase">{item.typeId}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        <CommandSeparator />
        <CommandGroup heading="Quick Navigation">
          <CommandItem onSelect={() => runCommand(() => navigate("/"))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Mission Control</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/schema"))}>
            <Database className="mr-2 h-4 w-4" />
            <span>Schema Architect</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/media"))}>
            <ImageIcon className="mr-2 h-4 w-4" />
            <span>Asset Library</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/settings"))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Content Models">
          {(types?.items ?? []).map((type) => (
            <CommandItem key={type.id} onSelect={() => runCommand(() => navigate(`/content/${type.id}`))}>
              <Box className="mr-2 h-4 w-4" />
              <span>{type.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}