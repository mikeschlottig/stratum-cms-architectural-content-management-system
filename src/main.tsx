import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import { AuthGuard } from '@/components/AuthGuard';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import { SchemaBuilder } from '@/pages/SchemaBuilder'
import { ContentMatrix } from '@/pages/ContentMatrix'
import { EditorStudio } from '@/pages/EditorStudio'
import { MediaLibrary } from '@/pages/MediaLibrary'
import { Settings } from '@/pages/Settings'
import { LoginPage } from '@/pages/LoginPage'
const queryClient = new QueryClient();
const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/",
    element: <AuthGuard><HomePage /></AuthGuard>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/schema",
    element: <AuthGuard><SchemaBuilder /></AuthGuard>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/content/:typeId",
    element: <AuthGuard><ContentMatrix /></AuthGuard>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/content/:typeId/new",
    element: <AuthGuard><EditorStudio /></AuthGuard>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/content/:typeId/edit/:id",
    element: <AuthGuard><EditorStudio /></AuthGuard>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/media",
    element: <AuthGuard><MediaLibrary /></AuthGuard>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/settings",
    element: <AuthGuard><Settings /></AuthGuard>,
    errorElement: <RouteErrorBoundary />,
  },
]);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </QueryClientProvider>
  </StrictMode>,
)