import { Head, Link, usePage } from '@inertiajs/react';
import { MapPin, Menu, Phone, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
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
import { dashboard, home, login } from '@/routes';
import { blog, contact, services, shop } from '@/routes/storefront';
import type { Seo } from '@/types/storefront';

const mainNav = [
    ['home', home],
    ['services', services],
    ['shop', shop],
    ['blog', blog],
    ['contact', contact],
] as const;

export default function StorefrontLayout({
    children,
}: {
    children: ReactNode;
}) {
    const { props, url } = usePage<{ seo: Seo }>();
    const { seo } = props;
    const { language, t } = useSiteText();
    const [menu, setMenu] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const closeMenu = () => setMenu(false);
    const pathname = url.split(/[?#]/)[0];

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 18);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);
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
        document.documentElement.lang = language;
        return () => {
            document.documentElement.lang = 'en';
        };
    }, [language]);

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
                {seo.structured && (
                    <script head-key="structured" type="application/ld+json">
                        {seo.structured}
                    </script>
                )}
            </Head>
            <a href="#main" className="skip">
                {t('skip')}
            </a>
            <div className="topbar">
                <div className="wrap top-inner">
                    <a href={directions} target="_blank" rel="noreferrer">
                        <MapPin size={15} aria-hidden="true" />
                        {t('location')}
                    </a>
                    <a href={'tel:' + business.phone} dir="ltr">
                        <Phone size={14} aria-hidden="true" />
                        {business.phoneText}
                    </a>
                </div>
            </div>
            <header className={scrolled ? 'header is-scrolled' : 'header'}>
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
                        />
                    </Link>
                    <button
                        type="button"
                        className="menu-button"
                        aria-controls="site-nav"
                        aria-expanded={menu}
                        aria-label={t(menu ? 'closeMenu' : 'openMenu')}
                        onClick={() => setMenu(!menu)}
                    >
                        {menu ? <X /> : <Menu />}
                    </button>
                    <nav
                        id="site-nav"
                        className={menu ? 'nav open' : 'nav'}
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
                                    aria-current={active ? 'page' : undefined}
                                >
                                    {t(label)}
                                </Link>
                            );
                        })}
                    </nav>
                    <Chat className="button header-chat">{t('whatsapp')}</Chat>
                </div>
            </header>
            <main id="main" tabIndex={-1}>
                {children}
            </main>
            <footer>
                <div className="wrap footer-inner">
                    <span>© Vishwa IT Solutions</span>
                    <div className="footer-links">
                        <Link
                            href={
                                props.auth.user?.is_admin
                                    ? dashboard()
                                    : login()
                            }
                        >
                            {t(
                                props.auth.user?.is_admin
                                    ? 'dashboard'
                                    : 'admin',
                            )}
                        </Link>
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
