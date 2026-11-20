import { Head, Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    ChevronRight,
    Home,
    Laptop,
    MapPin,
    Phone,
    Wrench,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import '../../css/storefront.css';
import '../../css/storefront-pages.css';
import '../../css/storefront-refresh.css';
import '../../css/site-polish.css';
import '../../css/storefront-modern.css';
import {
    business,
    directions,
    whatsapp,
} from '@/components/storefront/business';
import { Chat } from '@/components/storefront/catalog';
import LanguageSwitcher from '@/components/storefront/language-switcher';
import { useSiteText } from '@/lib/site-text';
import { registerWebMcpTools } from '@/lib/webmcp';
import { home } from '@/routes';
import {
    about,
    blog,
    contact,
    services,
    shop,
    terms,
} from '@/routes/storefront';
import type { Seo } from '@/types/storefront';

const mainNav = [
    ['home', home, Home],
    ['services', services, Wrench],
    ['shop', shop, Laptop],
    ['blog', blog, BookOpen],
    ['contact', contact, Phone],
] as const;

const initialSchema =
    typeof document === 'undefined'
        ? null
        : document.head.querySelector<HTMLScriptElement>(
              'script[data-inertia="structured"]',
          );

export default function StorefrontLayout({
    children,
}: {
    children: ReactNode;
}) {
    const { props, url, component } = usePage<{
        seo: Seo;
        structuredData?: string;
    }>();
    const { seo } = props;
    const structuredData =
        props.structuredData ??
        (initialSchema?.dataset.canonical === seo.canonical
            ? initialSchema.textContent
            : null);
    const { language, t, visitingChargeInr } = useSiteText();
    const [menu, setMenu] = useState(
        () =>
            typeof document !== 'undefined' &&
            document.querySelector('.preview-mobile-menu[open]') !== null,
    );
    const [scrolled, setScrolled] = useState(false);
    const closeMenu = () => setMenu(false);
    const pathname = url.split(/[?#]/)[0];
    const headerHost =
        component === 'storefront/home' && typeof document !== 'undefined'
            ? document.getElementById('home-preview-header')
            : null;
    const renderHeader = (header: ReactNode) =>
        headerHost ? createPortal(header, headerHost) : header;

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 18);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        if (!menu) {
            return;
        }
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setMenu(false);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [menu]);
    const social = {
        'og:title': seo.title,
        'og:description': seo.description,
        'og:image': seo.image,
        'og:image:alt': seo.imageAlt,
        'og:url': seo.canonical,
        'og:type': seo.type,
        'og:site_name': business.name,
        'og:locale': language + '_IN',
    };
    const twitter = {
        card: 'summary_large_image',
        title: seo.title,
        description: seo.description,
        image: seo.image,
        'image:alt': seo.imageAlt,
    };

    useEffect(() => {
        registerWebMcpTools(visitingChargeInr);
        document.documentElement.lang = language;
        return () => {
            document.documentElement.lang = 'en';
        };
    }, [language, visitingChargeInr]);

    return (
        <div className="vishwa-site">
            <Head title={seo.title}>
                <meta
                    head-key="description"
                    name="description"
                    content={seo.description}
                />
                <meta head-key="robots" name="robots" content={seo.robots} />
                <link
                    head-key="canonical"
                    rel="canonical"
                    href={seo.canonical}
                />
                {Object.entries(social).map(([key, value]) => (
                    <meta
                        key={key}
                        head-key={key}
                        property={key}
                        content={value}
                    />
                ))}
                {Object.entries(twitter).map(([key, value]) => (
                    <meta
                        key={key}
                        head-key={'twitter:' + key}
                        name={'twitter:' + key}
                        content={value}
                    />
                ))}
                {structuredData && (
                    <script head-key="structured" type="application/ld+json">
                        {structuredData}
                    </script>
                )}
            </Head>
            {renderHeader(
                <>
                    <a
                        href={headerHost ? '#home-preview-content' : '#main'}
                        className="skip"
                    >
                        {t('skip')}
                    </a>
                    <div className="topbar">
                        <div className="wrap top-inner">
                            <a
                                href={directions}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <MapPin size={15} aria-hidden="true" />
                                {t('location')}
                            </a>
                            <a href={'tel:' + business.phone} dir="ltr">
                                <Phone size={14} aria-hidden="true" />
                                {business.phoneText}
                            </a>
                        </div>
                    </div>
                    <header
                        className={scrolled ? 'header is-scrolled' : 'header'}
                    >
                        <div className="wrap header-inner">
                            <Link
                                href={home()}
                                onClick={closeMenu}
                                className="brand"
                                aria-label={business.name + ' · ' + t('home')}
                            >
                                <img
                                    src="/vishwa-logo.svg"
                                    alt="Vishwa IT Solutions"
                                    width="192"
                                    height="63"
                                    fetchPriority="high"
                                />
                            </Link>
                            <button
                                type="button"
                                className={
                                    menu ? 'menu-button is-open' : 'menu-button'
                                }
                                aria-controls="mobile-drawer"
                                aria-expanded={menu}
                                aria-label={t(menu ? 'closeMenu' : 'openMenu')}
                                onClick={() => setMenu(!menu)}
                            >
                                <span
                                    className="hamburger-bars"
                                    aria-hidden="true"
                                >
                                    <span />
                                    <span />
                                    <span />
                                </span>
                            </button>
                            <nav
                                id="site-nav"
                                className="nav desktop-nav"
                                aria-label={t('mainNav')}
                            >
                                {mainNav.map(([label, route]) => {
                                    const path = route.url();
                                    const active =
                                        pathname === path ||
                                        (path !== '/' &&
                                            pathname.startsWith(path + '/'));
                                    return (
                                        <Link
                                            href={route()}
                                            onClick={closeMenu}
                                            key={label}
                                            aria-current={
                                                active ? 'page' : undefined
                                            }
                                        >
                                            {t(label)}
                                        </Link>
                                    );
                                })}
                            </nav>
                            <Chat className="button header-chat">
                                {t('whatsapp')}
                            </Chat>
                        </div>
                    </header>

                    {/* Modern Right-Side Slide-In Mobile Drawer */}
                    <div
                        className={
                            menu
                                ? 'mobile-drawer-backdrop is-open'
                                : 'mobile-drawer-backdrop'
                        }
                        aria-hidden="true"
                        onClick={closeMenu}
                    />
                    <aside
                        id="mobile-drawer"
                        className={
                            menu ? 'mobile-drawer is-open' : 'mobile-drawer'
                        }
                        aria-label={t('mainNav')}
                        aria-hidden={!menu}
                    >
                        <div
                            className="mobile-drawer-glow"
                            aria-hidden="true"
                        />
                        <div className="mobile-drawer-head">
                            <div className="mobile-drawer-brand">
                                <strong>Vishwa IT Solutions</strong>
                                <span>{t('location')}</span>
                            </div>
                            <button
                                type="button"
                                className="mobile-drawer-close"
                                aria-label={t('closeMenu')}
                                onClick={closeMenu}
                                tabIndex={menu ? 0 : -1}
                            >
                                <X size={20} aria-hidden="true" />
                            </button>
                        </div>
                        <nav
                            className="mobile-drawer-links"
                            aria-label={t('mainNav')}
                        >
                            {mainNav.map(([label, route, Icon], index) => {
                                const path = route.url();
                                const active =
                                    pathname === path ||
                                    (path !== '/' &&
                                        pathname.startsWith(path + '/'));
                                return (
                                    <Link
                                        href={route()}
                                        onClick={closeMenu}
                                        key={label}
                                        aria-current={
                                            active ? 'page' : undefined
                                        }
                                        tabIndex={menu ? 0 : -1}
                                        style={{ ['--nav-i' as string]: index }}
                                    >
                                        <span
                                            className="drawer-link-icon"
                                            aria-hidden="true"
                                        >
                                            <Icon size={18} />
                                        </span>
                                        <span className="drawer-link-label">
                                            {t(label)}
                                        </span>
                                        <ChevronRight
                                            size={16}
                                            className="drawer-link-arrow"
                                            aria-hidden="true"
                                        />
                                    </Link>
                                );
                            })}
                        </nav>
                        <div className="mobile-drawer-footer">
                            <Chat className="button primary drawer-wa">
                                {t('whatsapp')}
                            </Chat>
                            <a
                                href={'tel:' + business.phone}
                                className="button secondary drawer-call"
                                dir="ltr"
                                tabIndex={menu ? 0 : -1}
                            >
                                <Phone size={16} aria-hidden="true" />
                                {business.phoneText}
                            </a>
                            <a
                                href={directions}
                                target="_blank"
                                rel="noreferrer"
                                className="drawer-directions"
                                tabIndex={menu ? 0 : -1}
                            >
                                <MapPin size={14} aria-hidden="true" />
                                {t('directions')}
                            </a>
                        </div>
                    </aside>
                </>,
            )}
            <main id="main" tabIndex={-1}>
                {children}
            </main>
            <footer className="site-footer">
                <div className="wrap footer-inner">
                    <span className="footer-copy">© Vishwa IT Solutions</span>
                    <nav className="footer-nav" aria-label="Footer">
                        <Link href={about()}>{t('about')}</Link>
                        <Link href={contact()}>{t('contact')}</Link>
                        <Link href={terms()}>{t('terms')}</Link>
                    </nav>
                    <div className="footer-lang">
                        <LanguageSwitcher />
                    </div>
                </div>
            </footer>
            <a
                className="float-chat"
                href={whatsapp()}
                target="_blank"
                rel="noreferrer"
                aria-label={t('whatsapp')}
            >
                <svg
                    viewBox="0 0 64 64"
                    width="56"
                    height="56"
                    aria-hidden="true"
                    className="float-wa-svg"
                >
                    <path
                        fill="#25D366"
                        d="M32 4C16.54 4 4 16.54 4 32c0 5.36 1.51 10.37 4.13 14.63L4.4 60l13.78-3.61A27.86 27.86 0 0 0 32 60c15.46 0 28-12.54 28-28S47.46 4 32 4Z"
                    />
                    <path
                        fill="#FFFFFF"
                        d="M44.78 38.67c-.7-.35-4.14-2.04-4.78-2.27-.64-.23-1.11-.35-1.57.35-.47.7-1.81 2.27-2.22 2.74-.41.47-.82.53-1.52.18-.7-.35-2.96-1.09-5.63-3.48-2.08-1.86-3.49-4.15-3.9-4.85-.41-.7-.04-1.08.31-1.43.32-.31.7-.82 1.05-1.22.35-.41.47-.7.7-1.17.23-.47.12-.87-.06-1.22-.18-.35-1.57-3.79-2.16-5.19-.57-1.36-1.15-1.18-1.57-1.2-.41-.02-.87-.03-1.34-.03-.47 0-1.22.18-1.87.87-.64.7-2.45 2.39-2.45 5.83s2.51 6.76 2.86 7.23c.35.47 4.94 7.55 11.97 10.58 1.67.72 2.98 1.15 4 1.48 1.68.53 3.21.46 4.42.28 1.35-.2 4.14-1.69 4.72-3.33.58-1.63.58-3.03.41-3.33-.18-.29-.64-.47-1.34-.82Z"
                    />
                </svg>
            </a>
        </div>
    );
}
