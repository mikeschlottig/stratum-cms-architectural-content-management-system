import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { GlobalCommand } from '@/components/GlobalCommand';
type AppLayoutProps = {
  children: React.ReactNode;
  container?: boolean;
  className?: string;
  title?: string;
};
export function AppLayout({ children, container = true, className, title }: AppLayoutProps): JSX.Element {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className={className}>
        <header className="flex h-20 shrink-0 items-center gap-4 border-b-2 bg-background/80 backdrop-blur-xl sticky top-0 z-30 px-6">
          <SidebarTrigger className="-ml-1 size-10 hover:bg-secondary transition-colors" />
          <Separator orientation="vertical" className="mx-2 h-6 w-0.5 bg-border" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/" className="font-black uppercase tracking-widest text-[10px] text-muted-foreground hover:text-foreground">
                  STRATUM_CORE
                </BreadcrumbLink>
              </BreadcrumbItem>
              {title && (
                <>
                  <BreadcrumbSeparator className="hidden md:block font-bold" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-black uppercase tracking-widest text-[10px] text-orange-600 dark:text-orange-400">
                      {title}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto flex items-center gap-4">
             <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-border bg-secondary/50">
               <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-tighter">Live_Sync</span>
             </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          {container ? (
            <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-10 md:py-14">
              {children}
            </div>
          ) : (
            children
          )}
        </main>
        <GlobalCommand />
      </SidebarInset>
    </SidebarProvider>
  );
}