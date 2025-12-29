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
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background/60 backdrop-blur-md sticky top-0 z-30 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Stratum CMS</BreadcrumbLink>
              </BreadcrumbItem>
              {title && (
                <>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{title}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex-1 overflow-auto">
          {container ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
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