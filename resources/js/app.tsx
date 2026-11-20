import { createInertiaApp, router } from '@inertiajs/react';
import type { ResolvedComponent } from '@inertiajs/react';
import { initializeTheme } from '@/hooks/use-appearance';

const appName = 'Vishwa IT Solutions';
const pages = import.meta.glob<{ default: ResolvedComponent }>(
    './pages/**/*.tsx',
);
const layouts = new Map<string, ResolvedComponent['layout']>();
if (typeof document !== 'undefined') {
    const homePreview = document.getElementById('home-preview');
    if (homePreview) {
        router.on('navigate', ({ detail: { page } }) => {
            if (page.component !== 'storefront/home') {
                homePreview.remove();
            }
        });
    }
}

async function loadLayout(name: string): Promise<ResolvedComponent['layout']> {
    if (name === 'welcome') {
        return;
    }

    if (name.startsWith('storefront/')) {
        return (await import('@/layouts/storefront-layout')).default;
    }

    if (name === 'dashboard' || name.startsWith('admin/')) {
        return (await import('@/layouts/admin-layout')).default;
    }

    if (name.startsWith('auth/')) {
        return (await import('@/layouts/auth-layout')).default;
    }

    if (name.startsWith('settings/')) {
        const [app, settings] = await Promise.all([
            import('@/layouts/app-layout'),
            import('@/layouts/settings/layout'),
        ]);

        return [app.default, settings.default];
    }

    return (await import('@/layouts/app-layout')).default;
}

void createInertiaApp({
    title: (title) => (title ? `${title} | ${appName}` : appName),
    async resolve(name) {
        const [page, layout] = await Promise.all([
            pages[`./pages/${name}.tsx`](),
            loadLayout(name),
        ]);

        layouts.set(name, layout);

        return page.default;
    },
    layout: (name) => layouts.get(name),
    strictMode: true,
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
