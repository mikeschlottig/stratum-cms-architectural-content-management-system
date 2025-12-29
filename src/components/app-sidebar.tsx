import React from "react";
import { LayoutDashboard, Database, Settings, Image as ImageIcon, Box } from "lucide-react";
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
    <Sidebar variant="inset" className="border-r border-border">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3 px-1">
          <div className="h-9 w-9 rounded-xl bg-orange-600 flex items-center justify-center text-white font-black text-2xl shadow-glow">
            S
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black leading-none tracking-tight">Stratum</span>
            <span className="text-[10px] text-orange-600 dark:text-orange-400 uppercase tracking-widest font-black">CMS Engine</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/")} tooltip="Dashboard" className="font-bold py-6">
                <Link to="/">
                  <LayoutDashboard className="size-5" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-4 text-[10px] font-black uppercase text-foreground/80 tracking-widest">Content</SidebarGroupLabel>
          <SidebarMenu>
            {types?.items?.map((type) => (
              <SidebarMenuItem key={type.id}>
                <SidebarMenuButton asChild isActive={location.pathname.startsWith(`/content/${type.id}`)} className="font-bold py-5">
                  <Link to={`/content/${type.id}`}>
                    <Box className="size-5" />
                    <span>{type.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            {(!types || types.items.length === 0) && (
              <div className="px-4 py-2 text-xs text-muted-foreground italic font-medium">No models defined</div>
            )}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-4 text-[10px] font-black uppercase text-foreground/80 tracking-widest">Management</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/schema")} className="font-bold py-5">
                <Link to="/schema">
                  <Database className="size-5" />
                  <span>Schema Architect</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/media")} className="font-bold py-5">
                <Link to="/media">
                  <ImageIcon className="size-5" />
                  <span>Asset Library</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/settings")} className="font-bold py-5">
              <Link to="/settings">
                <Settings className="size-5" />
                <span>Global Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}