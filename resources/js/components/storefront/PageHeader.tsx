import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { useSiteText } from '@/lib/site-text';
import { home } from '@/routes';
import MotionPattern, { movePattern, resetPattern } from './motion-pattern';

export type PageHeaderProps = {
    eyebrow?: string;
    eyebrowHref?: string;
    title: string;
    description?: string;
    breadcrumbLabel?: string;
    aside?: ReactNode;
    footer?: ReactNode;
    narrow?: boolean;
    className?: string;
};

export default function PageHeader({
    eyebrow,
    eyebrowHref,
    title,
    description,
    breadcrumbLabel,
    aside,
    footer,
    narrow = false,
    className = '',
}: PageHeaderProps) {
    const { t } = useSiteText();
    const hasAside = Boolean(aside);

    return (
        <header
            className={
                'vishwa-page-header' +
                (hasAside ? ' has-aside' : '') +
                (narrow ? ' is-narrow' : '') +
                (className ? ' ' + className : '')
            }
            onPointerMove={movePattern}
            onPointerLeave={resetPattern}
        >
            <div className="page-header-ambient" aria-hidden="true" />
            <div className="page-header-grid-bg" aria-hidden="true" />
            <MotionPattern />
            <div
                className={
                    'wrap page-header-inner' + (narrow ? ' article-wrap' : '')
                }
            >
                <div className="page-header-copy">
                    {breadcrumbLabel && (
                        <nav
                            className="page-header-crumb"
                            aria-label={t('breadcrumb')}
                        >
                            <Link href={home()}>{t('home')}</Link>
                            <ChevronRight size={14} aria-hidden="true" />
                            <span aria-current="page">{breadcrumbLabel}</span>
                        </nav>
                    )}
                    {eyebrow &&
                        (eyebrowHref ? (
                            <Link
                                href={eyebrowHref}
                                className="page-header-pill"
                            >
                                <span
                                    className="pill-dot"
                                    aria-hidden="true"
                                />
                                {eyebrow}
                            </Link>
                        ) : (
                            <p className="page-header-pill">
                                <span
                                    className="pill-dot"
                                    aria-hidden="true"
                                />
                                {eyebrow}
                            </p>
                        ))}
                    <h1>{title}</h1>
                    {description && (
                        <p className="page-header-lead">{description}</p>
                    )}
                    {footer && <div className="page-header-footer">{footer}</div>}
                </div>
                {hasAside && <div className="page-header-aside">{aside}</div>}
            </div>
        </header>
    );
}

