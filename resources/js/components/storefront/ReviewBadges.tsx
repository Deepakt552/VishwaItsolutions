import { Star } from 'lucide-react';
import { useSiteText } from '@/lib/site-text';

export function GoogleBadgeIcon({ size = 20 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="provider-brand-svg"
        >
            <path
                fill="#4285F4"
                d="M23.49 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.08 3.56-5.15 3.56-8.65Z"
            />
            <path
                fill="#34A853"
                d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.87-3c-1.07.72-2.45 1.14-4.08 1.14-3.14 0-5.8-2.12-6.75-4.97H1.25v3.1A12 12 0 0 0 12 24Z"
            />
            <path
                fill="#FBBC05"
                d="M5.25 14.26A7.2 7.2 0 0 1 4.88 12c0-.79.14-1.56.37-2.26V6.64H1.25a12 12 0 0 0 0 10.72l4-3.1Z"
            />
            <path
                fill="#EA4335"
                d="M12 4.77c1.76 0 3.35.61 4.59 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.25 6.64l4 3.1C6.2 6.89 8.86 4.77 12 4.77Z"
            />
        </svg>
    );
}

export function JustdialBadgeIcon({ size = 20 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 28 28"
            aria-hidden="true"
            className="provider-brand-svg"
        >
            <rect width="28" height="28" rx="7" fill="#0076D7" />
            <text
                x="14"
                y="19"
                textAnchor="middle"
                fill="#FFFFFF"
                fontFamily="system-ui, -apple-system, sans-serif"
                fontSize="13.5"
                fontWeight="800"
                letterSpacing="-0.5"
            >
                Jd
            </text>
            <circle cx="22.5" cy="6.2" r="2.6" fill="#FF6C00" />
        </svg>
    );
}

export function RatingStars({
    rating = 5,
    size = 15,
    className = 'live-stars',
}: {
    rating?: number;
    size?: number;
    className?: string;
}) {
    const { t } = useSiteText();
    return (
        <span className={className} aria-label={t('starRating', { rating })}>
            {Array.from({ length: 5 }, (_, index) => (
                <span className="rating-star" key={index} aria-hidden="true">
                    <Star size={size} />
                    <span
                        style={{
                            width:
                                Math.max(0, Math.min(1, rating - index)) * 100 +
                                '%',
                        }}
                    >
                        <Star size={size} fill="currentColor" />
                    </span>
                </span>
            ))}
        </span>
    );
}

