import { Form, router } from '@inertiajs/react';
import { MapPin, Plus, RefreshCw, Save, Store, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
    Field,
    PageHeading,
    Panel,
    Status,
} from '@/components/admin/workspace';
import { justdialListing } from '@/components/storefront/business';
import { refresh, update } from '@/routes/admin/reviews';

type ManualReview = {
    author: string;
    rating: number | null;
    text: string | null;
    date: string | null;
    url: string | null;
};

type Settings = {
    googlePlaceId: string | null;
    googleSaved: boolean;
    googleReady: boolean;
    justdialListingId: string | null;
    justdialSaved: boolean;
    justdialFeedConfigured: boolean;
    justdialReady: boolean;
    justdialManualRating: number | null;
    justdialManualCount: number | null;
    justdialManualUrl: string | null;
    justdialManualReviews: ManualReview[];
    lastRefreshedAt?: string | null;
};

export default function ReviewSettings(settings: Settings) {
    const [refreshing, setRefreshing] = useState(false);
    const [manualReviews, setManualReviews] = useState<ManualReview[]>(
        settings.justdialManualReviews ?? [],
    );

    function triggerRefresh() {
        setRefreshing(true);
        router.post(
            refresh.url(),
            {},
            {
                preserveScroll: true,
                onFinish: () => setRefreshing(false),
            },
        );
    }

    function addReview() {
        if (manualReviews.length >= 12) {
            return;
        }
        setManualReviews([
            ...manualReviews,
            { author: '', rating: 5, text: '', date: '', url: '' },
        ]);
    }

    function removeReview(index: number) {
        setManualReviews(manualReviews.filter((_, i) => i !== index));
    }

    function updateReview(
        index: number,
        field: keyof ManualReview,
        value: string | number | null,
    ) {
        setManualReviews(
            manualReviews.map((review, i) =>
                i === index ? { ...review, [field]: value } : review,
            ),
        );
    }

    return (
        <>
            <PageHeading
                title="Review integrations"
                text="Connect Google Maps and Justdial reviews to the home page. Live feeds are cached and auto-refresh every 12 hours (~60 calls/month, staying free)."
                actions={
                    <button
                        type="button"
                        className="admin-btn"
                        onClick={triggerRefresh}
                        disabled={refreshing}
                    >
                        <RefreshCw size={16} />
                        {refreshing ? 'Refreshing…' : 'Refresh now'}
                    </button>
                }
            />
            <Form
                {...update.form()}
                resetOnSuccess={[
                    'google_key',
                    'justdial_key',
                    'remove_google_key',
                    'remove_justdial_key',
                ]}
            >
                {({ errors, processing }) => (
                    <>
                        <div className="admin-editor automation-grid">
                            <Panel
                                title="Google Maps"
                                text="Use a server-side Google Maps key with Places API (New) enabled. Cached for 12 hours (~60 calls/month, free tier)."
                            >
                                <div className="admin-fields">
                                    <div className="admin-split">
                                        <span className="admin-inline">
                                            <MapPin size={17} /> Connection
                                            settings
                                        </span>
                                        <Status
                                            value={
                                                settings.googleReady
                                                    ? 'configured'
                                                    : 'disabled'
                                            }
                                        />
                                    </div>
                                    <Field
                                        label="Google Place ID"
                                        error={errors.google_place_id}
                                        note="Find the ID for the business listing in Google’s Place ID finder."
                                    >
                                        <input
                                            name="google_place_id"
                                            defaultValue={
                                                settings.googlePlaceId ?? ''
                                            }
                                            maxLength={255}
                                            autoComplete="off"
                                            placeholder="e.g. ChIJ…"
                                        />
                                    </Field>
                                    <Field
                                        label="Google Maps API key"
                                        error={errors.google_key}
                                        note={
                                            settings.googleSaved
                                                ? 'A key is saved. Leave blank to keep it.'
                                                : 'This key is encrypted and used by the server.'
                                        }
                                    >
                                        <input
                                            type="password"
                                            name="google_key"
                                            autoComplete="new-password"
                                            maxLength={512}
                                        />
                                    </Field>
                                    {settings.googleSaved && (
                                        <label className="admin-check">
                                            <input
                                                type="checkbox"
                                                value="1"
                                                name="remove_google_key"
                                            />
                                            Remove saved Google key
                                        </label>
                                    )}
                                    <a
                                        href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                                        className="admin-inline"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Find a Google Place ID
                                    </a>
                                </div>
                            </Panel>

                            <Panel
                                title="Justdial"
                                text="Show your Justdial rating & customer reviews for free below, or connect an authorised partner API feed."
                            >
                                <div className="admin-fields">
                                    <div className="admin-split">
                                        <span className="admin-inline">
                                            <Store size={17} /> Justdial rating
                                            & reviews
                                        </span>
                                        <Status
                                            value={
                                                settings.justdialReady
                                                    ? 'configured'
                                                    : 'disabled'
                                            }
                                        />
                                    </div>

                                    <div className="admin-field-row">
                                        <Field
                                            label="Overall rating (out of 5)"
                                            error={
                                                errors.justdial_manual_rating
                                            }
                                        >
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="5"
                                                name="justdial_manual_rating"
                                                defaultValue={
                                                    settings.justdialManualRating ??
                                                    ''
                                                }
                                                placeholder="4.9"
                                            />
                                        </Field>
                                        <Field
                                            label="Total ratings count"
                                            error={errors.justdial_manual_count}
                                        >
                                            <input
                                                type="number"
                                                min="0"
                                                max="1000000"
                                                name="justdial_manual_count"
                                                defaultValue={
                                                    settings.justdialManualCount ??
                                                    ''
                                                }
                                                placeholder="85"
                                            />
                                        </Field>
                                    </div>

                                    <Field
                                        label="Justdial listing URL"
                                        error={errors.justdial_manual_url}
                                    >
                                        <input
                                            type="url"
                                            name="justdial_manual_url"
                                            defaultValue={
                                                settings.justdialManualUrl ??
                                                justdialListing
                                            }
                                            maxLength={500}
                                        />
                                    </Field>

                                    <div className="admin-split">
                                        <strong>
                                            Customer reviews for carousel (
                                            {manualReviews.length}/12)
                                        </strong>
                                        <button
                                            type="button"
                                            className="admin-btn"
                                            onClick={addReview}
                                            disabled={
                                                manualReviews.length >= 12
                                            }
                                        >
                                            <Plus size={15} /> Add review
                                        </button>
                                    </div>

                                    {manualReviews.length === 0 && (
                                        <p className="admin-config-notice">
                                            Click <strong>Add review</strong> to
                                            add real customer reviews from your
                                            Justdial listing so they appear in
                                            the &ldquo;What customers say&rdquo;
                                            carousel.
                                        </p>
                                    )}

                                    {manualReviews.map((review, index) => (
                                        <div
                                            key={index}
                                            className="admin-fields"
                                            style={{
                                                padding: '0.9rem',
                                                border: '1px solid #e7d8de',
                                                borderRadius: '10px',
                                                background: '#fdfafc',
                                            }}
                                        >
                                            <div className="admin-split">
                                                <strong>
                                                    Review #{index + 1}
                                                </strong>
                                                <button
                                                    type="button"
                                                    className="admin-btn"
                                                    onClick={() =>
                                                        removeReview(index)
                                                    }
                                                >
                                                    <Trash2 size={14} /> Remove
                                                </button>
                                            </div>
                                            <div className="admin-field-row">
                                                <Field label="Customer name">
                                                    <input
                                                        name={`justdial_manual_reviews[${index}][author]`}
                                                        value={review.author}
                                                        onChange={(e) =>
                                                            updateReview(
                                                                index,
                                                                'author',
                                                                e.target.value,
                                                            )
                                                        }
                                                        maxLength={120}
                                                        placeholder="Customer name"
                                                    />
                                                </Field>
                                                <Field label="Stars (1–5)">
                                                    <input
                                                        type="number"
                                                        step="0.5"
                                                        min="1"
                                                        max="5"
                                                        name={`justdial_manual_reviews[${index}][rating]`}
                                                        value={
                                                            review.rating ?? 5
                                                        }
                                                        onChange={(e) =>
                                                            updateReview(
                                                                index,
                                                                'rating',
                                                                e.target
                                                                    .value ===
                                                                    ''
                                                                    ? null
                                                                    : Number(
                                                                          e
                                                                              .target
                                                                              .value,
                                                                      ),
                                                            )
                                                        }
                                                    />
                                                </Field>
                                                <Field label="Date">
                                                    <input
                                                        name={`justdial_manual_reviews[${index}][date]`}
                                                        value={
                                                            review.date ?? ''
                                                        }
                                                        onChange={(e) =>
                                                            updateReview(
                                                                index,
                                                                'date',
                                                                e.target.value,
                                                            )
                                                        }
                                                        maxLength={60}
                                                        placeholder="Nov 2026"
                                                    />
                                                </Field>
                                            </div>
                                            <Field label="Review text">
                                                <textarea
                                                    rows={2}
                                                    name={`justdial_manual_reviews[${index}][text]`}
                                                    value={review.text ?? ''}
                                                    onChange={(e) =>
                                                        updateReview(
                                                            index,
                                                            'text',
                                                            e.target.value,
                                                        )
                                                    }
                                                    maxLength={2000}
                                                    placeholder="What the customer wrote on Justdial…"
                                                />
                                            </Field>
                                        </div>
                                    ))}

                                    <details className="admin-feed-contract">
                                        <summary>
                                            Optional: Authorised Justdial API
                                            feed
                                        </summary>
                                        {!settings.justdialFeedConfigured && (
                                            <p className="admin-config-notice">
                                                Set{' '}
                                                <code>
                                                    JUSTDIAL_REVIEWS_ENDPOINT
                                                </code>{' '}
                                                in <code>.env</code> if you have
                                                a licensed Justdial JSON feed.
                                            </p>
                                        )}
                                        <Field
                                            label="Justdial listing ID or URL"
                                            error={errors.justdial_listing_id}
                                        >
                                            <input
                                                name="justdial_listing_id"
                                                defaultValue={
                                                    settings.justdialListingId ??
                                                    ''
                                                }
                                                maxLength={255}
                                                autoComplete="off"
                                                placeholder="022PXX22-XX22-211220161254-E5C8_BZDET"
                                            />
                                        </Field>
                                        <Field
                                            label="Justdial feed key"
                                            error={errors.justdial_key}
                                            note={
                                                settings.justdialSaved
                                                    ? 'A key is saved. Leave blank to keep it.'
                                                    : 'Bearer credential supplied by your feed provider.'
                                            }
                                        >
                                            <input
                                                type="password"
                                                name="justdial_key"
                                                autoComplete="new-password"
                                                maxLength={512}
                                            />
                                        </Field>
                                        {settings.justdialSaved && (
                                            <label className="admin-check">
                                                <input
                                                    type="checkbox"
                                                    value="1"
                                                    name="remove_justdial_key"
                                                />
                                                Remove saved Justdial key
                                            </label>
                                        )}
                                    </details>
                                </div>
                            </Panel>
                        </div>
                        <div className="review-admin-submit">
                            <button
                                className="admin-btn admin-primary"
                                type="submit"
                                disabled={processing}
                            >
                                <Save size={17} />
                                {processing
                                    ? 'Saving…'
                                    : 'Save review settings'}
                            </button>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}
