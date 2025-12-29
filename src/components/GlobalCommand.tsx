import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { LayoutDashboard, Database, Settings, Image as ImageIcon, Plus, Box } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { ContentType } from "@/types/schema";
export function GlobalCommand() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { data: types } = useQuery({
    queryKey: ["content-types"],
    queryFn: () => api<{ items: ContentType[] }>("/api/types"),
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
      <CommandInput placeholder="Type a command or search content..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => navigate("/"))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/schema"))}>
            <Database className="mr-2 h-4 w-4" />
            <span>Schema Architect</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/media"))}>
            <ImageIcon className="mr-2 h-4 w-4" />
            <span>Assets</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Content Models">
          {types?.items?.map((type) => (
            <CommandItem key={type.id} onSelect={() => runCommand(() => navigate(`/content/${type.id}`))}>
              <Box className="mr-2 h-4 w-4" />
              <span>{type.name}</span>
            </CommandItem>
          ))}
          <CommandItem onSelect={() => runCommand(() => navigate("/schema"))}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Create New Model</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem onSelect={() => runCommand(() => navigate("/settings"))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>System Settings</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}