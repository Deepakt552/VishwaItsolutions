export type Photo = { name: string; url: string };

export type GalleryPhoto = {
    id: number;
    url: string;
    alt_text: string;
    caption: string | null;
    width: number;
    height: number;
};

export type Product = {
    id: number;
    slug: string;
    name: string;
    category: string;
    condition: string;
    status: 'draft' | 'available' | 'sold';
    price: string | null;
    processor: string | null;
    ram_gb: number | null;
    storage_gb: number | null;
    storage_type: string | null;
    age_months: number | null;
    photos: Photo[];
    featured: boolean;
    graphics?: string | null;
    operating_system?: string | null;
    description?: string | null;
    features?: string | null;
};

export type Article = {
    id: number;
    slug: string;
    title: string;
    excerpt: string;
    image: string | null;
    cover_alt: string | null;
    published_at: string | null;
};

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type PageResult<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: PaginationLink[];
};

export type ResourcePage<T> = {
    data: T[];
    meta: Omit<PageResult<T>, 'data'>;
};

export type RepairServiceLink = {
    name: string;
    url: string;
};

export type Seo = {
    title: string;
    description: string;
    canonical: string;
    image: string;
    imageAlt: string;
    type: string;
    robots: string;
};

export function storageLabel(amount: number): string {
    if (amount >= 1000 && amount % 1000 === 0) return amount / 1000 + ' TB';
    if (amount >= 1024 && amount % 1024 === 0) return amount / 1024 + ' TB';
    return amount + ' GB';
}

export function ageLabel(months: number, language = 'en'): string {
    const format = (value: number, unit: 'year' | 'month') =>
        new Intl.NumberFormat(language + '-IN', {
            style: 'unit',
            unit,
            unitDisplay: 'long',
        }).format(value);
    if (months === 0) return '< ' + format(1, 'month');
    const years = Math.floor(months / 12);
    const remainder = months % 12;
    return [
        years ? format(years, 'year') : '',
        remainder ? format(remainder, 'month') : '',
    ]
        .filter(Boolean)
        .join(' ');
}

export function dateLabel(value: string): string {
    const date = value.length === 10 ? value + 'T00:00:00Z' : value;
    return new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata',
    }).format(new Date(date));
}
