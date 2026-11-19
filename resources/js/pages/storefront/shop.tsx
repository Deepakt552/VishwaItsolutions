import { Link, router } from '@inertiajs/react';
import {
    Laptop,
    Monitor,
    Plug,
    Search,
    SlidersHorizontal,
    SquareStack,
} from 'lucide-react';
import type { FormEvent } from 'react';
import {
    EmptyStock,
    Pagination,
    ProductCards,
} from '@/components/storefront/catalog';
import PageHeader from '@/components/storefront/PageHeader';
import { isSiteTextKey, useSiteText } from '@/lib/site-text';
import { shop } from '@/routes/storefront';
import type { Product, ResourcePage } from '@/types/storefront';
import { storageLabel } from '@/types/storefront';

type Filters = {
    q?: string;
    category?: string;
    ram_gb?: string;
    storage_gb?: string;
    processor?: string;
    storage_type?: string;
};
const icons = {
    Laptops: Laptop,
    Desktops: Monitor,
    Workstations: Monitor,
    Accessories: Plug,
};

export default function Shop({
    products,
    filters,
    categories,
    ramOptions,
    storageOptions,
    storageTypes,
}: {
    products: ResourcePage<Product>;
    filters: Filters;
    categories: string[];
    ramOptions: number[];
    storageOptions: number[];
    storageTypes: string[];
}) {
    const { language, t } = useSiteText();

    function apply(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const values = Object.fromEntries(
            Array.from(new FormData(event.currentTarget))
                .map(([name, value]) => [name, String(value).trim()])
                .filter(([, value]) => value),
        );
        router.get(shop.url(), values, { preserveScroll: true });
    }

    const filtered = Object.values(filters).some(Boolean);
    const categoryLabel = (value: string) =>
        isSiteTextKey(value) ? t(value) : value;
    const count = new Intl.NumberFormat(language + '-IN').format(
        products.meta.total,
    );

    return (
        <>
            <PageHeader
                breadcrumbLabel={t('shop')}
                eyebrow={t('usedShop')}
                title={t('shopTitle')}
                description={t('shopIntro')}
                aside={
                    <div className="page-header-media-frame">
                        <img
                            className="page-banner-image"
                            src="/service-photos/it-upgrades.webp"
                            alt=""
                            width="840"
                            height="560"
                            fetchPriority="high"
                        />
                    </div>
                }
            />
            <section className="section shop shop-results">
                <nav
                    className="wrap shop-category-rail"
                    aria-label={t('category')}
                >
                    {['', ...categories].map((category) => {
                        const Icon =
                            icons[category as keyof typeof icons] ||
                            SquareStack;
                        return (
                            <Link
                                key={category}
                                href={shop({
                                    query: {
                                        ...filters,
                                        category: category || null,
                                    },
                                })}
                                aria-current={
                                    (filters.category || '') === category
                                        ? 'page'
                                        : undefined
                                }
                                preserveScroll
                            >
                                <Icon size={19} aria-hidden="true" />
                                {category
                                    ? categoryLabel(category)
                                    : t('allDevices')}
                            </Link>
                        );
                    })}
                </nav>
                <div className="wrap shop-layout">
                    <aside className="shop-sidebar">
                        <h2 className="filter-heading">
                            <SlidersHorizontal size={18} aria-hidden="true" />{' '}
                            {t('filter')}
                        </h2>
                        <form className="site-fields" onSubmit={apply}>
                            <label>
                                {t('search')}
                                <div className="search">
                                    <Search size={17} aria-hidden="true" />
                                    <input
                                        name="q"
                                        placeholder={t('searchPlaceholder')}
                                        maxLength={120}
                                        defaultValue={filters.q}
                                    />
                                </div>
                            </label>
                            <label>
                                {t('category')}
                                <select
                                    name="category"
                                    defaultValue={filters.category || ''}
                                >
                                    <option value="">
                                        {t('allCategories')}
                                    </option>
                                    {categories.map((value) => (
                                        <option key={value} value={value}>
                                            {categoryLabel(value)}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                {t('processor')}
                                <input
                                    name="processor"
                                    placeholder="Intel Core i5"
                                    maxLength={100}
                                    defaultValue={filters.processor}
                                />
                            </label>
                            <label>
                                {t('memory')}
                                <select
                                    name="ram_gb"
                                    defaultValue={filters.ram_gb || ''}
                                >
                                    <option value="">{t('anyMemory')}</option>
                                    {ramOptions.map((value) => (
                                        <option value={value} key={value}>
                                            {value} GB
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                {t('storageCapacity')}
                                <select
                                    name="storage_gb"
                                    defaultValue={filters.storage_gb || ''}
                                >
                                    <option value="">{t('anyStorage')}</option>
                                    {storageOptions.map((value) => (
                                        <option value={value} key={value}>
                                            {storageLabel(value)}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                {t('storageType')}
                                <select
                                    name="storage_type"
                                    defaultValue={filters.storage_type || ''}
                                >
                                    <option value="">{t('anyStorage')}</option>
                                    {storageTypes.map((value) => (
                                        <option key={value}>{value}</option>
                                    ))}
                                </select>
                            </label>
                            <button className="button primary" type="submit">
                                {t('applyFilters')}
                            </button>
                            {filtered && (
                                <Link
                                    className="button secondary"
                                    href={shop()}
                                    preserveScroll
                                >
                                    {t('clearFilters')}
                                </Link>
                            )}
                        </form>
                    </aside>
                    <div className="results-column">
                        <div className="results-title">
                            <h2>{t('availableDevices')}</h2>
                            <span aria-live="polite">
                                {t(
                                    products.meta.total === 1
                                        ? 'deviceCountOne'
                                        : 'deviceCount',
                                    { count },
                                )}
                            </span>
                        </div>
                        {products.data.length ? (
                            <ProductCards items={products.data} />
                        ) : (
                            <EmptyStock
                                filtered={filtered}
                                topic={filters.q || filters.processor}
                            />
                        )}
                        <Pagination links={products.meta.links} />
                    </div>
                </div>
            </section>
        </>
    );
}
