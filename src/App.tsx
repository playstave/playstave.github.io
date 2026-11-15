import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { AppStateProvider } from './state/AppState';
import { RouteError } from './pages/RouteError';
import { Home } from './pages/Home';
import { Learn } from './pages/Learn';
import { WorldDetail } from './pages/WorldDetail';
import { Roadmap } from './pages/Roadmap';
import { LevelPage } from './pages/LevelPage';
import { Library } from './pages/Library';
import { Practice } from './pages/Practice';
import { Progress } from './pages/Progress';
import { Achievements } from './pages/Achievements';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';

const router = createBrowserRouter([
  {
    element: <AppShell />,
    errorElement: <RouteError />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/learn', element: <Learn /> },
      { path: '/learn/world/:worldId', element: <WorldDetail /> },
      { path: '/roadmap', element: <Roadmap /> },
      { path: '/level/:levelId', element: <LevelPage /> },
      { path: '/library', element: <Library /> },
      { path: '/practice', element: <Practice /> },
      { path: '/progress', element: <Progress /> },
      { path: '/achievements', element: <Achievements /> },
      { path: '/profile', element: <Profile /> },
      { path: '/settings', element: <Settings /> },
      { path: '*', element: <NotFound /> },
    ],
  },
], {
  future: {
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
  },
});

export function App() {
  return (
    <AppStateProvider>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </AppStateProvider>
  );
}
