import { Head, Link, router } from '@inertiajs/react';
import { Check, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import type { PaginationLink } from '@/types/storefront';

export function PageHeading({
    title,
    text,
    actions,
    back,
}: {
    title: string;
    text?: string;
    actions?: ReactNode;
    back?: { url: string; label: string };
}) {
    return (
        <>
            <Head title={title} />
            {back && (
                <Link className="admin-back" href={back.url}>
                    <ChevronLeft size={17} /> {back.label}
                </Link>
            )}
            <div className="admin-heading">
                <div>
                    <h1>{title}</h1>
                    {text && <p>{text}</p>}
                </div>
                {actions && <div className="admin-actions">{actions}</div>}
            </div>
        </>
    );
}

export function Field({
    label,
    error,
    note,
    children,
}: {
    label: string;
    error?: string;
    note?: string;
    children: ReactNode;
}) {
    return (
        <label className="admin-field">
            <span>{label}</span>
            {children}
            {note && <small>{note}</small>}
            {error && (
                <span className="admin-error" role="alert">
                    {error}
                </span>
            )}
        </label>
    );
}

export function Panel({
    title,
    text,
    children,
    className = '',
}: {
    title: string;
    text?: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <section className={'admin-panel ' + className}>
            <div className="admin-panel-heading">
                <h2>{title}</h2>
                {text && <p>{text}</p>}
            </div>
            {children}
        </section>
    );
}

export function Status({ value }: { value: string }) {
    return (
        <span className={'admin-status is-' + value}>
            {value[0]?.toUpperCase()}
            {value.slice(1)}
        </span>
    );
}

export function Empty({
    icon: Icon,
    title,
    text,
    action,
}: {
    icon: LucideIcon;
    title: string;
    text: string;
    action?: ReactNode;
}) {
    return (
        <div className="admin-empty">
            <span className="admin-empty-icon">
                <Icon size={24} strokeWidth={1.7} />
            </span>
            <h3>{title}</h3>
            <p>{text}</p>
            {action}
        </div>
    );
}

export function DeleteButton({
    url,
    label,
    message,
}: {
    url: string;
    label: string;
    message: string;
}) {
    return (
        <button
            className="admin-btn admin-danger"
            type="button"
            onClick={() => {
                if (window.confirm(message)) router.delete(url);
            }}
        >
            <Trash2 size={16} />
            {label}
        </button>
    );
}

export function FilterBar({
    url,
    active,
    children,
}: {
    url: string;
    active: boolean;
    children: ReactNode;
}) {
    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const values = Object.fromEntries(
            Array.from(new FormData(event.currentTarget))
                .map(([key, value]) => [key, String(value).trim()])
                .filter(([, value]) => value),
        );
        router.get(url, values, { preserveScroll: true });
    }
    return (
        <form className="admin-filter" onSubmit={submit}>
            {children}
            <button type="submit" className="admin-btn admin-secondary">
                Filter
            </button>
            {active && (
                <Link href={url} className="admin-inline">
                    Clear filters
                </Link>
            )}
        </form>
    );
}

export function AdminPagination({ links }: { links: PaginationLink[] }) {
    if (links.length <= 3) return null;

    return (
        <nav className="admin-pagination" aria-label="Pagination">
            {links.map(({ url, label, active }, index) => {
                const previous = index === 0;
                const next = index === links.length - 1;
                const description = previous
                    ? 'Previous page'
                    : next
                      ? 'Next page'
                      : label;
                const content = previous ? (
                    <ChevronLeft size={17} />
                ) : next ? (
                    <ChevronRight size={17} />
                ) : (
                    label
                );
                return url ? (
                    <Link
                        key={index}
                        href={url}
                        aria-label={description}
                        aria-current={active ? 'page' : undefined}
                    >
                        {content}
                    </Link>
                ) : (
                    <span key={index} aria-label={description}>
                        {content}
                    </span>
                );
            })}
        </nav>
    );
}

export function CopyButton({ value }: { value: string }) {
    return (
        <button
            className="admin-btn admin-secondary"
            type="button"
            onClick={(event) => {
                const button = event.currentTarget;
                const status =
                    button.parentElement?.querySelector('[role="status"]');
                if (!status) return;

                navigator.clipboard.writeText(value).then(
                    () => {
                        status.textContent = 'Copied';
                    },
                    () => {
                        status.textContent = 'Select the token to copy it.';
                    },
                );
            }}
        >
            <Check size={16} />
            Copy token
        </button>
    );
}
