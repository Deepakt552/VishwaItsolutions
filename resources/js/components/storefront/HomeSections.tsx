import { Link } from '@inertiajs/react';
import {
    ArrowUpRight,
    CheckCircle2,
    ChevronDown,
    Cpu,
    HelpCircle,
    Laptop,
    Monitor,
    Phone,
    ShieldCheck,
    Wrench,
} from 'lucide-react';
import { useSiteText } from '@/lib/site-text';
import { useLiveReviews } from '@/lib/use-live-reviews';
import type { ReviewAvailability } from '@/lib/use-live-reviews';
import { contact, services, shop } from '@/routes/storefront';
import { business, directions, justdialListing, mapsListing } from './business';
import { Chat } from './catalog';
import MotionPattern, { movePattern, resetPattern } from './motion-pattern';
import Reveal from './Reveal';
import {
    GoogleBadgeIcon,
    JustdialBadgeIcon,
    RatingStars,
} from './ReviewBadges';
import { servicesList } from './service-list';

const countFormat = new Intl.NumberFormat('en-IN');

function HeroRatingCard({
    provider,
    name,
    fallbackUrl,
    enabled,
    feedsLoaded,
    feed,
}: {
    provider: 'google' | 'justdial';
    name: string;
    fallbackUrl: string;
    enabled: boolean;
    feedsLoaded: boolean;
    feed?: {
        rating: number | null;
        count: number | null;
        url: string | null;
    };
}) {
    const { t } = useSiteText();
    const isLoading = enabled && !feedsLoaded;
    const starValue = feed?.rating ?? 5;

    return (
        <a
            href={feed?.url || fallbackUrl}
            target="_blank"
            rel="noreferrer"
            className="hero-review-badge"
        >
            <span className={'hero-review-icon ' + provider}>
                {provider === 'google' ? (
                    <GoogleBadgeIcon size={22} />
                ) : (
                    <JustdialBadgeIcon size={22} />
                )}
            </span>
            <div className="hero-review-body">
                <div className="hero-review-top">
                    <strong translate="no">{name}</strong>
                    <ArrowUpRight
                        size={14}
                        className="hero-review-ext"
                        aria-hidden="true"
                    />
                </div>
                <RatingStars
                    rating={starValue}
                    size={15}
                    className="live-stars hero-stars"
                />
                <div className="hero-review-rating-line">
                    {isLoading ? (
                        <span className="hero-review-meta">
                            {t('reviewLoading')}
                        </span>
                    ) : feed?.rating != null ? (
                        <>
                            <span className="hero-out-of">
                                <strong>{feed.rating.toFixed(1)}</strong>
                                <span>/ 5</span>
                            </span>
                            {feed.count != null && (
                                <span className="hero-review-meta">
                                    ·{' '}
                                    {t('ratingCount', {
                                        count: countFormat.format(feed.count),
                                    })}
                                </span>
                            )}
                        </>
                    ) : (
                        <span className="hero-review-meta">
                            {t('verifiedReviews')}
                        </span>
                    )}
                </div>
            </div>
        </a>
    );
}

export function Hero({
    reviewsEnabled = { google: false, justdial: false },
}: {
    reviewsEnabled?: ReviewAvailability;
}) {
    const { t } = useSiteText();
    const feeds = useLiveReviews(
        reviewsEnabled.google || reviewsEnabled.justdial,
    );

    const googleFeed =
        feeds?.google?.status === 'live' ? feeds.google : undefined;
    const justdialFeed =
        feeds?.justdial?.status === 'live' ? feeds.justdial : undefined;
    const feedsLoaded = feeds !== null;

    return (
        <section
            className="modern-hero hero-full"
            id="home"
            onPointerMove={movePattern}
            onPointerLeave={resetPattern}
        >
            <div className="hero-ambient" aria-hidden="true">
                <span className="hero-orb hero-orb-1" />
                <span className="hero-orb hero-orb-2" />
                <span className="hero-grid-overlay" />
            </div>
            <MotionPattern />
            <div className="hero-wide-wrap modern-hero-grid">
                <div className="modern-hero-copy">
                    <div className="hero-eyebrow-pill hero-anim hero-anim-1">
                        <span className="hero-live-dot" aria-hidden="true" />
                        <span>{t('trustedLocal')}</span>
                    </div>
                    <h1 className="hero-anim hero-anim-2">
                        {t('heroTitle')} <em>{t('heroAccent')}</em>
                    </h1>
                    <p className="hero-anim hero-anim-3">{t('heroCopy')}</p>
                    <div className="actions hero-anim hero-anim-4">
                        <Chat
                            className="button hero-cta-primary"
                            icon="black"
                            message="Hi Vishwa IT Solutions, I need help with a computer repair."
                        >
                            {t('whatsapp')}
                        </Chat>
                        <Link
                            href={shop()}
                            className="button hero-cta-secondary"
                        >
                            <Laptop size={19} aria-hidden="true" />
                            {t('browseDevices')}
                            <ArrowUpRight
                                size={17}
                                className="cta-arrow"
                                aria-hidden="true"
                            />
                        </Link>
                    </div>

                    <div
                        className="hero-trust-dock hero-anim hero-anim-5"
                        aria-label={t('reviewsTitle')}
                    >
                        <HeroRatingCard
                            provider="google"
                            name="Google"
                            fallbackUrl={mapsListing}
                            enabled={reviewsEnabled.google}
                            feedsLoaded={feedsLoaded}
                            feed={googleFeed}
                        />
                        <HeroRatingCard
                            provider="justdial"
                            name="Justdial"
                            fallbackUrl={justdialListing}
                            enabled={reviewsEnabled.justdial}
                            feedsLoaded={feedsLoaded}
                            feed={justdialFeed}
                        />
                    </div>
                </div>

                <div className="hero-stage hero-anim hero-anim-media">
                    <div className="hero-stage-glow" aria-hidden="true" />
                    <div className="modern-hero-media">
                        <img
                            src="/repair-bench.webp"
                            alt={t('heroPhoto')}
                            width="1200"
                            height="800"
                            fetchPriority="high"
                        />
                        <div className="hero-media-scrim" aria-hidden="true" />
                    </div>
                    <div className="hero-float-chip chip-top" aria-hidden="true">
                        <span className="chip-icon">
                            <Cpu size={17} />
                        </span>
                        <div>
                            <strong>{t('hardwareLab')}</strong>
                            <span>{t('location')}</span>
                        </div>
                    </div>
                    <a
                        href={'tel:' + business.phone}
                        className="hero-float-chip chip-bottom"
                    >
                        <span className="chip-icon gold">
                            <ShieldCheck size={18} aria-hidden="true" />
                        </span>
                        <div>
                            <strong>{t('sameDayCheck')}</strong>
                            <span dir="ltr">{business.phoneText}</span>
                        </div>
                    </a>
                </div>
            </div>
        </section>
    );
}

