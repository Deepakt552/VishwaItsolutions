import { useEffect, useState } from 'react';
import { liveReviews } from '@/routes/storefront';

export type ReviewAvailability = { google: boolean; justdial: boolean };
export type ReviewProvider = keyof ReviewAvailability;

export type ReviewItem = {
    author: string;
    text: string | null;
    rating: number | null;
    date: string | null;
    authorUrl: string | null;
    photo: string | null;
    url: string | null;
};

export type ReviewFeed =
    | { status: 'unconfigured' | 'unavailable' }
    | {
          status: 'live';
          rating: number | null;
          count: number | null;
          url: string | null;
          reviews: ReviewItem[];
          attributions: { name: string; url: string | null }[];
      };

export type ReviewFeeds = Record<ReviewProvider, ReviewFeed>;

let cachedFeeds: ReviewFeeds | null = null;
let inflightRequest: Promise<ReviewFeeds> | null = null;

function loadLiveReviews(): Promise<ReviewFeeds> {
    if (cachedFeeds) {
        return Promise.resolve(cachedFeeds);
    }

    if (!inflightRequest) {
        inflightRequest = fetch(liveReviews.url(), {
            headers: { Accept: 'application/json' },
            cache: 'no-store',
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Reviews unavailable');
                }
                return response.json() as Promise<ReviewFeeds>;
            })
            .then((result) => {
                cachedFeeds = result;
                return result;
            })
            .catch(() => {
                const fallback: ReviewFeeds = {
                    google: { status: 'unavailable' },
                    justdial: { status: 'unavailable' },
                };
                return fallback;
            })
            .finally(() => {
                inflightRequest = null;
            });
    }

    return inflightRequest;
}

export function useLiveReviews(shouldLoad: boolean): ReviewFeeds | null {
    const [feeds, setFeeds] = useState<ReviewFeeds | null>(() =>
        shouldLoad ? cachedFeeds : null,
    );

    useEffect(() => {
        if (!shouldLoad) {
            return;
        }

        let active = true;

        loadLiveReviews().then((result) => {
            if (active) {
                setFeeds(result);
            }
        });

        return () => {
            active = false;
        };
    }, [shouldLoad]);

    return feeds;
}

