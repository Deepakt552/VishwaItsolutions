import { Link, router } from '@inertiajs/react';
import {
    BookOpen,
    Cable,
    ChevronLeft,
    ChevronRight,
    CircleCheck,
    Eye,
    Globe,
    Mail,
    Package,
    PackageCheck,
    PackageOpen,
    Plus,
    Search,
    Sparkles,
    Users,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { Empty, PageHeading, Status } from '@/components/admin/workspace';
import { money } from '@/components/storefront/business';
import { dashboard } from '@/routes';
import { index as automation } from '@/routes/admin/automation';
import { index as inbox } from '@/routes/admin/inbox';
import { index as integrations } from '@/routes/admin/integrations';
import {
    create as newPost,
    edit as editPost,
    index as posts,
} from '@/routes/admin/posts';
import {
    create as newProduct,
    edit as editProduct,
    index as products,
} from '@/routes/admin/products';
import type { PageResult, Product } from '@/types/storefront';

type Stats = {
    uniqueVisitors: number;
    todayVisitors: number;
    totalPageViews: number;
    available: number;
    sold: number;
    drafts: number;
    published: number;
    unread: number;
};

type VisitorRecord = {
    id: number;
    ip_address: string;
    visits_count: number;
    first_path: string;
    last_path: string;
    user_agent: string | null;
    referrer: string | null;
    first_visited_at: string | null;
    last_visited_at: string | null;
};

const dateTimeFormat = new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
});

function formatTimestamp(value: string | null): string {
    if (!value) {
        return '—';
    }
    return dateTimeFormat.format(new Date(value));
}

function summarizeDevice(ua: string | null): string {
    if (!ua) {
        return 'Unknown';
    }
    const browser = /Edg\//i.test(ua)
        ? 'Edge'
        : /Chrome\//i.test(ua) && !/Edg\//i.test(ua)
          ? 'Chrome'
          : /Firefox\//i.test(ua)
            ? 'Firefox'
            : /Safari\//i.test(ua) && !/Chrome\//i.test(ua)
              ? 'Safari'
              : /bot|crawler|spider/i.test(ua)
                ? 'Bot'
                : 'Browser';

    const os = /Android/i.test(ua)
        ? 'Android'
        : /iPhone|iPad|iOS/i.test(ua)
          ? 'iOS'
          : /Windows/i.test(ua)
            ? 'Windows'
            : /Mac OS X/i.test(ua)
              ? 'macOS'
              : /Linux/i.test(ua)
                ? 'Linux'
                : '';

    return os ? `${browser} · ${os}` : browser;
}

