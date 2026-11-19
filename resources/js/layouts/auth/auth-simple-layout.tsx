import { Link } from '@inertiajs/react';
import { ArrowLeft, MapPin, ShieldCheck } from 'lucide-react';
import { useEffect } from 'react';
import '../../../css/auth-vishwa.css';
import LanguageSwitcher from '@/components/storefront/language-switcher';
import MotionPattern, {
    movePattern,
    resetPattern,
} from '@/components/storefront/motion-pattern';
import { isSiteTextKey, useSiteText } from '@/lib/site-text';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { language, t } = useSiteText();

    useEffect(() => {
        document.documentElement.lang = language;
        return () => {
            document.documentElement.lang = 'en';
        };
    }, [language]);

    return (
        <div className="vishwa-auth">
            <aside
                className="auth-visual"
                aria-hidden="true"
                onPointerMove={movePattern}
                onPointerLeave={resetPattern}
            >
                <img
                    src="/repair-bench.webp"
                    alt=""
                    width="1200"
                    height="800"
                />
                <div className="auth-visual-scrim" />
                <MotionPattern />
                <div className="auth-visual-content">
                    <div className="auth-visual-badge">
                        <ShieldCheck size={16} />
                        <span>Vishwa IT Solutions</span>
                    </div>
                    <div className="auth-visual-card">
                        <p className="auth-visual-title">
                            {t('heroTitle')} <em>{t('heroAccent')}</em>
                        </p>
                        <p className="auth-visual-copy">{t('heroCopy')}</p>
                        <div className="auth-visual-loc">
                            <MapPin size={14} />
                            <span>{t('location')}</span>
                        </div>
                    </div>
                </div>
            </aside>
            <div className="auth-stage">
                <header className="auth-header">
                    <Link
                        href={home()}
                        className="auth-brand"
                        aria-label={t('backHome')}
                    >
                        <img
                            src="/vishwa-logo.svg"
                            alt="Vishwa IT Solutions"
                            width="174"
                            height="57"
                        />
                    </Link>
                    <Link href={home()} className="auth-back">
                        <ArrowLeft size={16} aria-hidden="true" />
                        <span>{t('backHome')}</span>
                    </Link>
                </header>
                <main className="auth-main">
                    <div className="auth-card-accent" aria-hidden="true" />
                    <div className="auth-heading">
                        <span className="auth-lock-icon" aria-hidden="true">
                            <ShieldCheck size={20} />
                        </span>
                        <h1>
                            {title && isSiteTextKey(title) ? t(title) : title}
                        </h1>
                        {description && (
                            <p>
                                {isSiteTextKey(description)
                                    ? t(description)
                                    : description}
                            </p>
                        )}
                    </div>
                    {children}
                </main>
                <footer className="auth-footer">
                    <span className="auth-copyright">
                        © Vishwa IT Solutions
                    </span>
                    <LanguageSwitcher />
                </footer>
            </div>
        </div>
    );
}
