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
        <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background/80 backdrop-blur-xl sticky top-0 z-30 px-4 sm:px-6">
          <SidebarTrigger className="-ml-1 size-9 hover:bg-secondary transition-colors" />
          <Separator orientation="vertical" className="mx-2 h-4 w-px bg-border" />
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
             <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-secondary/50">
               <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-tighter">Live_Sync</span>
             </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          {container ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="py-8 md:py-10 lg:py-12">
                {children}
              </div>
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