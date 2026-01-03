import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { LayoutDashboard, Database, Settings, Image as ImageIcon, Box, Search, FileText, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { ContentType, SearchRecord } from "@shared/types";
export function GlobalCommand() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);
  const { data: types } = useQuery({
    queryKey: ["content-types"],
    queryFn: () => api<{ items: ContentType[] }>("/api/types"),
  });
  const { data: searchResults } = useQuery({
    queryKey: ["global-search", debouncedQuery],
    queryFn: () => api<{ items: SearchRecord[] }>(`/api/search?q=${encodeURIComponent(debouncedQuery)}`),
    enabled: debouncedQuery.length > 1,
  });
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
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
        placeholder="Search core data matrix..."
        value={query}
        onValueChange={setQuery}
        className="font-bold border-none h-14"
      />
      <CommandList className="max-h-[450px]">
        <CommandEmpty className="py-10 text-center">
          <p className="text-xs font-black uppercase tracking-widest text-zinc-500">No matching records found</p>
        </CommandEmpty>
        {searchResults?.items && searchResults.items.length > 0 && (
          <CommandGroup heading="Content Results">
            {searchResults.items.map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => runCommand(() => navigate(`/content/${item.typeId}/edit/${item.id}`))}
                className="flex items-center gap-4 py-3"
              >
                <FileText className="size-4 text-orange-500" />
                <div className="flex flex-col">
                  <span className="font-bold text-sm tracking-tight">{item.title}</span>
                  <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{item.typeId}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        <CommandSeparator />
        <CommandGroup heading="Navigation Nodes">
          <CommandItem onSelect={() => runCommand(() => navigate("/"))} className="font-bold uppercase text-[10px] tracking-widest py-3">
            <LayoutDashboard className="mr-3 h-4 w-4" />
            Mission Control
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/schema"))} className="font-bold uppercase text-[10px] tracking-widest py-3">
            <Database className="mr-3 h-4 w-4" />
            Architect
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/media"))} className="font-bold uppercase text-[10px] tracking-widest py-3">
            <ImageIcon className="mr-3 h-4 w-4" />
            Asset Matrix
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Content Models">
          {(types?.items ?? []).map((type) => (
            <CommandItem key={type.id} onSelect={() => runCommand(() => navigate(`/content/${type.id}`))} className="font-bold uppercase text-[10px] tracking-widest py-3">
              <Box className="mr-3 h-4 w-4 text-zinc-500" />
              {type.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}