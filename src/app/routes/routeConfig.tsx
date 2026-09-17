import { lazy } from 'react';

const Layout = lazy(() => import('../../components/layout/Layout').then(m => ({ default: m.Layout })));
const PageTransition = lazy(() => import('../../components/layout/PageTransition').then(m => ({ default: m.PageTransition })));

export { Layout, PageTransition };
