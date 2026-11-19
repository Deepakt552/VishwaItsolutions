import { Link } from '@inertiajs/react';
import {
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Cpu,
    HardDrive,
    Laptop,
    MemoryStick,
    Monitor,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { isSiteTextKey, useSiteText } from '@/lib/site-text';
import { article, product } from '@/routes/storefront';
import type { Article, PaginationLink, Product } from '@/types/storefront';
import { dateLabel, storageLabel } from '@/types/storefront';
import { money, whatsapp } from './business';
import Reveal from './Reveal';
import WhatsAppIcon from './WhatsAppIcon';

export function Chat({
    children,
    message,
    className = 'button primary',
    icon = 'white',
}: {
    children: ReactNode;
    message?: string;
    className?: string;
    icon?: string;
}) {
    return (
        <a
            className={className + ' whatsapp-link'}
            href={whatsapp(message)}
            target="_blank"
            rel="noreferrer"
        >
            <WhatsAppIcon variant={icon} />
            {children}
        </a>
    );
}

export function ProductImage({
    item,
    className = 'product-photo',
    lazy = true,
}: {
    item: Product;
    className?: string;
    lazy?: boolean;
}) {
    const photo = item.photos[0];
    const Icon =
        item.category === 'Desktops' || item.category === 'Workstations'
            ? Monitor
            : Laptop;
    return photo ? (
        <img
            className={className}
            src={photo.url}
            alt={item.name}
            loading={lazy ? 'lazy' : 'eager'}
            decoding="async"
            width="640"
            height="426"
        />
    ) : (
        <div className={className + ' empty-photo'} aria-hidden="true">
            <Icon size={46} strokeWidth={1.5} />
        </div>
    );
}

export function ProductCards({ items }: { items: Product[] }) {
    const { t } = useSiteText();

    return (
        <div className="product-grid">
            {items.map((item, index) => {
                const specs = [
                    { icon: Cpu, text: item.processor },
                    {
                        icon: MemoryStick,
                        text: item.ram_gb && item.ram_gb + ' GB RAM',
                    },
                    {
                        icon: HardDrive,
                        text:
                            item.storage_gb &&
                            [storageLabel(item.storage_gb), item.storage_type]
                                .filter(Boolean)
                                .join(' '),
                    },
                ].filter((spec) => spec.text);
                return (
                    <Reveal
                        as="article"
                        className="product-card catalog-card device-card"
                        key={item.id}
                        delay={Math.min(index, 5) * 65}
                    >
                        <Link
                            className="card-photo-link"
                            href={product(item.slug)}
                            aria-label={t('details') + ' · ' + item.name}
                        >
                            <ProductImage item={item} />
                            <span className="card-condition">
                                {isSiteTextKey(item.condition)
                                    ? t(item.condition)
                                    : item.condition}
                            </span>
                        </Link>
                        <div className="product-copy">
                            <p className="product-meta">
                                {isSiteTextKey(item.category)
                                    ? t(item.category)
                                    : item.category}
                            </p>
                            <h3>
                                <Link href={product(item.slug)}>
                                    {item.name}
                                </Link>
                            </h3>
                            {specs.length > 0 && (
                                <ul
                                    className="card-specs"
                                    aria-label={t('specifications')}
                                >
                                    {specs.map(({ icon: Icon, text }) => (
                                        <li key={text}>
                                            <Icon
                                                size={15}
                                                aria-hidden="true"
                                            />
                                            {text}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <div className="catalog-card-bottom">
                                <strong>
                                    {item.price == null
                                        ? t('askPrice')
                                        : money.format(Number(item.price))}
                                </strong>
                                <Link
                                    className="button secondary"
                                    href={product(item.slug)}
                                >
                                    {t('details')}
                                </Link>
                            </div>
                        </div>
                    </Reveal>
                );
            })}
        </div>
    );
}

export function EmptyStock({
    filtered = false,
    topic,
}: {
    filtered?: boolean;
    topic?: string;
}) {
    const { t } = useSiteText();

    return (
        <div className="shop-empty">
            <span className="service-icon">
                <Laptop size={25} aria-hidden="true" />
            </span>
            <div>
                <h3>{t(filtered ? 'noMatching' : 'currentStock')}</h3>
                <p>{t(filtered ? 'noMatchingCopy' : 'currentStockCopy')}</p>
            </div>
            <Chat
                className="button secondary"
                icon="black"
                message={
                    'Hi Vishwa IT Solutions, I’m looking for a pre-owned computer.' +
                    (topic ? ' Model or specs: ' + topic : '')
                }
            >
                {t('enquire')}
            </Chat>
        </div>
    );
}

export function ArticleCards({
    posts,
    featured = false,
}: {
    posts: Article[];
    featured?: boolean;
}) {
    const { t } = useSiteText();

    return (
        <div className={featured ? 'featured-article-grid' : 'product-grid'}>
            {posts.map((post, index) => (
                <Reveal
                    as="article"
                    className={
                        'product-card catalog-card article-card' +
                        (featured ? ' article-card-featured' : '')
                    }
                    key={post.id}
                    delay={featured ? 0 : Math.min(index, 5) * 65}
                >
                    <Link
                        href={article(post.slug)}
                        className="card-photo-link"
                        aria-label={t('readArticle') + ' · ' + post.title}
                    >
                        {post.image ? (
                            <img
                                src={post.image}
                                alt={post.cover_alt || ''}
                                className="product-photo"
                                loading={featured ? 'eager' : 'lazy'}
                                decoding="async"
                                width="640"
                                height="426"
                            />
                        ) : (
                            <div className="product-photo article-fallback">
                                <BookOpen
                                    size={43}
                                    strokeWidth={1.5}
                                    aria-hidden="true"
                                />
                            </div>
                        )}
                    </Link>
                    <div className="product-copy">
                        {post.published_at && (
                            <time
                                className="product-meta"
                                dateTime={post.published_at}
                            >
                                {dateLabel(post.published_at)}
                            </time>
                        )}
                        <h3>
                            <Link href={article(post.slug)}>{post.title}</Link>
                        </h3>
                        <p>{post.excerpt}</p>
                        <Link className="text-link" href={article(post.slug)}>
                            {t('readArticle')}
                        </Link>
                    </div>
                </Reveal>
            ))}
        </div>
    );
}

export function Pagination({ links }: { links: PaginationLink[] }) {
    const { t } = useSiteText();
    if (links.length <= 3) return null;

    return (
        <nav className="v-pagination" aria-label={t('pagination')}>
            {links.map((link, index) => {
                const previous = index === 0;
                const next = index === links.length - 1;
                const label = previous
                    ? t('previousPage')
                    : next
                      ? t('nextPage')
                      : link.label;
                const content = previous ? (
                    <ChevronLeft size={18} />
                ) : next ? (
                    <ChevronRight size={18} />
                ) : (
                    link.label
                );
                return link.url ? (
                    <Link
                        key={index}
                        href={link.url}
                        aria-current={link.active ? 'page' : undefined}
                        aria-label={label}
                    >
                        {content}
                    </Link>
                ) : (
                    <span key={index} aria-label={label}>
                        {content}
                    </span>
                );
            })}
        </nav>
    );
}
