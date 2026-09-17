import { Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Layout, PageTransition } from './routes/routeConfig';
import { routeConfig } from './routes/routes';
import { useLanguageStore } from '../stores/languageStore';
import { getDirection } from '../lib/i18n';

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <PageTransition key={location.pathname}>
        <Routes location={location}>
          <Route path="/" element={<Layout />}>
            {routeConfig.map(({ path, Element }) => (
              <Route
                key={path}
                path={path}
                element={
                  <Suspense fallback={<PageLoader />}>
                    <Element />
                  </Suspense>
                }
              />
            ))}
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