export function ServiceIcon({ name }: { name: string }) {
    return (
        <span className="service-icon animated-icon" aria-hidden="true">
            <img
                src={'/animations/' + name + '.svg'}
                alt=""
                width="42"
                height="42"
            />
        </span>
    );
}

export function Services() {
    const { t } = useSiteText();

    return (
        <section id="services" className="section service-gallery">
            <div className="wrap">
                <Reveal className="section-head">
                    <h2>{t('help')}</h2>
                    <Link href={services()} className="button secondary">
                        {t('allServices')}
                    </Link>
                </Reveal>
                <div className="service-grid">
                    {servicesList
                        .slice(0, 4)
                        .map(({ id, icon, title, summary, image }, index) => (
                            <Reveal
                                as="article"
                                key={id}
                                className="service-card"
                                delay={index * 70}
                            >
                                <div className="service-photo-wrap">
                                    <img
                                        className="service-photo"
                                        src={'/service-photos/' + image + '.webp'}
                                        alt=""
                                        width="840"
                                        height="560"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                </div>
                                <div className="service-copy">
                                    <ServiceIcon name={icon} />
                                    <h3>{t(title)}</h3>
                                    <p>{t(summary)}</p>
                                    <Link
                                        className="text-link"
                                        href={services.url() + '#' + id}
                                    >
                                        {t('details')}
                                    </Link>
                                </div>
                            </Reveal>
                        ))}
                </div>
                <SpecialistRepairs embedded />
            </div>
        </section>
    );
}

export function SpecialistRepairs({
    embedded = false,
}: {
    embedded?: boolean;
}) {
    const { t } = useSiteText();
    const specialties = [
        {
            icon: Cpu,
            title: t('specChipLevel'),
            copy: t('specChipLevelCopy'),
        },
        {
            icon: Laptop,
            title: t('specMacBook'),
            copy: t('specMacBookCopy'),
        },
        {
            icon: Monitor,
            title: t('specAllInOne'),
            copy: t('specAllInOneCopy'),
        },
    ];

    const content = (
        <div className={embedded ? 'specialist-block is-embedded' : 'specialist-block'}>
            <Reveal className="specialist-head">
                <h3>{t('specialtiesTitle')}</h3>
            </Reveal>
            <div className="specialist-grid">
                {specialties.map(({ icon: Icon, title, copy }, index) => (
                    <Reveal
                        as="article"
                        key={title}
                        className="specialist-card"
                        delay={index * 65}
                    >
                        <span className="specialist-icon" aria-hidden="true">
                            <Icon size={22} />
                        </span>
                        <div>
                            <h4>{title}</h4>
                            <p>{copy}</p>
                        </div>
                    </Reveal>
                ))}
            </div>
        </div>
    );

    if (embedded) {
        return content;
    }

    return (
        <section className="specialist-section">
            <div className="wrap">{content}</div>
        </section>
    );
}