export default function Dashboard({
    stats,
    visitors,
    visitorSearch,
    products: recentProducts,
    posts: recentPosts,
    apiEnabled,
}: {
    stats: Stats;
    visitors: PageResult<VisitorRecord>;
    visitorSearch: string;
    products: Product[];
    posts: { id: number; title: string; published_at: string | null }[];
    apiEnabled: boolean;
}) {
    function searchVisitors(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const q = String(
            new FormData(event.currentTarget).get('visitor_q') ?? '',
        ).trim();
        router.get(
            dashboard.url(),
            q ? { visitor_q: q } : {},
            { preserveScroll: true },
        );
    }

    const cards = [
        {
            title: 'Unique visitor IPs',
            icon: Globe,
            value: stats.uniqueVisitors,
            href: '#visitors',
            isAnchor: true,
        },
        {
            title: 'Unique IPs today',
            icon: Users,
            value: stats.todayVisitors,
            href: '#visitors',
            isAnchor: true,
        },
        {
            title: 'Total page views',
            icon: Eye,
            value: stats.totalPageViews,
            href: '#visitors',
            isAnchor: true,
        },
        {
            title: 'Available products',
            icon: PackageCheck,
            value: stats.available,
            href: products({ query: { status: 'available' } }),
            isAnchor: false,
        },
        {
            title: 'Sold products',
            icon: CircleCheck,
            value: stats.sold,
            href: products({ query: { status: 'sold' } }),
            isAnchor: false,
        },
        {
            title: 'Product drafts',
            icon: PackageOpen,
            value: stats.drafts,
            href: products({ query: { status: 'draft' } }),
            isAnchor: false,
        },
        {
            title: 'Published posts',
            icon: BookOpen,
            value: stats.published,
            href: posts({ query: { status: 'published' } }),
            isAnchor: false,
        },
        {
            title: 'Unread enquiries',
            icon: Mail,
            value: stats.unread,
            href: inbox(),
            isAnchor: false,
        },
    ];

    return (
        <>
            <PageHeading
                title="Overview"
                text="Track website visitors, manage inventory, publish articles and respond to enquiries."
                actions={
                    <Link
                        className="admin-btn admin-primary"
                        href={newProduct()}
                    >
                        <Plus size={18} />
                        Add product
                    </Link>
                }
            />
            <div className="admin-stats">
                {cards.map(({ title, icon: Icon, value, href, isAnchor }) =>
                    isAnchor ? (
                        <a
                            className="admin-stat"
                            key={title}
                            href={href as string}
                        >
                            <span className="admin-stat-icon">
                                <Icon size={20} strokeWidth={1.75} />
                            </span>
                            <span className="admin-stat-title">{title}</span>
                            <strong>{value}</strong>
                        </a>
                    ) : (
                        <Link
                            className="admin-stat"
                            key={title}
                            href={href as ReturnType<typeof inbox>}
                        >
                            <span className="admin-stat-icon">
                                <Icon size={20} strokeWidth={1.75} />
                            </span>
                            <span className="admin-stat-title">{title}</span>
                            <strong>{value}</strong>
                        </Link>
                    ),
                )}
            </div>

            <section
                id="visitors"
                className="admin-panel admin-table-panel"
                style={{ marginBottom: '1.5rem' }}
            >
                <div className="admin-panel-heading admin-split">
                    <div>
                        <h2>Unique IP Visitors ({visitors.total})</h2>
                        <p>
                            Full record of unique IP addresses that visited the
                            website, with total visits and timestamps.
                        </p>
                    </div>
                    <form
                        onSubmit={searchVisitors}
                        style={{
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                        }}
                    >
                        <div style={{ position: 'relative' }}>
                            <Search
                                size={15}
                                aria-hidden="true"
                                style={{
                                    position: 'absolute',
                                    left: '0.65rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    opacity: 0.6,
                                }}
                            />
                            <input
                                type="search"
                                name="visitor_q"
                                defaultValue={visitorSearch}
                                placeholder="Search IP or page…"
                                maxLength={100}
                                style={{
                                    padding: '0.45rem 0.7rem 0.45rem 2rem',
                                    borderRadius: '8px',
                                    border: '1px solid #dccad1',
                                    minWidth: '200px',
                                    fontSize: '0.88rem',
                                }}
                            />
                        </div>
                        <button type="submit" className="admin-btn">
                            Filter
                        </button>
                        {visitorSearch && (
                            <Link
                                href={dashboard()}
                                className="admin-btn"
                                preserveScroll
                            >
                                Clear
                            </Link>
                        )}
                    </form>
                </div>

                {visitors.data.length > 0 ? (
                    <>
                        <div className="admin-table-scroll">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>IP Address</th>
                                        <th>Visits</th>
                                        <th>Last / Landing Page</th>
                                        <th>Device / Browser</th>
                                        <th>First Visited</th>
                                        <th>Last Visited</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visitors.data.map((visitor) => (
                                        <tr key={visitor.id}>
                                            <td>
                                                <code
                                                    style={{
                                                        fontWeight: 700,
                                                        fontSize: '0.9rem',
                                                    }}
                                                >
                                                    {visitor.ip_address}
                                                </code>
                                            </td>
                                            <td>
                                                <strong>
                                                    {visitor.visits_count}
                                                </strong>
                                            </td>
                                            <td>
                                                <div className="admin-record">
                                                    <span>
                                                        {visitor.last_path}
                                                    </span>
                                                    {visitor.first_path !==
                                                        visitor.last_path && (
                                                        <small>
                                                            First:{' '}
                                                            {visitor.first_path}
                                                        </small>
                                                    )}
                                                </div>
                                            </td>
                                            <td
                                                title={
                                                    visitor.user_agent ??
                                                    undefined
                                                }
                                            >
                                                {summarizeDevice(
                                                    visitor.user_agent,
                                                )}
                                            </td>
                                            <td>
                                                {formatTimestamp(
                                                    visitor.first_visited_at,
                                                )}
                                            </td>
                                            <td>
                                                {formatTimestamp(
                                                    visitor.last_visited_at,
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {visitors.last_page > 1 && (
                            <nav
                                aria-label="Visitor records pagination"
                                style={{
                                    display: 'flex',
                                    gap: '0.4rem',
                                    justifyContent: 'flex-end',
                                    padding: '1rem 1.25rem',
                                    borderTop: '1px solid #efe4e8',
                                    flexWrap: 'wrap',
                                }}
                            >
                                {visitors.links.map((link, index) => {
                                    const isPrev = index === 0;
                                    const isNext =
                                        index === visitors.links.length - 1;
                                    const label = isPrev ? (
                                        <ChevronLeft size={16} />
                                    ) : isNext ? (
                                        <ChevronRight size={16} />
                                    ) : (
                                        link.label
                                    );
                                    return link.url ? (
                                        <Link
                                            key={index}
                                            href={link.url}
                                            preserveScroll
                                            className={
                                                link.active
                                                    ? 'admin-btn admin-primary'
                                                    : 'admin-btn'
                                            }
                                            style={{ minWidth: '38px' }}
                                        >
                                            {label}
                                        </Link>
                                    ) : (
                                        <span
                                            key={index}
                                            className="admin-btn"
                                            style={{
                                                opacity: 0.45,
                                                pointerEvents: 'none',
                                                minWidth: '38px',
                                            }}
                                        >
                                            {label}
                                        </span>
                                    );
                                })}
                            </nav>
                        )}
                    </>
                ) : (
                    <Empty
                        icon={Globe}
                        title={
                            visitorSearch
                                ? 'No matching visitor IPs'
                                : 'No website visits recorded yet'
                        }
                        text={
                            visitorSearch
                                ? 'Try a different IP address or page path.'
                                : 'Visits to your public storefront pages will appear here automatically.'
                        }
                    />
                )}
            </section>

            <div className="admin-overview-grid">
                <section className="admin-panel admin-table-panel">
                    <div className="admin-panel-heading admin-split">
                        <div>
                            <h2>Recent inventory</h2>
                            <p>Recently added or updated items</p>
                        </div>
                        <Link href={products()} className="admin-inline">
                            All products <ChevronRight size={16} />
                        </Link>
                    </div>
                    {recentProducts.length ? (
                        <div className="admin-table-scroll">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Status</th>
                                        <th>Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentProducts.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                <Link
                                                    className="admin-record"
                                                    href={editProduct(item.id)}
                                                >
                                                    {item.name}
                                                    <small>
                                                        {item.category} ·{' '}
                                                        {item.condition}
                                                    </small>
                                                </Link>
                                            </td>
                                            <td>
                                                <Status value={item.status} />
                                            </td>
                                            <td>
                                                {item.price == null
                                                    ? 'On enquiry'
                                                    : money.format(
                                                          Number(item.price),
                                                      )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <Empty
                            icon={Package}
                            title="No inventory yet"
                            text="Add your first listing to start building the storefront."
                            action={
                                <Link
                                    className="admin-btn admin-secondary"
                                    href={newProduct()}
                                >
                                    Add product
                                </Link>
                            }
                        />
                    )}
                </section>
                <section className="admin-panel admin-quick">
                    <div className="admin-panel-heading">
                        <h2>Quick actions</h2>
                    </div>
                    <Link href={newPost()}>
                        <span className="admin-stat-icon">
                            <BookOpen size={19} />
                        </span>
                        <span>
                            <strong>Write an article</strong>
                            <small>Open the manual editor</small>
                        </span>
                        <ChevronRight size={17} />
                    </Link>
                    <Link href={automation()}>
                        <span className="admin-stat-icon">
                            <Sparkles size={19} />
                        </span>
                        <span>
                            <strong>Generate a draft</strong>
                            <small>Start with a topic or product brief</small>
                        </span>
                        <ChevronRight size={17} />
                    </Link>
                    <Link href={integrations()}>
                        <span className="admin-stat-icon">
                            <Cable size={19} />
                        </span>
                        <span>
                            <strong>Product API</strong>
                            <small>{apiEnabled ? 'Enabled' : 'Disabled'}</small>
                        </span>
                        <ChevronRight size={17} />
                    </Link>
                </section>
            </div>
            {recentPosts.length > 0 && (
                <section className="admin-panel admin-table-panel">
                    <div className="admin-panel-heading admin-split">
                        <h2>Recent blog posts</h2>
                        <Link className="admin-inline" href={posts()}>
                            All posts <ChevronRight size={16} />
                        </Link>
                    </div>
                    <div className="admin-table-scroll">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Article</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentPosts.map((post) => (
                                    <tr key={post.id}>
                                        <td>
                                            <Link
                                                className="admin-record"
                                                href={editPost(post.id)}
                                            >
                                                {post.title}
                                            </Link>
                                        </td>
                                        <td>
                                            <Status
                                                value={
                                                    post.published_at
                                                        ? 'published'
                                                        : 'draft'
                                                }
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </>
    );
}
