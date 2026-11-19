import { Link } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    Quote,
} from 'lucide-react';
import { useState } from 'react';
import { useSiteText } from '@/lib/site-text';
import { useLiveReviews } from '@/lib/use-live-reviews';
import type {
    ReviewAvailability,
    ReviewFeed,
    ReviewProvider,
} from '@/lib/use-live-reviews';
import { reviewSources } from '@/routes/storefront';
import { justdialListing, mapsListing } from './business';
import Reveal from './Reveal';
import {
    GoogleBadgeIcon,
    JustdialBadgeIcon,
    RatingStars,
} from './ReviewBadges';

export type { ReviewAvailability };

const providers = {
    google: {
        name: 'Google Maps',
        url: mapsListing,
        icon: GoogleBadgeIcon,
    },
    justdial: {
        name: 'Justdial',
        url: justdialListing,
        icon: JustdialBadgeIcon,
    },
};
const sources = ['google', 'justdial'] as const;
const number = new Intl.NumberFormat('en-IN');
const googleReviewPolicy =
    'https://support.google.com/contributionpolicy/answer/7422880';

function ReviewCarousel({
    provider,
    feed,
}: {
    provider: ReviewProvider;
    feed: Extract<ReviewFeed, { status: 'live' }>;
}) {
    const [active, setActive] = useState(0);
    const { reviews } = feed;
    const { t } = useSiteText();
    const review = reviews[active];
    const name = providers[provider].name;
    const google = provider === 'google';

    return (
        <div className="reviews-content" id="provider-reviews">
            {review ? (
                <div
                    className="reviews-carousel"
                    aria-roledescription="carousel"
                    aria-label={name}
                >
                    <div
                        className="review-slide"
                        key={active}
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        <div className="review-slide-head">
                            {review.photo ? (
                                <img
                                    className="review-photo"
                                    src={review.photo}
                                    alt=""
                                    width="46"
                                    height="46"
                                    loading="lazy"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <span
                                    className="review-initials"
                                    aria-hidden="true"
                                >
                                    {review.author
                                        .trim()
                                        .slice(0, 1)
                                        .toUpperCase()}
                                </span>
                            )}
                            <div>
                                {review.authorUrl ? (
                                    <a
                                        href={review.authorUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {review.author}
                                    </a>
                                ) : (
                                    <strong>{review.author}</strong>
                                )}
                                <div className="review-slide-meta">
                                    {review.rating !== null && (
                                        <RatingStars rating={review.rating} />
                                    )}
                                    {review.date && <span>{review.date}</span>}
                                </div>
                            </div>
                            <Quote
                                aria-hidden="true"
                                size={30}
                                className="live-quote"
                            />
                        </div>
                        {review.text && <blockquote>{review.text}</blockquote>}
                        {review.url && (
                            <a
                                className="text-link"
                                href={review.url}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {t('reviewOriginal', { name })}
                                <ExternalLink size={14} aria-hidden="true" />
                            </a>
                        )}
                    </div>
                    {reviews.length > 1 && (
                        <div className="review-carousel-controls">
                            <button
                                type="button"
                                aria-label={t('previousReview')}
                                onClick={() =>
                                    setActive(
                                        (active + reviews.length - 1) %
                                            reviews.length,
                                    )
                                }
                            >
                                <ChevronLeft size={21} />
                            </button>
                            <span aria-live="polite">
                                {t('reviewPosition', {
                                    index: active + 1,
                                    total: reviews.length,
                                })}
                            </span>
                            <button
                                type="button"
                                aria-label={t('nextReview')}
                                onClick={() =>
                                    setActive((active + 1) % reviews.length)
                                }
                            >
                                <ChevronRight size={21} />
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <p className="reviews-feedback">
                    {t('reviewNoIndividual', { name })}
                </p>
            )}
            {google && (
                <p className="review-provider-note">
                    <strong translate="no">Google Maps</strong>
                    <span>{t('reviewOrder')}</span>
                    <a
                        href={googleReviewPolicy}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {t('reviewGooglePolicy')}
                    </a>
                </p>
            )}
            {feed.attributions.map((attribution) => (
                <p className="review-provider-note" key={attribution.name}>
                    {attribution.url ? (
                        <a
                            href={attribution.url}
                            target="_blank"
                            rel="noreferrer"
                        >
                            {attribution.name}
                        </a>
                    ) : (
                        attribution.name
                    )}
                </p>
            ))}
        </div>
    );
}

export default function LiveReviews({
    enabled,
}: {
    enabled: ReviewAvailability;
}) {
    const { t } = useSiteText();
    const [selected, setSelected] = useState<ReviewProvider>(
        enabled.google || !enabled.justdial ? 'google' : 'justdial',
    );
    const shouldLoad = enabled.google || enabled.justdial;
    const feeds = useLiveReviews(shouldLoad);
    const activeFeed = feeds?.[selected];

    return (
        <section className="section reviews live-reviews" id="reviews">
            <div className="wrap">
                <Reveal className="section-head">
                    <h2>{t('reviewsTitle')}</h2>
                    <Link className="text-link" href={reviewSources()}>
                        {t('reviewSources')}
                    </Link>
                </Reveal>
                <div className="review-provider-grid">
                    {sources.map((provider, index) => {
                        const { name, icon: Icon, url } = providers[provider];
                        const feed = feeds?.[provider];
                        const live = feed?.status === 'live';
                        const displayRating =
                            live && feed.rating !== null ? feed.rating : 5;
                        return (
                            <Reveal
                                className="review-provider-card"
                                key={provider}
                                delay={index * 90}
                            >
                                <div className="review-provider-title">
                                    <span className={'provider-logo ' + provider}>
                                        <Icon size={22} />
                                    </span>
                                    <h3 translate="no">{name}</h3>
                                </div>
                                <div className="review-score">
                                    {live && feed.rating !== null && (
                                        <strong>
                                            {feed.rating.toFixed(1)}
                                        </strong>
                                    )}
                                    <div>
                                        <RatingStars
                                            rating={displayRating}
                                            size={16}
                                        />
                                        <span>
                                            {live && feed.count !== null
                                                ? t('ratingCount', {
                                                      count: number.format(
                                                          feed.count,
                                                      ),
                                                  })
                                                : t('verifiedReviews')}
                                        </span>
                                    </div>
                                </div>
                                <div className="review-provider-actions">
                                    {enabled[provider] && (
                                        <button
                                            type="button"
                                            className="button secondary"
                                            aria-pressed={selected === provider}
                                            aria-controls="provider-reviews"
                                            onClick={() =>
                                                setSelected(provider)
                                            }
                                        >
                                            {t('showReviews')}
                                        </button>
                                    )}
                                    <a
                                        href={live ? feed.url || url : url}
                                        className="text-link"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {t('openProvider', { name })}
                                        <ExternalLink size={14} />
                                    </a>
                                </div>
                            </Reveal>
                        );
                    })}
                </div>
                {activeFeed?.status === 'live' ? (
                    <ReviewCarousel
                        key={selected}
                        provider={selected}
                        feed={activeFeed}
                    />
                ) : (
                    <p
                        className="reviews-feedback"
                        id="provider-reviews"
                        role="status"
                    >
                        {!shouldLoad
                            ? t('reviewPlatforms')
                            : activeFeed
                              ? t('reviewUnavailable')
                              : !enabled[selected]
                                ? t('reviewPlatforms')
                                : t('reviewLoading')}
                    </p>
                )}
            </div>
        </section>
    );
}
