import { Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Layout, PageTransition } from './routes/routeConfig';
import { routeConfig, type RouteConfig } from './routes/routes';
import { useLanguageStore } from '../stores/languageStore';
import { getDirection } from '../lib/i18n';

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

interface RouteWithChildren extends RouteConfig {
  children?: RouteConfig[];
}

function renderRoutes(routes: RouteWithChildren[], parentPath = '') {
  return routes.map(({ path, Element, children }) => {
    const fullPath = parentPath ? `${parentPath}/${path}` : path;
    
    if (children) {
      return (
        <Route key={path} path={path} element={
          <Suspense fallback={<PageLoader />}>
            <Element />
          </Suspense>
        }>
          {renderRoutes(children, fullPath)}
        </Route>
      );
    }
    
    return (
      <Route
        key={path}
        path={fullPath}
        element={
          <Suspense fallback={<PageLoader />}>
            <Element />
          </Suspense>
        }
      />
    );
  });
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <PageTransition key={location.pathname}>
        <Routes location={location}>
          <Route path="/" element={<Layout />}>
            {renderRoutes(routeConfig as RouteWithChildren[])}
          </Route>
        </Routes>
      </PageTransition>
    </AnimatePresence>
  );
}

export default function App() {
  const language = useLanguageStore((state) => state.language);
  const direction = getDirection(language);

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
  }, [direction, language]);

  return <AnimatedRoutes />;
}
