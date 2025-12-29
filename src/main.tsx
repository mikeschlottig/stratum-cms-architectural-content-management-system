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
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import { SchemaBuilder } from '@/pages/SchemaBuilder'
import { ContentMatrix } from '@/pages/ContentMatrix'
import { EditorStudio } from '@/pages/EditorStudio'
import { MediaLibrary } from '@/pages/MediaLibrary'
import { Settings } from '@/pages/Settings'
const queryClient = new QueryClient();
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/schema",
    element: <SchemaBuilder />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/content/:typeId",
    element: <ContentMatrix />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/content/:typeId/new",
    element: <EditorStudio />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/content/:typeId/edit/:id",
    element: <EditorStudio />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/media",
    element: <MediaLibrary />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/settings",
    element: <Settings />,
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