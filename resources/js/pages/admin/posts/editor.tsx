import { Form, Link } from '@inertiajs/react';
import { Bold, ExternalLink, Heading2, List, Save } from 'lucide-react';
import { useRef } from 'react';
import {
    DeleteButton,
    Field,
    PageHeading,
    Panel,
    Status,
} from '@/components/admin/workspace';
import { destroy, index, store, update } from '@/routes/admin/posts';
import { article } from '@/routes/storefront';

type Post = {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    body: string;
    cover_url: string | null;
    cover_alt: string | null;
    seo_title: string | null;
    seo_description: string | null;
    published_at: string | null;
};

export default function PostEditor({ post }: { post: Post | null }) {
    const body = useRef<HTMLTextAreaElement>(null);
    const published = Boolean(post?.published_at);

    function format(prefix: string, suffix = '', placeholder = 'Text') {
        const editor = body.current;
        if (!editor) return;
        const { selectionStart, selectionEnd, value } = editor;
        const selection = value.slice(selectionStart, selectionEnd);
        editor.setRangeText(
            prefix + (selection || placeholder) + suffix,
            selectionStart,
            selectionEnd,
            'end',
        );
        editor.dispatchEvent(new Event('input', { bubbles: true }));
        editor.focus();
        editor.setSelectionRange(
            selectionStart + prefix.length,
            selectionStart + prefix.length + (selection || placeholder).length,
        );
    }

    return (
        <>
            <PageHeading
                title={post ? 'Edit article' : 'Write article'}
                text="Manage the article, cover photo and search preview."
                back={{ url: index.url(), label: 'Blog posts' }}
                actions={
                    post && published ? (
                        <Link
                            href={article(post.slug)}
                            className="admin-btn admin-secondary"
                        >
                            <ExternalLink size={16} />
                            View article
                        </Link>
                    ) : undefined
                }
            />
            <Form
                key={post?.id ?? 'new'}
                action={post ? update.url(post.id) : store.url()}
                method="post"
                encType="multipart/form-data"
                className="admin-editor"
            >
                {({ errors, processing }) => (
                    <>
                        {post && (
                            <input type="hidden" name="_method" value="PUT" />
                        )}
                        <div className="admin-editor-main">
                            <Panel title="Article content">
                                <div className="admin-fields">
                                    <Field label="Title" error={errors.title}>
                                        <input
                                            name="title"
                                            defaultValue={post?.title}
                                            maxLength={150}
                                            required
                                        />
                                    </Field>
                                    <Field
                                        label="Excerpt"
                                        error={errors.excerpt}
                                        note="Shown in previews and used as the fallback search description."
                                    >
                                        <textarea
                                            name="excerpt"
                                            rows={3}
                                            defaultValue={post?.excerpt}
                                            maxLength={300}
                                            required
                                        />
                                    </Field>
                                    <div>
                                        <div
                                            className="admin-editor-tools"
                                            aria-label="Markdown formatting"
                                        >
                                            <button
                                                type="button"
                                                title="Bold"
                                                aria-label="Bold"
                                                onClick={() =>
                                                    format('**', '**')
                                                }
                                            >
                                                <Bold size={17} />
                                            </button>
                                            <button
                                                type="button"
                                                title="Section heading"
                                                aria-label="Section heading"
                                                onClick={() =>
                                                    format(
                                                        '\n## ',
                                                        '\n',
                                                        'Heading',
                                                    )
                                                }
                                            >
                                                <Heading2 size={18} />
                                            </button>
                                            <button
                                                type="button"
                                                title="List item"
                                                aria-label="List item"
                                                onClick={() =>
                                                    format(
                                                        '\n- ',
                                                        '',
                                                        'List item',
                                                    )
                                                }
                                            >
                                                <List size={18} />
                                            </button>
                                        </div>
                                        <Field
                                            label="Article body"
                                            error={errors.body}
                                            note="Supports Markdown headings, links, lists and tables."
                                        >
                                            <textarea
                                                className="admin-markdown"
                                                ref={body}
                                                name="body"
                                                rows={18}
                                                defaultValue={post?.body}
                                                maxLength={50000}
                                                required
                                            />
                                        </Field>
                                    </div>
                                </div>
                            </Panel>
                            <Panel title="Cover photo">
                                <div className="admin-fields">
                                    {post?.cover_url && (
                                        <div className="admin-cover-preview">
                                            <img
                                                src={post.cover_url}
                                                alt={post.cover_alt || ''}
                                                width="400"
                                                height="240"
                                            />
                                            <label className="admin-check">
                                                <input
                                                    type="checkbox"
                                                    name="remove_cover"
                                                    value="1"
                                                />
                                                Remove cover photo
                                            </label>
                                        </div>
                                    )}
                                    <Field
                                        label="Upload cover"
                                        error={errors.cover_file}
                                        note="JPG, PNG or WebP, up to 4 MB."
                                    >
                                        <input
                                            name="cover_file"
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                        />
                                    </Field>
                                    <Field
                                        label="Photo alt text"
                                        error={errors.cover_alt}
                                    >
                                        <input
                                            name="cover_alt"
                                            defaultValue={post?.cover_alt ?? ''}
                                            maxLength={160}
                                            placeholder="Describe what appears in the photo"
                                        />
                                    </Field>
                                </div>
                            </Panel>
                        </div>
                        <div className="admin-editor-side">
                            <Panel title="Publishing">
                                <div className="admin-fields">
                                    {post && (
                                        <Status
                                            value={
                                                published
                                                    ? 'published'
                                                    : 'draft'
                                            }
                                        />
                                    )}
                                    <Field
                                        label="Visibility"
                                        error={errors.publish}
                                    >
                                        <select
                                            name="publish"
                                            defaultValue={published ? '1' : '0'}
                                        >
                                            <option value="0">Draft</option>
                                            <option value="1">Published</option>
                                        </select>
                                    </Field>
                                    <button
                                        type="submit"
                                        className="admin-btn admin-primary"
                                        disabled={processing}
                                    >
                                        <Save size={17} />
                                        {processing
                                            ? 'Saving…'
                                            : post
                                              ? 'Save changes'
                                              : 'Create article'}
                                    </button>
                                    {post && (
                                        <DeleteButton
                                            url={destroy.url(post.id)}
                                            label="Delete article"
                                            message={
                                                'Delete ' +
                                                post.title +
                                                '? This removes its public URL.'
                                            }
                                        />
                                    )}
                                </div>
                            </Panel>
                            <Panel
                                title="Search and social"
                                text="The article title and excerpt are used when these fields are blank."
                            >
                                <div className="admin-fields">
                                    <Field
                                        label="URL slug"
                                        error={errors.slug}
                                        note={
                                            post
                                                ? 'Changing this replaces the article URL.'
                                                : 'A slug is generated if left blank.'
                                        }
                                    >
                                        <input
                                            name="slug"
                                            defaultValue={post?.slug}
                                            maxLength={180}
                                            pattern="[a-z0-9]+(-[a-z0-9]+)*"
                                            placeholder="e.g. laptop-buying-guide"
                                        />
                                    </Field>
                                    <Field
                                        label="SEO title"
                                        error={errors.seo_title}
                                    >
                                        <input
                                            name="seo_title"
                                            defaultValue={post?.seo_title ?? ''}
                                            maxLength={70}
                                        />
                                    </Field>
                                    <Field
                                        label="SEO description"
                                        error={errors.seo_description}
                                    >
                                        <textarea
                                            name="seo_description"
                                            defaultValue={
                                                post?.seo_description ?? ''
                                            }
                                            maxLength={170}
                                            rows={4}
                                        />
                                    </Field>
                                </div>
                            </Panel>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}
