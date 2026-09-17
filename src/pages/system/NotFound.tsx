import { Link } from 'react-router-dom';
import { SEO } from '../../components/ui/SEO';
import { Button } from '../../components/ui/Button';
import { useLanguageStore } from '../../stores/languageStore';

export function NotFound() {
  const language = useLanguageStore((state) => state.language);

  const content = language === 'fa'
    ? {
        title: 'صفحه مورد نظر یافت نشد',
        description: 'صفحه‌ای که به دنبال آن هستید وجود ندارد یا منتقل شده است.',
        button: 'بازگشت به صفحه اصلی',
        seoTitle: 'صفحه یافت نشد',
        seoDescription: 'صفحه مورد نظر یافت نشد. بازگشت به صفحه اصلی وایرو.',
      }
    : {
        title: 'Page Not Found',
        description: 'The page you are looking for does not exist or has been moved.',
        button: 'Back to Home',
        seoTitle: 'Page Not Found',
        seoDescription: 'The page you are looking for does not exist. Return to VYRO home.',
      };

  return (
    <>
      <SEO
        title={content.seoTitle}
        description={content.seoDescription}
      />
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <p className="text-8xl font-bold text-primary">۴۰۴</p>
        <h1 className="mt-4 text-2xl font-semibold text-primary">{content.title}</h1>
        <p className="mt-2 text-text-secondary">{content.description}</p>
        <Button className="mt-8" asChild>
          <Link to="/">{content.button}</Link>
        </Button>
      </div>
    </>
  );
}
