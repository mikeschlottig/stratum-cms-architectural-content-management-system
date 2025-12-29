import React from "react";
import { LayoutDashboard, Database, Settings, Image as ImageIcon, Plus, Box } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { ContentType } from "@/types/schema";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  const { data: types } = useQuery({
    queryKey: ["content-types"],
    queryFn: () => api<{ items: ContentType[] }>("/api/types"),
  });
  const isActive = (path: string) => location.pathname === path;
  return (
    <Sidebar variant="inset" className="border-r border-border/40">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 px-1">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20">
            S
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-none">Stratum</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">CMS Engine</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/")} tooltip="Dashboard">
                <Link to="/">
                  <LayoutDashboard className="size-4" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold uppercase text-muted-foreground/70">Content</SidebarGroupLabel>
          <SidebarMenu>
            {types?.items?.map((type) => (
              <SidebarMenuItem key={type.id}>
                <SidebarMenuButton asChild isActive={location.pathname.startsWith(`/content/${type.id}`)}>
                  <Link to={`/content/${type.id}`}>
                    <Box className="size-4" />
                    <span>{type.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            {(!types || types.items.length === 0) && (
              <div className="px-4 py-2 text-xs text-muted-foreground italic">No models defined</div>
            )}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold uppercase text-muted-foreground/70">Management</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/schema")}>
                <Link to="/schema">
                  <Database className="size-4" />
                  <span>Schema Architect</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/media")}>
                <Link to="/media">
                  <ImageIcon className="size-4" />
                  <span>Asset Library</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-border/40">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/settings")}>
              <Link to="/settings">
                <Settings className="size-4" />
                <span>Global Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}