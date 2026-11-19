import { Link } from '@inertiajs/react';
import { business } from '@/components/storefront/business';
import PageHeader from '@/components/storefront/PageHeader';
import { useSiteText } from '@/lib/site-text';
import { contact, reviewSources } from '@/routes/storefront';

export default function TermsPage() {
    const { t } = useSiteText();

    return (
        <>
            <PageHeader
                narrow
                breadcrumbLabel={t('terms')}
                title={t('termsTitle')}
                description={t('termsIntro')}
            />
            <div className="wrap article-wrap article-body article-content">
                <h2>{t('visitChargeTitle')}</h2>
                <p>
                    Our standard technician visiting charge is{' '}
                    <strong>₹350</strong>, which covers on-site or workshop
                    diagnosis and repair of any software-related issue. If a
                    hardware fault is identified, only the cost of replacement
                    parts is billed separately after your confirmation.
                </p>

                <h2>Repairs &amp; Pre-owned Devices</h2>
                <p>
                    Hardware repairs — including chip-level motherboard
                    repairing, MacBook repairs, and All-in-One (AIO) systems —
                    are quoted transparently before work begins. Pre-owned
                    laptops, desktops, and workstations are inspected and tested
                    before sale; please inspect the device and specifications in
                    person before completing your purchase.
                </p>

                <h2>Data &amp; Privacy</h2>
                <p>
                    We treat customer devices and data confidentially. Customers
                    are advised to back up important files before submitting a
                    device for repair or upgrade whenever possible. Details
                    submitted through our <Link href={contact()}>contact form</Link>{' '}
                    are used solely to respond to your enquiry. For details on
                    how Google Maps and Justdial reviews are displayed, see our{' '}
                    <Link href={reviewSources()}>Review Sources &amp; Privacy</Link>{' '}
                    page.
                </p>

                <h2>Contact</h2>
                <p>
                    <strong>{business.name}</strong>
                    <br />
                    {business.address}
                    <br />
                    <a href={'tel:' + business.phone} dir="ltr">
                        {business.phoneText}
                    </a>
                </p>
            </div>
        </>
    );
}

