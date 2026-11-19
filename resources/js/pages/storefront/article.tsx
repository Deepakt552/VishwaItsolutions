import { ArticleCards } from '@/components/storefront/catalog';
import PageHeader from '@/components/storefront/PageHeader';
import Reveal from '@/components/storefront/Reveal';
import { useSiteText } from '@/lib/site-text';
import { blog } from '@/routes/storefront';
import type { Article } from '@/types/storefront';
import { dateLabel } from '@/types/storefront';

export default function ArticlePage({
    post,
    related,
}: {
    post: Article & { html: string };
    related: Article[];
}) {
    const { t } = useSiteText();
    return (
        <>
            <article>
                <PageHeader
                    narrow
                    eyebrow={t('blog')}
                    eyebrowHref={blog.url()}
                    title={post.title}
                    description={post.excerpt}
                    footer={
                        post.published_at ? (
                            <time
                                className="page-header-meta-time"
                                dateTime={post.published_at}
                            >
                                {dateLabel(post.published_at)} · Vishwa IT
                                Solutions
                            </time>
                        ) : undefined
                    }
                />
                <div className="wrap article-wrap article-body">
                    {post.image && (
                        <Reveal>
                            <img
                                className="article-cover"
                                src={post.image}
                                alt={post.cover_alt || ''}
                                width="960"
                                height="520"
                            />
                        </Reveal>
                    )}
                    <div
                        className="article-content"
                        dangerouslySetInnerHTML={{ __html: post.html }}
                    />
                </div>
            </article>
            {related.length > 0 && (
                <section className="section shop">
                    <div className="wrap">
                        <Reveal className="section-head">
                            <h2>{t('moreArticles')}</h2>
                        </Reveal>
                        <ArticleCards posts={related} />
                    </div>
                </section>
            )}
        </>
    );
}
