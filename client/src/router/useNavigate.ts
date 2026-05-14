import { useEffect, useState } from 'react';

export type Screen = 'main' | 'rules' | 'settings' | 'scores' | 'lobby' | 'playing' | 'paused' | 'ended';
export type AppRoute = '/' | '/rules' | '/settings' | '/scores' | '/lobby' | '/game' | '/pause' | '/end';

type NavigateOptions = {
  replace?: boolean;
};

const routeByScreen: Record<Screen, AppRoute> = {
  main: '/',
  rules: '/rules',
  settings: '/settings',
  scores: '/scores',
  lobby: '/lobby',
  playing: '/game',
  paused: '/pause',
  ended: '/end',
};

const screenByRoute: Record<AppRoute, Screen> = {
  '/': 'main',
  '/rules': 'rules',
  '/settings': 'settings',
  '/scores': 'scores',
  '/lobby': 'lobby',
  '/game': 'playing',
  '/pause': 'paused',
  '/end': 'ended',
};

function normalizeRoute(value: string): AppRoute {
  const route = value.replace(/^#/, '') || '/';

  if (route in screenByRoute) {
    return route as AppRoute;
  }

  return '/';
}

function readCurrentRoute(): AppRoute {
  return normalizeRoute(window.location.hash);
}

function dispatchRouteChange() {
  window.dispatchEvent(new Event('hashchange'));
}

export function screenToRoute(screen: Screen): AppRoute {
  return routeByScreen[screen];
}

export function routeToScreen(route: AppRoute): Screen {
  return screenByRoute[route];
}

export function useCurrentRoute() {
  const [route, setRoute] = useState<AppRoute>(() => readCurrentRoute());

  useEffect(() => {
    const handleRouteChange = () => setRoute(readCurrentRoute());

    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return route;
}

export function useNavigate() {
  return (route: AppRoute, options: NavigateOptions = {}) => {
    const nextRoute = normalizeRoute(route);
    const nextHash = `#${nextRoute}`;

    if (options.replace) {
      window.history.replaceState(null, '', nextHash);
      dispatchRouteChange();
      return;
    }

    if (window.location.hash === nextHash) return;
    window.location.hash = nextRoute;
  };
}