export function VisitingPricingBanner() {
    const { t } = useSiteText();

    return (
        <section
            className="visiting-pricing-section"
            aria-labelledby="visiting-pricing-title"
        >
            <div className="wrap">
                <Reveal className="visiting-pricing-card" variant="scale">
                    <div className="visiting-price-col">
                        <div className="visiting-amount">
                            <strong>{t('visitChargeAmount')}</strong>
                            <h2 id="visiting-pricing-title">
                                {t('visitChargeTitle')}
                            </h2>
                        </div>
                        <ul className="visiting-rules">
                            <li>
                                <CheckCircle2 size={18} aria-hidden="true" />
                                <span>{t('visitChargeSoftware')}</span>
                            </li>
                            <li>
                                <Wrench size={18} aria-hidden="true" />
                                <span>{t('visitChargeHardware')}</span>
                            </li>
                        </ul>
                    </div>

                    <div className="visiting-action-col">
                        <Chat
                            className="button hero-cta-primary visiting-cta"
                            icon="black"
                            message="Hi Vishwa IT Solutions, I’d like to book a ₹350 technician visit."
                        >
                            {t('bookVisit')}
                        </Chat>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

export function Maintenance() {
    const { t } = useSiteText();

    return (
        <section id="amc" className="home-maintenance">
            <div className="wrap">
                <Reveal className="maintenance-strip" variant="scale">
                    <ServiceIcon name="calendar" />
                    <div>
                        <h2>{t('office')}</h2>
                        <p>{t('officeSummary')}</p>
                    </div>
                    <Link
                        className="button primary"
                        href={services.url() + '#office-it'}
                    >
                        {t('maintenance')}
                    </Link>
                </Reveal>
            </div>
        </section>
    );
}

export function Contact() {
    const { t } = useSiteText();

    return (
        <section id="contact" className="home-contact">
            <div className="home-contact-glow" aria-hidden="true" />
            <Reveal className="wrap home-contact-content">
                <div>
                    <h2>{t('contactTitle')}</h2>
                    <p>{t('contactIntro')}</p>
                </div>
                <div className="actions">
                    <a className="button pale" href={'tel:' + business.phone}>
                        <Phone size={18} aria-hidden="true" />
                        {business.phoneText}
                    </a>
                    <Link
                        href={contact()}
                        className="button home-contact-button"
                    >
                        {t('formTitle')}
                    </Link>
                </div>
            </Reveal>
        </section>
    );
}

export function FrequentlyAsked() {
    const { t } = useSiteText();
    const items = [
        {
            num: '01',
            question: t('faqCharges'),
            answer: <p>{t('faqChargesAnswer')}</p>,
            defaultOpen: true,
        },
        {
            num: '02',
            question: t('faqSpecialties'),
            answer: <p>{t('faqSpecialtiesAnswer')}</p>,
            defaultOpen: false,
        },
        {
            num: '03',
            question: t('faqQuote'),
            answer: <p>{t('faqQuoteAnswer')}</p>,
            defaultOpen: false,
        },
        {
            num: '04',
            question: t('faqVisit'),
            answer: (
                <p>
                    {t('faqVisitAnswer')}{' '}
                    <a href={directions} target="_blank" rel="noreferrer">
                        {t('directions')}
                    </a>
                </p>
            ),
            defaultOpen: false,
        },
        {
            num: '05',
            question: t('faqOffice'),
            answer: <p>{t('faqOfficeAnswer')}</p>,
            defaultOpen: false,
        },
    ];

    return (
        <section
            className="section faq faq-modern"
            id="faq"
            aria-labelledby="faq-title"
        >
            <div className="wrap faq-modern-grid">
                <Reveal className="faq-intro-col">
                    <span className="faq-pill">
                        <HelpCircle size={15} aria-hidden="true" />
                        {t('faqBadge')}
                    </span>
                    <h2 id="faq-title">{t('faq')}</h2>
                    <p className="faq-subtitle">{t('faqSubtitle')}</p>
                    <div className="faq-help-card">
                        <h3>{t('faqStillNeedHelp')}</h3>
                        <p>{t('faqStillNeedHelpCopy')}</p>
                        <div className="faq-help-actions">
                            <Chat
                                className="button primary"
                                message="Hi Vishwa IT Solutions, I have a question."
                            >
                                {t('whatsapp')}
                            </Chat>
                            <a
                                href={'tel:' + business.phone}
                                className="faq-phone-link"
                                dir="ltr"
                            >
                                <Phone size={15} aria-hidden="true" />
                                {business.phoneText}
                            </a>
                        </div>
                    </div>
                </Reveal>
                <div className="faq-cards">
                    {items.map((item, index) => (
                        <Reveal key={item.num} delay={index * 75}>
                            <details
                                className="faq-card"
                                open={item.defaultOpen}
                            >
                                <summary className="faq-card-summary">
                                    <span
                                        className="faq-num"
                                        aria-hidden="true"
                                    >
                                        {item.num}
                                    </span>
                                    <span className="faq-question">
                                        {item.question}
                                    </span>
                                    <span
                                        className="faq-chevron"
                                        aria-hidden="true"
                                    >
                                        <ChevronDown size={18} />
                                    </span>
                                </summary>
                                <div className="faq-card-body">{item.answer}</div>
                            </details>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
