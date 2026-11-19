import { Form, Link, usePoll } from '@inertiajs/react';
import { BookOpen, Package, Sparkles } from 'lucide-react';
import {
    AdminPagination,
    Empty,
    Field,
    PageHeading,
    Panel,
    Status,
} from '@/components/admin/workspace';
import { index, store } from '@/routes/admin/automation';
import { edit as editPost } from '@/routes/admin/posts';
import { edit as editProduct } from '@/routes/admin/products';
import type { PageResult } from '@/types/storefront';
import { dateLabel } from '@/types/storefront';

type Job = {
    id: number;
    topic: string;
    status: string;
    error: string | null;
    post_id: number | null;
    product_id: number | null;
    created_at: string;
};

function RefreshGenerations() {
    usePoll(2800, { only: ['generations', 'hasPending'] });
    return null;
}

export default function Automation({
    kind,
    configured,
    generations,
    hasPending,
}: {
    kind: 'post' | 'product';
    configured: boolean;
    generations: PageResult<Job>;
    hasPending: boolean;
}) {
    const article = kind === 'post';

    return (
        <>
            {hasPending && <RefreshGenerations />}
            <PageHeading
                title="AI automation"
                text="Generate an editable blog draft or extract a product listing from a single brief."
            />
            <nav className="admin-tabs" aria-label="Draft type">
                <Link
                    href={index({ query: { kind: 'post' } })}
                    aria-current={article ? 'page' : undefined}
                >
                    <BookOpen size={17} /> Blog studio
                </Link>
                <Link
                    href={index({ query: { kind: 'product' } })}
                    aria-current={!article ? 'page' : undefined}
                >
                    <Package size={17} /> Product listings
                </Link>
            </nav>
            <div className="admin-editor automation-grid">
                <Panel
                    title={
                        article
                            ? 'Generate a blog post'
                            : 'Generate a product listing'
                    }
                    text={
                        article
                            ? 'Provide a topic and optional source material. The draft includes a complete article, excerpt and SEO fields.'
                            : 'Provide the model, specs, condition and price. You can review the details and upload listing photos before publishing.'
                    }
                >
                    {!configured && (
                        <p className="admin-config-notice">
                            Set <code>OPENAI_API_KEY</code> on the server to
                            enable draft generation.
                        </p>
                    )}
                    <Form
                        key={kind}
                        {...store.form()}
                        className="admin-fields"
                        resetOnSuccess={['topic', 'notes', 'reference']}
                    >
                        {({ errors, processing }) => (
                            <>
                                <input name="kind" type="hidden" value={kind} />
                                <Field
                                    label={
                                        article
                                            ? 'Article topic'
                                            : 'Product brief'
                                    }
                                    error={errors.topic}
                                >
                                    <input
                                        name="topic"
                                        maxLength={180}
                                        required
                                        placeholder={
                                            article
                                                ? 'e.g. What to check before buying a used laptop'
                                                : 'e.g. ThinkPad T14 Gen 2, i5, 16 GB RAM, 512 GB SSD'
                                        }
                                    />
                                </Field>
                                <Field
                                    label="Additional instructions (optional)"
                                    error={errors.notes}
                                >
                                    <textarea
                                        name="notes"
                                        rows={5}
                                        maxLength={6000}
                                        placeholder={
                                            article
                                                ? 'Audience, language, target search phrase or points to cover'
                                                : 'Condition, age, price, accessories, and any details to emphasise'
                                        }
                                    />
                                </Field>
                                <Field
                                    label="Reference upload (optional)"
                                    error={errors.reference}
                                    note="PDF, text, JPG, PNG or WebP up to 4 MB. The file is sent to the AI provider as source material."
                                >
                                    <input
                                        name="reference"
                                        type="file"
                                        accept=".pdf,.txt,image/jpeg,image/png,image/webp"
                                    />
                                </Field>
                                <button
                                    className="admin-btn admin-primary"
                                    type="submit"
                                    disabled={!configured || processing}
                                >
                                    <Sparkles size={17} />
                                    {processing
                                        ? 'Submitting…'
                                        : 'Generate draft'}
                                </button>
                            </>
                        )}
                    </Form>
                </Panel>
                <section className="admin-panel admin-table-panel">
                    <div className="admin-panel-heading">
                        <h2>Generation history</h2>
                        <p>Open completed drafts to review and publish them.</p>
                    </div>
                    {generations.data.length ? (
                        <ul className="admin-job-list">
                            {generations.data.map((job) => (
                                <li key={job.id}>
                                    <div className="admin-split">
                                        <strong>{job.topic}</strong>
                                        <Status value={job.status} />
                                    </div>
                                    <small>{dateLabel(job.created_at)}</small>
                                    {job.error && (
                                        <p className="admin-error">
                                            {job.error}
                                        </p>
                                    )}
                                    {job.post_id && (
                                        <Link
                                            className="admin-inline"
                                            href={editPost(job.post_id)}
                                        >
                                            Open article draft
                                        </Link>
                                    )}
                                    {job.product_id && (
                                        <Link
                                            className="admin-inline"
                                            href={editProduct(job.product_id)}
                                        >
                                            Open product draft
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <Empty
                            icon={Sparkles}
                            title="No generations yet"
                            text="Draft requests and their status will appear here."
                        />
                    )}
                    <AdminPagination links={generations.links} />
                </section>
            </div>
        </>
    );
}
