import { Link } from '@inertiajs/react';
import {
    ArticleCards,
    EmptyStock,
    ProductCards,
} from '@/components/storefront/catalog';
import {
    Contact,
    FrequentlyAsked,
    Hero,
    Maintenance,
    ServiceAreas,
    Services,
    VisitingPricingBanner,
} from '@/components/storefront/HomeSections';
import LiveReviews from '@/components/storefront/LiveReviews';
import type { ReviewAvailability } from '@/components/storefront/LiveReviews';
import Reveal from '@/components/storefront/Reveal';
import WorkshopGallery from '@/components/storefront/WorkshopGallery';
import { useSiteText } from '@/lib/site-text';
import { blog, shop } from '@/routes/storefront';
import type {
    Article,
    GalleryPhoto,
    Product,
    RepairServiceLink,
} from '@/types/storefront';

export default function Home({
    products,
    posts,
    reviewsEnabled,
    repairServices,
    galleryPhotos,
}: {
    products: Product[];
    posts: Article[];
    reviewsEnabled: ReviewAvailability;
    repairServices: RepairServiceLink[];
    galleryPhotos: GalleryPhoto[];
}) {
    const { t } = useSiteText();
    return (
        <>
            <Hero reviewsEnabled={reviewsEnabled} />
            <div className="home-sections">
                <Services repairServices={repairServices} />
                <VisitingPricingBanner />
                <Maintenance />
                <section id="shop" className="section shop">
                    <div className="wrap">
                        <Reveal className="section-head">
                            <h2>{t('homeShop')}</h2>
                            <Link href={shop()} className="button secondary">
                                {t('viewShop')}
                            </Link>
                        </Reveal>
                        {products.length ? (
                            <ProductCards items={products} />
                        ) : (
                            <EmptyStock />
                        )}
                    </div>
                </section>
                <LiveReviews enabled={reviewsEnabled} />
                {posts.length > 0 && (
                    <section className="section">
                        <div className="wrap">
                            <Reveal className="section-head">
                                <h2>{t('latestAdvice')}</h2>
                                <Link
                                    href={blog()}
                                    className="button secondary"
                                >
                                    {t('allArticles')}
                                </Link>
                            </Reveal>
                            <ArticleCards posts={posts} />
                        </div>
                    </section>
                )}
                <FrequentlyAsked />
                <ServiceAreas />
                <Contact />
                <WorkshopGallery photos={galleryPhotos} />
            </div>
        </>
    );
}
