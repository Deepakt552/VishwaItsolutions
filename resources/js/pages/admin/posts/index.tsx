import { Link } from '@inertiajs/react';
import { BookOpen, Plus, Search, Sparkles } from 'lucide-react';
import {
    AdminPagination,
    Empty,
    FilterBar,
    PageHeading,
    Status,
} from '@/components/admin/workspace';
import { index as automation } from '@/routes/admin/automation';
import { create, edit, index } from '@/routes/admin/posts';
import type { PageResult } from '@/types/storefront';
import { dateLabel } from '@/types/storefront';

type Post = {
    id: number;
    title: string;
    excerpt: string;
    published_at: string | null;
    updated_at: string;
};

export default function Posts({
    posts,
    filters,
}: {
    posts: PageResult<Post>;
    filters: { q?: string; status?: string };
}) {
    const filtered = Object.values(filters).some(Boolean);
    return (
        <>
            <PageHeading
                title="Blog posts"
                text="Write, review and publish repair tips and buying guides."
                actions={
                    <>
                        <Link
                            href={automation()}
                            className="admin-btn admin-secondary"
                        >
                            <Sparkles size={17} />
                            Generate draft
                        </Link>
                        <Link
                            href={create()}
                            className="admin-btn admin-primary"
                        >
                            <Plus size={18} />
                            Write article
                        </Link>
                    </>
                }
            />
            <section className="admin-panel admin-table-panel">
                <FilterBar url={index.url()} active={filtered}>
                    <label className="admin-search">
                        <Search size={17} />
                        <input
                            name="q"
                            aria-label="Search articles"
                            placeholder="Search articles"
                            maxLength={120}
                            defaultValue={filters.q}
                        />
                    </label>
                    <select
                        name="status"
                        aria-label="Status"
                        defaultValue={filters.status || ''}
                    >
                        <option value="">All statuses</option>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                    </select>
                </FilterBar>
                {posts.data.length > 0 ? (
                    <div className="admin-table-scroll">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Article</th>
                                    <th>Status</th>
                                    <th>Updated</th>
                                    <th>
                                        <span className="sr-only">Action</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.data.map((post) => (
                                    <tr key={post.id}>
                                        <td>
                                            <Link
                                                className="admin-record"
                                                href={edit(post.id)}
                                            >
                                                {post.title}
                                                <small className="admin-truncate">
                                                    {post.excerpt}
                                                </small>
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
                                        <td>{dateLabel(post.updated_at)}</td>
                                        <td>
                                            <Link
                                                className="admin-inline"
                                                href={edit(post.id)}
                                                aria-label={
                                                    'Edit ' + post.title
                                                }
                                            >
                                                Edit
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <Empty
                        icon={BookOpen}
                        title={
                            filtered
                                ? 'No matching articles'
                                : 'No articles yet'
                        }
                        text={
                            filtered
                                ? 'Try a different title or status.'
                                : 'Write an article or start with an AI-generated draft.'
                        }
                    />
                )}
                <AdminPagination links={posts.links} />
            </section>
        </>
    );
}
