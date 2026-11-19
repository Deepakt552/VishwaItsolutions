import { Form, usePage } from '@inertiajs/react';
import { Cable, KeyRound } from 'lucide-react';
import {
    CopyButton,
    PageHeading,
    Panel,
    Status,
} from '@/components/admin/workspace';
import { rotate, update } from '@/routes/admin/integrations';

const example = JSON.stringify(
    {
        name: 'Lenovo ThinkPad T14',
        category: 'Laptops',
        condition: 'Good',
        status: 'draft',
        processor: 'Intel Core i5-1135G7',
        ram_gb: 16,
        storage_gb: 512,
        storage_type: 'SSD',
        age_months: 24,
        price: 25900,
        description: 'A 14-inch business laptop with original charger.',
        features: 'Backlit keyboard\nUSB-C charging',
    },
    null,
    2,
);

export default function Integrations({
    enabled,
    hasToken,
    endpoint,
}: {
    enabled: boolean;
    hasToken: boolean;
    endpoint: string;
}) {
    const { flash } = usePage();
    const token = typeof flash?.apiToken === 'string' ? flash.apiToken : null;

    return (
        <>
            <PageHeading
                title="API integration"
                text="Create product listings from an inventory system or external publishing tool."
            />
            <div className="admin-editor automation-grid">
                <div className="admin-editor-main">
                    <Panel
                        title="Product publishing API"
                        text="Disabling access stops new API requests immediately. Manual listings remain available in the dashboard."
                    >
                        <div className="admin-fields">
                            <div className="admin-split">
                                <span className="admin-inline">
                                    <Cable size={18} /> Endpoint access
                                </span>
                                <Status
                                    value={enabled ? 'enabled' : 'disabled'}
                                />
                            </div>
                            <Form {...update.form()}>
                                {({ processing }) => (
                                    <>
                                        <input
                                            type="hidden"
                                            name="enabled"
                                            value={enabled ? '0' : '1'}
                                        />
                                        <button
                                            className={
                                                'admin-btn ' +
                                                (enabled
                                                    ? 'admin-secondary'
                                                    : 'admin-primary')
                                            }
                                            disabled={processing}
                                        >
                                            {enabled
                                                ? 'Disable API'
                                                : 'Enable API'}
                                        </button>
                                    </>
                                )}
                            </Form>
                        </div>
                    </Panel>
                    <Panel
                        title="Bearer token"
                        text={
                            hasToken
                                ? 'Rotating the token immediately revokes the previous token.'
                                : 'Generate a token and store it securely in your integration.'
                        }
                    >
                        <div className="admin-fields">
                            {token && (
                                <div className="admin-token">
                                    <p>
                                        Copy this token now. It is shown once.
                                    </p>
                                    <code>{token}</code>
                                    <div className="admin-actions">
                                        <CopyButton value={token} />
                                        <span role="status" />
                                    </div>
                                </div>
                            )}
                            <Form
                                {...rotate.form()}
                                onBefore={() =>
                                    !hasToken ||
                                    window.confirm(
                                        'Rotate the token and revoke access for clients using the current one?',
                                    )
                                }
                            >
                                {({ processing }) => (
                                    <button
                                        className="admin-btn admin-secondary"
                                        disabled={processing}
                                    >
                                        <KeyRound size={17} />
                                        {hasToken
                                            ? 'Rotate token'
                                            : 'Generate token'}
                                    </button>
                                )}
                            </Form>
                        </div>
                    </Panel>
                </div>
                <Panel
                    title="Create a product"
                    text="Send a JSON request or multipart form data for photos."
                >
                    <div className="admin-fields">
                        <p className="admin-endpoint">
                            <strong>POST</strong>
                            <code>{endpoint}</code>
                        </p>
                        <p>
                            Set <code>Authorization: Bearer &lt;token&gt;</code>{' '}
                            and <code>Accept: application/json</code>. Use{' '}
                            <code>uploads[]</code> for multipart photos.
                        </p>
                        <p>
                            Status defaults to <code>draft</code>. Set it to{' '}
                            <code>available</code> to publish immediately. A
                            successful request returns <code>201 Created</code>{' '}
                            with the new listing.
                        </p>
                        <pre className="admin-code">{example}</pre>
                    </div>
                </Panel>
            </div>
        </>
    );
}
