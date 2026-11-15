import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { AppStateProvider } from './state/AppState';
import { RouteError } from './pages/RouteError';
import { Home } from './pages/Home';
import { Learn } from './pages/Learn';
import { WorldDetail } from './pages/WorldDetail';
import { Roadmap } from './pages/Roadmap';
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
      { path: '/library', element: <Library /> },
      { path: '/practice', element: <Practice /> },
      { path: '/progress', element: <Progress /> },
      { path: '/achievements', element: <Achievements /> },
      { path: '/profile', element: <Profile /> },
      { path: '/settings', element: <Settings /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export function App() {
  return (
    <AppStateProvider>
      <RouterProvider router={router} />
    </AppStateProvider>
  );
}
