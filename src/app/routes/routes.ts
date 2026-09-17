import { lazy } from 'react';
import { ROUTES } from '../../constants/routes';

const Home = lazy(() => import('../../pages/system/Home').then(m => ({ default: m.Home })));
const Shop = lazy(() => import('../../pages/shop/Shop').then(m => ({ default: m.Shop })));
const Hats = lazy(() => import('../../pages/shop/Hats').then(m => ({ default: m.Hats })));
const Glasses = lazy(() => import('../../pages/shop/Glasses').then(m => ({ default: m.Glasses })));
const ProductDetails = lazy(() => import('../../pages/shop/ProductDetails').then(m => ({ default: m.ProductDetails })));
const StyleFinder = lazy(() => import('../../pages/shop/StyleFinder').then(m => ({ default: m.StyleFinder })));
const Wishlist = lazy(() => import('../../pages/shop/Wishlist').then(m => ({ default: m.Wishlist })));
const Cart = lazy(() => import('../../pages/shop/Cart').then(m => ({ default: m.Cart })));
const Checkout = lazy(() => import('../../pages/shop/Checkout').then(m => ({ default: m.Checkout })));
const SearchResults = lazy(() => import('../../pages/shop/SearchResults').then(m => ({ default: m.SearchResults })));
const About = lazy(() => import('../../pages/info/About').then(m => ({ default: m.About })));
const Contact = lazy(() => import('../../pages/info/Contact').then(m => ({ default: m.Contact })));
const FAQ = lazy(() => import('../../pages/info/FAQ').then(m => ({ default: m.FAQ })));
const Shipping = lazy(() => import('../../pages/info/Shipping').then(m => ({ default: m.Shipping })));
const Returns = lazy(() => import('../../pages/info/Returns').then(m => ({ default: m.Returns })));
const Privacy = lazy(() => import('../../pages/info/Privacy').then(m => ({ default: m.Privacy })));
const Terms = lazy(() => import('../../pages/info/Terms').then(m => ({ default: m.Terms })));
const NotFound = lazy(() => import('../../pages/system/NotFound').then(m => ({ default: m.NotFound })));

const AdminDashboard = lazy(() => import('../../pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminProducts = lazy(() => import('../../pages/admin/AdminProducts').then(m => ({ default: m.AdminProducts })));
const AdminProductCreate = lazy(() => import('../../pages/admin/AdminProductCreate').then(m => ({ default: m.AdminProductCreate })));
const AdminProductEdit = lazy(() => import('../../pages/admin/AdminProductEdit').then(m => ({ default: m.AdminProductEdit })));

export const routeConfig = [
  { path: ROUTES.HOME, Element: Home },
  { path: ROUTES.SHOP, Element: Shop },
  { path: ROUTES.HATS, Element: Hats },
  { path: ROUTES.GLASSES, Element: Glasses },
  { path: ROUTES.PRODUCT, Element: ProductDetails },
  { path: ROUTES.STYLE_FINDER, Element: StyleFinder },
  { path: ROUTES.WISHLIST, Element: Wishlist },
  { path: ROUTES.CART, Element: Cart },
  { path: ROUTES.CHECKOUT, Element: Checkout },
  { path: ROUTES.SEARCH, Element: SearchResults },
  { path: ROUTES.ABOUT, Element: About },
  { path: ROUTES.CONTACT, Element: Contact },
  { path: ROUTES.FAQ, Element: FAQ },
  { path: ROUTES.SHIPPING, Element: Shipping },
  { path: ROUTES.RETURNS, Element: Returns },
  { path: ROUTES.PRIVACY, Element: Privacy },
  { path: ROUTES.TERMS, Element: Terms },
  { path: ROUTES.ADMIN, Element: AdminDashboard },
  { path: ROUTES.ADMIN_PRODUCTS, Element: AdminProducts },
  { path: ROUTES.ADMIN_PRODUCT_NEW, Element: AdminProductCreate },
  { path: ROUTES.ADMIN_PRODUCT_EDIT, Element: AdminProductEdit },
  { path: ROUTES.NOT_FOUND, Element: NotFound },
];
