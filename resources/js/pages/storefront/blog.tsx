import { Link } from '@inertiajs/react';
import { ArticleCards, Pagination } from '@/components/storefront/catalog';
import PageHeader from '@/components/storefront/PageHeader';
import Reveal from '@/components/storefront/Reveal';
import { useSiteText } from '@/lib/site-text';
import { services } from '@/routes/storefront';
import type { Article, PageResult } from '@/types/storefront';

export default function Blog({ posts }: { posts: PageResult<Article> }) {
    const { t } = useSiteText();
    const feature = posts.current_page === 1 ? posts.data[0] : undefined;
    const articles = feature ? posts.data.slice(1) : posts.data;

    return (
        <>
            <PageHeader
                breadcrumbLabel={t('blog')}
                eyebrow={t('latestAdvice')}
                title={t('blogTitle')}
                description={t('blogIntro')}
                aside={
                    <div className="page-header-media-frame">
                        <img
                            className="page-banner-image"
                            src="/service-photos/data-recovery.webp"
                            alt=""
                            width="840"
                            height="560"
                            fetchPriority="high"
                        />
                    </div>
                }
            />
            <section className="section shop blog-landing">
                <div className="wrap">
                    {feature && (
                        <section>
                            <Reveal className="section-head">
                                <h2>{t('latestArticle')}</h2>
                            </Reveal>
                            <ArticleCards posts={[feature]} featured />
                        </section>
                    )}
                    {articles.length > 0 && (
                        <section>
                            <Reveal className="section-head">
                                <h2>
                                    {t(
                                        feature
                                            ? 'moreArticles'
                                            : 'allArticles',
                                    )}
                                </h2>
                            </Reveal>
                            <ArticleCards posts={articles} />
                        </section>
                    )}
                    {posts.data.length === 0 && (
                        <Reveal className="blog-empty">
                            <div>
                                <h2>{t('moreSoon')}</h2>
                                <Link
                                    href={services()}
                                    className="button secondary"
                                >
                                    {t('allServices')}
                                </Link>
                            </div>
                        </Reveal>
                    )}
                    <Pagination links={posts.links} />
                </div>
            </section>
        </>
    );
}
