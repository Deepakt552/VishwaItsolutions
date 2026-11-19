import { Head, Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    ChevronRight,
    Cable,
    ExternalLink,
    LayoutDashboard,
    LogOut,
    Mail,
    Menu,
    Package,
    Settings,
    Sparkles,
    Star,
    X,
} from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import '../../css/admin.css';
import { dashboard, home, logout } from '@/routes';
import { index as automation } from '@/routes/admin/automation';
import { index as inbox } from '@/routes/admin/inbox';
import { index as integrations } from '@/routes/admin/integrations';
import { index as posts } from '@/routes/admin/posts';
import { index as products } from '@/routes/admin/products';
import { index as reviews } from '@/routes/admin/reviews';
import { edit as profile } from '@/routes/profile';

const navigation = [
    { label: 'Overview', route: dashboard, icon: LayoutDashboard },
    { label: 'Products', route: products, icon: Package },
    { label: 'Blog posts', route: posts, icon: BookOpen },
    { label: 'Inbox', route: inbox, icon: Mail },
    { label: 'AI automation', route: automation, icon: Sparkles },
    { label: 'API integration', route: integrations, icon: Cable },
    { label: 'Review integrations', route: reviews, icon: Star },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
    const { props, url } = usePage<{ notice?: string }>();
    const [menu, setMenu] = useState(false);
    const pathname = url.split('?')[0];
    const section = navigation.find(
        ({ route }) =>
            pathname === route.url() || pathname.startsWith(route.url() + '/'),
    );
    const initials =
        props.auth.user?.name
            .split(/\s+/)
            .slice(0, 2)
            .map((word) => word[0]?.toUpperCase())
            .join('') || 'V';

    return (
        <div className="vishwa-admin">
            <Head>
                <meta
                    head-key="robots"
                    name="robots"
                    content="noindex,nofollow"
                />
            </Head>
            {menu && (
                <button
                    type="button"
                    className="admin-backdrop"
                    aria-label="Close sidebar"
                    onClick={() => setMenu(false)}
                />
            )}
            <aside
                className={'admin-sidebar' + (menu ? ' is-open' : '')}
                id="admin-sidebar"
            >
                <div className="admin-brand">
                    <Link href={dashboard()} onClick={() => setMenu(false)}>
                        <img
                            src="/vishwa-logo.svg"
                            alt="Vishwa IT Solutions"
                            width="164"
                            height="50"
                        />
                    </Link>
                    <button
                        type="button"
                        aria-label="Close menu"
                        className="admin-icon admin-mobile"
                        onClick={() => setMenu(false)}
                    >
                        <X size={21} />
                    </button>
                </div>
                <div className="admin-sidebar-group">
                    <p>Workspace</p>
                    <nav aria-label="Workspace">
                        {navigation.map(({ label, route, icon: Icon }) => (
                            <Link
                                key={label}
                                href={route()}
                                onClick={() => setMenu(false)}
                                aria-current={
                                    section?.label === label
                                        ? 'page'
                                        : undefined
                                }
                            >
                                <Icon size={19} strokeWidth={1.75} />
                                {label}
                                {section?.label === label && (
                                    <ChevronRight
                                        className="admin-nav-indicator"
                                        size={16}
                                    />
                                )}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="admin-sidebar-group admin-sidebar-bottom">
                    <nav aria-label="Account">
                        <Link href={profile()}>
                            <Settings size={19} strokeWidth={1.75} />
                            Account settings
                        </Link>
                        <Link href={logout()} as="button">
                            <LogOut size={19} strokeWidth={1.75} />
                            Sign out
                        </Link>
                    </nav>
                </div>
            </aside>
            <div className="admin-main">
                <header className="admin-top">
                    <div className="admin-top-context">
                        <button
                            type="button"
                            className="admin-icon admin-mobile"
                            aria-label="Open menu"
                            aria-controls="admin-sidebar"
                            aria-expanded={menu}
                            onClick={() => setMenu(true)}
                        >
                            <Menu size={22} />
                        </button>
                        <span>Store admin</span>
                        <ChevronRight size={15} />
                        <strong>{section?.label || 'Workspace'}</strong>
                    </div>
                    <div className="admin-top-actions">
                        <Link href={home()} className="admin-store-link">
                            View website <ExternalLink size={15} />
                        </Link>
                        <Link
                            href={profile()}
                            className="admin-avatar"
                            aria-label="Account settings"
                        >
                            {initials}
                        </Link>
                    </div>
                </header>
                <main className="admin-content">
                    {props.notice && (
                        <p className="admin-notice" role="status">
                            {props.notice}
                        </p>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}
